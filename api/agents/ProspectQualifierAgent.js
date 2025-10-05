/**
 * ProspectQualifierAgent - V3.0 Rebuild
 *
 * Role: Filter prospects with 100-point AI scoring system
 * Goal: Eliminate 70% of bad fits upfront
 *
 * Scoring Breakdown:
 * - Company Fit: 40 points (size, industry, growth)
 * - Role Fit: 30 points (seniority, department relevance)
 * - Timing Signals: 30 points (engagement, pain signals, tech stack)
 *
 * Output:
 * - REJECTED (score < 70): Discard immediately
 * - QUALIFIED (score 70-85): Standard 18-day workflow
 * - HOT (score > 85): Priority 8-day workflow
 */

const OpenAI = require('openai');

class ProspectQualifierAgent {
  constructor(config = {}) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || config.apiKey
    });

    this.model = config.model || 'gpt-4';
    this.rejectionThreshold = config.rejectionThreshold || 70;
    this.hotProspectThreshold = config.hotProspectThreshold || 85;

    // 8-dimension qualification criteria
    this.scoringDimensions = {
      // Company Fit (40 points total)
      companySize: {
        weight: 15,
        ideal: { min: 50, max: 500 },
        description: 'Company employee count - sweet spot 50-500'
      },
      industry: {
        weight: 15,
        targets: ['SaaS', 'Technology', 'Software', 'Consulting', 'Professional Services', 'Tech Services'],
        description: 'Industry vertical - B2B tech focus'
      },
      growthSignals: {
        weight: 10,
        indicators: ['hiring', 'funding', 'expansion', 'revenue growth', 'new office'],
        description: 'Growth indicators - hiring sprees, funding rounds'
      },

      // Role Fit (30 points total)
      seniority: {
        weight: 15,
        targets: ['Director', 'VP', 'Vice President', 'Head of', 'Chief', 'C-Level', 'SVP'],
        description: 'Decision-maker seniority - Director+'
      },
      departmentRelevance: {
        weight: 15,
        targets: ['Sales', 'Marketing', 'Growth', 'Revenue', 'RevOps', 'Business Development', 'Commercial'],
        description: 'Department fit - Sales/Marketing/Growth'
      },

      // Timing Signals (30 points total)
      linkedinActivity: {
        weight: 10,
        indicators: ['recent post', 'hiring post', 'pain point post', 'industry discussion'],
        description: 'Recent LinkedIn engagement - active last 14 days'
      },
      painSignals: {
        weight: 10,
        indicators: ['hiring SDRs', 'job posts for sales', 'scaling team', 'mentioned prospection challenges'],
        description: 'Pain point indicators - hiring SDRs, scaling sales'
      },
      techStack: {
        weight: 10,
        basicTools: ['spreadsheets', 'basic CRM', 'no automation', 'manual process'],
        description: 'Current tech maturity - opportunity for upgrade'
      }
    };
  }

  /**
   * Main qualification method
   * @param {Object} prospect - Raw prospect data from Google Sheets
   * @returns {Object} - { score, status, reasoning, workflow }
   */
  async qualify(prospect) {
    try {
      // Step 1: Calculate base score with rule-based scoring
      const baseScore = this.calculateBaseScore(prospect);

      // Step 2: Enhance with AI-powered contextual analysis
      const aiScore = await this.enhanceWithAI(prospect, baseScore);

      // Step 3: Determine status and workflow
      const finalScore = Math.round(aiScore.total);
      const status = this.determineStatus(finalScore);
      const workflow = this.assignWorkflow(finalScore);

      return {
        prospectId: prospect.id || prospect.email,
        score: finalScore,
        status: status, // REJECTED | QUALIFIED | HOT
        workflow: workflow, // null | standard | priority
        breakdown: aiScore.breakdown,
        reasoning: aiScore.reasoning,
        timestamp: new Date().toISOString(),
        metadata: {
          companySize: prospect.companySize,
          industry: prospect.industry,
          title: prospect.title,
          seniority: this.extractSeniority(prospect.title)
        }
      };

    } catch (error) {
      console.error('❌ ProspectQualifierAgent Error:', error.message);
      return {
        prospectId: prospect.id || prospect.email,
        score: 0,
        status: 'ERROR',
        workflow: null,
        error: error.message
      };
    }
  }

  /**
   * Rule-based scoring (fast, deterministic)
   */
  calculateBaseScore(prospect) {
    const scores = {
      companySize: this.scoreCompanySize(prospect.companySize),
      industry: this.scoreIndustry(prospect.industry),
      growthSignals: this.scoreGrowthSignals(prospect),
      seniority: this.scoreSeniority(prospect.title),
      departmentRelevance: this.scoreDepartment(prospect.title, prospect.department),
      linkedinActivity: this.scoreLinkedInActivity(prospect),
      painSignals: this.scorePainSignals(prospect),
      techStack: this.scoreTechStack(prospect)
    };

    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);

    return {
      total,
      breakdown: scores
    };
  }

  /**
   * AI-enhanced scoring (contextual, nuanced)
   * Falls back to base score if OpenAI is not configured
   */
  async enhanceWithAI(prospect, baseScore) {
    // If no OpenAI key, return base score
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-proj-your-key-here') {
      console.log('⚠️  OpenAI not configured, using rule-based scoring only');
      return {
        total: baseScore.total,
        breakdown: baseScore.breakdown,
        reasoning: 'Rule-based scoring (OpenAI not configured)'
      };
    }

    const prompt = `Tu es un expert en qualification de prospects B2B pour Graixl, une plateforme d'IA de prospection.

Prospect à qualifier:
- Nom: ${prospect.firstName} ${prospect.lastName}
- Titre: ${prospect.title}
- Entreprise: ${prospect.company}
- Taille: ${prospect.companySize} employés
- Industrie: ${prospect.industry}
- LinkedIn: ${prospect.linkedinActivity || 'Non disponible'}
- Bio: ${prospect.bio || 'Non disponible'}

Score de base (règles): ${baseScore.total}/100

Analyse ce prospect selon 8 dimensions et ajuste le score:

1. Company Size (15 pts) - Idéal: 50-500 employés
2. Industry (15 pts) - Cible: SaaS, Tech, Consulting
3. Growth Signals (10 pts) - Hiring, funding, expansion
4. Seniority (15 pts) - Director+
5. Department (15 pts) - Sales/Marketing/Growth
6. LinkedIn Activity (10 pts) - Actif récemment ?
7. Pain Signals (10 pts) - Challenges de prospection ?
8. Tech Stack (10 pts) - Opportunité d'upgrade ?

Réponds en JSON strict:
{
  "total": 75,
  "breakdown": {
    "companySize": 12,
    "industry": 15,
    "growthSignals": 8,
    "seniority": 15,
    "departmentRelevance": 12,
    "linkedinActivity": 6,
    "painSignals": 7,
    "techStack": 0
  },
  "reasoning": "Director of Sales dans une scale-up SaaS de 120 personnes. Industrie parfaite, séniorité excellente. LinkedIn actif avec posts sur les défis de scaling. Probablement en train d'embaucher (growth signals). Score ajusté à 75 - QUALIFIED pour workflow standard."
}`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3 // Low temp for consistency
    });

    const aiAnalysis = JSON.parse(response.choices[0].message.content);

    return {
      total: aiAnalysis.total,
      breakdown: aiAnalysis.breakdown,
      reasoning: aiAnalysis.reasoning
    };
  }

  /**
   * Scoring helpers (rule-based)
   */
  scoreCompanySize(size) {
    if (!size) return 0;
    const num = parseInt(size);
    const { ideal, weight } = this.scoringDimensions.companySize;

    if (num >= ideal.min && num <= ideal.max) return weight; // Perfect fit
    if (num >= 30 && num <= 1000) return Math.round(weight * 0.6); // Acceptable
    if (num >= 10 && num < 30) return Math.round(weight * 0.3); // Too small
    return 0; // Too small or too large
  }

  scoreIndustry(industry) {
    if (!industry) return 0;
    const { targets, weight } = this.scoringDimensions.industry;
    const industryLower = industry.toLowerCase();

    const match = targets.some(target =>
      industryLower.includes(target.toLowerCase())
    );

    return match ? weight : 0;
  }

  scoreGrowthSignals(prospect) {
    if (!prospect.growthSignals && !prospect.bio) return 0;
    const { indicators, weight } = this.scoringDimensions.growthSignals;

    const text = `${prospect.growthSignals || ''} ${prospect.bio || ''}`.toLowerCase();
    const matchCount = indicators.filter(indicator =>
      text.includes(indicator.toLowerCase())
    ).length;

    return Math.min(weight, Math.round((matchCount / indicators.length) * weight));
  }

  scoreSeniority(title) {
    if (!title) return 0;
    const { targets, weight } = this.scoringDimensions.seniority;
    const titleLower = title.toLowerCase();

    const match = targets.some(target =>
      titleLower.includes(target.toLowerCase())
    );

    return match ? weight : 0;
  }

  scoreDepartment(title, department) {
    const { targets, weight } = this.scoringDimensions.departmentRelevance;
    const text = `${title || ''} ${department || ''}`.toLowerCase();

    const match = targets.some(target =>
      text.includes(target.toLowerCase())
    );

    return match ? weight : 0;
  }

  scoreLinkedInActivity(prospect) {
    if (!prospect.linkedinActivity && !prospect.lastActivity) return 0;
    const { weight } = this.scoringDimensions.linkedinActivity;

    // Simple heuristic: if lastActivity is recent (< 14 days), give full points
    if (prospect.lastActivity) {
      const daysSinceActivity = Math.floor((Date.now() - new Date(prospect.lastActivity)) / (1000 * 60 * 60 * 24));
      if (daysSinceActivity <= 14) return weight;
      if (daysSinceActivity <= 30) return Math.round(weight * 0.5);
    }

    return 0;
  }

  scorePainSignals(prospect) {
    if (!prospect.painSignals && !prospect.bio && !prospect.recentPosts) return 0;
    const { indicators, weight } = this.scoringDimensions.painSignals;

    const text = `${prospect.painSignals || ''} ${prospect.bio || ''} ${prospect.recentPosts || ''}`.toLowerCase();
    const matchCount = indicators.filter(indicator =>
      text.includes(indicator.toLowerCase())
    ).length;

    return Math.min(weight, Math.round((matchCount / indicators.length) * weight));
  }

  scoreTechStack(prospect) {
    if (!prospect.techStack && !prospect.currentTools) return 0;
    const { basicTools, weight } = this.scoringDimensions.techStack;

    const text = `${prospect.techStack || ''} ${prospect.currentTools || ''}`.toLowerCase();

    // If using basic tools, it's an opportunity (give points)
    const hasBasicTools = basicTools.some(tool =>
      text.includes(tool.toLowerCase())
    );

    return hasBasicTools ? weight : 0;
  }

  /**
   * Helper methods
   */
  determineStatus(score) {
    if (score < this.rejectionThreshold) return 'REJECTED';
    if (score >= this.hotProspectThreshold) return 'HOT';
    return 'QUALIFIED';
  }

  assignWorkflow(score) {
    if (score < this.rejectionThreshold) return null;
    if (score >= this.hotProspectThreshold) return 'priority';
    return 'standard';
  }

  extractSeniority(title) {
    if (!title) return 'Unknown';
    const titleLower = title.toLowerCase();

    if (titleLower.includes('chief') || titleLower.includes('c-level')) return 'C-Level';
    if (titleLower.includes('vp') || titleLower.includes('vice president')) return 'VP';
    if (titleLower.includes('director')) return 'Director';
    if (titleLower.includes('head of')) return 'Head';
    if (titleLower.includes('manager')) return 'Manager';

    return 'Other';
  }

  /**
   * Batch qualification
   */
  async qualifyBatch(prospects, options = {}) {
    const { concurrency = 3, onProgress } = options;
    const results = [];

    for (let i = 0; i < prospects.length; i += concurrency) {
      const batch = prospects.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(prospect => this.qualify(prospect))
      );
      results.push(...batchResults);

      if (onProgress) {
        onProgress({
          processed: results.length,
          total: prospects.length,
          percentage: Math.round((results.length / prospects.length) * 100)
        });
      }
    }

    return results;
  }

  /**
   * Get statistics for a batch of qualification results
   */
  getStats(results) {
    const total = results.length;
    const rejected = results.filter(r => r.status === 'REJECTED').length;
    const qualified = results.filter(r => r.status === 'QUALIFIED').length;
    const hot = results.filter(r => r.status === 'HOT').length;
    const errors = results.filter(r => r.status === 'ERROR').length;

    const avgScore = results
      .filter(r => r.status !== 'ERROR')
      .reduce((sum, r) => sum + r.score, 0) / (total - errors);

    return {
      total,
      rejected,
      rejectionRate: Math.round((rejected / total) * 100),
      qualified,
      hot,
      errors,
      avgScore: Math.round(avgScore),
      qualifiedRate: Math.round(((qualified + hot) / total) * 100)
    };
  }
}

module.exports = ProspectQualifierAgent;
