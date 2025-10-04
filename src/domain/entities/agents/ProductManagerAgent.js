/**
 * Product Manager Agent - Agent spécialisé en gestion produit et validation
 * Capable de valider les besoins, définir les spécifications et s'assurer de l'adéquation produit-marché
 */

const Agent = require('../Agent');

class ProductManagerAgent extends Agent {
  constructor(config = {}) {
    super({
      id: config.id || 'product_manager_' + Date.now(),
      name: config.name || 'Product Manager',
      type: 'product-manager',
      specialization: 'product_strategy',
      capabilities: [
        'requirements_validation',
        'user_story_creation',
        'market_analysis',
        'feature_prioritization',
        'product_roadmap',
        'user_experience_validation',
        'competitive_analysis',
        'success_metrics_definition',
        'stakeholder_alignment',
        'product_market_fit'
      ],
      config: {
        methodology: 'lean_startup', // 'lean_startup', 'design_thinking', 'jobs_to_be_done'
        focusArea: 'customer_value', // 'customer_value', 'business_value', 'technical_excellence'
        validationApproach: 'data_driven', // 'data_driven', 'user_feedback', 'market_research'
        prioritizationFramework: 'value_effort', // 'value_effort', 'rice', 'moscow'
        ...config
      }
    });
    
    this.productRequirements = new Map();
    this.userStories = new Map();
    this.metrics = new Map();
    this.competitorAnalysis = new Map();
    this.initializeProductFramework();
  }

