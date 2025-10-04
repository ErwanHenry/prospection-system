/**
 * Update All Prospects - Fonctionnalité de mise à jour globale
 * Gère l'interface et les appels API pour la mise à jour en masse des prospects
 */

class UpdateAllProspects {
    constructor() {
        this.isUpdating = false;
        this.updateInterval = null;
        this.modal = null;
        this.progressSection = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Bouton principal
        this.updateButton = document.getElementById('updateAllProspects');
        
        // Modal elements
        this.modal = document.getElementById('updateAllModal');
        this.modalClose = this.modal.querySelector('.modal-close');
        this.cancelButton = document.getElementById('cancelUpdate');
        this.startButton = document.getElementById('startUpdate');
        
        // Options checkboxes
        this.findMissingEmailsCheck = document.getElementById('findMissingEmails');
        this.updateScoresCheck = document.getElementById('updateScores');
        this.cleanDuplicatesCheck = document.getElementById('cleanDuplicates');
        this.refreshLinkedInDataCheck = document.getElementById('refreshLinkedInData');
        
        // Performance settings
        this.batchSizeSelect = document.getElementById('batchSize');
        this.maxConcurrentSelect = document.getElementById('maxConcurrent');
        
        // Time estimation
        this.estimatedTimeSpan = document.getElementById('estimatedTime');
        
        // Progress elements
        this.progressSection = document.getElementById('updateProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.processedCount = document.getElementById('processedCount');
        this.emailsFoundCount = document.getElementById('emailsFoundCount');
        this.errorsCount = document.getElementById('errorsCount');
        this.cancelProgressButton = document.getElementById('cancelUpdateProgress');
    }

    bindEvents() {
        // Bouton principal
        this.updateButton?.addEventListener('click', () => this.showModal());
        
        // Modal controls
        this.modalClose?.addEventListener('click', () => this.hideModal());
        this.cancelButton?.addEventListener('click', () => this.hideModal());
        this.startButton?.addEventListener('click', () => this.startUpdate());
        
        // Fermer modal en cliquant à côté
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
        
        // Bouton d'annulation pendant progression
        this.cancelProgressButton?.addEventListener('click', () => this.cancelUpdate());
        
        // Mise à jour estimation temps quand options changent
        this.bindEstimationUpdates();
        
        // Empêcher fermeture accidentelle pendant mise à jour
        window.addEventListener('beforeunload', (e) => {
            if (this.isUpdating) {
                e.preventDefault();
                e.returnValue = 'Une mise à jour est en cours. Êtes-vous sûr de vouloir quitter ?';
            }
        });
    }

    bindEstimationUpdates() {
        const updateEstimation = () => this.updateTimeEstimation();
        
        this.findMissingEmailsCheck?.addEventListener('change', updateEstimation);
        this.updateScoresCheck?.addEventListener('change', updateEstimation);
        this.cleanDuplicatesCheck?.addEventListener('change', updateEstimation);
        this.refreshLinkedInDataCheck?.addEventListener('change', updateEstimation);
        this.batchSizeSelect?.addEventListener('change', updateEstimation);
        this.maxConcurrentSelect?.addEventListener('change', updateEstimation);
    }

    async showModal() {
        if (this.isUpdating) {
            this.showNotification('Une mise à jour est déjà en cours', 'warning');
            return;
        }

        // Récupérer le nombre de prospects pour estimation
        await this.getProspectCount();
        
        this.updateTimeEstimation();
        this.modal.style.display = 'flex';
        
        // Focus sur le premier checkbox
        setTimeout(() => {
            this.findMissingEmailsCheck?.focus();
        }, 300);
    }

    hideModal() {
        if (this.isUpdating) {
            if (!confirm('Une mise à jour est en cours. Voulez-vous vraiment fermer ?')) {
                return;
            }
        }
        
        this.modal.style.display = 'none';
    }

    async getProspectCount() {
        try {
            const response = await fetch('/api/prospects/stats');
            const data = await response.json();
            
            if (data.success) {
                this.prospectCount = data.data.total || 0;
            } else {
                this.prospectCount = 0;
            }
        } catch (error) {
            console.error('Error getting prospect count:', error);
            this.prospectCount = 0;
        }
    }

    updateTimeEstimation() {
        const prospectCount = this.prospectCount || 100; // Estimation par défaut
        const batchSize = parseInt(this.batchSizeSelect?.value || '10');
        const maxConcurrent = parseInt(this.maxConcurrentSelect?.value || '3');
        
        let timePerProspect = 1; // seconde de base par prospect
        
        // Facteurs d'estimation
        if (this.findMissingEmailsCheck?.checked) {
            timePerProspect += 2; // 2s pour recherche email
        }
        
        if (this.refreshLinkedInDataCheck?.checked) {
            timePerProspect += 5; // 5s pour extraction LinkedIn
        }
        
        if (this.updateScoresCheck?.checked) {
            timePerProspect += 0.5; // 0.5s pour calcul score
        }
        
        if (this.cleanDuplicatesCheck?.checked) {
            timePerProspect += 0.2; // 0.2s pour vérification doublon
        }
        
        // Calcul du temps total
        const totalSeconds = (prospectCount * timePerProspect) / maxConcurrent;
        const minutes = Math.ceil(totalSeconds / 60);
        
        let estimationText;
        if (minutes <= 5) {
            estimationText = '3-8 minutes';
        } else if (minutes <= 15) {
            estimationText = '8-20 minutes';
        } else if (minutes <= 30) {
            estimationText = '20-40 minutes';
        } else {
            estimationText = '40-60+ minutes';
        }
        
        if (this.estimatedTimeSpan) {
            this.estimatedTimeSpan.textContent = estimationText;
        }
    }

    async startUpdate() {
        if (this.isUpdating) return;
        
        const options = this.gatherOptions();
        
        // Validation basique
        if (!this.validateOptions(options)) {
            return;
        }
        
        // Confirmation
        const confirmText = `Démarrer la mise à jour de ${this.prospectCount || 'tous les'} prospects ?\n\n` +
                          `Options sélectionnées:\n` +
                          `• ${options.findMissingEmails ? '✅' : '❌'} Rechercher emails manquants\n` +
                          `• ${options.updateScores ? '✅' : '❌'} Recalculer scores\n` +
                          `• ${options.cleanDuplicates ? '✅' : '❌'} Supprimer doublons\n` +
                          `• ${options.refreshLinkedInData ? '✅' : '❌'} Actualiser données LinkedIn\n\n` +
                          `Estimation: ${this.estimatedTimeSpan?.textContent || '10-30 minutes'}`;
        
        if (!confirm(confirmText)) {
            return;
        }
        
        this.isUpdating = true;
        this.hideModal();
        this.showProgressSection();
        
        try {
            await this.performUpdate(options);
        } catch (error) {
            this.handleUpdateError(error);
        }
    }

    gatherOptions() {
        return {
            findMissingEmails: this.findMissingEmailsCheck?.checked !== false,
            updateScores: this.updateScoresCheck?.checked !== false,
            cleanDuplicates: this.cleanDuplicatesCheck?.checked !== false,
            refreshLinkedInData: this.refreshLinkedInDataCheck?.checked === true,
            batchSize: parseInt(this.batchSizeSelect?.value || '10'),
            maxConcurrent: parseInt(this.maxConcurrentSelect?.value || '3')
        };
    }

    validateOptions(options) {
        if (!options.findMissingEmails && !options.updateScores && 
            !options.cleanDuplicates && !options.refreshLinkedInData) {
            alert('Veuillez sélectionner au moins une option de mise à jour.');
            return false;
        }
        
        if (options.batchSize < 1 || options.batchSize > 50) {
            alert('La taille des lots doit être entre 1 et 50.');
            return false;
        }
        
        if (options.maxConcurrent < 1 || options.maxConcurrent > 10) {
            alert('Le traitement concurrent doit être entre 1 et 10.');
            return false;
        }
        
        return true;
    }

    showProgressSection() {
        this.progressSection.style.display = 'block';
        this.progressSection.scrollIntoView({ behavior: 'smooth' });
        
        // Démarrer le monitoring de progression
        this.startProgressMonitoring();
    }

    hideProgressSection() {
        this.progressSection.style.display = 'none';
        this.stopProgressMonitoring();
    }

    async performUpdate(options) {
        try {
            this.updateProgressText('Démarrage de la mise à jour...');
            
            const response = await fetch('/api/prospects/update-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(options)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.updateProgressText('Mise à jour démarrée avec succès...');
                this.showNotification('Mise à jour démarrée ! Vous recevrez un email une fois terminée.', 'success');
                
                // La mise à jour continue en arrière-plan
                // Le monitoring de progression continuera jusqu'à la fin
                
            } else {
                throw new Error(data.error || 'Erreur lors du démarrage de la mise à jour');
            }
            
        } catch (error) {
            throw error;
        }
    }

    startProgressMonitoring() {
        // Monitoring toutes les 5 secondes
        this.updateInterval = setInterval(async () => {
            await this.checkUpdateStatus();
        }, 5000);
        
        // Vérification immédiate
        this.checkUpdateStatus();
    }

    stopProgressMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    async checkUpdateStatus() {
        try {
            const response = await fetch('/api/prospects/update-all/status');
            const data = await response.json();
            
            if (data.success) {
                const stats = data.data;
                
                this.updateProgressStats(stats);
                
                if (stats.endTime) {
                    // Mise à jour terminée
                    this.handleUpdateComplete(stats);
                } else if (stats.startTime && !stats.endTime) {
                    // En cours
                    this.updateProgressText(`Traitement en cours... (${stats.progress}%)`);
                }
            }
            
        } catch (error) {
            console.error('Error checking update status:', error);
        }
    }

    updateProgressStats(stats) {
        if (this.processedCount) {
            this.processedCount.textContent = stats.updated || 0;
        }
        
        if (this.emailsFoundCount) {
            this.emailsFoundCount.textContent = stats.emailsFound || 0;
        }
        
        if (this.errorsCount) {
            this.errorsCount.textContent = stats.errors || 0;
        }
        
        // Mettre à jour la barre de progression
        const progress = Math.min(100, parseFloat(stats.progress) || 0);
        if (this.progressFill) {
            this.progressFill.style.width = `${progress}%`;
        }
    }

    updateProgressText(text) {
        if (this.progressText) {
            this.progressText.textContent = text;
        }
    }

    handleUpdateComplete(stats) {
        this.isUpdating = false;
        this.stopProgressMonitoring();
        
        const duration = stats.duration ? Math.round(stats.duration / 1000 / 60) : 0;
        
        this.updateProgressText(`✅ Mise à jour terminée ! (${duration} minutes)`);
        this.progressSection.classList.add('success-state');
        
        // Masquer le bouton d'annulation
        if (this.cancelProgressButton) {
            this.cancelProgressButton.style.display = 'none';
        }
        
        // Notification de succès
        const message = `Mise à jour terminée !\n` +
                       `• ${stats.updated || 0} prospects traités\n` +
                       `• ${stats.emailsFound || 0} emails trouvés\n` +
                       `• ${stats.errors || 0} erreurs\n` +
                       `• Durée: ${duration} minutes`;
        
        this.showNotification(message, 'success');
        
        // Masquer automatiquement après 10 secondes
        setTimeout(() => {
            this.hideProgressSection();
            this.progressSection.classList.remove('success-state');
            if (this.cancelProgressButton) {
                this.cancelProgressButton.style.display = 'block';
            }
        }, 10000);
        
        // Recharger les données de la page
        if (typeof loadCRMData === 'function') {
            loadCRMData();
        }
        
        if (typeof updateSystemHealth === 'function') {
            updateSystemHealth();
        }
    }

    handleUpdateError(error) {
        this.isUpdating = false;
        this.stopProgressMonitoring();
        
        this.updateProgressText(`❌ Erreur: ${error.message}`);
        this.progressSection.classList.add('error-state');
        
        this.showNotification(`Erreur lors de la mise à jour: ${error.message}`, 'error');
        
        // Réinitialiser après 5 secondes
        setTimeout(() => {
            this.hideProgressSection();
            this.progressSection.classList.remove('error-state');
        }, 5000);
    }

    async cancelUpdate() {
        if (!this.isUpdating) {
            this.hideProgressSection();
            return;
        }
        
        if (confirm('Voulez-vous vraiment annuler la mise à jour en cours ?')) {
            this.isUpdating = false;
            this.stopProgressMonitoring();
            this.hideProgressSection();
            
            // TODO: Implémenter l'annulation côté serveur si nécessaire
            this.showNotification('Mise à jour annulée', 'warning');
        }
    }

    showNotification(message, type = 'info') {
        // Utiliser la fonction existante de notification si disponible
        if (typeof updateStatus === 'function') {
            const icon = {
                'success': '✅',
                'error': '❌',
                'warning': '⚠️',
                'info': 'ℹ️'
            };
            
            updateStatus(`${icon[type] || 'ℹ️'} ${message}`, type);
        } else {
            // Fallback
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialiser quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.updateAllProspects = new UpdateAllProspects();
});

// Exposer la classe globalement pour d'éventuelles intégrations
window.UpdateAllProspects = UpdateAllProspects;