/**
 * Backend Developer Agent - Agent spécialisé en développement backend
 * Capable de créer des APIs, services, et architectures backend
 */

const Agent = require('../Agent');

class BackendDeveloperAgent extends Agent {
  constructor(config = {}) {
    super({
      id: config.id || 'backend_dev_' + Date.now(),
      name: config.name || 'Backend Developer',
      type: 'backend-developer',
      specialization: 'backend_development',
      capabilities: [
        'api_development',
        'database_design',
        'service_architecture',
        'authentication_systems',
        'data_processing',
        'integration_development',
        'performance_optimization',
        'security_implementation',
        'microservices_design',
        'event_handling'
      ],
      config: {
        preferredFramework: 'express', // 'express', 'fastify', 'nest'
        databasePreference: 'mongodb', // 'mongodb', 'postgresql', 'mysql'
        authStrategy: 'jwt', // 'jwt', 'oauth', 'session'
        architectureStyle: 'hexagonal', // 'mvc', 'hexagonal', 'microservices'
        testingFramework: 'jest', // 'jest', 'mocha', 'vitest'
        ...config
      }
    });
    
    this.codeTemplates = new Map();
    this.servicePatterns = new Map();
    this.initializeTemplates();
  }

  async processTask(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'create_api_endpoint':
        return await this.createApiEndpoint(data);
      case 'design_database_schema':
        return await this.designDatabaseSchema(data);
      case 'implement_authentication':
        return await this.implementAuthentication(data);
      case 'create_service_layer':
        return await this.createServiceLayer(data);
      case 'optimize_performance':
        return await this.optimizePerformance(data);
      case 'implement_integration':
        return await this.implementIntegration(data);
      case 'setup_email_service':
        return await this.setupEmailService(data);
      case 'create_prospection_api':
        return await this.createProspectionAPI(data);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  // ========== DÉVELOPPEMENT D'API ==========

  async createApiEndpoint(endpointData) {
    const { name, method, path, functionality, authentication = false } = endpointData;
    
    console.log(`🔧 Backend Dev crée l'endpoint ${method} ${path}`);
    
    const endpoint = {
      name,
      method: method.toUpperCase(),
      path,
      functionality,
      authentication,
      code: this.generateEndpointCode(endpointData),
      tests: this.generateEndpointTests(endpointData),
      documentation: this.generateApiDocumentation(endpointData)
    };

    // Mémoriser l'endpoint pour réutilisation
    this.remember(`endpoint_${name}`, endpoint);
    
    return {
      endpoint,
      implementation: endpoint.code,
      tests: endpoint.tests,
      documentation: endpoint.documentation,
      nextSteps: this.getEndpointNextSteps(endpointData)
    };
  }

  generateEndpointCode(endpointData) {
    const { name, method, path, functionality, authentication, validation } = endpointData;
    
    let code = `// ${name} - ${functionality}\n`;
    code += `router.${method.toLowerCase()}('${path}'`;
    
    if (authentication) {
      code += `, authenticateToken`;
    }
    
    if (validation) {
      code += `, validate${name}`;
    }
    
    code += `, async (req, res) => {\n`;
    code += `  try {\n`;
    
    // Générer le corps de la fonction selon le type
    switch (functionality) {
      case 'prospection_analysis':
        code += this.generateProspectionAnalysisCode();
        break;
      case 'email_generation':
        code += this.generateEmailGenerationCode();
        break;
      case 'contact_management':
        code += this.generateContactManagementCode();
        break;
      default:
        code += `    // TODO: Implémenter ${functionality}\n`;
        code += `    const result = await ${name}Service.process(req.body);\n`;
        code += `    res.json({ success: true, data: result });\n`;
    }
    
    code += `  } catch (error) {\n`;
    code += `    console.error('${name} error:', error);\n`;
    code += `    res.status(500).json({ success: false, error: error.message });\n`;
    code += `  }\n`;
    code += `});\n`;
    
    return code;
  }

  generateProspectionAnalysisCode() {
    return `    const { target, context } = req.body;
    
    // Validation des données d'entrée
    if (!target || !target.email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Target email is required' 
      });
    }
    
    // Analyse via le planificateur
    const analysisResult = await planificateurAgent.execute({
      type: 'analyze_prospection_target',
      data: { target, context }
    });
    
    if (!analysisResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Analysis failed: ' + analysisResult.error
      });
    }
    
    // Stocker l'analyse pour usage futur
    await ProspectionAnalysis.create({
      targetEmail: target.email,
      analysis: analysisResult.result,
      createdAt: new Date()
    });
    
    res.json({
      success: true,
      data: {
        analysis: analysisResult.result.analysis,
        recommendations: analysisResult.result.recommendations,
        nextSteps: analysisResult.result.nextSteps
      }
    });`;
  }

  generateEmailGenerationCode() {
    return `    const { target, template, personalization } = req.body;
    
    // Validation
    if (!target || !target.email) {
      return res.status(400).json({
        success: false,
        error: 'Target email is required'
      });
    }
    
    // Récupérer l'analyse précédente si disponible
    const previousAnalysis = await ProspectionAnalysis.findOne({
      targetEmail: target.email
    }).sort({ createdAt: -1 });
    
    // Générer l'email personnalisé
    const emailContent = await emailGenerationService.generatePersonalizedEmail({
      target,
      template,
      personalization,
      analysis: previousAnalysis?.analysis
    });
    
    // Tester la qualité de l'email via le testeur
    const qualityTest = await testeurAgent.execute({
      type: 'test_email_generation',
      data: { target, email: emailContent }
    });
    
    // Stocker l'email généré
    await GeneratedEmail.create({
      targetEmail: target.email,
      content: emailContent,
      qualityScore: qualityTest.result?.qualityScore || 0,
      createdAt: new Date()
    });
    
    res.json({
      success: true,
      data: {
        email: emailContent,
        qualityAssessment: qualityTest.result,
        canSend: qualityTest.result?.isValid || false
      }
    });`;
  }

  async createServiceLayer(serviceData) {
    const { name, responsibility, dependencies = [] } = serviceData;
    
    console.log(`🏗️ Backend Dev crée le service ${name}`);
    
    const service = {
      name,
      responsibility,
      dependencies,
      code: this.generateServiceCode(serviceData),
      interface: this.generateServiceInterface(serviceData),
      tests: this.generateServiceTests(serviceData)
    };
    
    return {
      service,
      implementation: service.code,
      interface: service.interface,
      tests: service.tests
    };
  }

  generateServiceCode(serviceData) {
    const { name, responsibility, methods = [] } = serviceData;
    
    let code = `/**\n * ${name} Service\n * ${responsibility}\n */\n\n`;
    code += `class ${name}Service {\n`;
    code += `  constructor(dependencies = {}) {\n`;
    code += `    this.dependencies = dependencies;\n`;
    code += `    this.logger = dependencies.logger || console;\n`;
    code += `  }\n\n`;
    
    // Générer les méthodes
    methods.forEach(method => {
      code += this.generateServiceMethod(method);
      code += `\n`;
    });
    
    code += `}\n\nmodule.exports = ${name}Service;`;
    
    return code;
  }

  generateServiceMethod(methodData) {
    const { name, params = [], returnType, functionality } = methodData;
    
    let method = `  async ${name}(${params.join(', ')}) {\n`;
    method += `    try {\n`;
    method += `      this.logger.info(\`Executing ${name} with params: \${JSON.stringify({ ${params.join(', ')} })}\`);\n\n`;
    
    // Logique spécifique selon la fonctionnalité
    switch (functionality) {
      case 'prospection_analysis':
        method += this.generateProspectionAnalysisServiceLogic();
        break;
      case 'email_validation':
        method += this.generateEmailValidationServiceLogic();
        break;
      default:
        method += `      // TODO: Implémenter ${functionality}\n`;
        method += `      const result = { processed: true, timestamp: new Date() };\n`;
        method += `      return result;\n`;
    }
    
    method += `    } catch (error) {\n`;
    method += `      this.logger.error(\`Error in ${name}:\`, error);\n`;
    method += `      throw error;\n`;
    method += `    }\n`;
    method += `  }`;
    
    return method;
  }

  // ========== SPÉCIALISATIONS PROSPECTION ==========

  async createProspectionAPI(apiData) {
    const { version = 'v1', endpoints = [] } = apiData;
    
    console.log(`🎯 Backend Dev crée l'API de prospection ${version}`);
    
    const prospectionEndpoints = [
      {
        name: 'analyzeProspect',
        method: 'POST',
        path: `/api/${version}/prospects/analyze`,
        functionality: 'prospection_analysis',
        authentication: true,
        validation: true
      },
      {
        name: 'generateEmail',
        method: 'POST', 
        path: `/api/${version}/emails/generate`,
        functionality: 'email_generation',
        authentication: true,
        validation: true
      },
      {
        name: 'sendProspectionEmail',
        method: 'POST',
        path: `/api/${version}/emails/send`,
        functionality: 'email_sending',
        authentication: true,
        validation: true
      },
      {
        name: 'getProspectionHistory',
        method: 'GET',
        path: `/api/${version}/prospects/:email/history`,
        functionality: 'contact_management',
        authentication: true
      },
      {
        name: 'updateProspectStatus',
        method: 'PATCH',
        path: `/api/${version}/prospects/:email/status`,
        functionality: 'contact_management',
        authentication: true,
        validation: true
      }
    ];
    
    const api = {
      version,
      endpoints: prospectionEndpoints,
      router: this.generateProspectionRouter(prospectionEndpoints),
      middleware: this.generateProspectionMiddleware(),
      models: this.generateProspectionModels(),
      services: this.generateProspectionServices()
    };
    
    return {
      api,
      implementation: api.router,
      middleware: api.middleware,
      models: api.models,
      services: api.services,
      documentation: this.generateAPIDocumentation(api)
    };
  }

  generateProspectionRouter(endpoints) {
    let router = `const express = require('express');\n`;
    router += `const router = express.Router();\n`;
    router += `const { authenticateToken, validateRequest } = require('../middleware');\n`;
    router += `const prospectionService = require('../services/prospectionService');\n`;
    router += `const emailService = require('../services/emailService');\n\n`;
    
    endpoints.forEach(endpoint => {
      router += this.generateEndpointCode(endpoint) + '\n\n';
    });
    
    router += `module.exports = router;`;
    
    return router;
  }

  async setupEmailService(emailConfig) {
    const { provider = 'smtp', configuration } = emailConfig;
    
    console.log(`📧 Backend Dev configure le service email ${provider}`);
    
    const emailService = {
      provider,
      configuration,
      implementation: this.generateEmailServiceCode(emailConfig),
      templates: this.generateEmailTemplates(),
      tests: this.generateEmailServiceTests()
    };
    
    return {
      emailService,
      implementation: emailService.implementation,
      templates: emailService.templates,
      tests: emailService.tests
    };
  }

  generateEmailServiceCode(emailConfig) {
    const { provider, configuration } = emailConfig;
    
    let code = `/**\n * Email Service - Service d'envoi d'emails personnalisés\n */\n\n`;
    code += `const nodemailer = require('nodemailer');\n\n`;
    code += `class EmailService {\n`;
    code += `  constructor(config) {\n`;
    code += `    this.config = config;\n`;
    code += `    this.transporter = this.setupTransporter();\n`;
    code += `  }\n\n`;
    
    code += `  setupTransporter() {\n`;
    code += `    return nodemailer.createTransporter({\n`;
    code += `      host: this.config.smtp.host,\n`;
    code += `      port: this.config.smtp.port,\n`;
    code += `      secure: this.config.smtp.secure,\n`;
    code += `      auth: {\n`;
    code += `        user: this.config.smtp.user,\n`;
    code += `        pass: this.config.smtp.password\n`;
    code += `      }\n`;
    code += `    });\n`;
    code += `  }\n\n`;
    
    code += `  async sendProspectionEmail(emailData) {\n`;
    code += `    const { to, subject, content, trackingId } = emailData;\n\n`;
    code += `    const mailOptions = {\n`;
    code += `      from: this.config.from,\n`;
    code += `      to,\n`;
    code += `      subject,\n`;
    code += `      html: this.addTrackingPixel(content, trackingId),\n`;
    code += `      headers: {\n`;
    code += `        'X-Prospection-ID': trackingId\n`;
    code += `      }\n`;
    code += `    };\n\n`;
    code += `    try {\n`;
    code += `      const result = await this.transporter.sendMail(mailOptions);\n`;
    code += `      await this.logEmailSent(emailData, result);\n`;
    code += `      return { success: true, messageId: result.messageId };\n`;
    code += `    } catch (error) {\n`;
    code += `      await this.logEmailError(emailData, error);\n`;
    code += `      throw error;\n`;
    code += `    }\n`;
    code += `  }\n\n`;
    
    code += `  addTrackingPixel(content, trackingId) {\n`;
    code += `    const trackingPixel = \`<img src="\${this.config.trackingUrl}/pixel/\${trackingId}" width="1" height="1" style="display:none;" />\`;\n`;
    code += `    return content + trackingPixel;\n`;
    code += `  }\n\n`;
    
    code += `  async logEmailSent(emailData, result) {\n`;
    code += `    // Log l'email envoyé pour suivi\n`;
    code += `    console.log('Email sent:', { to: emailData.to, messageId: result.messageId });\n`;
    code += `  }\n\n`;
    
    code += `  async logEmailError(emailData, error) {\n`;
    code += `    // Log l'erreur d'envoi\n`;
    code += `    console.error('Email send error:', { to: emailData.to, error: error.message });\n`;
    code += `  }\n`;
    code += `}\n\n`;
    code += `module.exports = EmailService;`;
    
    return code;
  }

  // ========== MÉTHODES UTILITAIRES ==========

  initializeTemplates() {
    // Templates de code réutilisables
    this.codeTemplates.set('express_controller', this.getExpressControllerTemplate());
    this.codeTemplates.set('service_class', this.getServiceClassTemplate());
    this.codeTemplates.set('middleware', this.getMiddlewareTemplate());
    this.codeTemplates.set('validation', this.getValidationTemplate());
  }

  generateEndpointTests(endpointData) {
    const { name, method, path } = endpointData;
    
    let tests = `// Tests pour ${name}\n`;
    tests += `describe('${method} ${path}', () => {\n`;
    tests += `  it('should return success for valid request', async () => {\n`;
    tests += `    const response = await request(app)\n`;
    tests += `      .${method.toLowerCase()}('${path}')\n`;
    tests += `      .send(validTestData)\n`;
    tests += `      .expect(200);\n\n`;
    tests += `    expect(response.body.success).toBe(true);\n`;
    tests += `  });\n\n`;
    tests += `  it('should return error for invalid request', async () => {\n`;
    tests += `    const response = await request(app)\n`;
    tests += `      .${method.toLowerCase()}('${path}')\n`;
    tests += `      .send(invalidTestData)\n`;
    tests += `      .expect(400);\n\n`;
    tests += `    expect(response.body.success).toBe(false);\n`;
    tests += `  });\n`;
    tests += `});`;
    
    return tests;
  }

  generateApiDocumentation(endpointData) {
    const { name, method, path, functionality } = endpointData;
    
    return {
      endpoint: `${method} ${path}`,
      description: functionality,
      parameters: this.extractParameters(endpointData),
      responses: this.generateResponseExamples(endpointData),
      examples: this.generateUsageExamples(endpointData)
    };
  }

  getEndpointNextSteps(endpointData) {
    return [
      'Implémenter les tests unitaires',
      'Ajouter la validation des données',
      'Configurer la documentation Swagger',
      'Tester l\'intégration avec les services'
    ];
  }
}

module.exports = BackendDeveloperAgent;