  async processTask(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'validate_product_requirements':
        return await this.validateProductRequirements(data);
      case 'analyze_market_fit':
        return await this.analyzeMarketFit(data);
      case 'define_success_metrics':
        return await this.defineSuccessMetrics(data);
      case 'create_user_stories':
        return await this.createUserStories(data);
      case 'prioritize_features':
        return await this.prioritizeFeatures(data);
      case 'validate_user_experience':
        return await this.validateUserExperience(data);
      case 'analyze_competitive_landscape':
        return await this.analyzeCompetitiveLandscape(data);
      case 'assess_prospection_workflow':
        return await this.assessProspectionWorkflow(data);
      case 'validate_email_effectiveness':
        return await this.validateEmailEffectiveness(data);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  // ========== VALIDATION PRODUIT PROSPECTION ==========

  async validateProductRequirements(requirementsData) {
    const { target, workflow, expectedOutcomes } = requirementsData;
    
    console.log(`📋 Product Manager valide les exigences produit pour ${target.email}`);
    
    const validation = {
      requirements: this.analyzeRequirements(requirementsData),
      userNeeds: this.assessUserNeeds(target),
      businessValue: this.assessBusinessValue(workflow),
      technicalFeasibility: this.assessTechnicalFeasibility(workflow),
      marketAlignment: this.assessMarketAlignment(target),
      recommendations: []
    };

    // Validation des critères d'acceptation
    const acceptanceCriteria = this.validateAcceptanceCriteria(validation);
    validation.acceptanceCriteria = acceptanceCriteria;
    
    // Génération des recommandations
    validation.recommendations = this.generateProductRecommendations(validation);
    
    // Score global de validation
    validation.overallScore = this.calculateValidationScore(validation);
    
    return {
      validation,
      isValid: validation.overallScore >= 80,
      criticalIssues: this.identifyCriticalIssues(validation),
      improvementAreas: this.identifyImprovementAreas(validation)
    };
  }

  analyzeRequirements(requirementsData) {
    const { target, workflow } = requirementsData;
    
    return {
      clarity: this.assessRequirementClarity(requirementsData),
      completeness: this.assessRequirementCompleteness(requirementsData),
      feasibility: this.assessRequirementFeasibility(requirementsData),
      alignment: this.assessBusinessAlignment(requirementsData),
      measurability: this.assessMeasurability(requirementsData)
    };
  }

  assessUserNeeds(target) {
    const userPersona = this.identifyUserPersona(target);
    const painPoints = this.identifyUserPainPoints(target);
    const goals = this.identifyUserGoals(target);
    
    return {
      persona: userPersona,
      painPoints,
      goals,
      motivations: this.analyzeUserMotivations(target),
      expectedValue: this.calculateExpectedUserValue(target),
      satisfactionPrediction: this.predictUserSatisfaction(target)
    };
  }

  identifyUserPersona(target) {
    const { title, company, industry } = target;
    
    // Définir les personas basés sur le profil
    const personas = {
      'ceo_tech_startup': {
        description: 'CEO de startup tech orienté croissance',
        characteristics: ['growth_focused', 'time_constrained', 'tech_savvy', 'roi_driven'],
        preferences: ['automation', 'scalability', 'quick_wins', 'data_driven_decisions']
      },
      'sales_director_enterprise': {
        description: 'Directeur commercial en entreprise',
        characteristics: ['results_oriented', 'team_management', 'process_focused', 'kpi_driven'],
        preferences: ['team_efficiency', 'predictable_results', 'integration', 'reporting']
      },
      'marketing_manager_smb': {
        description: 'Responsable marketing PME',
        characteristics: ['creative', 'budget_conscious', 'multi_tasking', 'campaign_focused'],
        preferences: ['cost_effective', 'easy_to_use', 'creative_freedom', 'quick_setup']
      }
    };

    // Logique de détection du persona
    if (title?.toLowerCase().includes('ceo') && industry === 'tech') {
      return personas.ceo_tech_startup;
    } else if (title?.toLowerCase().includes('sales') || title?.toLowerCase().includes('commercial')) {
      return personas.sales_director_enterprise;
    } else if (title?.toLowerCase().includes('marketing')) {
      return personas.marketing_manager_smb;
    }
    
    return personas.ceo_tech_startup; // Par défaut
  }

  identifyUserPainPoints(target) {
    const persona = this.identifyUserPersona(target);
    
    const painPointsMap = {
      'ceo_tech_startup': [
        'Scaling commercial processes manually',
        'Inconsistent prospection quality',
        'Time spent on low-value tasks',
        'Difficulty measuring ROI of prospection efforts'
      ],
      'sales_director_enterprise': [
        'Team productivity variations',
        'Lead qualification inefficiency',
        'Pipeline predictability issues',
        'Training and onboarding complexity'
      ],
      'marketing_manager_smb': [
        'Limited budget for tools',
        'Content personalization at scale',
        'Campaign performance tracking',
        'Integration with existing tools'
      ]
    };

    const personaKey = Object.keys(painPointsMap).find(key => 
      persona.description.includes(key.split('_')[0])
    ) || 'ceo_tech_startup';

    return painPointsMap[personaKey];
  }

  async assessProspectionWorkflow(workflowData) {
    const { target, workflow, phases } = workflowData;
    
    console.log(`🔍 Product Manager évalue le workflow de prospection`);
    
    const assessment = {
      userJourney: this.mapUserJourney(workflow),
      valueDelivery: this.assessValueDelivery(workflow, target),
      painPointResolution: this.assessPainPointResolution(workflow, target),
      experienceQuality: this.assessExperienceQuality(workflow),
      competitiveAdvantage: this.assessCompetitiveAdvantage(workflow),
      scalabilityPotential: this.assessScalability(workflow)
    };

    // Analyse des phases du workflow
    assessment.phaseAnalysis = phases.map(phase => this.analyzeWorkflowPhase(phase, target));
    
    // Score global du workflow
    assessment.workflowScore = this.calculateWorkflowScore(assessment);
    
    // Recommandations d'amélioration
    assessment.improvements = this.generateWorkflowImprovements(assessment);
    
    return {
      assessment,
      isOptimal: assessment.workflowScore >= 85,
      strengthAreas: this.identifyWorkflowStrengths(assessment),
      improvementAreas: this.identifyWorkflowWeaknesses(assessment)
    };
  }

  mapUserJourney(workflow) {
    return {
      awareness: 'User discovers Graixl capabilities through demo',
      interest: 'User sees personalized analysis of their prospect',
      consideration: 'User evaluates generated email quality',
      trial: 'User experiences automated workflow',
      adoption: 'User sees successful email delivery',
      advocacy: 'User recommends based on results'
    };
  }

  assessValueDelivery(workflow, target) {
    const userNeeds = this.assessUserNeeds(target);
    
    return {
      timeToValue: this.calculateTimeToValue(workflow),
      perceivedValue: this.calculatePerceivedValue(workflow, userNeeds),
      actualValue: this.calculateActualValue(workflow),
      valueGap: this.calculateValueGap(workflow, userNeeds),
      valueRealization: this.assessValueRealization(workflow)
    };
  }

  async validateEmailEffectiveness(emailData) {
    const { target, emailContent, analysis } = emailData;
    
    console.log(`✉️ Product Manager valide l'efficacité de l'email`);
    
    const validation = {
      contentRelevance: this.assessContentRelevance(emailContent, target),
      personalizationLevel: this.assessPersonalizationLevel(emailContent, target),
      callToActionClarity: this.assessCallToActionClarity(emailContent),
      valuePropositionStrength: this.assessValuePropositionStrength(emailContent, target),
      professionalTone: this.assessProfessionalTone(emailContent),
      responseProbability: this.predictResponseProbability(emailContent, target)
    };

    // Benchmark contre les meilleures pratiques
    validation.benchmarkScore = this.benchmarkAgainstBestPractices(emailContent);
    
    // Suggestions d'amélioration
    validation.optimizations = this.generateEmailOptimizations(validation, target);
    
    // Score global d'efficacité
    validation.effectivenessScore = this.calculateEmailEffectivenessScore(validation);
    
    return {
      validation,
      isEffective: validation.effectivenessScore >= 75,
      strengths: this.identifyEmailStrengths(validation),
      improvements: validation.optimizations
    };
  }

  assessContentRelevance(emailContent, target) {
    const { subject, body } = emailContent;
    const userNeeds = this.assessUserNeeds(target);
    
    let relevanceScore = 0;
    
    // Vérifier la mention de l'industrie
    if (body.toLowerCase().includes(target.industry || 'business')) {
      relevanceScore += 20;
    }
    
    // Vérifier la personnalisation du rôle
    if (body.toLowerCase().includes(target.title?.toLowerCase() || 'professional')) {
      relevanceScore += 25;
    }
    
    // Vérifier l'adresse des pain points
    const painPoints = userNeeds.painPoints;
    const addressedPainPoints = painPoints.filter(pain => 
      body.toLowerCase().includes(pain.toLowerCase().split(' ')[0])
    );
    relevanceScore += (addressedPainPoints.length / painPoints.length) * 30;
    
    // Vérifier la proposition de valeur
    if (body.includes('automatisation') || body.includes('efficacité') || body.includes('ROI')) {
      relevanceScore += 25;
    }
    
    return Math.min(relevanceScore, 100);
  }

  predictResponseProbability(emailContent, target) {
    const factors = {
      personalization: this.assessPersonalizationLevel(emailContent, target),
      relevance: this.assessContentRelevance(emailContent, target),
      clarity: this.assessCallToActionClarity(emailContent),
      timing: 85, // Simulé - en réalité dépendrait du moment d'envoi
      credibility: this.assessCredibility(emailContent),
      valueProposition: this.assessValuePropositionStrength(emailContent, target)
    };
    
    // Algorithme de prédiction basé sur les facteurs
    const weights = {
      personalization: 0.25,
      relevance: 0.20,
      clarity: 0.15,
      timing: 0.10,
      credibility: 0.15,
      valueProposition: 0.15
    };
    
    let probability = 0;
    Object.entries(factors).forEach(([factor, score]) => {
      probability += (score / 100) * weights[factor];
    });
    
    return Math.round(probability * 100);
  }

  // ========== MÉTRIQUES ET KPIs ==========

  async defineSuccessMetrics(metricsData) {
    const { target, workflow, businessObjectives } = metricsData;
    
    console.log(`📊 Product Manager définit les métriques de succès`);
    
    const metrics = {
      primary: this.definePrimaryMetrics(),
      secondary: this.defineSecondaryMetrics(),
      leading: this.defineLeadingIndicators(),
      lagging: this.defineLaggingIndicators(),
      qualitative: this.defineQualitativeMetrics()
    };

    // Définir les seuils de succès
    metrics.successThresholds = this.defineSuccessThresholds(target);
    
    // Métriques spécifiques au prospect
    metrics.prospectSpecific = this.defineProspectSpecificMetrics(target);
    
    return {
      metrics,
      measurementPlan: this.createMeasurementPlan(metrics),
      reportingSchedule: this.defineReportingSchedule(),
      improvementTargets: this.defineImprovementTargets(metrics)
    };
  }

  definePrimaryMetrics() {
    return {
      emailOpenRate: {
        description: 'Taux d\'ouverture des emails',
        target: 25,
        measurement: 'percentage',
        frequency: 'daily'
      },
      responseRate: {
        description: 'Taux de réponse positive',
        target: 15,
        measurement: 'percentage',
        frequency: 'daily'
      },
      meetingBookingRate: {
        description: 'Taux de prise de RDV',
        target: 5,
        measurement: 'percentage',
        frequency: 'weekly'
      },
      conversionRate: {
        description: 'Taux de conversion en prospect qualifié',
        target: 3,
        measurement: 'percentage',
        frequency: 'monthly'
      }
    };
  }

  // ========== ANALYSE COMPÉTITIVE ==========

  async analyzeCompetitiveLandscape(competitorData) {
    console.log(`🏆 Product Manager analyse la concurrence`);
    
    const analysis = {
      directCompetitors: this.identifyDirectCompetitors(),
      indirectCompetitors: this.identifyIndirectCompetitors(),
      competitiveAdvantages: this.identifyCompetitiveAdvantages(),
      threats: this.identifyCompetitiveThreats(),
      opportunities: this.identifyMarketOpportunities(),
      positioning: this.defineCompetitivePositioning()
    };

    // Analyse SWOT
    analysis.swot = this.conductSWOTAnalysis();
    
    // Matrice de positionnement
    analysis.positioningMatrix = this.createPositioningMatrix();
    
    return {
      analysis,
      strategicRecommendations: this.generateStrategicRecommendations(analysis),
      differentiationStrategy: this.defineDifferentiationStrategy(analysis)
    };
  }

  identifyDirectCompetitors() {
    return [
      {
        name: 'Outreach.io',
        strengths: ['Market leader', 'Enterprise features', 'Integrations'],
        weaknesses: ['Complex setup', 'High price', 'Limited AI'],
        marketShare: 25
      },
      {
        name: 'SalesLoft',
        strengths: ['User-friendly', 'Good analytics', 'Training'],
        weaknesses: ['Expensive', 'Limited customization'],
        marketShare: 20
      },
      {
        name: 'Apollo',
        strengths: ['Database included', 'Affordable', 'All-in-one'],
        weaknesses: ['Data quality issues', 'Limited personalization'],
        marketShare: 15
      }
    ];
  }

  identifyCompetitiveAdvantages() {
    return [
      {
        advantage: 'Multi-Agent AI Architecture',
        description: 'Système unique d\'agents spécialisés pour une personnalisation poussée',
        strength: 'high',
        sustainability: 'medium'
      },
      {
        advantage: 'Hexagonal Architecture',
        description: 'Architecture modulaire permettant une évolutivité et maintenance supérieures',
        strength: 'medium',
        sustainability: 'high'
      },
      {
        advantage: 'Quality Validation AI',
        description: 'Tests automatisés de qualité et conformité anti-spam intégrés',
        strength: 'high',
        sustainability: 'medium'
      },
      {
        advantage: 'End-to-End Automation',
        description: 'Workflow complet automatisé de l\'analyse à l\'envoi',
        strength: 'medium',
        sustainability: 'medium'
      }
    ];
  }

  // ========== MÉTHODES UTILITAIRES ==========

  initializeProductFramework() {
    // Initialiser les frameworks de gestion produit
    this.metrics.set('acquisition', {
      visitors: 0,
      signups: 0,
      trials: 0,
      conversions: 0
    });
    
    this.metrics.set('activation', {
      firstValue: 0,
      featureAdoption: 0,
      timeToValue: 0
    });
    
    this.metrics.set('retention', {
      daily: 0,
      weekly: 0,
      monthly: 0
    });
  }

  calculateValidationScore(validation) {
    const weights = {
      requirements: 0.25,
      userNeeds: 0.25,
      businessValue: 0.20,
      technicalFeasibility: 0.15,
      marketAlignment: 0.15
    };
    
    let score = 0;
    Object.entries(weights).forEach(([area, weight]) => {
      const areaScore = this.calculateAreaScore(validation[area]);
      score += areaScore * weight;
    });
    
    return Math.round(score);
  }

  calculateAreaScore(areaData) {
    if (typeof areaData === 'number') return areaData;
    if (typeof areaData === 'object' && areaData !== null) {
      const values = Object.values(areaData).filter(v => typeof v === 'number');
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 70;
    }
    return 70; // Score par défaut
  }

  generateProductRecommendations(validation) {
    const recommendations = [];
    
    if (validation.overallScore < 80) {
      recommendations.push({
        priority: 'high',
        area: 'User Experience',
        recommendation: 'Améliorer la clarté du parcours utilisateur',
        effort: 'medium',
        impact: 'high'
      });
    }
    
    if (validation.userNeeds.satisfactionPrediction < 80) {
      recommendations.push({
        priority: 'high',
        area: 'Value Proposition',
        recommendation: 'Renforcer la proposition de valeur pour le persona identifié',
        effort: 'low',
        impact: 'high'
      });
    }
    
    return recommendations;
  }

  benchmarkAgainstBestPractices(emailContent) {
    const bestPractices = [
      { practice: 'Subject line 6-10 words', weight: 15 },
      { practice: 'Personal greeting', weight: 20 },
      { practice: 'Clear value proposition', weight: 25 },
      { practice: 'Single clear CTA', weight: 20 },
      { practice: 'Professional signature', weight: 10 },
      { practice: 'Mobile-friendly format', weight: 10 }
    ];
    
    let score = 0;
    bestPractices.forEach(bp => {
      if (this.checkBestPractice(emailContent, bp.practice)) {
        score += bp.weight;
      }
    });
    
    return score;
  }

  checkBestPractice(emailContent, practice) {
    const { subject, body } = emailContent;
    
    switch (practice) {
      case 'Subject line 6-10 words':
        return subject.split(' ').length >= 6 && subject.split(' ').length <= 10;
      case 'Personal greeting':
        return body.includes('Bonjour') && body.includes('Erwan');
      case 'Clear value proposition':
        return body.includes('automatisation') || body.includes('efficacité');
      case 'Single clear CTA':
        return body.includes('disponible') && body.includes('échange');
      case 'Professional signature':
        return body.includes('Cordialement') || body.includes('L\'équipe');
      case 'Mobile-friendly format':
        return body.length < 1000; // Approximation
      default:
        return false;
    }
  }
}

module.exports = ProductManagerAgent;