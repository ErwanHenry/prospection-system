/**
 * Frontend Developer Agent - Agent spécialisé en développement frontend
 * Capable de créer des interfaces, UX/UI et intégrations frontend
 */

const Agent = require('../Agent');

class FrontendDeveloperAgent extends Agent {
  constructor(config = {}) {
    super({
      id: config.id || 'frontend_dev_' + Date.now(),
      name: config.name || 'Frontend Developer',
      type: 'frontend-developer',
      specialization: 'frontend_development',
      capabilities: [
        'ui_component_development',
        'responsive_design',
        'state_management',
        'api_integration',
        'user_experience_design',
        'real_time_interfaces',
        'data_visualization',
        'form_validation',
        'performance_optimization',
        'accessibility_implementation'
      ],
      config: {
        framework: 'vanilla', // 'react', 'vue', 'angular', 'vanilla'
        styling: 'css', // 'css', 'scss', 'tailwind', 'styled-components'
        stateManagement: 'native', // 'redux', 'vuex', 'native'
        buildTool: 'webpack', // 'webpack', 'vite', 'parcel'
        testingFramework: 'cypress', // 'cypress', 'playwright', 'jest'
        ...config
      }
    });
    
    this.componentTemplates = new Map();
    this.uiPatterns = new Map();
    this.initializeTemplates();
  }

