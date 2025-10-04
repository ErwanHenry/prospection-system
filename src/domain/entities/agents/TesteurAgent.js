/**
 * Testeur Agent - Agent spécialisé en tests et QA
 * Capable de tester et valider tous les aspects du système
 */

const Agent = require('../Agent');

class TesteurAgent extends Agent {
  constructor(config = {}) {
    super({
      id: config.id || 'testeur_' + Date.now(),
      name: config.name || 'Testeur QA',
      type: 'testeur',
      specialization: 'quality_assurance',
      capabilities: [
        'workflow_testing',
        'data_validation',
        'performance_testing',
        'integration_testing',
        'user_acceptance_testing',
        'security_testing',
        'regression_testing',
        'load_testing',
        'api_testing',
        'email_testing'
      ],
      config: {
        testCoverage: 'comprehensive', // 'basic', 'standard', 'comprehensive'
        automationLevel: 'high', // 'low', 'medium', 'high'
        reportingDetail: 'detailed', // 'summary', 'standard', 'detailed'
        performanceThresholds: {
          maxResponseTime: 5000, // ms
          maxMemoryUsage: 100, // MB
          minSuccessRate: 95 // %
        },
        ...config
      }
    });
    
    this.testSuites = new Map();
    this.testResults = new Map();
    this.performanceMetrics = new Map();
  }

  async processTask(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'test_prospection_workflow':
        return await this.testProspectionWorkflow(data);
      case 'test_email_generation':
        return await this.testEmailGeneration(data);
      case 'test_agent_performance':
        return await this.testAgentPerformance(data);
      case 'validate_data_quality':
        return await this.validateDataQuality(data);
      case 'test_integration':
        return await this.testIntegration(data);
      case 'run_regression_tests':
        return await this.runRegressionTests(data);
      case 'generate_test_report':
        return await this.generateTestReport(data);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  // ========== TESTS SPÉCIALISÉS PROSPECTION ==========

  async testProspectionWorkflow(workflowData) {
    const { target, workflow, expectedOutcome } = workflowData;
    
    console.log(`🧪 Testeur valide le workflow de prospection pour ${target.email}`);
    
    const testSuite = {
      id: `test_prospection_${Date.now()}`,
      target,
      workflow,
      startTime: new Date(),
      tests: []
    };

    try {
      // Test 1: Validation des données d'entrée
      const inputValidation = await this.validateInputData(target);
      testSuite.tests.push({
        name: 'Input Data Validation',
        status: inputValidation.isValid ? 'PASS' : 'FAIL',
        details: inputValidation,
        timestamp: new Date()
      });

      // Test 2: Test de l'analyse du planificateur
      const planificateurTest = await this.testPlanificateurAnalysis(target);
      testSuite.tests.push({
        name: 'Planificateur Analysis',
        status: planificateurTest.isValid ? 'PASS' : 'FAIL',
        details: planificateurTest,
        timestamp: new Date()
      });

      // Test 3: Test de génération d'email
      const emailTest = await this.testEmailGeneration({ target, workflow });
      testSuite.tests.push({
        name: 'Email Generation',
        status: emailTest.isValid ? 'PASS' : 'FAIL',
        details: emailTest,
        timestamp: new Date()
      });

      // Test 4: Test de personnalisation
      const personalizationTest = await this.testPersonalization(target, emailTest.generatedEmail);
      testSuite.tests.push({
        name: 'Email Personalization',
        status: personalizationTest.isValid ? 'PASS' : 'FAIL',
        details: personalizationTest,
        timestamp: new Date()
      });

      // Test 5: Test de qualité du contenu
      const contentQualityTest = await this.testContentQuality(emailTest.generatedEmail);
      testSuite.tests.push({
        name: 'Content Quality',
        status: contentQualityTest.isValid ? 'PASS' : 'FAIL',
        details: contentQualityTest,
        timestamp: new Date()
      });

      // Test 6: Test de conformité (anti-spam)
      const complianceTest = await this.testEmailCompliance(emailTest.generatedEmail);
      testSuite.tests.push({
        name: 'Email Compliance',
        status: complianceTest.isValid ? 'PASS' : 'FAIL',
        details: complianceTest,
        timestamp: new Date()
      });

      testSuite.endTime = new Date();
      testSuite.duration = testSuite.endTime - testSuite.startTime;
      testSuite.overallStatus = this.calculateOverallStatus(testSuite.tests);
      testSuite.successRate = this.calculateSuccessRate(testSuite.tests);

      // Stocker les résultats
      this.testResults.set(testSuite.id, testSuite);

      return {
        testSuiteId: testSuite.id,
        overallStatus: testSuite.overallStatus,
        successRate: testSuite.successRate,
        duration: testSuite.duration,
        testsRun: testSuite.tests.length,
        details: testSuite,
        recommendations: this.generateRecommendations(testSuite)
      };

    } catch (error) {
      testSuite.endTime = new Date();
      testSuite.duration = testSuite.endTime - testSuite.startTime;
      testSuite.overallStatus = 'ERROR';
      testSuite.error = error.message;

      return {
        testSuiteId: testSuite.id,
        overallStatus: 'ERROR',
        error: error.message,
        duration: testSuite.duration,
        details: testSuite
      };
    }
  }

  async validateInputData(target) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100
    };

