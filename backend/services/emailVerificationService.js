/**
 * Email Verification Service
 * Validates generated email patterns before returning them
 */

const dns = require('dns').promises;
const axios = require('axios');

class EmailVerificationService {
  constructor() {
    this.cache = new Map(); // Cache validation results
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Verify an email address using multiple methods
   */
  async verifyEmail(email, domain) {
    const cacheKey = email.toLowerCase();
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result;
      }
    }

    try {
      const result = await this.performVerification(email, domain);
      
      // Cache result
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
      
      return result;
      
    } catch (error) {
      return {
        valid: false,
        confidence: 0,
        reason: error.message,
        checks: {}
      };
    }
  }

  async performVerification(email, domain) {
    const checks = {
      syntax: false,
      domain: false,
      mx: false,
      disposable: false,
      common: false
    };

    let confidence = 0;
    let valid = false;

    // 1. Syntax validation
    checks.syntax = this.validateEmailSyntax(email);
    if (checks.syntax) confidence += 20;

    // 2. Domain validation
    checks.domain = await this.validateDomain(domain);
    if (checks.domain) confidence += 30;

    // 3. MX record validation
    checks.mx = await this.validateMXRecord(domain);
    if (checks.mx) confidence += 25;

    // 4. Check if it's a disposable email
    checks.disposable = !this.isDisposableEmail(domain);
    if (checks.disposable) confidence += 15;

    // 5. Check against common business email patterns
    checks.common = this.isCommonBusinessPattern(email, domain);
    if (checks.common) confidence += 10;

    // Determine validity
    valid = checks.syntax && checks.domain && confidence >= 60;

    return {
      valid,
      confidence: Math.min(confidence, 100),
      checks,
      email,
      domain,
      reason: valid ? 'Email passes validation checks' : 'Email failed validation'
    };
  }

  validateEmailSyntax(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  async validateDomain(domain) {
    try {
      await dns.lookup(domain);
      return true;
    } catch (error) {
      return false;
    }
  }

  async validateMXRecord(domain) {
    try {
      const mxRecords = await dns.resolveMx(domain);
      return mxRecords && mxRecords.length > 0;
    } catch (error) {
      return false;
    }
  }

  isDisposableEmail(domain) {
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'temp-mail.org',
      'throwaway.email', 'sharklasers.com', 'guerrillamail.info'
    ];
    
    return disposableDomains.includes(domain.toLowerCase());
  }

  isCommonBusinessPattern(email, domain) {
    const [localPart] = email.split('@');
    
    // Common business patterns
    const businessPatterns = [
      /^[a-zA-Z]+\.[a-zA-Z]+$/,           // firstname.lastname
      /^[a-zA-Z]+[a-zA-Z]+$/,            // firstnamelastname
      /^[a-zA-Z]\.?[a-zA-Z]+$/,         // f.lastname or flastname
      /^[a-zA-Z]+_[a-zA-Z]+$/,          // firstname_lastname
      /^[a-zA-Z]+\.[a-zA-Z]\.[a-zA-Z]+$/ // firstname.m.lastname
    ];
    
    // Check against business email domains
    const businessDomains = [
      '.com', '.fr', '.org', '.net', '.eu', '.co.uk', '.de', '.es', '.it'
    ];
    
    const hasBusinessPattern = businessPatterns.some(pattern => pattern.test(localPart));
    const hasBusinessDomain = businessDomains.some(tld => domain.endsWith(tld));
    
    return hasBusinessPattern && hasBusinessDomain;
  }

  /**
   * Rank multiple email candidates by likelihood
   */
  async rankEmailCandidates(emails, domain) {
    const results = [];
    
    for (const email of emails) {
      const verification = await this.verifyEmail(email, domain);
      results.push({
        email,
        ...verification
      });
    }
    
    // Sort by confidence score
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get the most likely valid email from a list of candidates
   */
  async getBestEmailCandidate(emails, domain) {
    if (!emails || emails.length === 0) {
      return null;
    }

    const ranked = await this.rankEmailCandidates(emails, domain);
    
    // Return the highest confidence email that passes basic validation
    const best = ranked.find(result => result.valid && result.confidence >= 60);
    
    return best || ranked[0]; // Return best valid or highest scored
  }

  /**
   * Enhanced pattern generation with verification
   */
  async generateVerifiedEmailPatterns(firstName, lastName, company, domain) {
    // Generate all possible patterns
    const patterns = this.generateAllPatterns(firstName, lastName, domain);
    
    // Verify and rank them
    const ranked = await this.rankEmailCandidates(patterns, domain);
    
    // Return top 3 most likely patterns
    return ranked.slice(0, 3).map(result => ({
      email: result.email,
      confidence: result.confidence,
      valid: result.valid,
      reason: result.reason
    }));
  }

  generateAllPatterns(firstName, lastName, domain) {
    const first = firstName.toLowerCase().trim();
    const last = lastName.toLowerCase().trim();
    
    if (!first || !last || !domain) {
      return [];
    }

    const patterns = [
      `${first}.${last}@${domain}`,           // john.doe@company.com
      `${first}${last}@${domain}`,            // johndoe@company.com  
      `${first}@${domain}`,                   // john@company.com
      `${first}_${last}@${domain}`,           // john_doe@company.com
      `${first.charAt(0)}${last}@${domain}`,  // jdoe@company.com
      `${first}${last.charAt(0)}@${domain}`,  // johnd@company.com
      `${first}.${last.charAt(0)}@${domain}`, // john.d@company.com
      `${first.charAt(0)}.${last}@${domain}`, // j.doe@company.com
      `${last}.${first}@${domain}`,           // doe.john@company.com
      `${last}${first}@${domain}`             // doejohn@company.com
    ];

    // Remove duplicates and invalid patterns
    return [...new Set(patterns)].filter(pattern => 
      pattern.length > 0 && this.validateEmailSyntax(pattern)
    );
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
      entries: Array.from(this.cache.keys()).slice(0, 10) // First 10 entries
    };
  }
}

module.exports = new EmailVerificationService();