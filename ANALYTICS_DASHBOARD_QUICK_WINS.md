# 📊 Analytics Dashboard - Quick Wins Implementation

**Projet**: prospection-system
**Date**: 4 Octobre 2025
**Priorité**: 🟡 P1 - High Impact
**Durée estimée**: 3 jours (Jour 16-18 roadmap)

---

## 🎯 Objectif

Créer dashboard analytics simple mais puissant pour mesurer performance prospection LinkedIn → CRM et optimiser ROI campagnes.

**Besoins Business Identifiés**:
- ❌ Impossible de mesurer ROI actuellement
- ❌ Pas de visibilité performance scrapers
- ❌ Pas de métriques conversion
- ❌ Pas de tracking campagnes

---

## 📊 Métriques Clés (KPIs)

### 1. Acquisition Prospects
- **Prospects scrapés/jour** (total + par source)
- **Taux succès scraping** (success / tentatives)
- **Temps moyen scraping** (par prospect)
- **Coût par prospect** (API costs / prospects)

### 2. Conversion Pipeline
- **Prospects → Emails trouvés** (taux découverte email)
- **Emails envoyés** (total + par campagne)
- **Taux ouverture** (opens / sent)
- **Taux clic** (clicks / opens)
- **Taux réponse** (replies / sent)

### 3. Performance Campagnes
- **ROI campagne** ((revenus - coûts) / coûts × 100)
- **Meilleure performing campagne**
- **Taux conversion final** (deals / prospects)
- **Revenu généré**

### 4. Performance Système
- **Uptime scrapers** (%)
- **Erreurs/warnings** (count)
- **API rate limits** (utilisé / limite)

---

## 🚀 Quick Wins (MVP Dashboard)

### Phase 1: Data Collection (Jour 16 - 6h)

#### 1.1 Créer Schema Tracking

**Nouvelle table `analytics_events`**:
```javascript
// backend/models/AnalyticsEvent.js
class AnalyticsEvent {
  constructor(db) {
    this.db = db; // Google Sheets ou SQLite local
  }

  async track(event) {
    return this.db.append({
      timestamp: new Date().toISOString(),
      event_type: event.type,
      event_data: JSON.stringify(event.data),
      campaign_id: event.campaignId,
      prospect_id: event.prospectId,
      user_id: event.userId
    });
  }

  async getStats(filters = {}) {
    // Agrégation stats
    return this.db.query(filters);
  }
}
```

#### 1.2 Instrumenter Code Existant

**Ajouter tracking dans scraper**:
```javascript
// backend/services/linkedinApollo.js
const analytics = require('./analyticsService');

async function searchProspects(query, limit) {
  const startTime = Date.now();

  try {
    const results = await apollo.search(query, limit);

    // Track success
    await analytics.track({
      type: 'PROSPECTS_SCRAPED',
      data: {
        source: 'apollo',
        count: results.length,
        duration_ms: Date.now() - startTime,
        query
      }
    });

    return results;

  } catch (error) {
    // Track failure
    await analytics.track({
      type: 'SCRAPING_ERROR',
      data: {
        source: 'apollo',
        error: error.message,
        query
      }
    });

    throw error;
  }
}
```

**Tracking Email Discovery**:
```javascript
// backend/services/emailFinderService.js
async function findEmail(prospect) {
  const result = await hunter.findEmail(prospect.email);

  await analytics.track({
    type: 'EMAIL_DISCOVERED',
    data: {
      prospect_id: prospect.id,
      found: !!result,
      source: result?.source
    }
  });

  return result;
}
```

**Tracking Email Sent**:
```javascript
// backend/services/emailAutomation.js
async function sendEmail(prospect, template) {
  await gmail.send(prospect.email, template);

  await analytics.track({
    type: 'EMAIL_SENT',
    data: {
      prospect_id: prospect.id,
      campaign_id: template.campaignId,
      template_id: template.id
    }
  });
}
```

---

### Phase 2: Dashboard API (Jour 17 - 6h)

#### 2.1 Créer API Endpoints