    // Validation de l'email
    if (!target.email || !this.isValidEmail(target.email)) {
      validation.errors.push('Invalid or missing email address');
      validation.isValid = false;
      validation.score -= 25;
    }

    // Validation du nom
    if (!target.name || target.name.trim().length < 2) {
      validation.errors.push('Invalid or missing name');
      validation.isValid = false;
      validation.score -= 20;
    }

    // Validation de l'entreprise
    if (!target.company || target.company.trim().length < 2) {
      validation.warnings.push('Missing or incomplete company information');
      validation.score -= 10;
    }

    // Validation du titre
    if (!target.title || target.title.trim().length < 2) {
      validation.warnings.push('Missing or incomplete title information');
      validation.score -= 10;
    }

    // Validation de l'URL LinkedIn
    if (target.linkedinUrl && !this.isValidLinkedInUrl(target.linkedinUrl)) {
      validation.warnings.push('Invalid LinkedIn URL format');
      validation.score -= 5;
    }

    validation.score = Math.max(0, validation.score);

    return validation;
  }

  async testPlanificateurAnalysis(target) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      analysisQuality: 0
    };

    try {
      // Simuler l'analyse du planificateur (dans un vrai système, on appellerait l'agent)
      const analysis = {
        industry: this.detectIndustry(target),
        seniority: this.assessSeniority(target.title),
        opportunityScore: this.calculateOpportunityScore(target)
      };

      // Valider la qualité de l'analyse
      if (analysis.industry === 'unknown') {
        validation.warnings.push('Could not determine target industry');
        validation.analysisQuality -= 20;
      }

      if (analysis.seniority === 'unknown') {
        validation.warnings.push('Could not assess target seniority');
        validation.analysisQuality -= 15;
      }

      if (analysis.opportunityScore < 30) {
        validation.warnings.push('Low opportunity score detected');
        validation.analysisQuality -= 10;
      }

      validation.analysisQuality = Math.max(0, 100 + validation.analysisQuality);
      validation.analysis = analysis;

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Analysis failed: ${error.message}`);
    }

    return validation;
  }

  async testEmailGeneration(data) {
    const { target, workflow } = data;
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      generatedEmail: null,
      qualityScore: 0
    };

    try {
      // Simuler la génération d'email (dans un vrai système, on appellerait l'agent approprié)
      const generatedEmail = await this.simulateEmailGeneration(target);
      validation.generatedEmail = generatedEmail;

      // Valider la structure de l'email
      if (!generatedEmail.subject || generatedEmail.subject.length < 10) {
        validation.errors.push('Missing or too short email subject');
        validation.isValid = false;
      }

      if (!generatedEmail.body || generatedEmail.body.length < 50) {
        validation.errors.push('Missing or too short email body');
        validation.isValid = false;
      }

      // Calculer le score de qualité
      validation.qualityScore = this.calculateEmailQualityScore(generatedEmail);

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Email generation failed: ${error.message}`);
    }

    return validation;
  }

  async testPersonalization(target, email) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      personalizationScore: 0
    };

    if (!email) {
      validation.isValid = false;
      validation.errors.push('No email provided for personalization testing');
      return validation;
    }

    const subject = email.subject || '';
    const body = email.body || '';
    const fullText = (subject + ' ' + body).toLowerCase();

    let score = 0;

    // Test présence du nom
    if (target.name && fullText.includes(target.name.toLowerCase())) {
      score += 25;
    } else {
      validation.warnings.push('Target name not found in email');
    }

    // Test présence de l'entreprise
    if (target.company && fullText.includes(target.company.toLowerCase())) {
      score += 20;
    } else {
      validation.warnings.push('Target company not mentioned in email');
    }

    // Test présence du titre/rôle
    if (target.title && fullText.includes(target.title.toLowerCase())) {
      score += 15;
    }

    // Test de personnalisation contextuelle
    const personalElements = [
      'industry', 'sector', 'domain', 'field',
      'role', 'position', 'responsibility',
      'challenge', 'goal', 'objective'
    ];

    const foundElements = personalElements.filter(element => fullText.includes(element));
    score += Math.min(foundElements.length * 5, 40);

    validation.personalizationScore = score;

    if (score < 30) {
      validation.warnings.push('Low personalization score - email may appear generic');
    }

    return validation;
  }

  async testContentQuality(email) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      qualityMetrics: {}
    };

    if (!email) {
      validation.isValid = false;
      validation.errors.push('No email provided for content quality testing');
      return validation;
    }

    const subject = email.subject || '';
    const body = email.body || '';

    // Test longueur du sujet
    if (subject.length < 10 || subject.length > 100) {
      validation.warnings.push('Subject line length not optimal (10-100 chars recommended)');
    }

    // Test longueur du corps
    if (body.length < 100 || body.length > 1000) {
      validation.warnings.push('Email body length not optimal (100-1000 chars recommended)');
    }

    // Test présence d'un CTA
    const ctaKeywords = ['call', 'contact', 'meeting', 'discuss', 'schedule', 'book', 'talk', 'chat'];
    const hasCTA = ctaKeywords.some(keyword => body.toLowerCase().includes(keyword));
    
    if (!hasCTA) {
      validation.warnings.push('No clear call-to-action detected');
    }

    // Test ton professionnel
    const unprofessionalWords = ['urgent', 'free', 'guarantee', 'limited time', 'act now'];
    const hasUnprofessionalTone = unprofessionalWords.some(word => 
      body.toLowerCase().includes(word.toLowerCase())
    );

    if (hasUnprofessionalTone) {
      validation.warnings.push('Potentially unprofessional tone detected');
    }

    validation.qualityMetrics = {
      subjectLength: subject.length,
      bodyLength: body.length,
      hasCTA,
      professionalTone: !hasUnprofessionalTone,
      readabilityScore: this.calculateReadabilityScore(body)
    };

    return validation;
  }

  async testEmailCompliance(email) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      complianceScore: 100
    };

    if (!email) {
      validation.isValid = false;
      validation.errors.push('No email provided for compliance testing');
      return validation;
    }

    const fullText = (email.subject + ' ' + email.body).toLowerCase();

    // Test mots-clés spam
    const spamKeywords = [
      'free money', 'guaranteed', 'make money fast', 'click here now',
      'limited time', 'act now', 'urgent response', 'congratulations',
      'you have won', 'special promotion', 'exclusive offer'
    ];

    const foundSpamKeywords = spamKeywords.filter(keyword => fullText.includes(keyword));
    if (foundSpamKeywords.length > 0) {
      validation.warnings.push(`Potential spam keywords detected: ${foundSpamKeywords.join(', ')}`);
      validation.complianceScore -= foundSpamKeywords.length * 15;
    }

    // Test excès de majuscules
    const capsRatio = (email.subject.match(/[A-Z]/g) || []).length / email.subject.length;
    if (capsRatio > 0.3) {
      validation.warnings.push('Excessive use of capital letters in subject');
      validation.complianceScore -= 10;
    }

    // Test excès de ponctuation
    const punctuationRatio = (fullText.match(/[!?]{2,}/g) || []).length;
    if (punctuationRatio > 0) {
      validation.warnings.push('Excessive punctuation detected');
      validation.complianceScore -= 5;
    }

    validation.complianceScore = Math.max(0, validation.complianceScore);

    return validation;
  }

  // ========== MÉTHODES UTILITAIRES ==========

  async simulateEmailGeneration(target) {
    // Simulation simple de génération d'email
    return {
      subject: `${target.name}, optimisez votre prospection B2B avec Graixl`,
      body: `Bonjour ${target.name},

En tant que ${target.title} chez ${target.company}, vous savez combien il peut être chronophage de prospecter efficacement.

Graixl automatise votre prospection B2B en utilisant l'IA pour :
• Identifier les prospects les plus qualifiés
• Personnaliser automatiquement vos messages
• Optimiser vos taux de conversion

Nos clients augmentent leur efficacité commerciale de 75% en moyenne.

Seriez-vous disponible pour un échange de 15 minutes cette semaine pour découvrir comment Graixl pourrait booster votre développement commercial ?

Cordialement,
L'équipe Graixl`,
      to: target.email,
      from: 'contact@graixl.com'
    };
  }

  calculateEmailQualityScore(email) {
    let score = 0;
    
    if (email.subject && email.subject.length >= 10 && email.subject.length <= 100) score += 25;
    if (email.body && email.body.length >= 100 && email.body.length <= 1000) score += 25;
    if (email.body && email.body.includes('Bonjour')) score += 10;
    if (email.body && email.body.includes('Cordialement')) score += 10;
    if (email.body && /\b(call|contact|meeting|discuss)\b/i.test(email.body)) score += 15;
    if (email.subject && !email.subject.includes('!')) score += 15;
    
    return Math.min(score, 100);
  }

  calculateReadabilityScore(text) {
    // Score de lisibilité simple basé sur la longueur des phrases
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = text.split(' ').length / sentences.length;
    
    if (avgSentenceLength <= 15) return 'excellent';
    if (avgSentenceLength <= 20) return 'good';
    if (avgSentenceLength <= 25) return 'fair';
    return 'poor';
  }

  calculateOverallStatus(tests) {
    const failed = tests.filter(t => t.status === 'FAIL').length;
    if (failed === 0) return 'PASS';
    if (failed <= tests.length * 0.2) return 'PASS_WITH_WARNINGS';
    return 'FAIL';
  }

  calculateSuccessRate(tests) {
    const passed = tests.filter(t => t.status === 'PASS').length;
    return Math.round((passed / tests.length) * 100);
  }

  generateRecommendations(testSuite) {
    const recommendations = [];
    
    testSuite.tests.forEach(test => {
      if (test.status === 'FAIL') {
        switch (test.name) {
          case 'Input Data Validation':
            recommendations.push('Améliorer la qualité des données d\'entrée');
            break;
          case 'Email Generation':
            recommendations.push('Optimiser l\'algorithme de génération d\'emails');
            break;
          case 'Email Personalization':
            recommendations.push('Renforcer la personnalisation des messages');
            break;
          case 'Content Quality':
            recommendations.push('Améliorer la qualité rédactionnelle');
            break;
          case 'Email Compliance':
            recommendations.push('Revoir le contenu pour éviter les filtres anti-spam');
            break;
        }
      }
    });

    if (testSuite.successRate < 80) {
      recommendations.push('Révision générale du workflow recommandée');
    }

    return recommendations;
  }

  // Méthodes utilitaires héritées/simplifiées
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  isValidLinkedInUrl(url) {
    return url.includes('linkedin.com/in/');
  }

  detectIndustry(target) {
    // Simplification pour les tests
    const company = (target.company || '').toLowerCase();
    if (company.includes('tech')) return 'tech';
    if (company.includes('consulting')) return 'consulting';
    return 'other';
  }

  assessSeniority(title) {
    if (!title) return 'unknown';
    const titleLower = title.toLowerCase();
    if (['ceo', 'cto', 'founder'].some(t => titleLower.includes(t))) return 'senior';
    if (['director', 'manager'].some(t => titleLower.includes(t))) return 'mid';
    return 'junior';
  }

  calculateOpportunityScore(target) {
    let score = 50;
    if (this.assessSeniority(target.title) === 'senior') score += 30;
    if (this.detectIndustry(target) === 'tech') score += 20;
    return Math.min(score, 100);
  }
}

module.exports = TesteurAgent;