  async processTask(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'create_dashboard':
        return await this.createDashboard(data);
      case 'create_prospect_form':
        return await this.createProspectForm(data);
      case 'create_email_preview':
        return await this.createEmailPreview(data);
      case 'create_analytics_view':
        return await this.createAnalyticsView(data);
      case 'implement_real_time_updates':
        return await this.implementRealTimeUpdates(data);
      case 'optimize_performance':
        return await this.optimizePerformance(data);
      case 'create_mobile_responsive':
        return await this.createMobileResponsive(data);
      case 'implement_accessibility':
        return await this.implementAccessibility(data);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  // ========== CRÉATION D'INTERFACES ==========

  async createDashboard(dashboardData) {
    const { name, features = [], layout = 'grid', theme = 'modern' } = dashboardData;
    
    console.log(`🎨 Frontend Dev crée le dashboard ${name}`);
    
    const dashboard = {
      name,
      features,
      layout,
      theme,
      html: this.generateDashboardHTML(dashboardData),
      css: this.generateDashboardCSS(dashboardData),
      js: this.generateDashboardJS(dashboardData),
      components: this.generateDashboardComponents(features)
    };

    // Mémoriser le dashboard
    this.remember(`dashboard_${name}`, dashboard);
    
    return {
      dashboard,
      files: {
        html: dashboard.html,
        css: dashboard.css,
        js: dashboard.js
      },
      components: dashboard.components,
      nextSteps: this.getDashboardNextSteps(dashboardData)
    };
  }

  generateDashboardHTML(dashboardData) {
    const { name, features } = dashboardData;
    
    let html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Graixl Prospection System</title>
    <link rel="stylesheet" href="dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div id="app">
        <!-- Header -->
        <header class="dashboard-header">
            <div class="header-content">
                <div class="logo">
                    <h1><i class="fas fa-rocket"></i> Graixl</h1>
                </div>
                <nav class="main-nav">
                    <ul>
                        <li><a href="#prospects" class="nav-link active">Prospects</a></li>
                        <li><a href="#campaigns" class="nav-link">Campagnes</a></li>
                        <li><a href="#analytics" class="nav-link">Analytics</a></li>
                        <li><a href="#settings" class="nav-link">Paramètres</a></li>
                    </ul>
                </nav>
                <div class="user-menu">
                    <div class="notifications">
                        <i class="fas fa-bell"></i>
                        <span class="notification-count">3</span>
                    </div>
                    <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="dashboard-main">
            <!-- Sidebar -->
            <aside class="sidebar">
                <div class="sidebar-content">
                    <div class="quick-actions">
                        <h3>Actions Rapides</h3>
                        <button class="btn btn-primary" onclick="openProspectAnalysis()">
                            <i class="fas fa-search"></i> Analyser Prospect
                        </button>
                        <button class="btn btn-secondary" onclick="generateEmail()">
                            <i class="fas fa-envelope"></i> Générer Email
                        </button>
                        <button class="btn btn-success" onclick="startCampaign()">
                            <i class="fas fa-play"></i> Lancer Campagne
                        </button>
                    </div>
                    
                    <div class="recent-activity">
                        <h3>Activité Récente</h3>
                        <div id="activity-feed">
                            <!-- Sera peuplé dynamiquement -->
                        </div>
                    </div>
                </div>
            </aside>

            <!-- Content Area -->
            <div class="content-area">
                ${this.generateFeatureSections(features)}
            </div>
        </main>

        <!-- Modals -->
        <div id="prospect-analysis-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Analyse de Prospect</h2>
                    <span class="close" onclick="closeModal('prospect-analysis-modal')">&times;</span>
                </div>
                <div class="modal-body">
                    ${this.generateProspectAnalysisForm()}
                </div>
            </div>
        </div>

        <!-- Loading Overlay -->
        <div id="loading-overlay" class="loading-overlay hidden">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Traitement en cours...</p>
            </div>
        </div>
    </div>

    <script src="dashboard.js"></script>
</body>
</html>`;
    
    return html;
  }

  generateFeatureSections(features) {
    let sections = '';
    
    features.forEach(feature => {
      switch (feature) {
        case 'prospect_analysis':
          sections += this.generateProspectAnalysisSection();
          break;
        case 'email_campaigns':
          sections += this.generateEmailCampaignsSection();
          break;
        case 'analytics_dashboard':
          sections += this.generateAnalyticsSection();
          break;
        case 'real_time_monitoring':
          sections += this.generateMonitoringSection();
          break;
      }
    });
    
    return sections;
  }

  generateProspectAnalysisSection() {
    return `
        <!-- Prospect Analysis Section -->
        <section id="prospects" class="content-section active">
            <div class="section-header">
                <h2><i class="fas fa-users"></i> Analyse des Prospects</h2>
                <div class="section-actions">
                    <button class="btn btn-primary" onclick="openProspectAnalysis()">
                        <i class="fas fa-plus"></i> Nouveau Prospect
                    </button>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-eye"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="prospects-analyzed">0</h3>
                        <p>Prospects Analysés</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="emails-sent">0</h3>
                        <p>Emails Envoyés</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-reply"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="response-rate">0%</h3>
                        <p>Taux de Réponse</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="meetings-booked">0</h3>
                        <p>RDV Planifiés</p>
                    </div>
                </div>
            </div>
            
            <div class="prospects-table-container">
                <table class="prospects-table">
                    <thead>
                        <tr>
                            <th>Prospect</th>
                            <th>Entreprise</th>
                            <th>Score Opportunité</th>
                            <th>Statut</th>
                            <th>Dernière Action</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="prospects-tbody">
                        <!-- Sera peuplé dynamiquement -->
                    </tbody>
                </table>
            </div>
        </section>`;
  }

  generateDashboardCSS(dashboardData) {
    const { theme } = dashboardData;
    
    return `/* Dashboard CSS - ${theme} Theme */

/* Variables CSS */
:root {
    --primary-color: #3b82f6;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --background-color: #f8fafc;
    --surface-color: #ffffff;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --border-color: #e2e8f0;
    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    --radius: 8px;
}

/* Reset et Base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--background-color);
    color: var(--text-primary);
    line-height: 1.6;
}

/* Layout Principal */
#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* Header */
.dashboard-header {
    background: var(--surface-color);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.logo h1 {
    color: var(--primary-color);
    font-size: 1.5rem;
    font-weight: 700;
}

.main-nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-link {
    text-decoration: none;
    color: var(--text-secondary);
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    transition: all 0.2s;
}

.nav-link:hover,
.nav-link.active {
    color: var(--primary-color);
    background: rgba(59, 130, 246, 0.1);
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.notifications {
    position: relative;
    cursor: pointer;
}

.notification-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--danger-color);
    color: white;
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
}

/* Main Content */
.dashboard-main {
    flex: 1;
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

/* Sidebar */
.sidebar {
    background: var(--surface-color);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    height: fit-content;
    position: sticky;
    top: 100px;
}

.sidebar-content {
    padding: 1.5rem;
}

.quick-actions h3 {
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-size: 1.1rem;
}

.quick-actions .btn {
    width: 100%;
    margin-bottom: 0.75rem;
    justify-content: flex-start;
    gap: 0.5rem;
}

.recent-activity {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
}

/* Content Area */
.content-area {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.content-section {
    background: var(--surface-color);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
}

.content-section.hidden {
    display: none;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border-color);
}

.section-header h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    color: var(--text-primary);
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    padding: 2rem;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}

.stat-icon {
    font-size: 2rem;
    opacity: 0.8;
}

.stat-content h3 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.stat-content p {
    opacity: 0.9;
    font-size: 0.9rem;
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--radius);
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    gap: 0.5rem;
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
    transform: translateY(-1px);
}

.btn-secondary {
    background: var(--secondary-color);
    color: white;
}

.btn-success {
    background: var(--success-color);
    color: white;
}

/* Table */
.prospects-table-container {
    padding: 0 2rem 2rem;
    overflow-x: auto;
}

.prospects-table {
    width: 100%;
    border-collapse: collapse;
}

.prospects-table th,
.prospects-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

.prospects-table th {
    background: var(--background-color);
    font-weight: 600;
    color: var(--text-primary);
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.modal.show {
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: var(--surface-color);
    border-radius: var(--radius);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border-color);
}

.modal-body {
    padding: 2rem;
}

.close {
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
}

/* Loading */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.loading-overlay.hidden {
    display: none;
}

.loading-spinner {
    text-align: center;
    color: var(--primary-color);
}

.loading-spinner i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    .dashboard-main {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
    
    .sidebar {
        position: static;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .header-content {
        padding: 1rem;
    }
    
    .main-nav {
        display: none;
    }
}

/* Utilities */
.hidden {
    display: none !important;
}

.text-center {
    text-align: center;
}

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }`;
  }

  generateDashboardJS(dashboardData) {
    return `// Dashboard JavaScript - Graixl Prospection System

class ProspectionDashboard {
    constructor() {
        this.api = new APIClient();
        this.ws = null;
        this.currentSection = 'prospects';
        this.prospects = [];
        this.campaigns = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeWebSocket();
        this.loadInitialData();
        this.startPolling();
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });
        
        // Fermeture des modals
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });
        
        // Clicks hors modal
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }
    
    initializeWebSocket() {
        const wsUrl = \`ws://\${window.location.host}/ws\`;
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('✅ WebSocket connecté');
            this.showNotification('Connexion temps réel établie', 'success');
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealtimeUpdate(data);
        };
        
        this.ws.onclose = () => {
            console.log('❌ WebSocket déconnecté');
            this.showNotification('Connexion temps réel interrompue', 'warning');
            // Tentative de reconnexion après 5 secondes
            setTimeout(() => this.initializeWebSocket(), 5000);
        };
    }
    
    async loadInitialData() {
        this.showLoading(true);
        
        try {
            // Charger les prospects
            const prospectsResponse = await this.api.get('/api/v1/prospects');
            this.prospects = prospectsResponse.data;
            
            // Charger les statistiques
            const statsResponse = await this.api.get('/api/v1/analytics/stats');
            this.updateStats(statsResponse.data);
            
            // Charger l'activité récente
            const activityResponse = await this.api.get('/api/v1/activity/recent');
            this.updateActivityFeed(activityResponse.data);
            
            // Mettre à jour l'interface
            this.renderProspectsTable();
            
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    showSection(sectionId) {
        // Masquer toutes les sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Désactiver tous les liens de navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        
        // Activer le lien de navigation
        const activeLink = document.querySelector(\`[href="#\${sectionId}"]\`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        this.currentSection = sectionId;
    }
    
    async openProspectAnalysis() {
        const modal = document.getElementById('prospect-analysis-modal');
        modal.classList.add('show');
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }
    
    async analyzeProspect(prospectData) {
        this.showLoading(true);
        
        try {
            const response = await this.api.post('/api/v1/prospects/analyze', prospectData);
            
            if (response.success) {
                this.showNotification('Prospect analysé avec succès', 'success');
                this.prospects.unshift(response.data);
                this.renderProspectsTable();
                this.closeModal('prospect-analysis-modal');
            } else {
                throw new Error(response.error);
            }
            
        } catch (error) {
            console.error('Erreur lors de l\\'analyse:', error);
            this.showNotification('Erreur lors de l\\'analyse du prospect', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    renderProspectsTable() {
        const tbody = document.getElementById('prospects-tbody');
        
        if (!this.prospects || this.prospects.length === 0) {
            tbody.innerHTML = \`
                <tr>
                    <td colspan="6" class="text-center">
                        <p>Aucun prospect analysé pour le moment</p>
                        <button class="btn btn-primary mt-2" onclick="dashboard.openProspectAnalysis()">
                            Analyser votre premier prospect
                        </button>
                    </td>
                </tr>
            \`;
            return;
        }
        
        tbody.innerHTML = this.prospects.map(prospect => \`
            <tr>
                <td>
                    <div class="prospect-info">
                        <strong>\${prospect.name}</strong>
                        <br>
                        <small>\${prospect.email}</small>
                    </div>
                </td>
                <td>\${prospect.company}</td>
                <td>
                    <div class="opportunity-score">
                        <div class="score-badge score-\${this.getScoreClass(prospect.opportunityScore)}">
                            \${prospect.opportunityScore}%
                        </div>
                    </div>
                </td>
                <td>
                    <span class="status-badge status-\${prospect.status}">
                        \${this.getStatusLabel(prospect.status)}
                    </span>
                </td>
                <td>\${this.formatDate(prospect.lastAction)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="dashboard.generateEmail('\${prospect.id}')">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="dashboard.viewDetails('\${prospect.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        \`).join('');
    }
    
    updateStats(stats) {
        document.getElementById('prospects-analyzed').textContent = stats.prospectsAnalyzed || 0;
        document.getElementById('emails-sent').textContent = stats.emailsSent || 0;
        document.getElementById('response-rate').textContent = \`\${stats.responseRate || 0}%\`;
        document.getElementById('meetings-booked').textContent = stats.meetingsBooked || 0;
    }
    
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
    
    showNotification(message, type = 'info') {
        // Créer une notification toast
        const notification = document.createElement('div');
        notification.className = \`notification notification-\${type}\`;
        notification.innerHTML = \`
            <i class="fas fa-\${this.getNotificationIcon(type)}"></i>
            <span>\${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        \`;
        
        // Ajouter au DOM
        document.body.appendChild(notification);
        
        // Supprimer automatiquement après 5 secondes
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
    
    // Utility functions
    getScoreClass(score) {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    }
    
    getStatusLabel(status) {
        const labels = {
            'new': 'Nouveau',
            'analyzed': 'Analysé',
            'contacted': 'Contacté',
            'responded': 'Répondu',
            'meeting': 'RDV Planifié',
            'closed': 'Converti'
        };
        return labels[status] || status;
    }
    
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    }
}

// API Client Helper
class APIClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }
    
    async request(method, url, data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(this.baseURL + url, options);
        return await response.json();
    }
    
    get(url) {
        return this.request('GET', url);
    }
    
    post(url, data) {
        return this.request('POST', url, data);
    }
    
    put(url, data) {
        return this.request('PUT', url, data);
    }
    
    delete(url) {
        return this.request('DELETE', url);
    }
}

// Fonctions globales pour les événements
function openProspectAnalysis() {
    dashboard.openProspectAnalysis();
}

function closeModal(modalId) {
    dashboard.closeModal(modalId);
}

function generateEmail(prospectId) {
    dashboard.generateEmail(prospectId);
}

function startCampaign() {
    dashboard.startCampaign();
}

// Initialisation
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ProspectionDashboard();
});`;
  }

  generateProspectAnalysisForm() {
    return `
        <form id="prospect-analysis-form" onsubmit="handleProspectAnalysis(event)">
            <div class="form-group">
                <label for="prospect-email">Email du prospect *</label>
                <input type="email" id="prospect-email" name="email" required
                       placeholder="erwanhenry@hotmail.com">
            </div>
            
            <div class="form-group">
                <label for="prospect-name">Nom complet</label>
                <input type="text" id="prospect-name" name="name" 
                       placeholder="Erwan Henry">
            </div>
            
            <div class="form-group">
                <label for="prospect-company">Entreprise</label>
                <input type="text" id="prospect-company" name="company" 
                       placeholder="Graixl">
            </div>
            
            <div class="form-group">
                <label for="prospect-title">Titre/Poste</label>
                <input type="text" id="prospect-title" name="title" 
                       placeholder="CEO & Founder">
            </div>
            
            <div class="form-group">
                <label for="prospect-linkedin">URL LinkedIn (optionnel)</label>
                <input type="url" id="prospect-linkedin" name="linkedinUrl" 
                       placeholder="https://linkedin.com/in/erwanhenry">
            </div>
            
            <div class="form-group">
                <label for="analysis-context">Contexte de prospection</label>
                <textarea id="analysis-context" name="context" rows="3"
                          placeholder="Présentation de Graixl - solution d'automatisation de prospection B2B"></textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal('prospect-analysis-modal')">
                    Annuler
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-search"></i> Analyser le Prospect
                </button>
            </div>
        </form>`;
  }

  // ========== MÉTHODES UTILITAIRES ==========

  initializeTemplates() {
    this.componentTemplates.set('form', this.getFormTemplate());
    this.componentTemplates.set('card', this.getCardTemplate());
    this.componentTemplates.set('modal', this.getModalTemplate());
    this.componentTemplates.set('table', this.getTableTemplate());
  }

  getDashboardNextSteps(dashboardData) {
    return [
      'Implémenter les tests d\'interface',
      'Optimiser les performances (lazy loading)',
      'Ajouter l\'accessibilité ARIA',
      'Créer la version mobile responsive'
    ];
  }

  async createProspectForm(formData) {
    console.log(`📝 Frontend Dev crée le formulaire prospect`);
    
    return {
      html: this.generateProspectFormHTML(formData),
      css: this.generateFormCSS(),
      js: this.generateFormJS(),
      validation: this.generateFormValidation()
    };
  }

  async createEmailPreview(emailData) {
    console.log(`👀 Frontend Dev crée la prévisualisation email`);
    
    return {
      html: this.generateEmailPreviewHTML(emailData),
      css: this.generateEmailPreviewCSS(),
      js: this.generateEmailPreviewJS()
    };
  }
}

module.exports = FrontendDeveloperAgent;