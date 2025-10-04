/**
 * Graixl Dashboard JavaScript
 * Interface utilisateur pour la prospection intelligente
 */

class GraixlDashboard {
    constructor() {
        // Détection automatique de l'environnement
        this.apiUrl = this.getApiUrl();
        this.metrics = {
            prospectsAnalyzed: 0,
            emailsGenerated: 0,
            emailsSent: 0,
            successRate: 0
        };
        
        this.init();
    }

    getApiUrl() {
        // Si on est sur localhost, utiliser l'API locale
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api/v1';
        }
        // Sinon, utiliser l'URL actuelle (Vercel)
        return `${window.location.protocol}//${window.location.host}/api/v1`;
    }

    init() {
        this.setupEventListeners();
        this.loadMetrics();
        this.startMetricsPolling();
        this.addWelcomeActivity();
    }

    setupEventListeners() {
        // Form submissions
        document.getElementById('prospect-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.analyzeProspect();
        });

        // LinkedIn Import form
        document.getElementById('linkedin-import-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.importLinkedInProspects();
        });

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // ========== API METHODS ==========

    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.apiUrl}${endpoint}`, options);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            this.showNotification('Erreur de connexion à l\'API', 'error');
            return { success: false, error: error.message };
        }
    }

    async loadMetrics() {
        const response = await this.apiCall('/metrics');
        if (response.success) {
            this.updateMetricsDisplay(response.metrics);
        }
    }

    async analyzeProspect() {
        const formData = new FormData(document.getElementById('prospect-form'));
        const prospectData = Object.fromEntries(formData.entries());

        // Validation
        if (!prospectData.email) {
            this.showNotification('Email requis', 'error');
            return;
        }

        this.closeModal('new-prospect-modal');
        this.showLoading('Analyse du prospect en cours...');

        try {
            // Simulation du processus d'analyse avec progression
            await this.simulateAnalysisProgress();

            const response = await this.apiCall('/prospects/analyze', 'POST', prospectData);
            
            this.hideLoading();

            if (response.success) {
                this.showResults(response);
                this.addActivity(`Prospect ${prospectData.email} analysé avec succès`, 'success');
                this.loadMetrics(); // Refresh metrics
            } else {
                this.showNotification(`Erreur: ${response.error}`, 'error');
            }

        } catch (error) {
            this.hideLoading();
            this.showNotification('Erreur lors de l\'analyse', 'error');
        }
    }

    async simulateAnalysisProgress() {
        const steps = [
            { message: 'Initialisation des agents...', progress: 8 },
            { message: 'Product Manager: Validation du profil...', progress: 20 },
            { message: 'Planificateur: Analyse stratégique...', progress: 32 },
            { message: 'Testeur: Validation qualité...', progress: 44 },
            { message: 'Backend: Génération avec Claude Code...', progress: 56 },
            { message: 'Frontend: Optimisation technique...', progress: 68 },
            { message: 'UX-UI Designer: Personnalisation interface...', progress: 80 },
            { message: 'DevOps: Configuration infrastructure...', progress: 92 },
            { message: 'Chef de Projet: Finalisation...', progress: 100 }
        ];

        for (const step of steps) {
            await this.sleep(800);
            this.updateLoadingProgress(step.message, step.progress);
        }
    }

    async importLinkedInProspects() {
        const form = document.getElementById('linkedin-import-form');
        const formData = new FormData(form);
        
        const importData = {
            keywords: formData.get('keywords'),
            titles: formData.get('titles') ? formData.get('titles').split(',').map(t => t.trim()) : [],
            locations: formData.get('locations') ? formData.get('locations').split(',').map(l => l.trim()) : [],
            source: formData.get('source')
        };

        this.showLoading();
        this.updateLoadingProgress('Recherche LinkedIn/Apollo en cours...', 20);

        try {
            await this.simulateImportProgress();
            
            const response = await this.apiCall('/prospects/import', 'POST', importData);
            
            this.hideLoading();
            this.closeModal('linkedin-import-modal');

            if (response.success) {
                this.showImportResults(response);
                this.addActivity(`Import réussi: ${response.prospects.total || response.prospects.length} prospects trouvés`, 'success');
            } else {
                this.showNotification(`Erreur d'import: ${response.error}`, 'error');
            }

        } catch (error) {
            this.hideLoading();
            this.showNotification('Erreur lors de l\'import LinkedIn/Apollo', 'error');
        }
    }

    async simulateImportProgress() {
        const steps = [
            { message: 'Connexion à Apollo.io...', progress: 30 },
            { message: 'Recherche LinkedIn en cours...', progress: 50 },
            { message: 'Enrichissement des données...', progress: 70 },
            { message: 'Validation et nettoyage...', progress: 90 },
            { message: 'Finalisation...', progress: 100 }
        ];

        for (const step of steps) {
            await this.sleep(1000);
            this.updateLoadingProgress(step.message, step.progress);
        }
    }

    showImportResults(importResult) {
        const prospects = importResult.prospects;
        let prospectsArray = [];
        
        // Gérer différents formats de réponse
        if (prospects.apollo) {
            prospectsArray = [...prospects.apollo, ...prospects.linkedin, ...prospects.enriched];
        } else {
            prospectsArray = Array.isArray(prospects) ? prospects : [];
        }

        const resultsHtml = `
            <div class="import-results">
                <h3><i class="fab fa-linkedin"></i> Résultats Import LinkedIn/Apollo</h3>
                <div class="import-stats">
                    <div class="stat-item">
                        <strong>${prospectsArray.length}</strong> prospects trouvés
                    </div>
                    <div class="stat-item">
                        Source: <strong>${importResult.source}</strong>
                    </div>
                    <div class="stat-item">
                        Critères: <strong>${importResult.criteria.keywords}</strong>
                    </div>
                </div>
                
                <div class="prospects-list">
                    ${prospectsArray.map(prospect => `
                        <div class="prospect-item">
                            <div class="prospect-info">
                                <h4>${prospect.name || 'N/A'}</h4>
                                <p><strong>Email:</strong> ${prospect.email || 'N/A'}</p>
                                <p><strong>Titre:</strong> ${prospect.title || 'N/A'}</p>
                                <p><strong>Entreprise:</strong> ${prospect.company || 'N/A'}</p>
                                <p><strong>Source:</strong> <span class="source-badge">${prospect.source}</span></p>
                            </div>
                            <div class="prospect-actions">
                                <button class="btn btn-sm btn-primary" onclick="analyzeImportedProspect('${prospect.email}', '${prospect.name}', '${prospect.company}', '${prospect.title}')">
                                    Analyser
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('results-content').innerHTML = resultsHtml;
        this.openModal('results-modal');
    }

    // ========== UI METHODS ==========

    updateMetricsDisplay(metrics) {
        document.getElementById('prospects-count').textContent = metrics.prospectsAnalyzed || 0;
        document.getElementById('emails-count').textContent = metrics.emailsGenerated || 0;
        document.getElementById('sent-count').textContent = metrics.emailsSent || 0;
        document.getElementById('success-rate').textContent = `${metrics.successRate || 0}%`;
    }

    showResults(analysisResult) {
        const { prospect, analysis, email, validation } = analysisResult;
        
        const resultsHtml = `
            <div class="results-grid">
                <div class="result-section">
                    <h3><i class="fas fa-user"></i> Profil Prospect</h3>
                    <div class="prospect-info">
                        <p><strong>Nom:</strong> ${prospect.name || 'N/A'}</p>
                        <p><strong>Email:</strong> ${prospect.email}</p>
                        <p><strong>Entreprise:</strong> ${prospect.company || 'N/A'}</p>
                        <p><strong>Poste:</strong> ${prospect.title || 'N/A'}</p>
                        <p><strong>Industrie:</strong> ${prospect.industry || 'N/A'}</p>
                    </div>
                </div>

                <div class="result-section">
                    <h3><i class="fas fa-chart-line"></i> Scores d'Analyse</h3>
                    <div class="score-display">
                        <div class="score-circle ${this.getScoreClass(analysis?.target?.opportunityScore || 0)}">
                            ${analysis?.target?.opportunityScore || 0}%
                        </div>
                        <div>
                            <p><strong>Score d'Opportunité</strong></p>
                            <p>Séniorité: ${analysis?.target?.seniority || 'N/A'}</p>
                            <p>Industrie: ${analysis?.target?.industry || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div class="result-section">
                    <h3><i class="fas fa-check-circle"></i> Validation Qualité</h3>
                    <div class="validation-info">
                        <p><strong>Statut:</strong> ${validation?.isEffective ? '✅ Validé' : '❌ À revoir'}</p>
                        <p><strong>Score Efficacité:</strong> ${validation?.effectivenessScore || 0}%</p>
                        <p><strong>Probabilité Réponse:</strong> ${validation?.responseProbability || 0}%</p>
                    </div>
                </div>

                <div class="result-section">
                    <h3><i class="fas fa-envelope"></i> Email Généré</h3>
                    <div class="email-preview">
                        <div class="email-header">
                            <div class="email-subject">📧 ${email?.subject || 'Sujet non disponible'}</div>
                            <div class="email-meta">
                                À: ${email?.to || prospect.email}<br>
                                De: ${email?.from || 'contact@graixl.com'}<br>
                                IA: Claude Code
                            </div>
                        </div>
                        <div class="email-body">
                            ${email?.body?.substring(0, 500) || 'Contenu non disponible'}${email?.body?.length > 500 ? '...' : ''}
                        </div>
                    </div>
                    <div class="result-actions mt-2">
                        <button class="btn btn-success" onclick="dashboard.sendEmail('${prospect.email}')">
                            <i class="fas fa-paper-plane"></i> Envoyer l'Email
                        </button>
                        <button class="btn btn-secondary" onclick="dashboard.previewFullEmail()">
                            <i class="fas fa-eye"></i> Aperçu Complet
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('results-content').innerHTML = resultsHtml;
        this.openModal('results-modal');

        // Store current analysis for potential sending
        this.currentAnalysis = analysisResult;
    }

    async sendEmail(recipientEmail) {
        if (!this.currentAnalysis) {
            this.showNotification('Aucune analyse disponible', 'error');
            return;
        }

        this.showLoading('Envoi de l\'email en cours...');

        try {
            const response = await this.apiCall('/emails/send', 'POST', {
                email: this.currentAnalysis.email,
                prospect: this.currentAnalysis.prospect
            });

            this.hideLoading();

            if (response.success) {
                this.showNotification('Email envoyé avec succès !', 'success');
                this.addActivity(`Email envoyé à ${recipientEmail}`, 'success');
                this.loadMetrics();
                this.closeModal('results-modal');
            } else {
                this.showNotification(`Erreur d'envoi: ${response.error}`, 'error');
            }

        } catch (error) {
            this.hideLoading();
            this.showNotification('Erreur lors de l\'envoi', 'error');
        }
    }

    // ========== MODAL MANAGEMENT ==========

    openModal(modalId) {
        document.getElementById(modalId).classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = 'auto';
    }

    // ========== LOADING MANAGEMENT ==========

    showLoading(message = 'Chargement...') {
        document.getElementById('loading-message').textContent = message;
        document.getElementById('loading-overlay').classList.remove('hidden');
        this.updateLoadingProgress(message, 0);
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    updateLoadingProgress(message, progress) {
        document.getElementById('loading-message').textContent = message;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `${progress}%`;
    }

    // ========== ACTIVITY FEED ==========

    addActivity(message, type = 'info') {
        const activityFeed = document.getElementById('activity-feed');
        const timestamp = new Date().toLocaleTimeString('fr-FR');
        
        const icons = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle'
        };

        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };

        const activityHtml = `
            <div class="activity-item">
                <div class="activity-icon" style="background-color: ${colors[type]}">
                    <i class="${icons[type]}"></i>
                </div>
                <div class="activity-content">
                    <p>${message}</p>
                    <span class="activity-time">${timestamp}</span>
                </div>
            </div>
        `;

        activityFeed.insertAdjacentHTML('afterbegin', activityHtml);

        // Limiter à 10 activités
        const activities = activityFeed.querySelectorAll('.activity-item');
        if (activities.length > 10) {
            activities[activities.length - 1].remove();
        }
    }

    addWelcomeActivity() {
        this.addActivity('Dashboard Graixl initialisé avec succès', 'success');
        this.addActivity('7 agents IA prêts pour l\'analyse', 'info');
        this.addActivity('Claude Code configuré comme moteur principal', 'info');
    }

    // ========== NOTIFICATIONS ==========

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: '9999',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        });

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // ========== UTILITY METHODS ==========

    getScoreClass(score) {
        if (score >= 80) return 'score-high';
        if (score >= 60) return 'score-medium';
        return 'score-low';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    startMetricsPolling() {
        // Refresh metrics every 30 seconds
        setInterval(() => {
            this.loadMetrics();
        }, 30000);
    }

    // ========== CAMPAIGN METHODS ==========

    selectCampaignType(type) {
        this.closeModal('campaign-modal');
        
        if (type === 'single') {
            this.openModal('new-prospect-modal');
        } else if (type === 'bulk') {
            this.openBulkImportModal();
        }
    }

    openBulkImportModal() {
        // TODO: Implement bulk import functionality
        this.showNotification('Import en masse - Fonctionnalité en développement', 'info');
    }

    showMetrics() {
        // TODO: Implement detailed metrics view
        this.showNotification('Analytics détaillés - Fonctionnalité en développement', 'info');
    }

    previewFullEmail() {
        if (!this.currentAnalysis?.email) {
            this.showNotification('Aucun email à prévisualiser', 'error');
            return;
        }

        const email = this.currentAnalysis.email;
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Aperçu Email - Graixl</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                    .email-container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
                    .email-header { background: #f8f9fa; padding: 20px; border-bottom: 1px solid #ddd; }
                    .email-body { padding: 20px; white-space: pre-line; }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <h2>${email.subject}</h2>
                        <p><strong>À:</strong> ${email.to}</p>
                        <p><strong>De:</strong> ${email.from}</p>
                        <p><strong>Généré par:</strong> Claude Code AI</p>
                    </div>
                    <div class="email-body">
                        ${email.body}
                    </div>
                </div>
            </body>
            </html>
        `);
        previewWindow.document.close();
    }
}

// Global functions for onclick handlers
function openNewProspectModal() {
    dashboard.openModal('new-prospect-modal');
}

function openLinkedInImportModal() {
    dashboard.openModal('linkedin-import-modal');
}

function openCampaignModal() {
    dashboard.openModal('campaign-modal');
}

function openBulkImportModal() {
    dashboard.openBulkImportModal();
}

function showMetrics() {
    dashboard.showMetrics();
}

function closeModal(modalId) {
    dashboard.closeModal(modalId);
}

function selectCampaignType(type) {
    dashboard.selectCampaignType(type);
}

function analyzeImportedProspect(email, name, company, title) {
    // Pré-remplir le formulaire d'analyse avec les données importées
    document.getElementById('prospect-email').value = email || '';
    document.getElementById('prospect-name').value = name || '';
    document.getElementById('prospect-company').value = company || '';
    document.getElementById('prospect-title').value = title || '';
    
    dashboard.closeModal('results-modal');
    dashboard.openModal('new-prospect-modal');
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new GraixlDashboard();
});