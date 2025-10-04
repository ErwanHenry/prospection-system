/**
 * ProspectSearcher Agent - Claude-Flow
 * Specialized agent for LinkedIn prospect search and extraction
 */

// Use mock Claude-Flow for now
let Agent;
try {
  Agent = require('claude-flow').Agent;
} catch (error) {
  Agent = require('../mock/claude-flow-mock').Agent;
}
const linkedinScraper = require('../../backend/services/linkedinScraper');
const linkedinProfileExtractor = require('../../backend/services/linkedinProfileExtractor');
const logger = require('../../backend/utils/logger');

class ProspectSearcherAgent extends Agent {
  constructor(options = {}) {
    super({
      name: 'ProspectSearcher',
      description: 'Searches and extracts LinkedIn prospects with advanced filtering',
      capabilities: ['linkedin_search', 'profile_extraction', 'data_validation'],
      ...options
    });
    
    this.searchCache = new Map();
    this.rateLimiter = {
      requestsPerHour: 100,
      currentHour: new Date().getHours(),
      requestCount: 0
    };
  }

  async initialize() {
    try {
      logger.info('Initializing ProspectSearcher agent', { agent: 'ProspectSearcher' });
      
      // Verify LinkedIn scraper availability
      const scraperReady = await this.checkScraperHealth();
      if (!scraperReady) {
        throw new Error('LinkedIn scraper not available');
      }
      
      this.status = 'ready';
      logger.info('ProspectSearcher agent initialized successfully', { agent: 'ProspectSearcher' });
      return true;
      
    } catch (error) {
      logger.error('Failed to initialize ProspectSearcher agent', { 
        agent: 'ProspectSearcher', 
        error: error.message 
      });
      this.status = 'error';
      return false;
    }
  }

  async checkScraperHealth() {
    try {
      // Check if LinkedIn cookie is available
      return !!process.env.LINKEDIN_COOKIE;
    } catch (error) {
      return false;
    }
  }

