/**
 * Routes Workflow - Modern API
 * Gère les workflows d'automation LinkedIn
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting pour les workflows (opérations lourdes)
const workflowLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 workflows par 15 minutes
  message: {
    success: false,
    error: 'Limite de workflows atteinte. Réessayez dans 15 minutes.'
  }
});

const createWorkflowRoutes = (workflowController) => {
  const router = express.Router();

  // Validation pour démarrer un workflow
  const workflowValidation = [
    body('prospects')
      .isArray({ min: 1 })
      .withMessage('Au moins un prospect est requis'),
    body('prospects.*.name')
      .notEmpty()
      .withMessage('Le nom du prospect est requis'),
    body('prospects.*.company')
      .notEmpty()
      .withMessage('L\'entreprise est requise'),
    body('config.generateEmails')
      .optional()
      .isBoolean(),
    body('config.sendConnections')
      .optional()
      .isBoolean()
  ];

  // Middleware de validation
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

  // Démarrer un workflow complet
  router.post(
    '/run-full-sequence',
    workflowLimiter,
    workflowValidation,
    handleValidation,
    async (req, res) => {
      try {
        if (workflowController && workflowController.runFullSequence) {
          await workflowController.runFullSequence(req, res);
        } else {
          // Route legacy temporaire
          const { prospects = [], config = {} } = req.body;
          
          res.json({
            success: true,
            message: 'Workflow en cours de refactorisation vers l\'architecture moderne',
            data: {
              prospectCount: prospects.length,
              config,
              status: 'legacy-mode'
            }
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  // Obtenir le statut d'un workflow
  router.get(
    '/status/:workflowId?',
    query('format').optional().isIn(['json', 'summary']),
    async (req, res) => {
      try {
        if (workflowController && workflowController.getWorkflowStatus) {
          await workflowController.getWorkflowStatus(req, res);
        } else {
          res.json({
            success: true,
            message: 'Statut workflow - mode legacy',
            data: {
              status: 'inactive',
              mode: 'legacy'
            }
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  // Arrêter un workflow en cours
  router.post(
    '/stop/:workflowId?',
    async (req, res) => {
      try {
        if (workflowController && workflowController.stopWorkflow) {
          await workflowController.stopWorkflow(req, res);
        } else {
          res.json({
            success: true,
            message: 'Arrêt workflow - mode legacy',
            data: {
              status: 'stopped'
            }
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  return router;
};

module.exports = createWorkflowRoutes;