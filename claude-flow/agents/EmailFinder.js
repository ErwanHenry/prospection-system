/**
 * EmailFinder Agent - Claude-Flow
 * Specialized agent for finding and verifying email addresses
 */

// Use mock Claude-Flow for now
let Agent;
try {
  Agent = require('claude-flow').Agent;
} catch (error) {
  Agent = require('../mock/claude-flow-mock').Agent;
}
const emailFinderService = require('../../backend/services/emailFinderService');
const emailVerificationService = require('../../backend/services/emailVerificationService');
const logger = require('../../backend/utils/logger');

class EmailFinderAgent extends Agent {
  constructor(options = {}) {
    super({
      name: 'EmailFinder',
      description: 'Finds and verifies email addresses for prospects using multiple sources',
      capabilities: ['email_search', 'email_verification', 'contact_enrichment'],
      ...options
    });
    
    this.emailCache = new Map();
    this.rateLimiter = {
      searchesPerDay: 1000,
      currentDay: new Date().toDateString(),
      searchCount: 0
    };
    
    this.sources = ['apollo', 'hunter', 'clearbit', 'pattern_generation'];
    this.verificationEnabled = true;
  }

  async initialize() {
    try {
      logger.info('Initializing EmailFinder agent', { agent: 'EmailFinder' });
      
      // Initialize email finder service
      const finderReady = await emailFinderService.initialize();
      if (!finderReady) {
        logger.warn('Email finder service not fully ready, using limited functionality');
      }
      
      // Initialize verification service if available
      try {
        const verificationReady = await emailVerificationService.initialize();
        this.verificationEnabled = verificationReady;
      } catch (error) {
        logger.warn('Email verification service not available', { error: error.message });
        this.verificationEnabled = false;
      }
      
      this.status = 'ready';
      logger.info('EmailFinder agent initialized successfully', { 
        agent: 'EmailFinder',
        verificationEnabled: this.verificationEnabled
      });
      return true;
      
    } catch (error) {
      logger.error('Failed to initialize EmailFinder agent', { 
        agent: 'EmailFinder', 
        error: error.message 
      });
      this.status = 'error';
      return false;
    }
  }