  async searchProspects(query, options = {}) {
    try {
      const {
        limit = 20,
        location = '',
        industry = '',
        experience = '',
        useCache = true
      } = options;

      // Check rate limiting
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded for LinkedIn searches');
      }

      // Check cache first
      const cacheKey = `${query}_${limit}_${location}_${industry}`;
      if (useCache && this.searchCache.has(cacheKey)) {
        logger.info('Returning cached search results', { 
          agent: 'ProspectSearcher', 
          query, 
          cacheKey 
        });
        return this.searchCache.get(cacheKey);
      }

      logger.info('Starting prospect search', { 
        agent: 'ProspectSearcher', 
        query, 
        limit,
        location,
        industry
      });

      // Perform LinkedIn search using existing scraper
      const searchResult = await linkedinScraper.search(query, limit);
      
      // Transform to expected format
      const formattedResult = {
        success: searchResult && searchResult.length > 0,
        profiles: searchResult || [],
        error: !searchResult || searchResult.length === 0 ? 'No results found' : null
      };

      if (!formattedResult.success) {
        throw new Error(`Search failed: ${formattedResult.error}`);
      }

      // Extract detailed profiles for high-quality prospects
      const enrichedProspects = await this.enrichProspects(formattedResult.profiles, options);

      const result = {
        success: true,
        prospects: enrichedProspects,
        totalFound: formattedResult.profiles.length,
        query,
        timestamp: new Date().toISOString()
      };

      // Cache results
      if (useCache) {
        this.searchCache.set(cacheKey, result);
        // Clean cache after 1 hour
        setTimeout(() => this.searchCache.delete(cacheKey), 3600000);
      }

      // Update rate limiter
      this.updateRateLimit();

      logger.info('Prospect search completed', { 
        agent: 'ProspectSearcher', 
        found: enrichedProspects.length,
        query
      });

      return result;

    } catch (error) {
      logger.error('Prospect search failed', { 
        agent: 'ProspectSearcher', 
        error: error.message,
        query
      });
      
      return {
        success: false,
        error: error.message,
        prospects: [],
        query,
        timestamp: new Date().toISOString()
      };
    }
  }

  async enrichProspects(prospects, options = {}) {
    const { extractProfiles = true, maxProfiles = 10 } = options;
    
    if (!extractProfiles) {
      return prospects.map(this.formatBasicProspect);
    }

    const enriched = [];
    const prospectsToEnrich = prospects.slice(0, maxProfiles);

    for (const prospect of prospectsToEnrich) {
      try {
        if (prospect.linkedinUrl) {
          logger.info('Extracting detailed profile', { 
            agent: 'ProspectSearcher', 
            prospect: prospect.name 
          });
          
          const profileData = await linkedinProfileExtractor.extractDetailedProfile(prospect.linkedinUrl);
          
          if (profileData.success) {
            enriched.push({
              ...this.formatBasicProspect(prospect),
              ...profileData.profile,
              enriched: true,
              extractionTimestamp: new Date().toISOString()
            });
          } else {
            enriched.push({
              ...this.formatBasicProspect(prospect),
              enriched: false,
              extractionError: profileData.error
            });
          }
        } else {
          enriched.push(this.formatBasicProspect(prospect));
        }

        // Add delay to avoid rate limiting
        await this.delay(2000);

      } catch (error) {
        logger.error('Failed to enrich prospect', { 
          agent: 'ProspectSearcher', 
          prospect: prospect.name,
          error: error.message
        });
        
        enriched.push({
          ...this.formatBasicProspect(prospect),
          enriched: false,
          extractionError: error.message
        });
      }
    }

    return enriched;
  }

  formatBasicProspect(prospect) {
    return {
      id: prospect.id || this.generateId(),
      name: prospect.name || 'Nom non spécifié',
      title: prospect.title || 'Titre non spécifié',
      company: prospect.company || 'Entreprise non spécifiée',
      location: prospect.location || '',
      linkedinUrl: prospect.linkedinUrl || '',
      profileImageUrl: prospect.profileImageUrl || '',
      score: this.calculateProspectScore(prospect),
      tags: this.generateTags(prospect),
      source: 'linkedin_search',
      foundAt: new Date().toISOString(),
      agentId: this.name
    };
  }

  calculateProspectScore(prospect) {
    let score = 0;
    
    // Title scoring
    const titleKeywords = ['cto', 'ceo', 'founder', 'director', 'head', 'vp', 'chief'];
    if (titleKeywords.some(keyword => 
      prospect.title?.toLowerCase().includes(keyword)
    )) {
      score += 30;
    }

    // Company scoring
    if (prospect.company && prospect.company.length > 2) {
      score += 20;
    }

    // LinkedIn URL scoring
    if (prospect.linkedinUrl) {
      score += 25;
    }

    // Location scoring
    if (prospect.location) {
      score += 15;
    }

    // Image scoring (indicates active profile)
    if (prospect.profileImageUrl) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  generateTags(prospect) {
    const tags = [];
    
    if (prospect.title) {
      if (prospect.title.toLowerCase().includes('cto')) tags.push('tech');
      if (prospect.title.toLowerCase().includes('ceo')) tags.push('leadership');
      if (prospect.title.toLowerCase().includes('founder')) tags.push('startup');
      if (prospect.title.toLowerCase().includes('sales')) tags.push('sales');
      if (prospect.title.toLowerCase().includes('marketing')) tags.push('marketing');
    }

    if (prospect.company) {
      if (prospect.company.toLowerCase().includes('startup')) tags.push('startup');
      if (prospect.company.toLowerCase().includes('tech')) tags.push('tech');
    }

    return tags.join(',');
  }

  checkRateLimit() {
    const currentHour = new Date().getHours();
    
    // Reset counter if new hour
    if (currentHour !== this.rateLimiter.currentHour) {
      this.rateLimiter.currentHour = currentHour;
      this.rateLimiter.requestCount = 0;
    }
    
    return this.rateLimiter.requestCount < this.rateLimiter.requestsPerHour;
  }

  updateRateLimit() {
    this.rateLimiter.requestCount++;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Agent interface methods
  async execute(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'search':
        return await this.searchProspects(data.query, data.options);
      
      case 'enrich':
        return await this.enrichProspects(data.prospects, data.options);
      
      case 'health_check':
        return {
          success: true,
          status: this.status,
          rateLimitStatus: this.rateLimiter,
          cacheSize: this.searchCache.size
        };
      
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  async cleanup() {
    this.searchCache.clear();
    logger.info('ProspectSearcher agent cleaned up', { agent: 'ProspectSearcher' });
  }
}

module.exports = ProspectSearcherAgent;