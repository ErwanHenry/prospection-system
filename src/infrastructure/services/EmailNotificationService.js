/**
 * Service Email Notification moderne
 * Wraps the legacy email notification service with modern patterns
 */

class EmailNotificationService {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.initialized = false;
    
    // Charger le service legacy
    this.legacyService = require('../../backend/services/emailNotificationService');
  }

  async initialize() {
    try {
      this.logger.info('🔧 Initialisation Email Notification Service...', {
        component: 'EmailNotificationService'
      });

      // Le service legacy s'initialise automatiquement
      this.initialized = true;
      
      this.logger.info('✅ Email Notification Service initialisé', {
        component: 'EmailNotificationService'
      });
      
      return true;
      
    } catch (error) {
      this.logger.error('❌ Erreur initialisation Email Notification', {
        component: 'EmailNotificationService',
        error: error.message
      });
      throw error;
    }
  }

  async sendWorkflowStartNotification(data) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      return await this.legacyService.sendWorkflowStartNotification(data);
      
    } catch (error) {
      this.logger.error('❌ Erreur notification début workflow', {
        component: 'EmailNotificationService',
        error: error.message
      });
      throw error;
    }
  }

  async sendWorkflowEndNotification(results) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      return await this.legacyService.sendWorkflowEndNotification(results);
      
    } catch (error) {
      this.logger.error('❌ Erreur notification fin workflow', {
        component: 'EmailNotificationService',
        error: error.message
      });
      throw error;
    }
  }

  async sendErrorNotification(error, context) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      return await this.legacyService.sendErrorNotification(error, context);
      
    } catch (emailError) {
      this.logger.error('❌ Erreur notification erreur', {
        component: 'EmailNotificationService',
        error: emailError.message,
        originalError: error.message
      });
      throw emailError;
    }
  }
}

module.exports = EmailNotificationService;