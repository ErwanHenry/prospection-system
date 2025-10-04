/**
 * Service de Recherche d'Emails
 * Utilise plusieurs méthodes pour trouver des emails professionnels
 */

const axios = require('axios');
const emailVerificationService = require('./emailVerificationService');

class EmailFinderService {
  constructor() {
    this.initialized = false;
    this.hunterApiKey = process.env.HUNTER_API_KEY;
    this.apolloApiKey = process.env.APOLLO_API_KEY;
    
    // Rate limiting tracking
    this.lastApiCall = {
      hunter: 0,
      apollo: 0
    };
    this.apiCallDelays = {
      hunter: 1000, // 1 second between Hunter.io calls
      apollo: 2000  // 2 seconds between Apollo.io calls
    };
  }

  async initialize() {
    console.log('📧 Initialisation du service de recherche d\'emails...');
    this.initialized = true;
    return true;
  }

  // Méthode principale pour trouver un email
  async findEmail(prospect) {
    try {
      const { name, company, linkedinUrl, title } = prospect;
      
      console.log(`📧 Recherche email pour ${name} @ ${company}...`);
      
      const methods = [
        // Method 1: Apollo.io (si disponible)
        () => this.findEmailViaApollo(name, company, linkedinUrl),
        
        // Method 2: Hunter.io (si disponible)  
        () => this.findEmailViaHunter(name, company),
        
        // Method 3: Google Search patterns
        () => this.findEmailViaGooglePatterns(name, company),
        
        // Method 4: Verified email patterns
        () => this.generateEmailPatterns(name, company)
      ];

      for (const method of methods) {
        try {
          const result = await method();
          if (result.success && result.email) {
            console.log(`✅ Email trouvé pour ${name}: ${result.email} (${result.source})`);
            return result;
          }
        } catch (error) {
          console.log(`⚠️ Méthode échouée: ${error.message}`);
        }
      }
      
      console.log(`❌ Aucun email trouvé pour ${name}`);
      return { success: false, email: null, source: 'none' };
      
    } catch (error) {
      console.error('❌ Erreur recherche email:', error.message);
      return { success: false, email: null, source: 'error', error: error.message };
    }
  }

