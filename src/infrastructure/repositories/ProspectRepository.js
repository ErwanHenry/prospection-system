/**
 * Repository des Prospects
 * Interface avec Google Sheets suivant le pattern Repository
 */

const Prospect = require('../../domain/entities/Prospect');

class ProspectRepository {
  constructor(googleSheetsService, logger) {
    this.sheetsService = googleSheetsService;
    this.logger = logger;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Récupère tous les prospects
   */
  async getAll(useCache = true) {
    try {
      const cacheKey = 'all_prospects';
      
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      await this.sheetsService.initialize();
      const sheetData = await this.sheetsService.getSheetData();
      
      // Ignorer la ligne d'en-tête
      const prospectRows = sheetData.slice(1);
      
      const prospects = prospectRows
        .filter(row => row.length >= 4 && row[1] && row[3]) // Validation: require name and title, company optional
        .map(row => {
          try {
            return Prospect.fromCrmData(row).toJSON();
          } catch (error) {
            this.logger.warn('Prospect invalide ignoré', {
              component: 'ProspectRepository',
              row: row.slice(0, 4), // Ne log que les premières colonnes pour la sécurité
              error: error.message
            });
            return null;
          }
        })
        .filter(prospect => prospect !== null);

      // Mise en cache
      if (useCache) {
        this.cache.set(cacheKey, {
          data: prospects,
          timestamp: Date.now()
        });
      }

      this.logger.info(`📊 ${prospects.length} prospects récupérés`, {
        component: 'ProspectRepository'
      });

      return prospects;
    } catch (error) {
      this.logger.error('Erreur récupération prospects', {
        component: 'ProspectRepository',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Récupère un prospect par ID
   */
  async getById(id) {
    try {
      const prospects = await this.getAll();
      return prospects.find(p => p.id === id) || null;
    } catch (error) {
      this.logger.error(`Erreur récupération prospect ${id}`, {
        component: 'ProspectRepository',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Récupère les prospects par critères
   */
  async findBy(criteria) {
    try {
      const prospects = await this.getAll();
      
      return prospects.filter(prospect => {
        return Object.entries(criteria).every(([key, value]) => {
          if (typeof value === 'string') {
            return prospect[key] && prospect[key].toLowerCase().includes(value.toLowerCase());
          }
          return prospect[key] === value;
        });
      });
    } catch (error) {
      this.logger.error('Erreur recherche prospects', {
        component: 'ProspectRepository',
        criteria,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Récupère les prospects sans email
   */
  async getProspectsNeedingEmail() {
    try {
      const prospects = await this.getAll();
      return prospects.filter(p => !p.email || p.email.includes('not_unlocked'));
    } catch (error) {
      this.logger.error('Erreur récupération prospects sans email', {
        component: 'ProspectRepository',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Ajoute un nouveau prospect
   */
  async create(prospectData) {
    try {
      const prospect = new Prospect(prospectData);
      
      await this.sheetsService.initialize();
      await this.sheetsService.addProspectsToSheet([prospect.toJSON()]);
      
      // Invalider le cache
      this.invalidateCache();
      
      this.logger.info(`✅ Prospect créé: ${prospect.name}`, {
        component: 'ProspectRepository',
        prospectId: prospect.id
      });

      return prospect.toJSON();
    } catch (error) {
      this.logger.error('Erreur création prospect', {
        component: 'ProspectRepository',
        error: error.message,
        prospectData: prospectData.name
      });
      throw error;
    }
  }

  /**
   * Ajoute plusieurs prospects
   */
  async createMany(prospectsData) {
    try {
      const prospects = prospectsData.map(data => new Prospect(data));
      
      await this.sheetsService.initialize();
      await this.sheetsService.addProspectsToSheet(prospects.map(p => p.toJSON()));
      
      // Invalider le cache
      this.invalidateCache();
      
      this.logger.info(`✅ ${prospects.length} prospects créés`, {
        component: 'ProspectRepository'
      });

      return prospects.map(p => p.toJSON());
    } catch (error) {
      this.logger.error('Erreur création prospects multiples', {
        component: 'ProspectRepository',
        count: prospectsData.length,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Met à jour un prospect
   */
  async update(prospectData) {
    try {
      const prospect = new Prospect(prospectData);
      
      // Trouver la ligne correspondante dans la feuille
      const allProspects = await this.getAll(false); // Pas de cache pour avoir les dernières données
      const existingIndex = allProspects.findIndex(p => p.id === prospect.id);
      
      if (existingIndex === -1) {
        throw new Error(`Prospect ${prospect.id} non trouvé`);
      }

      const rowNumber = existingIndex + 2; // +2 car ligne 1 = headers, index commence à 0
      
      await this.sheetsService.initialize();
      
      // Mettre à jour chaque colonne
      const crmData = prospect.toCrmFormat();
      const columnLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
      
      for (let i = 0; i < crmData.length && i < columnLetters.length; i++) {
        const range = `${columnLetters[i]}${rowNumber}`;
        await this.sheetsService.updateCell(range, crmData[i]);
      }
      
      // Invalider le cache
      this.invalidateCache();
      
      this.logger.info(`✅ Prospect mis à jour: ${prospect.name}`, {
        component: 'ProspectRepository',
        prospectId: prospect.id
      });

      return prospect.toJSON();
    } catch (error) {
      this.logger.error('Erreur mise à jour prospect', {
        component: 'ProspectRepository',
        prospectId: prospectData.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Met à jour plusieurs prospects
   */
  async updateMany(prospectsData) {
    const results = [];
    const errors = [];

    for (const prospectData of prospectsData) {
      try {
        const result = await this.update(prospectData);
        results.push(result);
      } catch (error) {
        errors.push({
          prospect: prospectData.id || prospectData.name,
          error: error.message
        });
      }
    }

    if (errors.length > 0) {
      this.logger.warn(`⚠️ ${errors.length} erreurs lors mise à jour multiple`, {
        component: 'ProspectRepository',
        errors: errors.slice(0, 5) // Limiter les logs
      });
    }

    return { results, errors };
  }

  /**
   * Supprime un prospect
   */
  async delete(prospectId) {
    try {
      const allProspects = await this.getAll(false);
      const existingIndex = allProspects.findIndex(p => p.id === prospectId);
      
      if (existingIndex === -1) {
        throw new Error(`Prospect ${prospectId} non trouvé`);
      }

      const rowNumber = existingIndex + 2;
      
      await this.sheetsService.initialize();
      const range = `A${rowNumber}:M${rowNumber}`;
      await this.sheetsService.sheets.spreadsheets.values.clear({
        spreadsheetId: this.sheetsService.spreadsheetId,
        range
      });
      
      // Invalider le cache
      this.invalidateCache();
      
      this.logger.info(`🗑️ Prospect supprimé: ${prospectId}`, {
        component: 'ProspectRepository'
      });

      return true;
    } catch (error) {
      this.logger.error('Erreur suppression prospect', {
        component: 'ProspectRepository',
        prospectId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Supprime les doublons
   */
  async removeDuplicates() {
    try {
      const prospects = await this.getAll(false);
      const seen = new Map();
      const duplicates = [];

      for (let i = 0; i < prospects.length; i++) {
        const prospect = prospects[i];
        const key = prospect.linkedinUrl || `${prospect.name}|${prospect.company}`;
        const normalized = key.toLowerCase().trim();

        if (seen.has(normalized)) {
          duplicates.push({ prospect, index: i });
        } else {
          seen.set(normalized, { prospect, index: i });
        }
      }

      // Supprimer les doublons (du plus récent au plus ancien pour éviter les décalages d'index)
      duplicates.sort((a, b) => b.index - a.index);
      
      for (const duplicate of duplicates) {
        await this.delete(duplicate.prospect.id);
      }

      this.logger.info(`🗑️ ${duplicates.length} doublons supprimés`, {
        component: 'ProspectRepository'
      });

      return duplicates.length;
    } catch (error) {
      this.logger.error('Erreur suppression doublons', {
        component: 'ProspectRepository',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Obtient les statistiques
   */
  async getStats() {
    try {
      const prospects = await this.getAll();
      
      const stats = {
        total: prospects.length,
        withEmail: prospects.filter(p => p.email).length,
        withLinkedIn: prospects.filter(p => p.linkedinUrl).length,
        byStatus: {},
        bySource: {},
        recentActivity: prospects
          .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
          .slice(0, 10)
      };

      // Grouper par statut
      prospects.forEach(p => {
        stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
      });

      // Grouper par source d'email
      prospects.forEach(p => {
        if (p.emailSource) {
          stats.bySource[p.emailSource] = (stats.bySource[p.emailSource] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      this.logger.error('Erreur calcul statistiques', {
        component: 'ProspectRepository',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Invalide le cache
   */
  invalidateCache() {
    this.cache.clear();
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.cache.clear();
    this.logger.info('Cache vidé', {
      component: 'ProspectRepository'
    });
  }
}

module.exports = ProspectRepository;