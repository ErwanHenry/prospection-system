/**
 * Contrôleur des Prospects
 * Gère les endpoints API pour les prospects
 */

class ProspectController {
  constructor(prospectRepository, prospectUpdateService, emailFinderService, logger) {
    this.prospectRepository = prospectRepository;
    this.prospectUpdateService = prospectUpdateService;
    this.emailFinderService = emailFinderService;
    this.logger = logger;

    // Binding des méthodes pour les routes Express
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getStats = this.getStats.bind(this);
    this.removeDuplicates = this.removeDuplicates.bind(this);
    this.updateAll = this.updateAll.bind(this);
    this.getUpdateStatus = this.getUpdateStatus.bind(this);
    this.findEmail = this.findEmail.bind(this);
    this.bulkEmailFinding = this.bulkEmailFinding.bind(this);
    this.bulkUpdate = this.bulkUpdate.bind(this);
  }

  /**
   * GET /api/prospects
   * Récupère tous les prospects
   */
  async getAll(req, res) {
    try {
      const { status, company, hasEmail, limit, offset } = req.query;
      
      let prospects = await this.prospectRepository.getAll();
      
      // Filtrage
      if (status) {
        prospects = prospects.filter(p => p.status === status);
      }
      if (company) {
        prospects = prospects.filter(p => 
          p.company.toLowerCase().includes(company.toLowerCase())
        );
      }
      if (hasEmail !== undefined) {
        const filterHasEmail = hasEmail === 'true';
        prospects = prospects.filter(p => !!p.email === filterHasEmail);
      }
      
      // Pagination
      const totalCount = prospects.length;
      const startIndex = parseInt(offset) || 0;
      const limitCount = parseInt(limit) || prospects.length;
      
      if (limit || offset) {
        prospects = prospects.slice(startIndex, startIndex + limitCount);
      }

      res.json({
        success: true,
        data: prospects,
        pagination: {
          total: totalCount,
          offset: startIndex,
          limit: limitCount,
          returned: prospects.length
        }
      });

    } catch (error) {
      this.logger.error('Erreur récupération prospects', {
        component: 'ProspectController',
        method: 'getAll',
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des prospects'
      });
    }
  }

