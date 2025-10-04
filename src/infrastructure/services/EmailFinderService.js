/**
 * Service Email Finder moderne
 * Wraps the legacy email finder service with modern patterns
 */

class EmailFinderService {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.initialized = false;
    
    // Charger le service legacy
    this.legacyService = require('../../backend/services/emailFinderService');
  }

  async initialize() {
    try {
      this.logger.info('🔧 Initialisation Email Finder Service...', {
        component: 'EmailFinderService'
      });

      const result = await this.legacyService.initialize();
      this.initialized = result;
      
      if (result) {
        this.logger.info('✅ Email Finder Service initialisé', {
          component: 'EmailFinderService',
          sources: this.config.get('features.emailFinding.sources')
        });
      }
      
      return result;
      
    } catch (error) {
      this.logger.error('❌ Erreur initialisation Email Finder', {
        component: 'EmailFinderService',
        error: error.message
      });
      throw error;
    }
  }

  async findEmail(prospect) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      this.logger.info(`🔍 Recherche email pour ${prospect.name}`, {
        component: 'EmailFinderService',
        prospect: prospect.name,
        company: prospect.company
      });
      
      const result = await this.legacyService.findEmail(prospect);
      
      if (result.success) {
        this.logger.info(`✅ Email trouvé: ${result.email} (${result.source})`, {
          component: 'EmailFinderService',
          prospect: prospect.name,
          source: result.source
        });
      }
      
      return result;
      
    } catch (error) {
      this.logger.error('❌ Erreur recherche email', {
        component: 'EmailFinderService',
        error: error.message,
        prospect: prospect.name
      });
      throw error;
    }
  }
}

module.exports = EmailFinderService;