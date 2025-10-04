/**
 * Service Google Sheets moderne
 * Wraps the legacy Google Sheets service with modern patterns
 */

class GoogleSheetsService {
  constructor(logger) {
    this.logger = logger;
    this.initialized = false;
    
    // Charger le service legacy
    this.legacyService = require('../../backend/services/googleSheets');
  }

  async initialize() {
    try {
      this.logger.info('🔧 Initialisation Google Sheets Service...', {
        component: 'GoogleSheetsService'
      });

      const result = await this.legacyService.initialize();
      
      if (result) {
        await this.legacyService.setupHeaders();
        this.initialized = true;
        
        this.logger.info('✅ Google Sheets Service initialisé', {
          component: 'GoogleSheetsService'
        });
      }
      
      return result;
      
    } catch (error) {
      this.logger.error('❌ Erreur initialisation Google Sheets', {
        component: 'GoogleSheetsService',
        error: error.message
      });
      throw error;
    }
  }

  async getSheetData() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      return await this.legacyService.getSheetData();
    } catch (error) {
      this.logger.error('Erreur récupération données sheet', {
        component: 'GoogleSheetsService',
        error: error.message
      });
      throw error;
    }
  }

  async addProspectsToSheet(prospects) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      return await this.legacyService.addProspectsToSheet(prospects);
    } catch (error) {
      this.logger.error('Erreur ajout prospects', {
        component: 'GoogleSheetsService',
        error: error.message,
        prospectCount: prospects.length
      });
      throw error;
    }
  }

  async updateCell(range, value) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      return await this.legacyService.updateCell(range, value);
    } catch (error) {
      this.logger.error('Erreur mise à jour cellule', {
        component: 'GoogleSheetsService',
        error: error.message,
        range
      });
      throw error;
    }
  }

  async getAuthUrl() {
    return await this.legacyService.getAuthUrl();
  }

  async saveToken(code) {
    return await this.legacyService.saveToken(code);
  }

  get spreadsheetId() {
    return this.legacyService.spreadsheetId;
  }

  get sheets() {
    return this.legacyService.sheets;
  }
}

module.exports = GoogleSheetsService;