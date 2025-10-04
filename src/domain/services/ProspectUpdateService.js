/**
 * Service de Mise à Jour des Prospects
 * Gère la mise à jour en masse des prospects existants
 */

const Prospect = require('../entities/Prospect');

class ProspectUpdateService {
  constructor(prospectRepository, emailFinderService, logger) {
    this.prospectRepository = prospectRepository;
    this.emailFinderService = emailFinderService;
    this.logger = logger;
    this.updateStats = {
      total: 0,
      updated: 0,
      emailsFound: 0,
      errors: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * Met à jour tous les prospects existants
   * @param {Object} options - Options de mise à jour
   * @returns {Object} Statistiques de mise à jour
   */
  async updateAllProspects(options = {}) {
    const {
      findMissingEmails = true,
      refreshLinkedInData = false,
      updateScores = false,
      cleanDuplicates = true,
      batchSize = 10,
      maxConcurrent = 3
    } = options;

    this.resetStats();
    this.updateStats.startTime = new Date();

    this.logger.info('🔄 Démarrage mise à jour globale des prospects', {
      component: 'ProspectUpdate',
      options
    });

    try {
      // 1. Récupérer tous les prospects
      const allProspects = await this.prospectRepository.getAll();
      this.updateStats.total = allProspects.length;

      this.logger.info(`📊 ${allProspects.length} prospects à traiter`, {
        component: 'ProspectUpdate'
      });

      // 2. Nettoyer les doublons si demandé
      if (cleanDuplicates) {
        await this.removeDuplicates(allProspects);
      }

      // 3. Traitement par batches
      const batches = this.createBatches(allProspects, batchSize);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        this.logger.info(`🔄 Traitement batch ${i + 1}/${batches.length} (${batch.length} prospects)`, {
          component: 'ProspectUpdate'
        });

        await this.processBatch(batch, {
          findMissingEmails,
          refreshLinkedInData,
          updateScores,
          maxConcurrent
        });

        // Délai entre batches pour éviter rate limiting
        if (i < batches.length - 1) {
          await this.delay(2000);
        }
      }

      this.updateStats.endTime = new Date();
      this.updateStats.duration = this.updateStats.endTime - this.updateStats.startTime;

      this.logger.info('✅ Mise à jour globale terminée', {
        component: 'ProspectUpdate',
        stats: this.updateStats
      });

      return this.updateStats;

    } catch (error) {
      this.logger.error('❌ Erreur mise à jour globale', {
        component: 'ProspectUpdate',
        error: error.message,
        stack: error.stack
      });
      
      this.updateStats.endTime = new Date();
      throw error;
    }
  }

  /**
   * Traite un batch de prospects
   */
  async processBatch(prospects, options) {
    const { findMissingEmails, refreshLinkedInData, updateScores, maxConcurrent } = options;
    
    // Traitement concurrent limité
    const semaphore = new Array(maxConcurrent).fill(Promise.resolve());
    let semaphoreIndex = 0;

    const promises = prospects.map(async (prospect) => {
      // Attendre qu'un slot soit disponible
      await semaphore[semaphoreIndex];
      const currentIndex = semaphoreIndex;
      semaphoreIndex = (semaphoreIndex + 1) % maxConcurrent;

      try {
        const updatedProspect = await this.processProspect(prospect, {
          findMissingEmails,
          refreshLinkedInData,
          updateScores
        });

        if (updatedProspect) {
          await this.prospectRepository.update(updatedProspect);
          this.updateStats.updated++;
        }

        return updatedProspect;
      } catch (error) {
        this.updateStats.errors++;
        this.logger.error(`❌ Erreur traitement prospect ${prospect.name}`, {
          component: 'ProspectUpdate',
          error: error.message,
          prospect: prospect.id
        });
        return null;
      } finally {
        // Libérer le slot avec un délai
        semaphore[currentIndex] = this.delay(1000);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Traite un prospect individuel
   */
  async processProspect(prospect, options) {
    const { findMissingEmails, refreshLinkedInData, updateScores } = options;
    let hasUpdates = false;
    
    const prospectEntity = new Prospect(prospect);
    
    this.logger.info(`🔄 Traitement ${prospect.name} @ ${prospect.company}`, {
      component: 'ProspectUpdate',
      prospect: prospect.id
    });

    // 1. Rechercher emails manquants
    if (findMissingEmails && prospectEntity.needsEmailSearch()) {
      try {
        const emailResult = await this.emailFinderService.findEmail(prospect);
        
        if (emailResult.success && emailResult.email) {
          prospectEntity.updateEmail(emailResult.email, emailResult.source, emailResult.verified);
          this.updateStats.emailsFound++;
          hasUpdates = true;
          
          this.logger.info(`✅ Email trouvé: ${emailResult.email} (${emailResult.source})`, {
            component: 'ProspectUpdate',
            prospect: prospect.id
          });
        }
      } catch (error) {
        this.logger.warn(`⚠️ Échec recherche email pour ${prospect.name}`, {
          component: 'ProspectUpdate',
          error: error.message
        });
      }
    }

    // 2. Actualiser données LinkedIn (si demandé)
    if (refreshLinkedInData && prospectEntity.hasLinkedIn()) {
      // TODO: Implémenter refresh LinkedIn
      // const linkedinData = await this.linkedinService.getProfile(prospect.linkedinUrl);
    }

    // 3. Recalculer scores (si demandé)
    if (updateScores) {
      const newScore = this.calculateProspectScore(prospectEntity);
      if (newScore !== prospectEntity.score) {
        prospectEntity.score = newScore;
        hasUpdates = true;
      }
    }

    // 4. Nettoyage et normalisation des données
    const cleanedProspect = this.cleanProspectData(prospectEntity);
    if (cleanedProspect !== prospectEntity) {
      hasUpdates = true;
    }

    return hasUpdates ? cleanedProspect : null;
  }

  /**
   * Calcule le score d'un prospect
   */
  calculateProspectScore(prospect) {
    let score = 0;

    // Score de base selon le titre
    const seniorTitles = ['ceo', 'cto', 'coo', 'founder', 'director', 'vp', 'head'];
    const title = prospect.title.toLowerCase();
    
    if (seniorTitles.some(t => title.includes(t))) {
      score += 30;
    } else if (title.includes('manager') || title.includes('lead')) {
      score += 20;
    } else {
      score += 10;
    }

    // Bonus email
    if (prospect.hasEmail()) {
      score += 25;
      if (prospect.emailVerified) {
        score += 10;
      }
    }

    // Bonus LinkedIn
    if (prospect.hasLinkedIn()) {
      score += 20;
    }

    // Bonus localisation France
    if (prospect.location && prospect.location.toLowerCase().includes('france')) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Nettoie et normalise les données d'un prospect
   */
  cleanProspectData(prospect) {
    // Nettoyage des tags
    const tags = prospect.tags
      .split(' ')
      .filter(tag => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // Dédoublonner
      .sort()
      .join(' ');

    if (tags !== prospect.tags) {
      prospect.tags = tags;
    }

    // Nettoyage notes
    if (prospect.notes) {
      const notes = prospect.notes
        .split(' | ')
        .filter(note => note.trim().length > 0)
        .filter((note, index, arr) => arr.indexOf(note) === index) // Dédoublonner
        .join(' | ');
      
      if (notes !== prospect.notes) {
        prospect.notes = notes;
      }
    }

    return prospect;
  }

  /**
   * Supprime les doublons
   */
  async removeDuplicates(prospects) {
    const seen = new Map();
    const duplicates = [];

    for (const prospect of prospects) {
      // Clé de déduplication : LinkedIn URL ou Name + Company
      const key = prospect.linkedinUrl || `${prospect.name}|${prospect.company}`;
      const normalized = key.toLowerCase().trim();

      if (seen.has(normalized)) {
        duplicates.push(prospect);
      } else {
        seen.set(normalized, prospect);
      }
    }

    if (duplicates.length > 0) {
      this.logger.info(`🗑️ Suppression de ${duplicates.length} doublons`, {
        component: 'ProspectUpdate'
      });

      for (const duplicate of duplicates) {
        await this.prospectRepository.delete(duplicate.id);
      }
    }

    return duplicates.length;
  }

  /**
   * Crée des batches de prospects
   */
  createBatches(prospects, batchSize) {
    const batches = [];
    for (let i = 0; i < prospects.length; i += batchSize) {
      batches.push(prospects.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Délai asynchrone
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Remet à zéro les statistiques
   */
  resetStats() {
    this.updateStats = {
      total: 0,
      updated: 0,
      emailsFound: 0,
      errors: 0,
      startTime: null,
      endTime: null,
      duration: 0
    };
  }

  /**
   * Obtient les statistiques actuelles
   */
  getStats() {
    return { ...this.updateStats };
  }
}

module.exports = ProspectUpdateService;