**GET /api/analytics/summary**
```javascript
// api/analytics/summary.js
const analyticsService = require('../backend/services/analyticsService');

module.exports = async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    const summary = await analyticsService.getSummary(period);

    res.json({
      period,
      data: {
        prospects: {
          total: summary.prospectsScraped,
          perDay: summary.prospectsPerDay,
          successRate: summary.scrapingSuccessRate
        },
        emails: {
          discovered: summary.emailsDiscovered,
          discoveryRate: summary.emailDiscoveryRate,
          sent: summary.emailsSent,
          openRate: summary.emailOpenRate,
          replyRate: summary.emailReplyRate
        },
        campaigns: summary.topCampaigns.map(c => ({
          id: c.id,
          name: c.name,
          sent: c.emailsSent,
          opens: c.opens,
          replies: c.replies,
          roi: c.roi
        })),
        system: {
          uptime: summary.systemUptime,
          errors: summary.errorCount,
          warnings: summary.warningCount
        }
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**GET /api/analytics/timeseries**
```javascript
// api/analytics/timeseries.js
module.exports = async (req, res) => {
  const { metric = 'prospects', period = '30d', granularity = 'day' } = req.query;

  const data = await analyticsService.getTimeseries({
    metric,
    period,
    granularity
  });

  res.json({
    metric,
    period,
    data: data.map(point => ({
      timestamp: point.timestamp,
      value: point.value
    }))
  });
};
```

**GET /api/analytics/campaigns/:campaignId**
```javascript
// api/analytics/campaigns/[campaignId].js
module.exports = async (req, res) => {
  const { campaignId } = req.params;

  const stats = await analyticsService.getCampaignStats(campaignId);

  res.json({
    campaignId,
    stats: {
      prospects: stats.totalProspects,
      emails_sent: stats.emailsSent,
      opens: stats.opens,
      clicks: stats.clicks,
      replies: stats.replies,
      conversions: stats.conversions,
      revenue: stats.revenue,
      roi: ((stats.revenue - stats.cost) / stats.cost * 100).toFixed(2)
    },
    timeline: stats.timeline
  });
};
```

---

### Phase 3: Dashboard UI (Jour 18 - 6h)

#### 3.1 Dashboard Layout

**Simple HTML + Chart.js** (pas besoin React pour MVP):

```html
<!-- frontend/dashboard.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Prospection Analytics Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f7fa;
      padding: 20px;
    }
    .header {
      background: white;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      margin: 8px 0;
    }
    .stat-label {
      color: #64748b;
      font-size: 14px;
    }
    .chart-container {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Prospection Analytics Dashboard</h1>
    <p style="color: #64748b; margin-top: 8px;">
      Last updated: <span id="last-update"></span>
    </p>
  </div>

  <!-- KPI Cards -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Prospects Scrapés (7j)</div>
      <div class="stat-value" id="prospects-total">-</div>
      <div style="color: #10b981; font-size: 14px; margin-top: 4px;">
        ↗ <span id="prospects-change">-</span>% vs semaine précédente
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Taux Découverte Email</div>
      <div class="stat-value" id="email-discovery-rate">-</div>
      <div style="color: #64748b; font-size: 14px; margin-top: 4px;">
        <span id="emails-found">-</span> emails trouvés
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Taux Ouverture Emails</div>
      <div class="stat-value" id="open-rate">-</div>
      <div style="color: #64748b; font-size: 14px; margin-top: 4px;">
        <span id="emails-sent">-</span> emails envoyés
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Taux Réponse</div>
      <div class="stat-value" id="reply-rate">-</div>
      <div style="color: #64748b; font-size: 14px; margin-top: 4px;">
        <span id="replies">-</span> réponses reçues
      </div>
    </div>
  </div>

  <!-- Charts -->
  <div class="chart-container">
    <h3>Prospects Scrapés - 30 derniers jours</h3>
    <canvas id="prospects-chart" height="80"></canvas>
  </div>

  <div class="chart-container">
    <h3>Performance Emails - 30 derniers jours</h3>
    <canvas id="emails-chart" height="80"></canvas>
  </div>

  <div class="chart-container">
    <h3>Top 5 Campagnes (ROI)</h3>
    <canvas id="campaigns-chart" height="100"></canvas>
  </div>

  <script src="dashboard.js"></script>
</body>
</html>
```

#### 3.2 Dashboard JavaScript

```javascript
// frontend/dashboard.js
class Dashboard {
  constructor() {
    this.charts = {};
    this.init();
  }

  async init() {
    await this.loadData();
    this.createCharts();
    this.startAutoRefresh();
  }

  async loadData() {
    try {
      const response = await fetch('/api/analytics/summary?period=7d');
      const data = await response.json();

      this.updateKPIs(data.data);
      this.data = data.data;

    } catch (error) {
      console.error('Failed to load analytics', error);
    }
  }

  updateKPIs(data) {
    document.getElementById('prospects-total').textContent =
      data.prospects.total.toLocaleString();

    document.getElementById('email-discovery-rate').textContent =
      (data.emails.discoveryRate * 100).toFixed(1) + '%';

    document.getElementById('open-rate').textContent =
      (data.emails.openRate * 100).toFixed(1) + '%';

    document.getElementById('reply-rate').textContent =
      (data.emails.replyRate * 100).toFixed(1) + '%';

    document.getElementById('emails-found').textContent =
      data.emails.discovered.toLocaleString();

    document.getElementById('emails-sent').textContent =
      data.emails.sent.toLocaleString();

    document.getElementById('replies').textContent =
      (data.emails.sent * data.emails.replyRate).toFixed(0);

    document.getElementById('last-update').textContent =
      new Date().toLocaleString('fr-FR');
  }

  async createCharts() {
    await this.createProspectsChart();
    await this.createEmailsChart();
    await this.createCampaignsChart();
  }

  async createProspectsChart() {
    const response = await fetch('/api/analytics/timeseries?metric=prospects&period=30d');
    const { data } = await response.json();

    const ctx = document.getElementById('prospects-chart').getContext('2d');
    this.charts.prospects = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => new Date(d.timestamp).toLocaleDateString('fr-FR')),
        datasets: [{
          label: 'Prospects scrapés',
          data: data.map(d => d.value),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  async createEmailsChart() {
    const response = await fetch('/api/analytics/timeseries?metric=emails&period=30d');
    const { data } = await response.json();

    const ctx = document.getElementById('emails-chart').getContext('2d');
    this.charts.emails = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => new Date(d.timestamp).toLocaleDateString('fr-FR')),
        datasets: [
          {
            label: 'Envoyés',
            data: data.map(d => d.sent),
            backgroundColor: '#3b82f6'
          },
          {
            label: 'Ouverts',
            data: data.map(d => d.opens),
            backgroundColor: '#10b981'
          },
          {
            label: 'Réponses',
            data: data.map(d => d.replies),
            backgroundColor: '#f59e0b'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  async createCampaignsChart() {
    const campaigns = this.data.campaigns;

    const ctx = document.getElementById('campaigns-chart').getContext('2d');
    this.charts.campaigns = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
        labels: campaigns.map(c => c.name),
        datasets: [{
          label: 'ROI (%)',
          data: campaigns.map(c => c.roi),
          backgroundColor: campaigns.map(c =>
            c.roi > 100 ? '#10b981' : c.roi > 0 ? '#f59e0b' : '#ef4444'
          )
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  startAutoRefresh() {
    setInterval(() => {
      this.loadData();
    }, 60000); // Refresh every minute
  }
}

// Initialize dashboard
new Dashboard();
```

---

## 📦 Implémentation Rapide

### Jour 16 (6h): Data Collection

**Matin (3h)**:
```bash
cd ~/prospection-system

# Créer analytics service
touch backend/services/analyticsService.js

# Créer modèles
touch backend/models/AnalyticsEvent.js

# Installer dépendances si nécessaire
npm install date-fns lodash
```

**Après-midi (3h)**:
- Instrumenter code (scraper, email finder, email sender)
- Tests tracking events
- Vérifier data collection Google Sheets

---

### Jour 17 (6h): API Endpoints

**Matin (3h)**:
```bash
# Créer API endpoints
mkdir -p api/analytics
touch api/analytics/summary.js
touch api/analytics/timeseries.js
touch api/analytics/campaigns/[campaignId].js
```

**Après-midi (3h)**:
- Implémenter agrégations
- Tests endpoints
- Documentation API

---

### Jour 18 (6h): Dashboard UI

**Matin (3h)**:
```bash
# Créer dashboard
touch frontend/dashboard.html
touch frontend/dashboard.js
touch frontend/dashboard.css
```

**Après-midi (3h)**:
- Intégrer Chart.js
- Tests affichage
- Polish UI/UX

---

## 🎯 Success Metrics

### MVP Dashboard (Fin Jour 18)
- [ ] ✅ 4 KPIs affichés (prospects, emails, opens, replies)
- [ ] ✅ 3 graphiques (prospects, emails, campagnes)
- [ ] ✅ Auto-refresh 1 min
- [ ] ✅ Responsive mobile

### Adoption
- [ ] Dashboard consulté quotidiennement
- [ ] Décisions basées sur métriques
- [ ] ROI campagnes optimisé +20%

---

## 🚀 Quick Wins Supplémentaires (Post-MVP)

### Semaine suivante (optionnel)
1. **Export rapports CSV/PDF**
2. **Alertes email** (ex: taux ouverture < 15%)
3. **A/B testing framework** (comparer templates)
4. **Cohort analysis** (performance par date scraping)
5. **Predictive analytics** (ML prédiction conversion)

---

## 📚 Ressources

### Librairies Recommandées
- **Chart.js**: https://www.chartjs.org/
- **date-fns**: Manipulation dates
- **lodash**: Agrégations data

### Inspiration Dashboards
- **Mixpanel**: Analytics design patterns
- **Google Analytics**: KPI organization
- **HubSpot**: Sales pipeline metrics

---

**Date implémentation**: Jour 16-18 (19-21 Octobre 2025)
**Effort total**: 18h (3 jours)
**Impact Business**: HIGH - Visibilité performance + Optimisation ROI

**📊 QUICK WINS ANALYTICS - MESURER POUR OPTIMISER!**
