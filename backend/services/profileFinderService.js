/**
 * Profile Finder Service
 * Uses Google search to find LinkedIn profiles and other professional information
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

puppeteer.use(StealthPlugin());

class ProfileFinderService {
  constructor() {
    this.browser = null;
    this.initialized = false;
    this.requestDelay = 2000; // Delay between requests to avoid rate limiting
  }

  async initialize() {
    try {
      console.log('🔍 Initialisation Profile Finder Service...');
      
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });

      this.initialized = true;
      console.log('✅ Profile Finder Service initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Error initializing Profile Finder:', error.message);
      return false;
    }
  }

  /**
   * Find LinkedIn profile using Google search
   */
  async findLinkedInProfile(name, company, title = '') {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log(`🔍 Searching LinkedIn profile for ${name} at ${company}...`);
      
      const page = await this.browser.newPage();
      await page.setViewport({ width: 1366, height: 768 });

      // Construct smart Google search query
      const queries = this.buildSearchQueries(name, company, title);
      
      let bestResult = null;
      let bestScore = 0;

      for (const query of queries) {
        try {
          const results = await this.performGoogleSearch(page, query);
          
          for (const result of results) {
            const score = this.scoreProfileMatch(result, name, company, title);
            if (score > bestScore) {
              bestScore = score;
              bestResult = result;
            }
          }
          
          // If we found a high-confidence match, break early
          if (bestScore > 0.8) break;
          
          // Rate limiting
          await this.delay(this.requestDelay);
          
        } catch (searchError) {
          console.warn(`⚠️ Search query failed: ${query}`, searchError.message);
        }
      }

      await page.close();

      if (bestResult && bestScore > 0.5) {
        console.log(`✅ LinkedIn profile found for ${name} (confidence: ${Math.round(bestScore * 100)}%)`);
        return {
          success: true,
          profile: bestResult,
          confidence: bestScore,
          method: 'google-search'
        };
      } else {
        console.log(`❌ No LinkedIn profile found for ${name}`);
        return {
          success: false,
          profile: null,
          confidence: 0,
          reason: 'No matching profile found'
        };
      }

    } catch (error) {
      console.error(`❌ Error finding profile for ${name}:`, error.message);
      return {
        success: false,
        profile: null,
        confidence: 0,
        error: error.message
      };
    }
  }

  buildSearchQueries(name, company, title) {
    const cleanName = name.trim();
    const cleanCompany = company.trim();
    
    return [
      `"${cleanName}" "${cleanCompany}" site:linkedin.com/in`,
      `"${cleanName}" "${cleanCompany}" LinkedIn`,
      `${cleanName} ${cleanCompany} site:linkedin.com`,
      title ? `"${cleanName}" "${title}" "${cleanCompany}" LinkedIn` : null,
      `${cleanName.replace(' ', '+')}+${cleanCompany.replace(' ', '+')}+LinkedIn`,
    ].filter(Boolean);
  }

  async performGoogleSearch(page, query) {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`;
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.delay(1000);

      // Extract search results
      const results = await page.evaluate(() => {
        const searchResults = [];
        const resultElements = document.querySelectorAll('div[data-ved] h3');
        
        resultElements.forEach((titleElement, index) => {
          if (index >= 10) return; // Limit to first 10 results
          
          const linkElement = titleElement.closest('a');
          const url = linkElement ? linkElement.href : '';
          const title = titleElement.textContent || '';
          
          // Find description
          let description = '';
          const parent = titleElement.closest('[data-ved]');
          if (parent) {
            const descElement = parent.querySelector('[data-sncf]');
            description = descElement ? descElement.textContent : '';
          }
          
          if (url.includes('linkedin.com/in/') || url.includes('linkedin.com/pub/')) {
            searchResults.push({
              title: title,
              url: url,
              description: description,
              source: 'google'
            });
          }
        });
        
        return searchResults;
      });

      return results;
      
    } catch (error) {
      console.warn('Google search failed:', error.message);
      return [];
    }
  }

  scoreProfileMatch(result, targetName, targetCompany, targetTitle) {
    let score = 0;
    
    const title = result.title.toLowerCase();
    const description = result.description.toLowerCase();
    const url = result.url.toLowerCase();
    
    const nameWords = targetName.toLowerCase().split(' ');
    const companyWords = targetCompany.toLowerCase().split(' ');
    const titleWords = targetTitle ? targetTitle.toLowerCase().split(' ') : [];
    
    // Score based on name match in title (high weight)
    nameWords.forEach(word => {
      if (word.length > 2 && title.includes(word)) {
        score += 0.3;
      }
    });
    
    // Score based on company match (high weight)
    companyWords.forEach(word => {
      if (word.length > 2 && (title.includes(word) || description.includes(word))) {
        score += 0.25;
      }
    });
    
    // Score based on title match (medium weight)
    titleWords.forEach(word => {
      if (word.length > 3 && (title.includes(word) || description.includes(word))) {
        score += 0.15;
      }
    });
    
    // Bonus for complete name in URL
    if (nameWords.every(word => url.includes(word.toLowerCase()))) {
      score += 0.2;
    }
    
    // Penalty for common false positives
    if (title.includes('directory') || title.includes('list')) {
      score -= 0.3;
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Find multiple profiles for a batch of prospects
   */
  async findProfilesBatch(prospects) {
    const results = [];
    
    for (let i = 0; i < prospects.length; i++) {
      const prospect = prospects[i];
      
      try {
        const profileResult = await this.findLinkedInProfile(
          prospect.name, 
          prospect.company, 
          prospect.title
        );
        
        results.push({
          prospect: prospect,
          ...profileResult
        });
        
        console.log(`✅ Processed ${i + 1}/${prospects.length}: ${prospect.name}`);
        
      } catch (error) {
        console.error(`❌ Failed to process ${prospect.name}:`, error.message);
        results.push({
          prospect: prospect,
          success: false,
          error: error.message
        });
      }
      
      // Rate limiting between prospects
      if (i < prospects.length - 1) {
        await this.delay(this.requestDelay);
      }
    }
    
    return results;
  }

  /**
   * Enhanced profile search using Apollo.io (if API key available)
   */
  async findProfileViaApollo(name, company, title) {
    const apolloApiKey = process.env.APOLLO_API_KEY;
    
    if (!apolloApiKey) {
      throw new Error('Apollo API key not configured');
    }

    try {
      const response = await axios.post('https://app.apollo.io/api/v1/mixed_people/search', {
        q: `${name} ${company}`,
        per_page: 10,
        person_titles: title ? [title] : undefined
      }, {
        headers: {
          'X-API-KEY': apolloApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.people?.length > 0) {
        const people = response.data.people;
        
        // Find best match
        let bestMatch = null;
        let bestScore = 0;
        
        for (const person of people) {
          const score = this.scoreApolloMatch(person, name, company, title);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = person;
          }
        }
        
        if (bestMatch && bestScore > 0.6) {
          return {
            success: true,
            profile: {
              title: `${bestMatch.name} - ${bestMatch.title} at ${bestMatch.organization?.name}`,
              url: bestMatch.linkedin_url,
              description: `${bestMatch.title} at ${bestMatch.organization?.name}`,
              source: 'apollo',
              apolloData: bestMatch
            },
            confidence: bestScore,
            method: 'apollo-api'
          };
        }
      }
      
      throw new Error('No matching profiles found in Apollo');
      
    } catch (error) {
      throw new Error(`Apollo search failed: ${error.message}`);
    }
  }

  scoreApolloMatch(person, targetName, targetCompany, targetTitle) {
    let score = 0;
    
    // Name matching
    if (person.name) {
      const nameSimilarity = this.calculateSimilarity(
        person.name.toLowerCase(), 
        targetName.toLowerCase()
      );
      score += nameSimilarity * 0.4;
    }
    
    // Company matching
    if (person.organization?.name) {
      const companySimilarity = this.calculateSimilarity(
        person.organization.name.toLowerCase(),
        targetCompany.toLowerCase()
      );
      score += companySimilarity * 0.4;
    }
    
    // Title matching
    if (person.title && targetTitle) {
      const titleSimilarity = this.calculateSimilarity(
        person.title.toLowerCase(),
        targetTitle.toLowerCase()
      );
      score += titleSimilarity * 0.2;
    }
    
    return score;
  }

  calculateSimilarity(str1, str2) {
    // Simple similarity calculation (you might want to use a more sophisticated algorithm)
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.initialized = false;
    }
  }
}

module.exports = new ProfileFinderService();