  /**
   * GET /api/prospects/:id
   * Récupère un prospect par ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const prospect = await this.prospectRepository.getById(id);
      
      if (!prospect) {
        return res.status(404).json({
          success: false,
          error: 'Prospect non trouvé'
        });
      }

      res.json({
        success: true,
        data: prospect
      });

    } catch (error) {
      this.logger.error('Erreur récupération prospect', {
        component: 'ProspectController',
        method: 'getById',
        prospectId: req.params.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du prospect'
      });
    }
  }

  /**
   * POST /api/prospects
   * Crée un nouveau prospect
   */
  async create(req, res) {
    try {
      const prospectData = req.body;
      
      // Validation basique
      if (!prospectData.name || !prospectData.company || !prospectData.title) {
        return res.status(400).json({
          success: false,
          error: 'Nom, entreprise et titre sont requis'
        });
      }

      const prospect = await this.prospectRepository.create(prospectData);

      res.status(201).json({
        success: true,
        data: prospect
      });

    } catch (error) {
      this.logger.error('Erreur création prospect', {
        component: 'ProspectController',
        method: 'create',
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * PUT /api/prospects/:id
   * Met à jour un prospect
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body, id };

      const prospect = await this.prospectRepository.update(updateData);

      res.json({
        success: true,
        data: prospect
      });

    } catch (error) {
      this.logger.error('Erreur mise à jour prospect', {
        component: 'ProspectController',
        method: 'update',
        prospectId: req.params.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/prospects/:id
   * Supprime un prospect
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.prospectRepository.delete(id);

      res.json({
        success: true,
        message: 'Prospect supprimé avec succès'
      });

    } catch (error) {
      this.logger.error('Erreur suppression prospect', {
        component: 'ProspectController',
        method: 'delete',
        prospectId: req.params.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/prospects/stats
   * Récupère les statistiques des prospects
   */
  async getStats(req, res) {
    try {
      const stats = await this.prospectRepository.getStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      this.logger.error('Erreur récupération statistiques', {
        component: 'ProspectController',
        method: 'getStats',
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Erreur lors du calcul des statistiques'
      });
    }
  }

  /**
   * POST /api/prospects/remove-duplicates
   * Supprime les prospects en doublon
   */
  async removeDuplicates(req, res) {
    try {
      const removedCount = await this.prospectRepository.removeDuplicates();

      res.json({
        success: true,
        message: `${removedCount} doublon(s) supprimé(s)`,
        removed: removedCount
      });

    } catch (error) {
      this.logger.error('Erreur suppression doublons', {
        component: 'ProspectController',
        method: 'removeDuplicates',
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression des doublons'
      });
    }
  }

  /**
   * POST /api/prospects/update-all
   * Met à jour tous les prospects existants
   */
  async updateAll(req, res) {
    try {
      const options = {
        findMissingEmails: req.body.findMissingEmails !== false,
        refreshLinkedInData: req.body.refreshLinkedInData === true,
        updateScores: req.body.updateScores !== false,
        cleanDuplicates: req.body.cleanDuplicates !== false,
        batchSize: parseInt(req.body.batchSize) || 10,
        maxConcurrent: parseInt(req.body.maxConcurrent) || 3
      };

      this.logger.info('🔄 Démarrage mise à jour globale des prospects', {
        component: 'ProspectController',
        method: 'updateAll',
        options
      });

      // Lancer la mise à jour en arrière-plan
      const updatePromise = this.prospectUpdateService.updateAllProspects(options);
      
      // Réponse immédiate pour éviter les timeouts
      res.json({
        success: true,
        message: 'Mise à jour globale démarrée',
        estimatedDuration: '10-30 minutes selon le volume',
        options
      });

      // Continuer le traitement en arrière-plan
      try {
        const stats = await updatePromise;
        
        this.logger.info('✅ Mise à jour globale terminée', {
          component: 'ProspectController',
          method: 'updateAll',
          stats
        });

        // TODO: Envoyer une notification email à l'utilisateur avec les résultats
        
      } catch (error) {
        this.logger.error('❌ Échec mise à jour globale', {
          component: 'ProspectController',
          method: 'updateAll',
          error: error.message
        });

        // TODO: Envoyer une notification d'erreur
      }

    } catch (error) {
      this.logger.error('Erreur lancement mise à jour globale', {
        component: 'ProspectController',
        method: 'updateAll',
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Erreur lors du lancement de la mise à jour'
      });
    }
  }

  /**
   * GET /api/prospects/update-all/status
   * Récupère le statut de la mise à jour globale
   */
  async getUpdateStatus(req, res) {
    try {
      const stats = this.prospectUpdateService.getStats();
      
      res.json({
        success: true,
        data: {
          ...stats,
          isRunning: stats.startTime && !stats.endTime,
          progress: stats.total > 0 ? (stats.updated / stats.total * 100).toFixed(1) : 0
        }
      });

    } catch (error) {
      console.error('Erreur récupération statut mise à jour:', error.message);

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du statut'
      });
    }
  }

  /**
   * POST /api/prospects/:id/find-email
   * Trouve l'email d'un prospect spécifique
   */
  async findEmail(req, res) {
    try {
      const { id } = req.params;
      const prospect = await this.prospectRepository.getById(id);
      
      if (!prospect) {
        return res.status(404).json({
          success: false,
          error: 'Prospect non trouvé'
        });
      }

      const emailResult = await this.emailFinderService.findEmail(prospect);

      if (emailResult.success && emailResult.email) {
        // Mettre à jour le prospect avec l'email trouvé
        prospect.email = emailResult.email;
        prospect.emailSource = emailResult.source;
        prospect.emailVerified = emailResult.verified;
        
        await this.prospectRepository.update(prospect);
      }

      res.json({
        success: emailResult.success,
        email: emailResult.email,
        source: emailResult.source,
        verified: emailResult.verified,
        prospect: prospect
      });

    } catch (error) {
      this.logger.error('Erreur recherche email prospect', {
        component: 'ProspectController',
        method: 'findEmail',
        prospectId: req.params.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche d\'email'
      });
    }
  }

  /**
   * POST /api/prospects/bulk-email-finding
   * Recherche d'emails en lot pour les prospects sans email
   */
  async bulkEmailFinding(req, res) {
    try {
      const { maxConcurrent = 3, batchSize = 10 } = req.body;
      
      this.logger.info('🔍 Démarrage recherche emails en lot', {
        component: 'ProspectController',
        method: 'bulkEmailFinding',
        maxConcurrent,
        batchSize
      });

      // Get prospects without email
      const prospectsNeedingEmail = await this.prospectRepository.getProspectsNeedingEmail();
      
      if (prospectsNeedingEmail.length === 0) {
        return res.json({
          success: true,
          message: 'Aucun prospect sans email trouvé',
          data: {
            total: 0,
            processed: 0,
            found: 0,
            failed: 0,
            results: []
          }
        });
      }

      this.logger.info(`📊 ${prospectsNeedingEmail.length} prospects sans email trouvés`, {
        component: 'ProspectController'
      });

      const results = [];
      const errors = [];
      let processed = 0;
      let found = 0;

      // Process prospects in batches with concurrency control
      for (let i = 0; i < prospectsNeedingEmail.length; i += batchSize) {
        const batch = prospectsNeedingEmail.slice(i, i + batchSize);
        
        this.logger.info(`🔄 Traitement batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(prospectsNeedingEmail.length/batchSize)}`, {
          component: 'ProspectController',
          batchSize: batch.length
        });

        // Process batch sequentially to respect rate limits
        const batchResults = [];
        for (const prospect of batch) {
          try {
            const emailResult = await this.emailFinderService.findEmail(prospect);

            if (emailResult.success && emailResult.email) {
              // Update prospect with found email
              prospect.email = emailResult.email;
              prospect.emailSource = emailResult.source;
              prospect.emailVerified = emailResult.verified;
              
              await this.prospectRepository.update(prospect);
              found++;
              
              batchResults.push({
                success: true,
                prospectId: prospect.id,
                name: prospect.name,
                email: emailResult.email,
                source: emailResult.source,
                verified: emailResult.verified
              });
            } else {
              batchResults.push({
                success: false,
                prospectId: prospect.id,
                name: prospect.name,
                error: emailResult.error || 'Email non trouvé'
              });
            }

          } catch (error) {
            this.logger.error(`❌ Erreur recherche email pour ${prospect.name}`, {
              component: 'ProspectController',
              error: error.message
            });

            batchResults.push({
              success: false,
              prospectId: prospect.id,
              name: prospect.name,
              error: error.message
            });
          }

          // Add small delay between individual requests to avoid overwhelming services
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between requests
        }

        results.push(...batchResults);
        processed += batch.length;

        // Log progress
        this.logger.info(`✅ Batch terminé: ${processed}/${prospectsNeedingEmail.length}`, {
          component: 'ProspectController',
          found: results.filter(r => r.success).length
        });

        // Add delay between batches to respect rate limits
        if (i + batchSize < prospectsNeedingEmail.length) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second between batches
        }
      }

      const successResults = results.filter(r => r.success);
      const errorResults = results.filter(r => !r.success);

      this.logger.info('✅ Recherche emails en lot terminée', {
        component: 'ProspectController',
        total: prospectsNeedingEmail.length,
        processed,
        found: successResults.length,
        failed: errorResults.length
      });

      res.json({
        success: true,
        message: `Recherche terminée: ${successResults.length} emails trouvés sur ${processed} prospects`,
        data: {
          total: prospectsNeedingEmail.length,
          processed,
          found: successResults.length,
          failed: errorResults.length,
          results: successResults,
          errors: errorResults.slice(0, 10) // Limit error details
        }
      });

    } catch (error) {
      this.logger.error('❌ Erreur recherche emails en lot', {
        component: 'ProspectController',
        method: 'bulkEmailFinding',
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche d\'emails en lot'
      });
    }
  }

  /**
   * POST /api/prospects/bulk-update
   * Mise à jour en lot de prospects
   */
  async bulkUpdate(req, res) {
    try {
      const { prospects } = req.body;
      
      if (!Array.isArray(prospects) || prospects.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Liste de prospects requise'
        });
      }

      const { results, errors } = await this.prospectRepository.updateMany(prospects);

      res.json({
        success: true,
        data: {
          updated: results.length,
          errors: errors.length,
          results,
          errors: errors.slice(0, 10) // Limiter les erreurs affichées
        }
      });

    } catch (error) {
      this.logger.error('Erreur mise à jour en lot', {
        component: 'ProspectController',
        method: 'bulkUpdate',
        count: req.body.prospects?.length || 0,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour en lot'
      });
    }
  }
}

module.exports = ProspectController;