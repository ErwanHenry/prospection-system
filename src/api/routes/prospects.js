/**
 * Routes des Prospects
 * Définit toutes les routes liées aux prospects avec middlewares
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Middleware de validation des erreurs
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Données invalides',
      details: errors.array()
    });
  }
  next();
};

// Rate limiting pour les opérations coûteuses
const heavyOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 opérations lourdes par IP par fenêtre
  message: {
    success: false,
    error: 'Trop d\'opérations lourdes. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const emailSearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Maximum 20 recherches d'email par minute
  message: {
    success: false,
    error: 'Limite de recherches d\'email atteinte. Réessayez dans 1 minute.'
  }
});

// Validation schemas
const prospectValidation = [
  body('name')
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .trim(),
  body('company')
    .notEmpty()
    .withMessage('L\'entreprise est requise')
    .isLength({ min: 2, max: 150 })
    .withMessage('L\'entreprise doit contenir entre 2 et 150 caractères')
    .trim(),
  body('title')
    .notEmpty()
    .withMessage('Le titre est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le titre doit contenir entre 2 et 100 caractères')
    .trim(),
  body('linkedinUrl')
    .optional()
    .isURL()
    .withMessage('URL LinkedIn invalide')
    .custom(value => {
      if (value && !value.includes('linkedin.com/in/')) {
        throw new Error('URL LinkedIn doit contenir linkedin.com/in/');
      }
      return true;
    }),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email invalide'),
  body('score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Le score doit être entre 0 et 100'),
  body('status')
    .optional()
    .isIn(['Nouveau', 'Contacté', 'Intéressé', 'Qualifié', 'Converti', 'Rejeté'])
    .withMessage('Statut invalide')
];

const paginationValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('La limite doit être entre 1 et 1000'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'offset doit être positif')
];

const idValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID requis')
    .isLength({ min: 1, max: 50 })
    .withMessage('ID invalide')
];

const updateAllValidation = [
  body('findMissingEmails')
    .optional()
    .isBoolean()
    .withMessage('findMissingEmails doit être boolean'),
  body('refreshLinkedInData')
    .optional()
    .isBoolean()
    .withMessage('refreshLinkedInData doit être boolean'),
  body('updateScores')
    .optional()
    .isBoolean()
    .withMessage('updateScores doit être boolean'),
  body('cleanDuplicates')
    .optional()
    .isBoolean()
    .withMessage('cleanDuplicates doit être boolean'),
  body('batchSize')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('batchSize doit être entre 1 et 50'),
  body('maxConcurrent')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('maxConcurrent doit être entre 1 et 10')
];

// Factory pour créer les routes
function createProspectRoutes(prospectController) {
  
  // GET /api/prospects
  router.get('/', 
    paginationValidation,
    handleValidationErrors,
    prospectController.getAll
  );

  // GET /api/prospects/stats
  router.get('/stats', 
    prospectController.getStats
  );

  // GET /api/prospects/update-all/status
  router.get('/update-all/status',
    prospectController.getUpdateStatus
  );

  // GET /api/prospects/:id
  router.get('/:id',
    idValidation,
    handleValidationErrors,
    prospectController.getById
  );

  // POST /api/prospects
  router.post('/',
    prospectValidation,
    handleValidationErrors,
    prospectController.create
  );

  // POST /api/prospects/remove-duplicates
  router.post('/remove-duplicates',
    heavyOperationLimiter,
    prospectController.removeDuplicates
  );

  // POST /api/prospects/update-all
  router.post('/update-all',
    heavyOperationLimiter,
    updateAllValidation,
    handleValidationErrors,
    prospectController.updateAll
  );

  // POST /api/prospects/bulk-update
  router.post('/bulk-update',
    [
      body('prospects')
        .isArray({ min: 1, max: 100 })
        .withMessage('prospects doit être un tableau de 1 à 100 éléments'),
      body('prospects.*.id')
        .notEmpty()
        .withMessage('Chaque prospect doit avoir un ID')
    ],
    handleValidationErrors,
    prospectController.bulkUpdate
  );

  // POST /api/prospects/bulk-email-finding
  router.post('/bulk-email-finding',
    heavyOperationLimiter, // Use heavy operation limiter for bulk operations
    [
      body('maxConcurrent')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('maxConcurrent doit être entre 1 et 10'),
      body('batchSize')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('batchSize doit être entre 1 et 50')
    ],
    handleValidationErrors,
    prospectController.bulkEmailFinding
  );

  // POST /api/prospects/:id/find-email
  router.post('/:id/find-email',
    emailSearchLimiter,
    idValidation,
    handleValidationErrors,
    prospectController.findEmail
  );

  // PUT /api/prospects/:id
  router.put('/:id',
    idValidation,
    prospectValidation,
    handleValidationErrors,
    prospectController.update
  );

  // DELETE /api/prospects/:id
  router.delete('/:id',
    idValidation,
    handleValidationErrors,
    prospectController.delete
  );

  return router;
}

module.exports = createProspectRoutes;