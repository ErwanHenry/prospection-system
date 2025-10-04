/**
 * Routes Automation - Modern API
 * Gère les endpoints d'automation LinkedIn
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting pour les opérations d'automation - INCREASED LIMITS FOR BULK OPERATIONS
const automationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (increased from 5)
  max: 500, // Maximum 500 requêtes par 15 minutes (increased from 30)
  message: {
    success: false,
    error: 'Limite d\'automation atteinte. Réessayez dans 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests from counting towards rate limit in bulk mode
  skip: (req) => {
    // Skip rate limiting for bulk operations with special header
    return req.headers['x-bulk-mode'] === 'true';
  },
  // Custom key generator to allow different limits per user/ip
  keyGenerator: (req) => {
    return req.ip + ':' + (req.headers['user-agent'] || 'unknown');
  }
});

const createAutomationRoutes = (automationService, logger) => {
  const router = express.Router();

  // Middleware de validation global
  const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données de validation invalides',
        details: errors.array()
      });
    }
    next();
  };

  // Générer un email personnalisé
  router.post(
    '/generate-email',
    automationLimiter,
    [
      body('prospect.name')
        .notEmpty()
        .withMessage('Le nom du prospect est requis'),
      body('prospect.company')
        .notEmpty()
        .withMessage('Le nom de l\'entreprise est requis'),
      body('prospect.title')
        .optional()
        .isString(),
      body('prospect.linkedinUrl')
        .optional()
        .isURL()
        .withMessage('URL LinkedIn invalide'),
      body('options.bulkMode')
        .optional()
        .isBoolean(),
      body('options.extractProfile')
        .optional()
        .isBoolean()
    ],
    handleValidation,
    async (req, res) => {
      try {
        const { prospect, options = {} } = req.body;
        
        logger.info('📧 Génération email demandée', {
          component: 'AutomationAPI',
          prospect: prospect.name,
          company: prospect.company,
          options
        });

        if (!automationService || !automationService.initialized) {
          return res.status(503).json({
            success: false,
            error: 'Service d\'automation non disponible'
          });
        }

        const result = await automationService.generatePersonalizedEmail(prospect, options);

        if (result && result.success) {
          logger.info('✅ Email généré avec succès', {
            component: 'AutomationAPI',
            prospect: prospect.name
          });

          res.json({
            success: true,
            message: 'Email généré avec succès',
            data: {
              email: result.email,
              subject: result.subject,
              prospect: {
                name: prospect.name,
                company: prospect.company
              },
              metadata: result.metadata || {}
            }
          });
        } else {
          res.status(400).json({
            success: false,
            error: result?.error || 'Erreur lors de la génération de l\'email'
          });
        }

      } catch (error) {
        logger.error('❌ Erreur génération email', {
          component: 'AutomationAPI',
          error: error.message,
          stack: error.stack
        });

        res.status(500).json({
          success: false,
          error: 'Erreur serveur lors de la génération de l\'email'
        });
      }
    }
  );

  // Envoyer une connexion LinkedIn
  router.post(
    '/linkedin-connection',
    automationLimiter,
    [
      body('name')
        .notEmpty()
        .withMessage('Le nom est requis'),
      body('linkedinUrl')
        .notEmpty()
        .isURL()
        .withMessage('URL LinkedIn valide requise'),
      body('message')
        .optional()
        .isLength({ min: 10, max: 300 })
        .withMessage('Le message doit faire entre 10 et 300 caractères')
    ],
    handleValidation,
    async (req, res) => {
      try {
        const { name, linkedinUrl, message } = req.body;
        
        logger.info('🔗 Connexion LinkedIn demandée', {
          component: 'AutomationAPI',
          name,
          linkedinUrl
        });

        if (!automationService || !automationService.initialized) {
          return res.status(503).json({
            success: false,
            error: 'Service d\'automation non disponible'
          });
        }

        const result = await automationService.sendLinkedInConnection({
          name,
          linkedinUrl,
          message: message || 'Connexion professionnelle'
        });

        if (result && result.success) {
          logger.info('✅ Connexion LinkedIn envoyée', {
            component: 'AutomationAPI',
            name
          });

          res.json({
            success: true,
            message: 'Demande de connexion envoyée',
            data: {
              name,
              status: 'sent',
              timestamp: new Date().toISOString()
            }
          });
        } else {
          res.status(400).json({
            success: false,
            error: result?.error || 'Erreur lors de l\'envoi de la connexion'
          });
        }

      } catch (error) {
        logger.error('❌ Erreur connexion LinkedIn', {
          component: 'AutomationAPI',
          error: error.message,
          stack: error.stack
        });

        res.status(500).json({
          success: false,
          error: 'Erreur serveur lors de l\'envoi de la connexion'
        });
      }
    }
  );

  // Programmer un suivi
  router.post(
    '/schedule-followup',
    automationLimiter,
    [
      body('prospect.name')
        .notEmpty()
        .withMessage('Le nom du prospect est requis'),
      body('prospect.email')
        .optional()
        .isEmail()
        .withMessage('Email invalide'),
      body('email')
        .notEmpty()
        .withMessage('Le contenu de l\'email est requis'),
      body('delay')
        .optional()
        .isInt({ min: 1, max: 30 })
        .withMessage('Le délai doit être entre 1 et 30 jours')
    ],
    handleValidation,
    async (req, res) => {
      try {
        const { prospect, email, delay = 7 } = req.body;
        
        logger.info('📅 Programmation suivi demandée', {
          component: 'AutomationAPI',
          prospect: prospect.name,
          delay
        });

        if (!automationService || !automationService.initialized) {
          return res.status(503).json({
            success: false,
            error: 'Service d\'automation non disponible'
          });
        }

        const result = await automationService.scheduleFollowUp({
          prospect,
          email,
          delay
        });

        if (result && result.success) {
          logger.info('✅ Suivi programmé', {
            component: 'AutomationAPI',
            prospect: prospect.name,
            delay
          });

          res.json({
            success: true,
            message: `Suivi programmé dans ${delay} jours`,
            data: {
              prospect: prospect.name,
              delay,
              scheduledDate: new Date(Date.now() + delay * 24 * 60 * 60 * 1000).toISOString(),
              status: 'scheduled'
            }
          });
        } else {
          res.status(400).json({
            success: false,
            error: result?.error || 'Erreur lors de la programmation du suivi'
          });
        }

      } catch (error) {
        logger.error('❌ Erreur programmation suivi', {
          component: 'AutomationAPI',
          error: error.message,
          stack: error.stack
        });

        res.status(500).json({
          success: false,
          error: 'Erreur serveur lors de la programmation du suivi'
        });
      }
    }
  );

  // Test browser initialization
  router.post('/test-browser', async (req, res) => {
    try {
      logger.info('🧪 Test browser initialization requested', {
        component: 'AutomationAPI'
      });

      // Import LinkedIn automation for testing
      const linkedinAutomation = require('../../backend/services/linkedinAutomation');
      
      const result = await linkedinAutomation.testBrowserOnly();
      
      if (result.success) {
        logger.info('✅ Browser test successful', {
          component: 'AutomationAPI',
          browser: result.browser
        });

        res.json({
          success: true,
          message: 'Browser test completed successfully',
          data: result
        });
      } else {
        logger.error('❌ Browser test failed', {
          component: 'AutomationAPI',
          error: result.error
        });

        res.status(400).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }

    } catch (error) {
      logger.error('❌ Error testing browser', {
        component: 'AutomationAPI',
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Server error during browser test'
      });
    }
  });

  // Obtenir le statut du service d'automation
  router.get('/status', async (req, res) => {
    try {
      const status = {
        service: 'automation',
        initialized: automationService?.initialized || false,
        timestamp: new Date().toISOString(),
        features: {
          emailGeneration: true,
          linkedinConnection: true,
          followupScheduling: true
        }
      };

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      logger.error('❌ Erreur statut automation', {
        component: 'AutomationAPI',
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du statut'
      });
    }
  });

  return router;
};

module.exports = createAutomationRoutes;