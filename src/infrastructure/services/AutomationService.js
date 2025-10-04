/**
 * Service Automation moderne
 * Wraps the legacy automation service with modern patterns
 */

class AutomationService {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.initialized = false;
    
    // Charger le service legacy
    this.legacyService = require('../../backend/services/automationService');
  }

  async initialize() {
    try {
      this.logger.info('🔧 Initialisation Automation Service...', {
        component: 'AutomationService'
      });

      const result = await this.legacyService.initialize();
      this.initialized = result;
      
      if (result) {
        this.logger.info('✅ Automation Service initialisé', {
          component: 'AutomationService'
        });
      }
      
      return result;
      
    } catch (error) {
      this.logger.error('❌ Erreur initialisation Automation', {
        component: 'AutomationService',
        error: error.message
      });
      throw error;
    }
  }

  async generatePersonalizedEmail(prospect, options = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      return await this.legacyService.generatePersonalizedEmail(prospect, options);
      
    } catch (error) {
      this.logger.error('❌ Erreur génération email', {
        component: 'AutomationService',
        error: error.message,
        prospect: prospect.name
      });
      throw error;
    }
  }

  async sendLinkedInConnection(data) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      return await this.legacyService.sendLinkedInConnection(data);
      
    } catch (error) {
      this.logger.error('❌ Erreur connexion LinkedIn', {
        component: 'AutomationService',
        error: error.message
      });
      throw error;
    }
  }

  async scheduleFollowUp(data) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      return await this.legacyService.scheduleFollowUp(data);
      
    } catch (error) {
      this.logger.error('❌ Erreur programmation relance', {
        component: 'AutomationService',
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = AutomationService;