  // Méthode 1: Apollo.io
  async findEmailViaApollo(name, company, linkedinUrl) {
    if (!this.apolloApiKey) {
      throw new Error('Apollo API key not configured');
    }

    try {
      // Rate limiting for Apollo API
      await this.enforceRateLimit('apollo');

      // Recherche via Apollo avec les données prospect
      const response = await axios.post('https://app.apollo.io/api/v1/mixed_people/search', {
        q: `${name} ${company}`,
        page: 1,
        per_page: 5
      }, {
        headers: {
          'X-API-KEY': this.apolloApiKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      });

      if (response.data?.people?.length > 0) {
        for (const person of response.data.people) {
          // Match par nom et entreprise
          const nameMatch = this.matchName(name, person.name);
          const companyMatch = this.matchCompany(company, person.organization?.name);
          
          if (nameMatch && companyMatch && person.email) {
            return {
              success: true,
              email: person.email,
              source: 'apollo',
              confidence: 'high',
              verified: person.email_status === 'verified'
            };
          }
        }
      }
      
      throw new Error('No matching person found in Apollo');
      
    } catch (error) {
      throw new Error(`Apollo API error: ${error.message}`);
    }
  }

  // Méthode 2: Hunter.io
  async findEmailViaHunter(name, company) {
    if (!this.hunterApiKey) {
      throw new Error('Hunter API key not configured');
    }

    try {
      // Rate limiting for Hunter API
      await this.enforceRateLimit('hunter');

      // Extraire le domaine de l'entreprise
      const domain = await this.extractCompanyDomain(company);
      if (!domain) {
        throw new Error('Company domain not found');
      }

      const [firstName, lastName] = this.parseFullName(name);
      
      const response = await axios.get('https://api.hunter.io/v2/email-finder', {
        params: {
          domain: domain,
          first_name: firstName,
          last_name: lastName,
          api_key: this.hunterApiKey
        },
        timeout: 15000 // 15 second timeout
      });

      if (response.data?.data?.email) {
        return {
          success: true,
          email: response.data.data.email,
          source: 'hunter',
          confidence: response.data.data.confidence,
          verified: response.data.data.verification === 'valid'
        };
      }
      
      throw new Error('No email found via Hunter');
      
    } catch (error) {
      throw new Error(`Hunter API error: ${error.message}`);
    }
  }

  // Méthode 3: Recherche intelligente avec validation
  async findEmailViaGooglePatterns(name, company) {
    try {
      const domain = await this.extractCompanyDomain(company);
      if (!domain) {
        throw new Error('Cannot determine company domain');
      }
      
      // Générer des patterns d'emails vérifiés
      const patternResult = await this.generateEmailPatterns(name, company);
      if (!patternResult.success || !patternResult.email) {
        throw new Error('No email patterns generated');
      }
      
      const bestPattern = patternResult.email;
      
      return {
        success: true,
        email: bestPattern,
        source: 'intelligent-pattern',
        confidence: 'medium',
        verified: patternResult.verified,
        confidence: patternResult.confidence,
        alternatives: patternResult.alternatives || [] // Fournir des alternatives
      };
      
    } catch (error) {
      throw new Error(`Pattern search error: ${error.message}`);
    }
  }
  
  selectBestEmailPattern(patterns, company, domain) {
    // Logique pour sélectionner le meilleur pattern basé sur l'entreprise
    const companySize = this.estimateCompanySize(company);
    const companyType = this.determineCompanyType(company);
    
    // Les grandes entreprises utilisent souvent prenom.nom@domain
    if (companySize === 'large' || companyType === 'corporate') {
      const firstLastPattern = patterns.find(p => p.includes('.') && !p.includes('_'));
      if (firstLastPattern) return firstLastPattern;
    }
    
    // Les startups/PME utilisent souvent prenom@domain ou prenomnom@domain
    if (companySize === 'small' || companyType === 'startup') {
      const simplePattern = patterns.find(p => !p.includes('.') && !p.includes('_'));
      if (simplePattern) return simplePattern;
    }
    
    // Par défaut, retourner le premier pattern (prenom.nom@domain)
    return patterns[0];
  }
  
  estimateCompanySize(company) {
    const largeCompanyIndicators = ['group', 'groupe', 'international', 'corp', 'corporation', 'global'];
    const smallCompanyIndicators = ['startup', 'studio', 'lab', 'consulting', 'conseil'];
    
    const lowerCompany = company.toLowerCase();
    
    if (largeCompanyIndicators.some(indicator => lowerCompany.includes(indicator))) {
      return 'large';
    }
    if (smallCompanyIndicators.some(indicator => lowerCompany.includes(indicator))) {
      return 'small';
    }
    return 'medium';
  }
  
  determineCompanyType(company) {
    const techIndicators = ['tech', 'software', 'digital', 'data', 'ai', 'cloud', 'cyber'];
    const consultingIndicators = ['consulting', 'conseil', 'advisory', 'partners'];
    const corpIndicators = ['bank', 'insurance', 'telecom', 'energy', 'automotive'];
    
    const lowerCompany = company.toLowerCase();
    
    if (techIndicators.some(indicator => lowerCompany.includes(indicator))) {
      return 'tech';
    }
    if (consultingIndicators.some(indicator => lowerCompany.includes(indicator))) {
      return 'consulting';
    }
    if (corpIndicators.some(indicator => lowerCompany.includes(indicator))) {
      return 'corporate';
    }
    return 'general';
  }

  // Méthode 4: Patterns d'emails courants avec vérification
  async generateEmailPatterns(name, company) {
    try {
      const [firstName, lastName] = this.parseFullName(name);
      const domain = this.guessCompanyDomain(company);
      
      if (!domain) {
        throw new Error('Cannot guess company domain');
      }

      // Générer des patterns vérifiés
      const verifiedPatterns = await emailVerificationService.generateVerifiedEmailPatterns(
        firstName, lastName, company, domain
      );
      
      if (verifiedPatterns.length === 0) {
        throw new Error('No valid email patterns generated');
      }
      
      // Retourner le pattern le plus probable
      const bestPattern = verifiedPatterns[0];
      
      return {
        success: true,
        email: bestPattern.email,
        source: 'verified-pattern',
        confidence: bestPattern.confidence,
        verified: bestPattern.valid,
        alternatives: verifiedPatterns.slice(1).map(p => p.email),
        domain: domain
      };
      
    } catch (error) {
      return { success: false, email: null, error: error.message };
    }
  }

  // Utilitaires
  parseFullName(fullName) {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return [firstName, lastName];
  }

  matchName(name1, name2) {
    if (!name1 || !name2) return false;
    
    const normalize = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const n1 = normalize(name1);
    const n2 = normalize(name2);
    
    // Match exact ou partiel
    return n1.includes(n2) || n2.includes(n1) || 
           this.calculateSimilarity(n1, n2) > 0.7;
  }

  matchCompany(company1, company2) {
    if (!company1 || !company2) return false;
    
    const normalize = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const c1 = normalize(company1);
    const c2 = normalize(company2);
    
    return c1.includes(c2) || c2.includes(c1) ||
           this.calculateSimilarity(c1, c2) > 0.6;
  }

  calculateSimilarity(str1, str2) {
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

  async extractCompanyDomain(companyName) {
    // Map élargie des domaines connus (entreprises françaises et internationales)
    const knownDomains = {
      // Tech US
      'google': 'google.com', 'microsoft': 'microsoft.com', 'apple': 'apple.com',
      'amazon': 'amazon.com', 'meta': 'meta.com', 'facebook': 'facebook.com',
      'twitter': 'twitter.com', 'linkedin': 'linkedin.com', 'netflix': 'netflix.com',
      'uber': 'uber.com', 'airbnb': 'airbnb.com', 'spotify': 'spotify.com', 'tesla': 'tesla.com',
      // Tech Europe
      'spotify': 'spotify.com', 'sap': 'sap.com', 'asml': 'asml.com',
      // France - Tech
      'orange': 'orange.com', 'capgemini': 'capgemini.com', 'atos': 'atos.net',
      'thales': 'thalesgroup.com', 'dassault': 'dassault-systemes.com', 'sogeti': 'sogeti.com',
      'worldline': 'worldline.com', 'ovhcloud': 'ovhcloud.com', 'datadog': 'datadoghq.com',
      // France - Finance
      'bnpparibas': 'bnpparibas.com', 'creditagricole': 'credit-agricole.com', 
      'societegenerale': 'societegenerale.com', 'axa': 'axa.com', 'generali': 'generali.com',
      // France - Industry
      'airbus': 'airbus.com', 'safran': 'safran-group.com', 'schneider': 'se.com',
      'stmicroelectronics': 'st.com', 'valeo': 'valeo.com', 'michelin': 'michelin.com',
      'peugeot': 'stellantis.com', 'renault': 'renaultgroup.com', 'total': 'totalenergies.com',
      // France - Retail/Consumer
      'carrefour': 'carrefour.com', 'lvmh': 'lvmh.com', 'loreal': 'loreal.com',
      'danone': 'danone.com', 'sanofi': 'sanofi.com', 'veolia': 'veolia.com', 'suez': 'suez.com',
      // Consulting
      'mckinsey': 'mckinsey.com', 'bcg': 'bcg.com', 'bain': 'bain.com',
      'deloitte': 'deloitte.com', 'pwc': 'pwc.com', 'ey': 'ey.com', 'kpmg': 'kpmg.com',
      // Others
      'accenture': 'accenture.com', 'ibm': 'ibm.com', 'oracle': 'oracle.com', 'salesforce': 'salesforce.com'
    };

    const normalized = companyName.toLowerCase().replace(/[^\w]/g, '');
    
    // Chercher une correspondance exacte
    for (const [key, domain] of Object.entries(knownDomains)) {
      if (normalized.includes(key)) {
        return domain;
      }
    }

    return this.guessCompanyDomain(companyName);
  }

  guessCompanyDomain(companyName) {
    // Nettoyer le nom de l'entreprise
    let cleanName = companyName.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remplacer la ponctuation par des espaces
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
    
    // Supprimer les mots courants
    const commonWords = [
      'inc', 'corp', 'corporation', 'ltd', 'limited', 'llc', 'sarl', 'sa', 'sas', 'gmbh',
      'group', 'groupe', 'company', 'co', 'international', 'france', 'french', 'europe',
      'holding', 'technologies', 'tech', 'solutions', 'services', 'consulting', 'conseil'
    ];
    
    let words = cleanName.split(' ').filter(word => 
      word.length > 2 && !commonWords.includes(word)
    );
    
    // Prendre les premiers mots significatifs
    let domain = words.slice(0, 2).join('').substring(0, 20);
    
    // Si trop court, essayer avec le nom original nettoyé
    if (domain.length < 3) {
      domain = cleanName.replace(/\s+/g, '').substring(0, 15);
    }
    
    // Essayer plusieurs extensions
    const extensions = ['.com', '.fr', '.eu', '.net', '.org'];
    const mainDomain = domain + extensions[0];
    
    return mainDomain;
  }

  // Rate limiting enforcement
  async enforceRateLimit(service) {
    const now = Date.now();
    const lastCall = this.lastApiCall[service];
    const requiredDelay = this.apiCallDelays[service];
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall < requiredDelay) {
      const waitTime = requiredDelay - timeSinceLastCall;
      console.log(`⏳ Rate limiting ${service}: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastApiCall[service] = Date.now();
  }
}

module.exports = new EmailFinderService();