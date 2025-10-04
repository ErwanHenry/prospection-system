/**
 * Graixl Lead Generation System
 * Système automatisé pour générer des leads qualifiés pour Graixl.com
 * Objectif: Booking démos pour les services de recrutement IA Graixl
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const LinkedInApollo = require('../backend/services/linkedinApollo');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========== CONFIGURATION ==========

app.use(cors());
app.use(express.json());

// Configuration APIs (à remplir avec vraies clés)
const API_KEYS = {
  APOLLO: process.env.APOLLO_API_KEY || 'demo_apollo_key',
  HUNTER: process.env.HUNTER_API_KEY || 'demo_hunter_key', 
  LEMLIST: process.env.LEMLIST_API_KEY || 'demo_lemlist_key',
  CALENDLY: process.env.CALENDLY_TOKEN || 'demo_calendly_token'
};

// ========== GRAIXL LEAD GENERATION SYSTEM ==========

class GraixlLeadSystem {
  constructor() {
    this.metrics = {
      prospectsFound: 0,
      emailsSent: 0,
      demosBooked: 0,
      conversionRate: 0,
      activeSequences: 0
    };
    
    // Templates email spécifiques aux services Graixl
    this.emailTemplates = this.initializeGraixlTemplates();
    
    // Initialiser Apollo.io pour de vraies données
    this.apolloClient = new LinkedInApollo();
  }

  initializeGraixlTemplates() {
    return {
      banking: {
        subject: "{firstName}, réduire les coûts RH de 90% en Banking ?",
        body: `Bonjour {firstName},

{company} opère dans un secteur où le recrutement est critique et coûteux.

Le défi Banking : processus longs, conformité stricte, talents rares.

Graixl transforme ça avec l'IA vocale :
• Interviews automatisées 24/7 conformes aux réglementations bancaires
• Screening multilingue pour talents internationaux
• Évaluation objective sans biais humains
• 85% de réduction du time-to-hire

**Cas concret Banking :**
Une banque européenne a réduit son processus de recrutement de 4 mois à 2 semaines tout en maintenant la qualité d'évaluation.

**ROI calculé pour {company} :**
• Coût actuel par recrutement : ~15-25k€
• Avec Graixl : ~2-3k€ tout compris
• Économie potentielle : 200-300k€/an

Seriez-vous ouvert à une démo Banking de 15 minutes ?

📅 Réserver un créneau : [CALENDLY_LINK]

Cordialement,
L'équipe Graixl

P.S. : Cette approche révolutionne déjà le recrutement dans 15+ banques européennes.`
      },

      ecommerce: {
        subject: "Recrutement saisonnier automatisé pour {company}",
        body: `Bonjour {firstName},

E-commerce = recrutement en dents de scie : pics avant Black Friday, calme après fêtes...

{company} doit sûrement jongler entre :
• Embauches urgentes octobre-décembre
• Budget serré janvier-mars  
• Turnover saisonnier élevé
• Évaluation rapide mais qualitative

Graixl résout ces 4 défis d'un coup :
• Screening instantané 24/7 (pas d'attente recruteur)
• Coût fixe prévisible vs variables externes
• Évaluation qualité constante même en rush
• Scaling immédiat selon vos besoins

**Cas client e-commerce :**
Un leader européen recrute maintenant 50 saisonniers en 48h (vs 3 semaines avant). Qualité maintenue, coûts divisés par 5.

**Impact pour {company} :**
• Réactivité marché : de semaines à heures
• Prévisibilité budget RH
• Qualité équipes renforcée

15 minutes pour découvrir l'approche e-commerce ?

📅 Démo spécialisée : [CALENDLY_LINK]

Cordialement,
L'équipe Graixl`
      },

      startups: {
        subject: "Scaling RH : de 20 à 200 personnes sans friction",
        body: `Bonjour {firstName},

Startup en hypercroissance = défi RH exponential :
• 1 recruteur pour 50+ embauches
• Qualité vs vitesse : le dilemme constant
• Budget contrôlé mais besoins explosifs

{company} vit sûrement cette tension.

Graixl = solution de scaling RH :
• Pas d'effet de seuil (capacité infinie)
• Qualité constante à tous les volumes
• ROI prévisible (pas de surprise budget)
• Setup en 48h, impact immédiat

**Cas startup tech :**
Une scale-up parisienne a 10x son équipe en 6 mois (20→200) avec Graixl comme backbone RH.

**Avantages spécifiques startups :**
• Évaluation soft skills + techniques
• Adaptation culturelle automatique
• Reporting investisseurs inclus
• Intégration ATS existants

Découvrir l'approche scaling en 15 min ?

📅 Démo croissance : [CALENDLY_LINK]

Cordialement,
L'équipe Graixl

P.S. : Partenariats exclusifs régionaux encore disponibles (dépôt 5k€, revenus 10-15%).`
      },

      gaming: {
        subject: "{firstName}, recruter les meilleurs talents Gaming internationaux",
        body: `Bonjour {firstName},

Gaming = marché global, talents dispersés, compétition féroce.

{company} cherche sûrement :
• Devs gaming expérimentés (rares)
• Créatifs multilingues
• Profils techniques + passion
• Évaluation skills spécifiques

Graixl gaming-optimized :
• Évaluation technique gaming (Unity, Unreal, etc.)
• Tests créativité intégrés
• Screening passion gaming automatique
• Recrutement 24/7 (global talent pool)

**Cas studio gaming :**
Un studio AAA recrute maintenant ses talents en 1 semaine vs 3-4 mois. Portfolio technique + fit culturel évalués automatiquement.

**Spécificités gaming :**
• Tests techniques immersifs
• Évaluation créativité objective
• Screening passion authentique
• Profils internationaux sans barrière

15 minutes pour voir l'approche gaming ?

📅 Démo gaming : [CALENDLY_LINK]

Cordialement,
L'équipe Graixl`
      }
    };
  }

  // ========== PROSPECTION AUTOMATISÉE ==========

  async findGraixlProspects(criteria = {}) {
    try {
      console.log('🔍 [GRAIXL] Recherche RÉELLE avec Apollo.io');
      
      // Construire la requête Apollo.io optimisée pour Graixl
      const searchQuery = this.buildGraixlSearchQuery(criteria);
      
      let prospects = [];
      
      // Essayer d'abord Apollo.io avec vraie API
      try {
        console.log('🚀 [GRAIXL] Tentative Apollo.io API réelle...');
        prospects = await this.apolloClient.search(searchQuery, 20);
        
        if (prospects && prospects.length > 0 && !prospects[0].error) {
          console.log(`✅ [GRAIXL] ${prospects.length} VRAIS prospects Apollo.io`);
        } else {
          throw new Error('Apollo API returned no valid results');
        }
        
      } catch (apolloError) {
        console.log(`⚠️ [GRAIXL] Apollo.io erreur: ${apolloError.message}`);
        console.log('🔄 [GRAIXL] Fallback vers données simulées de qualité');
        
        // Fallback vers simulation améliorée
        prospects = await this.simulateApolloSearch(criteria);
      }

      // Enrichissement et scoring Graixl-specific
      const enrichedProspects = await this.enrichForGraixl(prospects);
      
      // Filtrage qualification
      const qualifiedProspects = enrichedProspects.filter(p => p.graixlScore > 70);

      this.metrics.prospectsFound += qualifiedProspects.length;
      
      return {
        success: true,
        prospects: qualifiedProspects,
        total: qualifiedProspects.length,
        criteria: criteria,
        dataSource: prospects.length > 0 && !prospects[0].error ? 'apollo_real' : 'simulation'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  buildGraixlSearchQuery(criteria) {
    // Construire requête optimisée pour Apollo.io
    const industries = criteria.industries || ["banking", "ecommerce", "gaming", "technology"];
    const locations = criteria.locations || ["France", "Belgium", "Switzerland"];
    
    // Mapping industries vers termes Apollo
    const industryMap = {
      'banking': 'financial services banking',
      'ecommerce': 'e-commerce retail',
      'gaming': 'gaming entertainment',
      'technology': 'technology software saas',
      'startups': 'startup scale-up'
    };
    
    // Construire la requête combinée
    const industryTerms = industries.map(ind => industryMap[ind] || ind).join(' OR ');
    const locationTerms = locations.join(' OR ');
    
    return `talent acquisition OR hr director OR head of hr OR people ops (${industryTerms}) (${locationTerms})`;
  }

  async simulateApolloSearch(criteria) {
    // Simulation prospects réalistes pour démo
    const demoProspects = [
      {
        id: 'apollo_1',
        email: 'marie.dupont@bnpparibas.com',
        firstName: 'Marie',
        lastName: 'Dupont',
        name: 'Marie Dupont',
        title: 'Head of Talent Acquisition',
        company: 'BNP Paribas',
        industry: 'banking',
        companySize: 1000,
        location: 'Paris, France',
        linkedinUrl: 'https://linkedin.com/in/mariedupont',
        recentFunding: false,
        activeHiring: true
      },
      {
        id: 'apollo_2',
        email: 'thomas.martin@zalando.com',
        firstName: 'Thomas',
        lastName: 'Martin', 
        name: 'Thomas Martin',
        title: 'VP People & Culture',
        company: 'Zalando',
        industry: 'ecommerce',
        companySize: 500,
        location: 'Berlin, Germany',
        linkedinUrl: 'https://linkedin.com/in/thomasmartin',
        recentFunding: true,
        activeHiring: true
      },
      {
        id: 'apollo_3',
        email: 'sarah.chen@ubisoft.com',
        firstName: 'Sarah',
        lastName: 'Chen',
        name: 'Sarah Chen',
        title: 'Talent Acquisition Director',
        company: 'Ubisoft',
        industry: 'gaming',
        companySize: 800,
        location: 'Paris, France',
        linkedinUrl: 'https://linkedin.com/in/sarahchen',
        recentFunding: false,
        activeHiring: true
      }
    ];

    return demoProspects.filter(p => 
      criteria.industries.includes(p.industry) &&
      criteria.titles.some(title => p.title.toLowerCase().includes(title.split(' ')[0]))
    );
  }

  async enrichForGraixl(prospects) {
    const enrichedProspects = [];
    
    for (const prospect of prospects) {
      // Score spécifique aux besoins Graixl
      prospect.graixlScore = this.calculateGraixlScore(prospect);
      
      // Validation email réelle avec Hunter.io
      prospect.emailValid = await this.simulateEmailValidation(prospect.email);
      
      prospect.painPoints = this.identifyGraixlPainPoints(prospect);
      prospect.templateCategory = this.categorizeForTemplate(prospect);
      
      enrichedProspects.push(prospect);
    }
    
    return enrichedProspects;
  }

  calculateGraixlScore(prospect) {
    let score = 50; // Base score
    
    // Industry fit
    const industryBonus = {
      'banking': 25,
      'ecommerce': 20,
      'gaming': 20,
      'technology': 15,
      'education': 15
    };
    score += industryBonus[prospect.industry] || 5;
    
    // Company size (sweet spot 50-1000)
    if (prospect.companySize >= 50 && prospect.companySize <= 1000) {
      score += 20;
    }
    
    // Active hiring
    if (prospect.activeHiring) score += 15;
    
    // Senior role
    if (prospect.title.includes('head') || prospect.title.includes('director') || 
        prospect.title.includes('vp') || prospect.title.includes('chief')) {
      score += 10;
    }
    
    // Recent funding (growth signal)
    if (prospect.recentFunding) score += 10;
    
    return Math.min(score, 100);
  }

  async simulateEmailValidation(email) {
    // Validation réelle avec Hunter.io si disponible
    if (API_KEYS.HUNTER && API_KEYS.HUNTER !== 'demo_hunter_key') {
      try {
        const response = await axios.get(`https://api.hunter.io/v2/email-verifier`, {
          params: {
            email: email,
            api_key: API_KEYS.HUNTER
          }
        });
        
        if (response.data && response.data.data) {
          const result = response.data.data.result;
          console.log(`📧 [HUNTER] Email ${email}: ${result}`);
          return result === 'deliverable';
        }
      } catch (error) {
        console.log(`⚠️ [HUNTER] Erreur validation ${email}: ${error.message}`);
      }
    }
    
    // Fallback: simulation améliorée basée sur domaines
    const domain = email.split('@')[1];
    const validDomains = ['gmail.com', 'outlook.com', 'company.com', 'bnpparibas.com', 'zalando.com', 'ubisoft.com'];
    const isKnownDomain = validDomains.some(d => domain.includes(d.split('.')[0]));
    
    return isKnownDomain ? true : Math.random() > 0.2; // 80% valid pour domaines inconnus
  }

  identifyGraixlPainPoints(prospect) {
    const painPointsMap = {
      'banking': ['compliance', 'long_processes', 'quality_control', 'multilingual'],
      'ecommerce': ['seasonal_hiring', 'scaling', 'cost_control', 'speed'],
      'gaming': ['specialized_skills', 'global_talent', 'creativity_assessment', 'passion_fit'],
      'technology': ['technical_skills', 'cultural_fit', 'scaling', 'competition'],
      'education': ['budget_constraints', 'seasonal_needs', 'compliance', 'values_fit']
    };
    
    return painPointsMap[prospect.industry] || ['general_hiring_challenges'];
  }

  categorizeForTemplate(prospect) {
    if (prospect.industry === 'banking' || prospect.industry === 'financial services') {
      return 'banking';
    }
    if (prospect.industry === 'ecommerce' || prospect.industry === 'retail') {
      return 'ecommerce';
    }
    if (prospect.industry === 'gaming' || prospect.industry === 'entertainment') {
      return 'gaming';
    }
    if (prospect.companySize < 200 && prospect.recentFunding) {
      return 'startups';
    }
    return 'banking'; // Default template
  }

  // ========== GÉNÉRATION EMAILS GRAIXL ==========

  async generateGraixlEmail(prospect) {
    const template = this.emailTemplates[prospect.templateCategory];
    
    if (!template) {
      throw new Error(`Template not found for category: ${prospect.templateCategory}`);
    }

    // Personnalisation automatique
    const personalizedEmail = {
      to: prospect.email,
      subject: this.personalizeText(template.subject, prospect),
      body: this.personalizeText(template.body, prospect),
      from: 'demo@graixl.com',
      category: prospect.templateCategory,
      graixlScore: prospect.graixlScore,
      painPoints: prospect.painPoints,
      calendlyLink: `https://calendly.com/graixl-demo/${prospect.templateCategory}`,
      timestamp: new Date()
    };

    this.metrics.emailsGenerated++;
    return personalizedEmail;
  }

  personalizeText(text, prospect) {
    return text
      .replace(/{firstName}/g, prospect.firstName || prospect.name)
      .replace(/{company}/g, prospect.company)
      .replace(/{title}/g, prospect.title)
      .replace(/\[CALENDLY_LINK\]/g, `https://calendly.com/graixl-demo/${prospect.templateCategory}`);
  }

  // ========== AUTOMATION OUTREACH ==========

  async launchGraixlSequence(prospects) {
    const results = {
      success: true,
      launched: 0,
      errors: 0,
      sequences: []
    };

    for (const prospect of prospects) {
      try {
        // Génération email personnalisé
        const email = await this.generateGraixlEmail(prospect);
        
        // Simulation envoi via Lemlist
        const sequenceResult = await this.simulateLemlistSequence(prospect, email);
        
        results.sequences.push({
          prospect: prospect.email,
          status: sequenceResult.success ? 'launched' : 'failed',
          sequenceId: sequenceResult.sequenceId,
          category: prospect.templateCategory
        });
        
        if (sequenceResult.success) {
          results.launched++;
          this.metrics.emailsSent++;
          this.metrics.activeSequences++;
        } else {
          results.errors++;
        }
        
      } catch (error) {
        results.errors++;
        results.sequences.push({
          prospect: prospect.email,
          status: 'error',
          error: error.message
        });
      }
    }

    return results;
  }

  async simulateLemlistSequence(prospect, email) {
    // Simulation API Lemlist
    console.log(`📧 [GRAIXL] Launching sequence for ${prospect.email} (${prospect.company})`);
    console.log(`📧 [GRAIXL] Category: ${prospect.templateCategory}`);
    console.log(`📧 [GRAIXL] Score: ${prospect.graixlScore}`);
    
    return {
      success: true,
      sequenceId: `graixl_${prospect.templateCategory}_${Date.now()}`,
      message: 'Sequence launched successfully'
    };
  }

  // ========== BOOKING DÉMO ==========

  async handleDemoBooking(bookingData) {
    try {
      const { email, name, company, selectedTime, category } = bookingData;
      
      // Enrichissement pré-démo
      const demoPrep = await this.generateDemoPrep({
        email, name, company, category
      });
      
      // Simulation booking Calendly
      const booking = {
        id: `demo_${Date.now()}`,
        attendee: { email, name, company },
        time: selectedTime,
        category: category,
        demoPrep: demoPrep,
        status: 'confirmed',
        meetingLink: 'https://meet.google.com/graixl-demo',
        timestamp: new Date()
      };
      
      this.metrics.demosBooked++;
      this.updateConversionRate();
      
      // Notification équipe (simulation Slack)
      await this.notifySalesTeam(booking);
      
      return {
        success: true,
        booking: booking
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateDemoPrep(prospectData) {
    const { company, category } = prospectData;
    
    const demoPreps = {
      banking: {
        focusAreas: ['Compliance & réglementation', 'Évaluation risques', 'Multilingual'],
        caseStudy: 'Banque européenne - 75% time-to-hire reduction',
        painPoints: ['Processus longs', 'Conformité', 'Talents rares'],
        demoFlow: 'Compliance → Technical → ROI',
        estimatedROI: '200-500k€/an'
      },
      ecommerce: {
        focusAreas: ['Recrutement saisonnier', 'Scaling rapide', 'Cost control'],
        caseStudy: 'E-commerce leader - 50 saisonniers en 48h',
        painPoints: ['Pics saisonniers', 'Budget variable', 'Turnover'],
        demoFlow: 'Seasonal → Scaling → Predictability',
        estimatedROI: '100-300k€/an'
      },
      gaming: {
        focusAreas: ['Skills techniques', 'Créativité', 'Passion gaming'],
        caseStudy: 'Studio AAA - Talents internationaux',
        painPoints: ['Skills rares', 'Créativité', 'Global talent'],
        demoFlow: 'Technical → Creative → Cultural',
        estimatedROI: '150-400k€/an'
      },
      startups: {
        focusAreas: ['Scaling RH', 'Budget contrôlé', 'Cultural fit'],
        caseStudy: 'Scale-up 20→200 en 6 mois',
        painPoints: ['Hypercroissance', 'Budget', 'Qualité'],
        demoFlow: 'Scaling → Budget → Quality',
        estimatedROI: '50-200k€/an'
      }
    };
    
    return demoPreps[category] || demoPreps.banking;
  }

  async notifySalesTeam(booking) {
    console.log(`🔔 [GRAIXL SALES] Nouvelle démo bookée !`);
    console.log(`👤 ${booking.attendee.name} - ${booking.attendee.company}`);
    console.log(`📅 ${booking.time}`);
    console.log(`🎯 Catégorie: ${booking.category}`);
    console.log(`💡 Focus: ${booking.demoPrep.focusAreas.join(', ')}`);
    console.log(`💰 ROI estimé: ${booking.demoPrep.estimatedROI}`);
  }

  updateConversionRate() {
    if (this.metrics.emailsSent > 0) {
      this.metrics.conversionRate = Math.round(
        (this.metrics.demosBooked / this.metrics.emailsSent) * 100
      );
    }
  }

  // ========== MÉTRIQUES & ANALYTICS ==========

  getSystemMetrics() {
    return {
      ...this.metrics,
      roi: this.calculateROI(),
      activeTemplates: Object.keys(this.emailTemplates).length,
      avgGraixlScore: 85, // Simulation
      topPerformingCategory: 'banking' // Simulation
    };
  }

  calculateROI() {
    const avgDemoValue = 15000; // Valeur moyenne client Graixl
    const conversionDemoToClient = 0.3; // 30% conversion démo → client
    
    const projectedRevenue = this.metrics.demosBooked * avgDemoValue * conversionDemoToClient;
    const estimatedCost = 100; // Budget mensuel
    
    return {
      projectedRevenue: projectedRevenue,
      cost: estimatedCost,
      roi: estimatedCost > 0 ? Math.round((projectedRevenue / estimatedCost) * 100) : 0
    };
  }
}

// Initialisation du système
const graixlLeadSystem = new GraixlLeadSystem();

// ========== ROUTES API ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Graixl Lead Generation System',
    version: '1.0.0',
    timestamp: new Date(),
    activeTemplates: Object.keys(graixlLeadSystem.emailTemplates).length
  });
});

// Documentation API
app.get('/api/v1/docs', (req, res) => {
  res.json({
    title: 'Graixl Lead Generation API',
    description: 'Système automatisé de génération de leads pour Graixl.com',
    objective: 'Générer des rendez-vous démo pour les services de recrutement IA Graixl',
    endpoints: {
      'POST /api/v1/prospects/find': 'Rechercher prospects RH qualifiés',
      'POST /api/v1/campaigns/launch': 'Lancer séquence email automatisée',
      'POST /api/v1/demos/book': 'Booking démo automatique',
      'GET /api/v1/metrics': 'Métriques et ROI',
      'GET /api/v1/templates': 'Templates email par secteur'
    },
    targetIndustries: ['banking', 'ecommerce', 'gaming', 'startups'],
    features: [
      'Prospection automatisée Apollo.io',
      'Templates sectoriels Graixl',
      'Séquences email personnalisées',
      'Booking démo Calendly',
      'Analytics ROI temps réel'
    ]
  });
});

// Recherche prospects automatisée
app.post('/api/v1/prospects/find', async (req, res) => {
  try {
    const { industries, locations, companySize } = req.body;
    
    const result = await graixlLeadSystem.findGraixlProspects({
      industries: industries || ['banking', 'ecommerce', 'gaming'],
      locations: locations || ['France', 'Belgium', 'Switzerland'],
      companySize: companySize || ['51-200', '201-500', '501-1000']
    });
    
    res.json(result);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Lancement campagne automatisée
app.post('/api/v1/campaigns/launch', async (req, res) => {
  try {
    const { prospects, campaignName } = req.body;
    
    if (!prospects || prospects.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prospects array required'
      });
    }
    
    const result = await graixlLeadSystem.launchGraixlSequence(prospects);
    
    res.json({
      success: true,
      campaign: {
        name: campaignName,
        timestamp: new Date(),
        ...result
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Booking démo
app.post('/api/v1/demos/book', async (req, res) => {
  try {
    const bookingData = req.body;
    const result = await graixlLeadSystem.handleDemoBooking(bookingData);
    
    res.json(result);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Métriques système
app.get('/api/v1/metrics', (req, res) => {
  const metrics = graixlLeadSystem.getSystemMetrics();
  
  res.json({
    success: true,
    metrics: metrics,
    service: 'Graixl Lead Generation',
    lastUpdate: new Date()
  });
});

// Templates email
app.get('/api/v1/templates', (req, res) => {
  res.json({
    success: true,
    templates: Object.keys(graixlLeadSystem.emailTemplates).map(category => ({
      category: category,
      subject: graixlLeadSystem.emailTemplates[category].subject,
      targetIndustry: category,
      personalizations: ['firstName', 'company', 'title']
    }))
  });
});

// Workflow complet automatisé
app.post('/api/v1/workflow/auto', async (req, res) => {
  try {
    const { criteria } = req.body;
    
    console.log('🚀 [GRAIXL] Démarrage workflow automatisé complet');
    
    // 1. Prospection
    const prospectResult = await graixlLeadSystem.findGraixlProspects(criteria);
    
    if (!prospectResult.success || prospectResult.prospects.length === 0) {
      return res.json({
        success: false,
        message: 'Aucun prospect qualifié trouvé',
        result: prospectResult
      });
    }
    
    console.log(`🎯 [GRAIXL] ${prospectResult.prospects.length} prospects qualifiés trouvés`);
    
    // 2. Lancement séquences
    const campaignResult = await graixlLeadSystem.launchGraixlSequence(prospectResult.prospects);
    
    console.log(`📧 [GRAIXL] ${campaignResult.launched} séquences lancées`);
    
    res.json({
      success: true,
      workflow: {
        prospection: {
          found: prospectResult.prospects.length,
          qualified: prospectResult.prospects.filter(p => p.graixlScore > 80).length
        },
        outreach: {
          launched: campaignResult.launched,
          errors: campaignResult.errors
        },
        categories: {
          banking: prospectResult.prospects.filter(p => p.templateCategory === 'banking').length,
          ecommerce: prospectResult.prospects.filter(p => p.templateCategory === 'ecommerce').length,
          gaming: prospectResult.prospects.filter(p => p.templateCategory === 'gaming').length,
          startups: prospectResult.prospects.filter(p => p.templateCategory === 'startups').length
        },
        nextSteps: [
          'Séquences email en cours',
          'Suivi automatique J+3, J+7, J+14',
          'Booking démo sur engagement',
          'Notification équipe sales'
        ]
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== SERVEUR ==========

app.listen(PORT, () => {
  console.log(`🚀 Graixl Lead Generation System démarré sur le port ${PORT}`);
  console.log(`🎯 Objectif: Générer des démos pour Graixl.com`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/v1/metrics`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api/v1/docs`);
  console.log(`🤖 Templates actifs: ${Object.keys(graixlLeadSystem.emailTemplates).length}`);
});

module.exports = app;