  async findEmail(prospect, options = {}) {
    try {
      const {
        sources = this.sources,
        verify = true,
        useCache = true,
        timeout = 30000
      } = options;

      // Check rate limiting
      if (!this.checkRateLimit()) {
        throw new Error('Daily rate limit exceeded for email searches');
      }

      // Generate cache key
      const cacheKey = this.generateCacheKey(prospect);
      
      // Check cache first
      if (useCache && this.emailCache.has(cacheKey)) {
        logger.info('Returning cached email result', { 
          agent: 'EmailFinder', 
          prospect: prospect.name,
          cacheKey 
        });
        return this.emailCache.get(cacheKey);
      }

      logger.info('Starting email search', { 
        agent: 'EmailFinder', 
        prospect: prospect.name,
        sources: sources.join(',')
      });

      // Try multiple sources in parallel with timeout
      const searchPromises = sources.map(source => 
        this.searchWithSource(prospect, source)
      );

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email search timeout')), timeout)
      );

      let searchResults;
      try {
        searchResults = await Promise.race([
          Promise.allSettled(searchPromises),
          timeoutPromise
        ]);
      } catch (error) {
        if (error.message === 'Email search timeout') {
          logger.warn('Email search timed out, using partial results', {
            agent: 'EmailFinder',
            prospect: prospect.name
          });
          // Get whatever results are available
          searchResults = await Promise.allSettled(searchPromises);
        } else {
          throw error;
        }
      }

      // Process results and find best email
      const emails = this.processSearchResults(searchResults);
      const bestEmail = this.selectBestEmail(emails);

      let result;
      if (bestEmail) {
        // Verify email if verification is enabled
        let verificationResult = null;
        if (verify && this.verificationEnabled) {
          try {
            verificationResult = await this.verifyEmail(bestEmail.email);
          } catch (verifyError) {
            logger.warn('Email verification failed', {
              agent: 'EmailFinder',
              email: bestEmail.email,
              error: verifyError.message
            });
          }
        }

        result = {
          success: true,
          email: bestEmail.email,
          source: bestEmail.source,
          confidence: bestEmail.confidence,
          verified: verificationResult?.verified || false,
          verificationScore: verificationResult?.score || 0,
          alternativeEmails: emails.filter(e => e.email !== bestEmail.email),
          prospect: prospect.name,
          timestamp: new Date().toISOString()
        };
      } else {
        result = {
          success: false,
          error: 'No email found',
          sources: sources,
          prospect: prospect.name,
          timestamp: new Date().toISOString()
        };
      }

      // Cache results
      if (useCache) {
        this.emailCache.set(cacheKey, result);
        // Clean cache after 24 hours
        setTimeout(() => this.emailCache.delete(cacheKey), 86400000);
      }

      // Update rate limiter
      this.updateRateLimit();

      logger.info('Email search completed', { 
        agent: 'EmailFinder', 
        prospect: prospect.name,
        success: result.success,
        email: result.email || 'not found'
      });

      return result;

    } catch (error) {
      logger.error('Email search failed', { 
        agent: 'EmailFinder', 
        prospect: prospect.name,
        error: error.message
      });
      
      return {
        success: false,
        error: error.message,
        prospect: prospect.name,
        timestamp: new Date().toISOString()
      };
    }
  }

  async searchWithSource(prospect, source) {
    try {
      switch (source) {
        case 'apollo':
          return await this.searchWithApollo(prospect);
        
        case 'hunter':
          return await this.searchWithHunter(prospect);
        
        case 'clearbit':
          return await this.searchWithClearbit(prospect);
        
        case 'pattern_generation':
          return await this.generateEmailPatterns(prospect);
        
        default:
          // Use the existing email finder service as fallback
          const result = await emailFinderService.findEmail(prospect);
          return {
            success: result.success,
            email: result.email,
            source: 'service',
            confidence: result.confidence || 70
          };
      }
    } catch (error) {
      logger.warn(`Email search failed for source ${source}`, {
        agent: 'EmailFinder',
        source,
        prospect: prospect.name,
        error: error.message
      });
      return { success: false, source, error: error.message };
    }
  }

  async searchWithApollo(prospect) {
    // Integration with Apollo API (requires API key)
    if (!process.env.APOLLO_API_KEY) {
      throw new Error('Apollo API key not configured');
    }

    const searchData = {
      first_name: prospect.name?.split(' ')[0],
      last_name: prospect.name?.split(' ').slice(1).join(' '),
      organization_name: prospect.company
    };

    // Simulate Apollo API call (implement actual API integration)
    return {
      success: false,
      source: 'apollo',
      error: 'Apollo integration not implemented yet'
    };
  }

  async searchWithHunter(prospect) {
    // Integration with Hunter.io API (requires API key)
    if (!process.env.HUNTER_API_KEY) {
      throw new Error('Hunter API key not configured');
    }

    // Simulate Hunter API call (implement actual API integration)
    return {
      success: false,
      source: 'hunter',
      error: 'Hunter integration not implemented yet'
    };
  }

  async searchWithClearbit(prospect) {
    // Integration with Clearbit API (requires API key)
    if (!process.env.CLEARBIT_API_KEY) {
      throw new Error('Clearbit API key not configured');
    }

    // Simulate Clearbit API call (implement actual API integration)
    return {
      success: false,
      source: 'clearbit',
      error: 'Clearbit integration not implemented yet'
    };
  }

  async generateEmailPatterns(prospect) {
    // Generate common email patterns based on name and company
    if (!prospect.name || !prospect.company) {
      throw new Error('Name and company required for pattern generation');
    }

    const firstName = prospect.name.split(' ')[0]?.toLowerCase();
    const lastName = prospect.name.split(' ').slice(1).join('')?.toLowerCase();
    const domain = this.extractDomainFromCompany(prospect.company);

    if (!firstName || !domain) {
      throw new Error('Insufficient data for pattern generation');
    }

    const patterns = [
      `${firstName}.${lastName}@${domain}`,
      `${firstName}@${domain}`,
      `${firstName}${lastName}@${domain}`,
      `${firstName.charAt(0)}${lastName}@${domain}`,
      `${firstName}.${lastName.charAt(0)}@${domain}`
    ].filter(Boolean);

    // Return the first pattern as a candidate (in practice, you'd verify these)
    if (patterns.length > 0) {
      return {
        success: true,
        email: patterns[0],
        source: 'pattern_generation',
        confidence: 40, // Lower confidence for generated patterns
        alternatives: patterns.slice(1)
      };
    }

    return {
      success: false,
      source: 'pattern_generation',
      error: 'Could not generate email patterns'
    };
  }

  extractDomainFromCompany(company) {
    // Simple domain extraction logic
    const companyName = company.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/inc|ltd|llc|corp|company|sarl|sas/g, '');
    
    return companyName + '.com'; // Simplistic - in practice, use more sophisticated domain detection
  }

  async verifyEmail(email) {
    if (!this.verificationEnabled) {
      return { verified: false, score: 0, error: 'Verification not available' };
    }

    try {
      return await emailVerificationService.verifyEmail(email);
    } catch (error) {
      logger.warn('Email verification failed', {
        agent: 'EmailFinder',
        email,
        error: error.message
      });
      return { verified: false, score: 0, error: error.message };
    }
  }

  processSearchResults(searchResults) {
    const emails = [];
    
    for (const result of searchResults) {
      if (result.status === 'fulfilled' && result.value.success) {
        emails.push(result.value);
      }
    }
    
    return emails;
  }

  selectBestEmail(emails) {
    if (emails.length === 0) return null;
    
    // Sort by confidence score
    emails.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    
    return emails[0];
  }

  generateCacheKey(prospect) {
    const name = prospect.name?.toLowerCase() || '';
    const company = prospect.company?.toLowerCase() || '';
    return `${name}_${company}`.replace(/[^a-z0-9_]/g, '');
  }

  checkRateLimit() {
    const currentDay = new Date().toDateString();
    
    // Reset counter if new day
    if (currentDay !== this.rateLimiter.currentDay) {
      this.rateLimiter.currentDay = currentDay;
      this.rateLimiter.searchCount = 0;
    }
    
    return this.rateLimiter.searchCount < this.rateLimiter.searchesPerDay;
  }

  updateRateLimit() {
    this.rateLimiter.searchCount++;
  }

  // Agent interface methods
  async execute(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'find_email':
        return await this.findEmail(data.prospect, data.options);
      
      case 'verify_email':
        return await this.verifyEmail(data.email);
      
      case 'batch_find':
        return await this.batchFindEmails(data.prospects, data.options);
      
      case 'health_check':
        return {
          success: true,
          status: this.status,
          rateLimitStatus: this.rateLimiter,
          cacheSize: this.emailCache.size,
          verificationEnabled: this.verificationEnabled
        };
      
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  async batchFindEmails(prospects, options = {}) {
    const { concurrency = 3 } = options;
    const results = [];
    
    // Process prospects in batches to respect rate limits
    for (let i = 0; i < prospects.length; i += concurrency) {
      const batch = prospects.slice(i, i + concurrency);
      const batchPromises = batch.map(prospect => this.findEmail(prospect, options));
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason?.message }));
      
      // Add delay between batches
      if (i + concurrency < prospects.length) {
        await this.delay(2000);
      }
    }
    
    return {
      success: true,
      results,
      processed: results.length,
      found: results.filter(r => r.success).length
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup() {
    this.emailCache.clear();
    logger.info('EmailFinder agent cleaned up', { agent: 'EmailFinder' });
  }
}

module.exports = EmailFinderAgent;