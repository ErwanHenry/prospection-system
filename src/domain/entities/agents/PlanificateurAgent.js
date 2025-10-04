/**
 * Planificateur Agent - Agent spécialisé en analyse et planification
 * Capable d'analyser les besoins et créer des roadmaps intelligentes
 */

const Agent = require('../Agent');

class PlanificateurAgent extends Agent {
  constructor(config = {}) {
    super({
      id: config.id || 'planificateur_' + Date.now(),
      name: config.name || 'Planificateur',
      type: 'planificateur',
      specialization: 'strategic_planning',
      capabilities: [
        'requirement_analysis',
        'roadmap_creation',
        'task_estimation',
        'priority_assessment',
        'risk_analysis',
        'resource_planning',
        'timeline_optimization',
        'stakeholder_analysis',
        'goal_decomposition',
        'strategy_formulation'
      ],
      config: {
        analysisDepth: 'comprehensive', // 'basic', 'detailed', 'comprehensive'
        planningHorizon: '3_months', // '1_month', '3_months', '6_months', '1_year'
        riskTolerance: 'moderate', // 'low', 'moderate', 'high'
        optimizationFocus: 'balanced', // 'speed', 'quality', 'cost', 'balanced'
        ...config
      }
    });
  }

  async processTask(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'analyze_prospection_target':
        return await this.analyzeProspectionTarget(data);
      case 'create_prospection_plan':
        return await this.createProspectionPlan(data);
      case 'analyze_requirements':
        return await this.analyzeRequirements(data);
      case 'create_roadmap':
        return await this.createRoadmap(data);
      case 'estimate_tasks':
        return await this.estimateTasks(data);
      case 'assess_risks':
        return await this.assessRisks(data);
      case 'optimize_timeline':
        return await this.optimizeTimeline(data);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  // ========== MÉTHODES SPÉCIALISÉES PROSPECTION ==========

  async analyzeProspectionTarget(targetData) {
    const { target, context = {} } = targetData;
    
    console.log(`🎯 Planificateur analyse la cible: ${target.name || target.email}`);
    
    // Analyse multi-dimensionnelle de la cible
    const analysis = {
      target: {
        name: target.name,
        email: target.email,
        company: target.company,
        title: target.title,
        industry: this.detectIndustry(target),
        seniority: this.assessSeniority(target.title),
        influence: this.assessInfluence(target)
      },
      context: {
        companySize: this.estimateCompanySize(target.company),
        marketPosition: this.assessMarketPosition(target.company),
        techStack: this.inferTechStack(target),
        painPoints: this.identifyPainPoints(target),
        budget: this.estimateBudget(target),
        decisionMakingPower: this.assessDecisionPower(target.title)
      },
      opportunity: {
        score: this.calculateOpportunityScore(target),
        fit: this.assessProductFit(target, context.product || 'Graixl'),
        timing: this.assessTiming(target),
        competition: this.assessCompetition(target)
      },
      strategy: this.formulateApproachStrategy(target)
    };

    // Mémoriser l'analyse pour usage futur
    this.remember(`analysis_${target.email}`, analysis);
    
    return {
      analysis,
      recommendations: this.generateRecommendations(analysis),
      nextSteps: this.defineNextSteps(analysis)
    };
  }

  async createProspectionPlan(planData) {
    const { target, product = 'Graixl', objectives = [], timeline = '2_weeks' } = planData;
    
    console.log(`📋 Planificateur crée un plan de prospection pour ${target.name}`);
    
    // Récupérer l'analyse précédente si disponible
    const previousAnalysis = this.recall(`analysis_${target.email}`);
    
    const plan = {
      id: `plan_${Date.now()}`,
      target,
      product,
      objectives,
      timeline,
      phases: [
        {
          name: 'Recherche et Intelligence',
          duration: '2_days',
          tasks: [
            'Analyse approfondie du profil LinkedIn',
            'Recherche sur l\'entreprise et ses défis',
            'Identification des connexions communes',
            'Analyse de la présence digitale'
          ]
        },
        {
          name: 'Préparation du Contact',
          duration: '1_day',
          tasks: [
            'Personnalisation du message d\'approche',
            'Préparation des arguments de valeur',
            'Sélection des preuves sociales',
            'Planification du timing optimal'
          ]
        },
        {
          name: 'Premier Contact',
          duration: '1_day',
          tasks: [
            'Envoi du message personnalisé',
            'Suivi sur LinkedIn si nécessaire',
            'Monitoring des réactions',
            'Ajustement de l\'approche'
          ]
        },
        {
          name: 'Nurturing et Suivi',
          duration: '1_week',
          tasks: [
            'Séquence de follow-up personnalisée',
            'Partage de contenu pertinent',
            'Proposition de valeur affinée',
            'Prise de rendez-vous si opportun'
          ]
        }
      ],
      messaging: this.createMessagingStrategy(target, product, previousAnalysis),
      success_metrics: this.defineSuccessMetrics(),
      contingencies: this.planContingencies(target)
    };

    return plan;
  }

  // ========== MÉTHODES D'ANALYSE ==========

  detectIndustry(target) {
    const company = (target.company || '').toLowerCase();
    const title = (target.title || '').toLowerCase();
    
    const industries = {
      'tech': ['tech', 'software', 'digital', 'ai', 'saas', 'cloud', 'startup'],
      'finance': ['bank', 'finance', 'investment', 'trading', 'fintech'],
      'healthcare': ['health', 'medical', 'pharma', 'biotech', 'hospital'],
      'retail': ['retail', 'ecommerce', 'commerce', 'shop', 'store'],
      'manufacturing': ['manufacturing', 'factory', 'industrial', 'production'],
      'consulting': ['consulting', 'advisory', 'services', 'strategy']
    };

    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => company.includes(keyword) || title.includes(keyword))) {
        return industry;
      }
    }
    
    return 'other';
  }

  assessSeniority(title) {
    if (!title) return 'unknown';
    
    const titleLower = title.toLowerCase();
    
    if (['ceo', 'cto', 'cfo', 'founder', 'president', 'vp', 'vice president'].some(senior => titleLower.includes(senior))) {
      return 'senior';
    }
    
    if (['director', 'head of', 'lead', 'principal', 'senior'].some(mid => titleLower.includes(mid))) {
      return 'mid';
    }
    
    if (['manager', 'coordinator', 'specialist', 'analyst'].some(junior => titleLower.includes(junior))) {
      return 'junior';
    }
    
    return 'unknown';
  }

  assessInfluence(target) {
    let influence = 50; // Base score
    
    const title = (target.title || '').toLowerCase();
    const company = (target.company || '').toLowerCase();
    
    // Augmente l'influence selon le titre
    if (['ceo', 'founder'].some(t => title.includes(t))) influence += 40;
    else if (['cto', 'cfo', 'vp'].some(t => title.includes(t))) influence += 30;
    else if (['director', 'head'].some(t => title.includes(t))) influence += 20;
    else if (['manager', 'lead'].some(t => title.includes(t))) influence += 10;
    
    // Ajuste selon la taille estimée de l'entreprise
    if (company.includes('startup')) influence += 15;
    else if (company.includes('enterprise')) influence -= 10;
    
    return Math.min(Math.max(influence, 0), 100);
  }

  calculateOpportunityScore(target) {
    const seniority = this.assessSeniority(target.title);
    const influence = this.assessInfluence(target);
    const industry = this.detectIndustry(target);
    
    let score = 50; // Base score
    
    // Ajustements selon le profil
    if (seniority === 'senior') score += 30;
    else if (seniority === 'mid') score += 15;
    
    if (influence > 70) score += 20;
    else if (influence > 50) score += 10;
    
    if (['tech', 'consulting'].includes(industry)) score += 15;
    
    return Math.min(Math.max(score, 0), 100);
  }

  createMessagingStrategy(target, product, analysis) {
    const strategy = {
      tone: this.determineTone(target),
      approach: this.determineApproach(target, analysis),
      valueProposition: this.craftValueProposition(target, product, analysis),
      callToAction: this.defineCallToAction(target),
      personalization: this.generatePersonalizationElements(target, analysis)
    };

    return strategy;
  }

  determineTone(target) {
    const seniority = this.assessSeniority(target.title);
    const industry = this.detectIndustry(target);
    
    if (seniority === 'senior') {
      return 'executive'; // Concis, direct, respectueux
    } else if (industry === 'tech') {
      return 'technical'; // Informatif, précis, orienté solutions
    } else {
      return 'professional'; // Courtois, accessible, orienté business
    }
  }

  determineApproach(target, analysis) {
    const score = analysis?.opportunity?.score || this.calculateOpportunityScore(target);
    
    if (score > 80) {
      return 'direct'; // Approche directe avec proposition claire
    } else if (score > 60) {
      return 'consultative'; // Approche conseil avec questions ouvertes
    } else {
      return 'educational'; // Approche éducative avec valeur ajoutée
    }
  }

  craftValueProposition(target, product, analysis) {
    const industry = this.detectIndustry(target);
    const seniority = this.assessSeniority(target.title);
    
    const propositions = {
      'tech': {
        'senior': `${product} automatise vos processus de prospection B2B, vous faisant gagner 80% de temps tout en augmentant vos taux de conversion de 45%.`,
        'mid': `Avec ${product}, transformez votre approche commerciale grâce à l'IA et concentrez-vous sur la conversion plutôt que sur la recherche manuelle.`,
        'junior': `${product} vous aide à identifier et contacter les bons prospects automatiquement, boost vos performances commerciales.`
      },
      'consulting': {
        'senior': `${product} démultiplie l'efficacité de vos équipes commerciales en automatisant la prospection intelligente pour vos services.`,
        'mid': `Utilisez ${product} pour développer votre portefeuille client plus rapidement avec une approche data-driven de la prospection.`,
        'junior': `${product} vous donne les outils pour prospecter comme un expert, même sans expérience approfondie.`
      },
      'default': {
        'senior': `${product} révolutionne votre approche commerciale : prospection automatisée, ciblage précis, ROI mesurable.`,
        'mid': `Accélérez votre développement commercial avec ${product} : plus de prospects qualifiés, moins de temps passé.`,
        'junior': `${product} simplifie votre prospection : trouvez et contactez vos prospects idéaux automatiquement.`
      }
    };
    
    const industryProps = propositions[industry] || propositions['default'];
    return industryProps[seniority] || industryProps['mid'];
  }

  generatePersonalizationElements(target, analysis) {
    return {
      companyMention: target.company ? `chez ${target.company}` : '',
      industryContext: this.getIndustryContext(this.detectIndustry(target)),
      roleSpecific: this.getRoleSpecificInsight(target.title),
      painPointAddress: this.identifyPainPoints(target),
      successStory: this.selectRelevantSuccessStory(target)
    };
  }

  getIndustryContext(industry) {
    const contexts = {
      'tech': "Dans le secteur tech où l'innovation et la rapidité sont cruciales",
      'consulting': "En tant que conseil, votre expertise est votre valeur principale",
      'finance': "Dans un environnement financier hautement compétitif",
      'healthcare': "Dans le domaine de la santé où la précision est essentielle",
      'default': "Dans votre secteur d'activité"
    };
    
    return contexts[industry] || contexts['default'];
  }

  getRoleSpecificInsight(title) {
    if (!title) return '';
    
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('ceo') || titleLower.includes('founder')) {
      return "vous savez que la croissance passe par l'efficacité opérationnelle";
    } else if (titleLower.includes('cto') || titleLower.includes('tech')) {
      return "l'automatisation intelligente est probablement dans vos priorités";
    } else if (titleLower.includes('sales') || titleLower.includes('commercial')) {
      return "vous connaissez la valeur d'un pipeline bien alimenté";
    } else if (titleLower.includes('marketing')) {
      return "l'alignement sales-marketing est crucial pour vos résultats";
    }
    
    return "l'efficacité de vos processus métier est stratégique";
  }

  identifyPainPoints(target) {
    const industry = this.detectIndustry(target);
    const title = (target.title || '').toLowerCase();
    
    const painPoints = {
      'tech': [
        'Scaling commercial processes',
        'Lead qualification efficiency', 
        'Sales team productivity',
        'Market penetration speed'
      ],
      'consulting': [
        'Client acquisition cost',
        'Pipeline predictability',
        'Resource optimization',
        'Market positioning'
      ]
    };
    
    const industryPains = painPoints[industry] || painPoints['tech'];
    
    // Sélectionner le pain point le plus pertinent selon le rôle
    if (title.includes('ceo') || title.includes('founder')) {
      return industryPains[0]; // Focus croissance
    } else if (title.includes('sales') || title.includes('commercial')) {
      return industryPains[1]; // Focus efficacité sales
    } else {
      return industryPains[2]; // Focus opérationnel
    }
  }

  selectRelevantSuccessStory(target) {
    const industry = this.detectIndustry(target);
    const seniority = this.assessSeniority(target.title);
    
    const successStories = {
      'tech_senior': "Un CEO de startup SaaS a augmenté son pipeline de 300% en 2 mois",
      'tech_mid': "Une équipe commerciale tech a doublé ses conversions en automatisant sa prospection",
      'consulting_senior': "Un cabinet de conseil a réduit son cycle de vente de 40% grâce à l'IA",
      'default': "Nos clients augmentent leur efficacité commerciale de 75% en moyenne"
    };
    
    const key = `${industry}_${seniority}`;
    return successStories[key] || successStories['default'];
  }

  defineNextSteps(analysis) {
    const score = analysis.opportunity.score;
    
    if (score > 80) {
      return [
        'Rédaction d\'un message personnalisé premium',
        'Recherche de connexions communes sur LinkedIn',
        'Préparation d\'une proposition de valeur spécifique',
        'Planification d\'un suivi multi-canal'
      ];
    } else if (score > 60) {
      return [
        'Création d\'un message d\'approche consultative',
        'Préparation de contenu éducatif pertinent',
        'Identification des moments optimaux de contact',
        'Définition d\'une séquence de nurturing'
      ];
    } else {
      return [
        'Développement d\'une approche éducative',
        'Création de contenu de valeur ajoutée',
        'Établissement d\'une relation de confiance progressive',
        'Suivi long terme avec valeur régulière'
      ];
    }
  }

  // ========== MÉTHODES GÉNÉRALES DE PLANIFICATION ==========

  async analyzeRequirements(requirements) {
    // Implémentation générale pour tout type de projet
    return {
      functional: this.extractFunctionalRequirements(requirements),
      nonFunctional: this.extractNonFunctionalRequirements(requirements),
      constraints: this.identifyConstraints(requirements),
      assumptions: this.identifyAssumptions(requirements),
      risks: this.identifyRequirementRisks(requirements)
    };
  }

  async createRoadmap(projectData) {
    // Création de roadmap générale
    const { requirements, timeline, resources } = projectData;
    
    return {
      phases: this.defineDevelopmentPhases(requirements),
      milestones: this.defineMilestones(timeline),
      dependencies: this.identifyDependencies(requirements),
      resources: this.planResourceAllocation(resources),
      timeline: this.createDetailedTimeline(timeline)
    };
  }

  // Méthodes utilitaires supplémentaires...
  estimateCompanySize(company) {
    if (!company) return 'unknown';
    
    const companyLower = company.toLowerCase();
    if (companyLower.includes('startup') || companyLower.includes('scale')) return 'startup';
    if (companyLower.includes('enterprise') || companyLower.includes('corp')) return 'enterprise';
    return 'mid-market';
  }

  assessDecisionPower(title) {
    if (!title) return 'low';
    
    const titleLower = title.toLowerCase();
    if (['ceo', 'cto', 'cfo', 'founder', 'president'].some(t => titleLower.includes(t))) return 'high';
    if (['vp', 'director', 'head'].some(t => titleLower.includes(t))) return 'medium';
    return 'low';
  }

  defineSuccessMetrics() {
    return {
      'open_rate': 'Taux d\'ouverture > 25%',
      'response_rate': 'Taux de réponse > 10%', 
      'meeting_rate': 'Taux de prise RDV > 5%',
      'conversion_rate': 'Taux de conversion > 2%',
      'engagement_score': 'Score d\'engagement > 70%'
    };
  }

  planContingencies(target) {
    return {
      'no_response': 'Séquence de follow-up avec contenu éducatif',
      'negative_response': 'Réponse empathique et proposition de valeur alternative',
      'out_of_office': 'Report du contact avec adaptation du message',
      'wrong_contact': 'Redirection vers le bon interlocuteur',
      'timing_issues': 'Proposition de recontact à un moment plus opportun'
    };
  }
}

module.exports = PlanificateurAgent;