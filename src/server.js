/**
 * Serveur Principal - Architecture Moderne
 * Utilise les couches Domain, Infrastructure et API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const path = require('path');

// Configuration et utilitaires
const config = require('./config');
const logger = require('./infrastructure/logger');

// Repositories (accès aux données)
const ProspectRepository = require('./infrastructure/repositories/ProspectRepository');

// Services Domain
const ProspectUpdateService = require('./domain/services/ProspectUpdateService');

// Services Infrastructure (services legacy refactorisés)
const GoogleSheetsService = require('./infrastructure/services/GoogleSheetsService');
const EmailFinderService = require('./infrastructure/services/EmailFinderService');
const AutomationService = require('./infrastructure/services/AutomationService');
const EmailNotificationService = require('./infrastructure/services/EmailNotificationService');

// Controllers
const ProspectController = require('./api/controllers/ProspectController');

// Routes
const createProspectRoutes = require('./api/routes/prospects');
const createWorkflowRoutes = require('./api/routes/workflows');
const createAutomationRoutes = require('./api/routes/automation');

class ModernProspectionServer {
  constructor() {
    this.app = express();
    this.server = null;
    
    // Services
    this.googleSheetsService = null;
    this.emailFinderService = null;
    this.automationService = null;
    this.emailNotificationService = null;
    
    // Repositories
    this.prospectRepository = null;
    
    // Domain Services  
    this.prospectUpdateService = null;
    
    // Controllers
    this.prospectController = null;
    
    this.initializeServer().catch(error => {
      logger.error('❌ Erreur fatale initialisation', {
        component: 'Server',
        error: error.message
      });
      throw error;
    });
  }

  async initializeServer() {
    try {
      logger.info('🚀 Initialisation du serveur moderne...', {
        component: 'Server',
        version: '2.0.0',
        environment: config.get('server.env')
      });

      this.setupMiddleware();
      await this.initializeServices();
      this.setupRoutes();
      this.setupErrorHandling();
      
    } catch (error) {
      logger.error('❌ Erreur initialisation serveur', {
        component: 'Server',
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  setupMiddleware() {
    // Sécurité et performance
    this.app.use(helmet({
      contentSecurityPolicy: false // Désactivé pour le développement
    }));
    this.app.use(compression());
    
    // CORS
    this.app.use(cors(config.get('security.cors')));
    
    // Rate limiting global
    const generalLimiter = rateLimit({
      ...config.get('security.rateLimit'),
      message: {
        success: false,
        error: 'Trop de requêtes. Réessayez plus tard.'
      }
    });
    this.app.use('/api', generalLimiter);

    // Parsing du body
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logs des requêtes
    this.app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
        
        logger[logLevel](`${req.method} ${req.url}`, {
          component: 'HTTP',
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      });
      
      next();
    });

    // Servir les fichiers statiques (frontend)
    this.app.use(express.static(path.join(__dirname, '../frontend')));

    logger.info('✅ Middleware configuré', { component: 'Server' });
  }

  async initializeServices() {
    try {
      logger.info('🔧 Initialisation des services...', { component: 'Server' });

      // Services infrastructure
      this.googleSheetsService = new GoogleSheetsService(logger);
      await this.googleSheetsService.initialize();
      
      this.emailFinderService = new EmailFinderService(config, logger);
      await this.emailFinderService.initialize();
      
      this.automationService = new AutomationService(config, logger);
      await this.automationService.initialize();
      
      this.emailNotificationService = new EmailNotificationService(config, logger);
      await this.emailNotificationService.initialize();

      // Repositories
      this.prospectRepository = new ProspectRepository(this.googleSheetsService, logger);

      // Services Domain
      this.prospectUpdateService = new ProspectUpdateService(
        this.prospectRepository,
        this.emailFinderService,
        logger
      );

      // Controllers
      this.prospectController = new ProspectController(
        this.prospectRepository,
        this.prospectUpdateService,
        this.emailFinderService,
        logger
      );

      // La méthode getUpdateStatus existe déjà dans ProspectController.js

      logger.info('✅ Services initialisés', { component: 'Server' });
      
    } catch (error) {
      logger.error('❌ Erreur initialisation services', {
        component: 'Server',
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  setupRoutes() {
    try {
      // Route d'accueil
      this.app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
      });

      // Health check
      this.app.get('/api/health', async (req, res) => {
        try {
          const health = await this.getSystemHealth();
          res.json(health);
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Erreur de santé système',
            timestamp: new Date().toISOString()
          });
        }
      });

      // Routes API modernes
      this.app.use('/api/prospects', createProspectRoutes(this.prospectController));
      this.app.use('/api/automation', createAutomationRoutes(this.automationService, logger));
      
      // Route directe pour l'email finding (debug)
      this.app.post('/api/prospects/:id/find-email', async (req, res) => {
        try {
          await this.prospectController.findEmail(req, res);
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Erreur lors de la recherche d\'email'
          });
        }
      });
      
      // Route pour les logs (souvent demandée par le frontend)
      this.app.get('/api/logs', async (req, res) => {
        try {
          const limit = parseInt(req.query.limit) || 100;
          const level = req.query.level || '';
          
          // Lire les logs Winston actuels
          const logs = await this.getRecentLogs(limit, level);
          
          res.json({
            success: true,
            logs: logs,
            count: logs.length,
            limit,
            level: level || 'all'
          });
          
        } catch (error) {
          logger.error('Erreur récupération logs', {
            component: 'Server',
            error: error.message
          });
          
          res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des logs',
            logs: []
          });
        }
      });
      
      // Routes legacy pour compatibilité (temporaire)
      this.setupLegacyRoutes();

      // Debug endpoint pour vérifier les données Google Sheets directement
      this.app.get('/api/debug/sheets/raw', async (req, res) => {
        try {
          const rawData = await this.googleSheetsService.getSheetData('A:Z');
          
          res.json({
            success: true,
            totalRows: rawData.length,
            headerRow: rawData[0] || null,
            dataRows: rawData.length > 1 ? rawData.length - 1 : 0,
            lastFewRows: rawData.slice(-5), // Dernières 5 lignes
            note: 'Raw data directly from Google Sheets without any filtering'
          });
        } catch (error) {
          logger.error('Debug sheets error', {
            component: 'Debug',
            error: error.message
          });
          res.status(500).json({
            success: false,
            error: error.message
          });
        }
      });

      // Debug endpoint pour voir les prospects filtrés
      this.app.get('/api/debug/prospects/filtering', async (req, res) => {
        try {
          const rawData = await this.googleSheetsService.getSheetData('A:Z');
          const prospectRows = rawData.slice(1); // Skip header
          
          const validRows = [];
          const invalidRows = [];
          
          prospectRows.forEach((row, index) => {
            const rowNumber = index + 2; // +2 because we skipped header and arrays are 0-indexed
            const isValid = row.length >= 4 && row[1] && row[2] && row[3];
            
            const rowInfo = {
              rowNumber,
              length: row.length,
              hasCol1: !!row[1], // Name
              hasCol2: !!row[2], // Company  
              hasCol3: !!row[3], // Title
              preview: row.slice(0, 4) // First 4 columns for preview
            };
            
            if (isValid) {
              validRows.push(rowInfo);
            } else {
              invalidRows.push(rowInfo);
            }
          });
          
          res.json({
            success: true,
            totalRows: prospectRows.length,
            validRows: validRows.length,
            invalidRows: invalidRows.length,
            filteredOut: invalidRows,
            note: 'Shows which rows are being filtered out during prospect processing'
          });
        } catch (error) {
          logger.error('Debug filtering error', {
            component: 'Debug',
            error: error.message
          });
          res.status(500).json({
            success: false,
            error: error.message
          });
        }
      });

      // Route catch-all pour SPA
      this.app.get('*', (req, res) => {
        if (req.url.startsWith('/api/')) {
          res.status(404).json({
            success: false,
            error: 'Endpoint non trouvé'
          });
        } else {
          res.sendFile(path.join(__dirname, '../frontend/index.html'));
        }
      });

      logger.info('✅ Routes configurées', { component: 'Server' });
      
    } catch (error) {
      logger.error('❌ Erreur configuration routes', {
        component: 'Server',
        error: error.message
      });
      throw error;
    }
  }

  setupLegacyRoutes() {
    // Maintenir les routes existantes pour compatibilité
    
    // Intégrer les routes LinkedIn existantes
    const linkedinRouter = require('../backend/routes/linkedin');
    this.app.use('/api/linkedin', linkedinRouter);

    // Workflow - Implémentation complète
    this.app.post('/api/workflow/run-full-sequence', async (req, res) => {
      try {
        const { prospects, config = {} } = req.body;
        
        if (!prospects || !Array.isArray(prospects) || prospects.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Liste de prospects requise'
          });
        }

        logger.info(`🚀 Démarrage workflow avec ${prospects.length} prospects`, {
          component: 'Workflow',
          prospectCount: prospects.length,
          config
        });

        // Mode bulk si plus de 10 prospects (évite les timeouts LinkedIn)
        const isBulkMode = prospects.length > 10;
        
        const results = {
          prospects: prospects.length,
          processed: 0,
          emails_generated: 0,
          connections_sent: 0,
          followups_scheduled: 0,
          errors: 0,
          details: []
        };

        // Traitement séquentiel des prospects
        for (let i = 0; i < prospects.length; i++) {
          const prospect = prospects[i];
          
          try {
            logger.info(`📝 Traitement ${i+1}/${prospects.length}: ${prospect.name}`, {
              component: 'Workflow'
            });

            const prospectResult = {
              name: prospect.name,
              company: prospect.company,
              email_generated: false,
              connection_sent: false,
              followup_scheduled: false,
              error: null
            };

            // 1. Génération d'email personnalisé
            if (config.generateEmails !== false) {
              try {
                const emailOptions = {
                  bulkMode: isBulkMode,
                  extractProfile: !isBulkMode // Extraction seulement si pas en mode bulk
                };

                const emailResult = await this.automationService.generatePersonalizedEmail(
                  prospect, 
                  emailOptions
                );
                
                if (emailResult && emailResult.success) {
                  prospectResult.email_generated = true;
                  prospectResult.email_content = emailResult.email;
                  results.emails_generated++;
                }
              } catch (emailError) {
                logger.warn(`⚠️ Erreur génération email pour ${prospect.name}`, {
                  error: emailError.message
                });
                prospectResult.error = `Email: ${emailError.message}`;
              }
            }

            // 2. Envoi connexion LinkedIn
            if (config.sendConnections && !isBulkMode) {
              try {
                const connectionResult = await this.automationService.sendLinkedInConnection({
                  name: prospect.name,
                  linkedinUrl: prospect.linkedinUrl,
                  message: prospectResult.email_content || 'Connexion professionnelle'
                });
                
                if (connectionResult && connectionResult.success) {
                  prospectResult.connection_sent = true;
                  results.connections_sent++;
                }
              } catch (connectionError) {
                logger.warn(`⚠️ Erreur connexion LinkedIn pour ${prospect.name}`, {
                  error: connectionError.message
                });
                prospectResult.error = `LinkedIn: ${connectionError.message}`;
              }
            }

            // 3. Programmation follow-up
            if (config.scheduleFollowups) {
              try {
                const followupResult = await this.automationService.scheduleFollowUp({
                  prospect: prospect,
                  email: prospectResult.email_content,
                  delay: 7 // 7 jours par défaut
                });
                
                if (followupResult && followupResult.success) {
                  prospectResult.followup_scheduled = true;
                  results.followups_scheduled++;
                }
              } catch (followupError) {
                logger.warn(`⚠️ Erreur follow-up pour ${prospect.name}`, {
                  error: followupError.message
                });
                prospectResult.error = `Follow-up: ${followupError.message}`;
              }
            }

            results.details.push(prospectResult);
            results.processed++;

            // Délai entre prospects pour éviter le rate limiting
            if (i < prospects.length - 1) {
              await new Promise(resolve => setTimeout(resolve, isBulkMode ? 200 : 1000));
            }

          } catch (error) {
            logger.error(`❌ Erreur critique pour ${prospect.name}`, {
              error: error.message
            });
            
            results.errors++;
            results.details.push({
              name: prospect.name,
              company: prospect.company,
              error: error.message,
              email_generated: false,
              connection_sent: false,
              followup_scheduled: false
            });
          }
        }

        // Notification email de fin
        try {
          await this.emailNotificationService.sendWorkflowEndNotification(results);
        } catch (notifError) {
          logger.warn('Erreur envoi notification fin', { error: notifError.message });
        }

        logger.info(`✅ Workflow terminé`, {
          component: 'Workflow',
          results: {
            processed: results.processed,
            emails: results.emails_generated,
            connections: results.connections_sent,
            followups: results.followups_scheduled,
            errors: results.errors
          }
        });

        res.json({
          success: true,
          message: `Workflow terminé - ${results.processed}/${prospects.length} prospects traités`,
          results
        });
        
      } catch (error) {
        logger.error('❌ Erreur workflow', {
          component: 'Workflow',
          error: error.message
        });
        
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Authentification Google
    this.app.get('/api/auth/google', async (req, res) => {
      try {
        const authUrl = await this.googleSheetsService.getAuthUrl();
        res.redirect(authUrl);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    this.app.get('/api/auth/google/callback', async (req, res) => {
      try {
        const { code } = req.query;
        if (!code) {
          return res.redirect('/?error=no_code');
        }
        
        const success = await this.googleSheetsService.saveToken(code);
        if (success) {
          await this.googleSheetsService.initialize();
          res.redirect('/?auth=success');
        } else {
          res.redirect('/?error=auth_failed');
        }
      } catch (error) {
        logger.error('OAuth callback error', {
          component: 'Server',
          error: error.message
        });
        res.redirect(`/?error=${encodeURIComponent(error.message)}`);
      }
    });
  }

  setupErrorHandling() {
    // Middleware de gestion d'erreurs 404
    this.app.use((req, res, next) => {
      if (req.url.startsWith('/api/')) {
        res.status(404).json({
          success: false,
          error: 'Endpoint non trouvé',
          path: req.url,
          method: req.method
        });
      } else {
        next();
      }
    });

    // Middleware de gestion d'erreurs globales
    this.app.use((error, req, res, next) => {
      const status = error.status || 500;
      const message = error.message || 'Erreur serveur interne';
      
      logger.error('Erreur non gérée', {
        component: 'Server',
        error: message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      res.status(status).json({
        success: false,
        error: config.isDevelopment() ? message : 'Erreur serveur',
        ...(config.isDevelopment() && { stack: error.stack })
      });
    });

    // Gestion des promesses non gérées
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Promise non gérée', {
        component: 'Process',
        reason: reason?.message || reason,
        stack: reason?.stack
      });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Exception non gérée', {
        component: 'Process',
        error: error.message,
        stack: error.stack
      });
      
      // Arrêt gracieux
      this.shutdown();
    });
  }

  async getSystemHealth() {
    const health = {
      status: 'running',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      services: {}
    };

    try {
      // Google Sheets
      health.services.googleSheets = {
        status: this.googleSheetsService?.initialized ? 'connected' : 'disconnected',
        spreadsheetId: config.get('database.spreadsheetId')
      };

      // Email Finder
      health.services.emailFinder = {
        status: this.emailFinderService?.initialized ? 'active' : 'inactive',
        sources: config.get('features.emailFinding.sources')
      };

      // Automation
      health.services.automation = {
        status: this.automationService?.initialized ? 'active' : 'inactive'
      };

      // Statistiques prospects
      const stats = await this.prospectRepository?.getStats();
      health.prospects = {
        total: stats?.total || 0,
        withEmail: stats?.withEmail || 0,
        lastUpdate: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Erreur vérification santé', {
        component: 'Server',
        error: error.message
      });
    }

    return health;
  }

  async getRecentLogs(limit = 100, level = '') {
    try {
      const fs = require('fs').promises;
      const today = new Date().toISOString().split('T')[0];
      const logFilePath = path.join(__dirname, 'logs', `app-${today}.log`);
      
      // Vérifier si le fichier existe
      const logFileExists = await fs.access(logFilePath).then(() => true).catch(() => false);
      if (!logFileExists) {
        return [];
      }
      
      // Lire le fichier de log
      const logContent = await fs.readFile(logFilePath, 'utf8');
      const logLines = logContent.trim().split('\n').filter(line => line.length > 0);
      
      // Parser et filtrer les logs
      const parsedLogs = logLines
        .reverse() // Plus récents en premier
        .slice(0, limit * 3) // Prendre plus de lignes au cas où certaines seraient filtrées
        .map(line => this.parseLogLine(line))
        .filter(log => log !== null) // Exclure les lignes malformées
        .filter(log => {
          if (!level) return true;
          return log.level.toLowerCase() === level.toLowerCase();
        })
        .slice(0, limit); // Appliquer la limite finale
        
      return parsedLogs;
      
    } catch (error) {
      logger.error('Erreur lecture fichiers logs', {
        component: 'Server',
        method: 'getRecentLogs',
        error: error.message
      });
      return [];
    }
  }

  parseLogLine(line) {
    try {
      // Format Winston: 2025-08-21T14:25:40.493Z [INFO] [Component] Message | Meta: {"key":"value"}
      const logRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z) \[(\w+)\] \[([^\]]+)\] ([^|]+)(?:\| Meta: (.+))?$/;
      const match = line.match(logRegex);
      
      if (!match) {
        return null;
      }
      
      const [, timestamp, level, component, message, metaStr] = match;
      
      let meta = {};
      if (metaStr) {
        try {
          meta = JSON.parse(metaStr);
        } catch (e) {
          // Meta parsing error - keep empty object
        }
      }
      
      return {
        timestamp: new Date(timestamp).toISOString(),
        level: level.toLowerCase(),
        component: component.trim(),
        message: message.trim(),
        meta: meta,
        raw: line
      };
      
    } catch (error) {
      return null;
    }
  }

  async start() {
    try {
      const port = config.get('server.port');
      const host = config.get('server.host');
      
      this.server = this.app.listen(port, host, () => {
        logger.info(`🎆 Serveur démarré sur http://${host}:${port}`, {
          component: 'Server',
          port,
          host,
          environment: config.get('server.env')
        });
        
        console.log('\n🚀 LinkedIn Prospection System v2.0.0');
        console.log(`🌐 Interface: http://${host}:${port}`);
        console.log(`🔧 API: http://${host}:${port}/api`);
        console.log(`📊 Health: http://${host}:${port}/api/health`);
        console.log('\n✨ Nouvelles fonctionnalités:');
        console.log('  • 🔄 Mise à jour globale des prospects');
        console.log('  • 📧 Recherche avancée d\'emails');
        console.log('  • 📊 Architecture moderne et scalable');
        console.log('  • 🛡️ Sécurité renforcée');
        console.log('\n🎯 Prêt à recevoir des requêtes !');
      });

      return this.server;
      
    } catch (error) {
      logger.error('❌ Erreur démarrage serveur', {
        component: 'Server',
        error: error.message
      });
      throw error;
    }
  }

  async shutdown() {
    logger.info('🛑 Arrêt du serveur en cours...', { component: 'Server' });
    
    if (this.server) {
      this.server.close(() => {
        logger.info('✅ Serveur arrêté', { component: 'Server' });
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }
}

// Démarrage du serveur si ce fichier est exécuté directement
if (require.main === module) {
  const server = new ModernProspectionServer();
  
  // Gestion des signaux d'arrêt
  process.on('SIGTERM', () => server.shutdown());
  process.on('SIGINT', () => server.shutdown());
  
  // Démarrer le serveur
  server.start().catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = ModernProspectionServer;