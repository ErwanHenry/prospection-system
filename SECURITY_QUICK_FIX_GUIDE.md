# GUIDE DE CORRECTION RAPIDE - SÉCURITÉ REACT ADMIN
## Déploiement d'urgence (24-48h)

**Objectif:** Bloquer l'accès public non autorisé aux backoffices en moins de 48h

---

## ÉTAPE 1: BASIC AUTH (15 minutes)

### business-plan

#### 1.1 Créer le middleware d'authentification

```bash
mkdir -p /Users/erwanhenry/business-plan/api/middleware
```

```javascript
// /Users/erwanhenry/business-plan/api/middleware/basicAuth.js
const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Business Plan Admin"');
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide valid credentials'
    });
  }

  try {
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const [username, password] = credentials.split(':');

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      console.error('⚠️  ADMIN_USERNAME or ADMIN_PASSWORD not configured!');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    if (username === validUsername && password === validPassword) {
      next();
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="Business Plan Admin"');
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password incorrect'
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = basicAuth;
```

#### 1.2 Modifier admin-server.js

```javascript
// /Users/erwanhenry/business-plan/api/admin-server.js
const express = require('express');
const cors = require('cors');
const basicAuth = require('./middleware/basicAuth');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 3004;

// Middleware
app.use(cors({
  origin: [
    'https://admin-gacebemru-erwan-henrys-projects.vercel.app',
    'http://localhost:3005'
  ],
  credentials: true
}));
app.use(express.json());

// Import route handlers
const scenarios = require('./routes/scenarios');

// 🔒 PROTECTION: Appliquer Basic Auth sur toutes les routes API
app.use('/api', basicAuth);

// API Routes
app.use('/api/scenarios', scenarios);

// Health check (non protégé)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'business-plan-api',
    timestamp: new Date().toISOString(),
    auth: 'enabled'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Business Plan API server running on http://localhost:${PORT}`);
  console.log(`🔒 Authentication: ENABLED`);
  console.log(`📊 Admin interface: http://localhost:3005`);
  console.log(`💡 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
```

#### 1.3 Configurer les variables d'environnement

```bash
# /Users/erwanhenry/business-plan/.env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=CHANGE_ME_IMMEDIATELY_IN_PRODUCTION
API_PORT=3004
```

```bash
# Vercel Environment Variables (PRODUCTION)
cd /Users/erwanhenry/business-plan
vercel env add ADMIN_USERNAME
# Valeur: votre_username_fort

vercel env add ADMIN_PASSWORD
# Valeur: un mot de passe fort généré (min 16 caractères)
```

---

### prospection-system

#### 1.4 Créer le middleware (même procédure)

```bash
mkdir -p /Users/erwanhenry/prospection-system/api/middleware
```

```javascript
// /Users/erwanhenry/prospection-system/api/middleware/basicAuth.js
const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Prospection System Admin"');
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide valid credentials'
    });
  }

  try {
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const [username, password] = credentials.split(':');

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      console.error('⚠️  ADMIN_USERNAME or ADMIN_PASSWORD not configured!');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    if (username === validUsername && password === validPassword) {
      next();
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="Prospection System Admin"');
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password incorrect'
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = basicAuth;
```

#### 1.5 Modifier admin-server.js

```javascript
// /Users/erwanhenry/prospection-system/api/admin-server.js
const express = require('express');
const cors = require('cors');
const basicAuth = require('./middleware/basicAuth');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'https://admin-al1xif0qv-erwan-henrys-projects.vercel.app',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json());

// Import route handlers
const campaigns = require('./routes/campaigns');
const prospects = require('./routes/prospects');
const messages = require('./routes/messages');
const activities = require('./routes/activities');

// 🔒 PROTECTION: Appliquer Basic Auth sur toutes les routes API
app.use('/api', basicAuth);

// API Routes
app.use('/api/campaigns', campaigns);
app.use('/api/prospects', prospects);
app.use('/api/messages', messages);
app.use('/api/activities', activities);

// Health check (non protégé)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    auth: 'enabled'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ React Admin API server running on http://localhost:${PORT}`);
  console.log(`🔒 Authentication: ENABLED`);
  console.log(`📊 Admin interface: http://localhost:3001`);
});

module.exports = app;
```

#### 1.6 Configurer les variables

```bash
# Vercel Environment Variables (PRODUCTION)
cd /Users/erwanhenry/prospection-system
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD
```

---

## ÉTAPE 2: REACT ADMIN AUTH PROVIDER (30 minutes)

### business-plan

#### 2.1 Créer l'authProvider

```javascript
// /Users/erwanhenry/business-plan/admin/src/authProvider.js
const authProvider = {
  login: ({ username, password }) => {
    // Encode credentials
    const credentials = btoa(`${username}:${password}`);

    // Store credentials
    localStorage.setItem('auth', credentials);

    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem('auth');
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem('auth')
      ? Promise.resolve()
      : Promise.reject();
  },

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => {
    // Tous les utilisateurs authentifiés ont les mêmes permissions
    return Promise.resolve(['admin']);
  },

  getIdentity: () => {
    const auth = localStorage.getItem('auth');
    if (!auth) return Promise.reject();

    // Decode username
    const credentials = atob(auth);
    const username = credentials.split(':')[0];

    return Promise.resolve({
      id: username,
      fullName: username,
      avatar: null
    });
  }
};

export default authProvider;
```

#### 2.2 Créer le dataProvider avec auth

```javascript
// /Users/erwanhenry/business-plan/admin/src/dataProvider.js
import simpleRestProvider from 'ra-data-simple-rest';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/api';

const baseDataProvider = simpleRestProvider(API_URL);

const dataProvider = {
  ...baseDataProvider,

  // Wrapper pour ajouter l'authentification à chaque requête
  getList: (resource, params) => {
    return addAuthHeader(() => baseDataProvider.getList(resource, params));
  },

  getOne: (resource, params) => {
    return addAuthHeader(() => baseDataProvider.getOne(resource, params));
  },

  getMany: (resource, params) => {
    return addAuthHeader(() => baseDataProvider.getMany(resource, params));
  },

  getManyReference: (resource, params) => {
    return addAuthHeader(() => baseDataProvider.getManyReference(resource, params));
  },

  create: (resource, params) => {
    return addAuthHeader(() => baseDataProvider.create(resource, params));
  },

  update: (resource, params) => {
    return addAuthHeader(() => baseDataProvider.update(resource, params));
  },

  updateMany: (resource, params) => {
    return addAuthHeader(() => baseDataProvider.updateMany(resource, params));
  },

  delete: (resource, params) => {
    return addAuthHeader(() => baseDataProvider.delete(resource, params));
  },

  deleteMany: (resource, params) => {
    return addAuthHeader(() => baseDataProvider.deleteMany(resource, params));
  }
};

// Helper pour ajouter le header d'authentification
function addAuthHeader(fetchCall) {
  const auth = localStorage.getItem('auth');

  if (auth) {
    // Injecter le header d'authentification
    const originalFetch = window.fetch;
    window.fetch = (url, options = {}) => {
      options.headers = {
        ...options.headers,
        'Authorization': `Basic ${auth}`
      };
      return originalFetch(url, options);
    };
  }

  return fetchCall();
}

export default dataProvider;
```

#### 2.3 Mettre à jour Admin.jsx

```javascript
// /Users/erwanhenry/business-plan/admin/src/Admin.jsx
import React from 'react';
import { Admin, Resource } from 'react-admin';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

// Resources
import { ScenarioList } from './resources/scenarios/ScenarioList';
import { ScenarioCreate } from './resources/scenarios/ScenarioCreate';
import { ScenarioEdit } from './resources/scenarios/ScenarioEdit';

// Dashboard
import Dashboard from './dashboard/Dashboard';

// Providers
import dataProvider from './dataProvider';
import authProvider from './authProvider';

const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}  // ← Ajouter cette ligne
    dashboard={Dashboard}
    title="Business Plan ESN"
    requireAuth  // ← Forcer l'authentification
  >
    <Resource
      name="scenarios"
      list={ScenarioList}
      create={ScenarioCreate}
      edit={ScenarioEdit}
      icon={BusinessCenterIcon}
      options={{ label: 'Scénarios' }}
    />
  </Admin>
);

export default App;
```

---

### prospection-system (même procédure)

#### 2.4 authProvider

```javascript
// /Users/erwanhenry/prospection-system/frontend/admin/src/authProvider.js
const authProvider = {
  login: ({ username, password }) => {
    const credentials = btoa(`${username}:${password}`);
    localStorage.setItem('auth', credentials);
    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem('auth');
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem('auth')
      ? Promise.resolve()
      : Promise.reject();
  },

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => Promise.resolve(['admin']),

  getIdentity: () => {
    const auth = localStorage.getItem('auth');
    if (!auth) return Promise.reject();
    const username = atob(auth).split(':')[0];
    return Promise.resolve({
      id: username,
      fullName: username,
      avatar: null
    });
  }
};

export default authProvider;
```

#### 2.5 dataProvider avec auth

```javascript
// /Users/erwanhenry/prospection-system/frontend/admin/src/dataProvider.js
import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'react-admin';

const API_URL = 'http://localhost:3000/api';

// Custom HTTP client avec authentification
const httpClient = (url, options = {}) => {
  const auth = localStorage.getItem('auth');

  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }

  if (auth) {
    options.headers.set('Authorization', `Basic ${auth}`);
  }

  return fetchUtils.fetchJson(url, options);
};

const dataProvider = simpleRestProvider(API_URL, httpClient);

export default dataProvider;
```

#### 2.6 Mettre à jour Admin.jsx

```javascript
// /Users/erwanhenry/prospection-system/frontend/admin/src/Admin.jsx
import { Admin, Resource } from 'react-admin';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import MessageIcon from '@mui/icons-material/Message';

import Dashboard from './dashboard/Dashboard';
import { CampaignList } from './resources/campaigns/CampaignList';
import { CampaignEdit } from './resources/campaigns/CampaignEdit';
import { CampaignCreate } from './resources/campaigns/CampaignCreate';
import { ProspectList } from './resources/prospects/ProspectList';
import { ProspectEdit } from './resources/prospects/ProspectEdit';
import { ProspectKanban } from './resources/prospects/ProspectKanban';
import { MessageList } from './resources/messages/MessageList';
import { MessageEdit } from './resources/messages/MessageEdit';
import { MessageCreate } from './resources/messages/MessageCreate';

import dataProvider from './dataProvider';
import authProvider from './authProvider';

const AdminApp = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}  // ← Ajouter cette ligne
    dashboard={Dashboard}
    requireAuth  // ← Forcer l'authentification
  >
    <Resource
      name="campaigns"
      list={CampaignList}
      edit={CampaignEdit}
      create={CampaignCreate}
      icon={CampaignIcon}
      options={{ label: 'Campagnes' }}
    />
    <Resource
      name="prospects"
      list={ProspectList}
      edit={ProspectEdit}
      icon={PeopleIcon}
      options={{ label: 'Prospects' }}
    />
    <Resource
      name="prospects/kanban"
      list={ProspectKanban}
      options={{ label: 'Pipeline Kanban' }}
    />
    <Resource
      name="messages"
      list={MessageList}
      edit={MessageEdit}
      create={MessageCreate}
      icon={MessageIcon}
      options={{ label: 'Messages' }}
    />
  </Admin>
);

export default AdminApp;
```

---

## ÉTAPE 3: TESTER LOCALEMENT (10 minutes)

### business-plan

```bash
# Terminal 1: API
cd /Users/erwanhenry/business-plan
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=test123
node api/admin-server.js

# Terminal 2: Admin Frontend
cd /Users/erwanhenry/business-plan/admin
npm run dev
```

### prospection-system

```bash
# Terminal 1: API
cd /Users/erwanhenry/prospection-system
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=test123
node api/admin-server.js

# Terminal 2: Admin Frontend
cd /Users/erwanhenry/prospection-system/frontend/admin
npm run dev
```

### Tests

1. **Accès à l'admin** → Doit afficher la page de login
2. **Login avec mauvais credentials** → Doit rejeter
3. **Login avec bons credentials** → Doit accéder au dashboard
4. **Tester API directement:**

```bash
# Sans auth - doit échouer (401)
curl http://localhost:3004/api/scenarios

# Avec auth - doit réussir (200)
curl -u admin:test123 http://localhost:3004/api/scenarios
```

---

## ÉTAPE 4: DÉPLOYER SUR VERCEL (20 minutes)

### 4.1 Configurer les variables d'environnement

```bash
# business-plan
cd /Users/erwanhenry/business-plan
vercel env add ADMIN_USERNAME production
# Entrer: votre_username

vercel env add ADMIN_PASSWORD production
# Entrer: un mot de passe fort (min 16 caractères, lettres+chiffres+symboles)

# Optionnel: même pour preview et development
vercel env add ADMIN_USERNAME preview
vercel env add ADMIN_PASSWORD preview
```

```bash
# prospection-system
cd /Users/erwanhenry/prospection-system
vercel env add ADMIN_USERNAME production
vercel env add ADMIN_PASSWORD production
```

### 4.2 Mettre à jour .env.production frontend

```bash
# /Users/erwanhenry/business-plan/admin/.env.production
VITE_API_URL=https://business-plan-ahefysddy-erwan-henrys-projects.vercel.app/api
```

```bash
# /Users/erwanhenry/prospection-system/frontend/admin/.env.production
VITE_API_URL=https://prospection-system-17iezdksp-erwan-henrys-projects.vercel.app/api
```

### 4.3 Déployer

```bash
# business-plan API
cd /Users/erwanhenry/business-plan
git add .
git commit -m "🔒 Security: Add Basic Auth to admin API"
git push origin main
vercel --prod

# business-plan Admin
cd /Users/erwanhenry/business-plan/admin
git add .
git commit -m "🔒 Security: Add authProvider to React Admin"
git push origin main
vercel --prod
```

```bash
# prospection-system API
cd /Users/erwanhenry/prospection-system
git add .
git commit -m "🔒 Security: Add Basic Auth to admin API"
git push origin main
vercel --prod

# prospection-system Admin
cd /Users/erwanhenry/prospection-system/frontend/admin
git add .
git commit -m "🔒 Security: Add authProvider to React Admin"
git push origin main
vercel --prod
```

### 4.4 Tester en production

```bash
# Test API (doit demander auth)
curl https://business-plan-ahefysddy-erwan-henrys-projects.vercel.app/api/scenarios

# Test avec credentials
curl -u your_username:your_password https://business-plan-ahefysddy-erwan-henrys-projects.vercel.app/api/scenarios
```

**Accès frontend:**
- https://admin-gacebemru-erwan-henrys-projects.vercel.app → Doit demander login
- https://admin-al1xif0qv-erwan-henrys-projects.vercel.app → Doit demander login

---

## ÉTAPE 5: CORS RESTRICTIF (15 minutes)

### 5.1 business-plan

```javascript
// /Users/erwanhenry/business-plan/api/admin-server.js
const cors = require('cors');

const ALLOWED_ORIGINS = [
  'https://admin-gacebemru-erwan-henrys-projects.vercel.app',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3005' : null
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser requêtes sans origin (curl, Postman) UNIQUEMENT en dev
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range'],
  maxAge: 86400
}));
```

### 5.2 prospection-system (même chose)

```javascript
// /Users/erwanhenry/prospection-system/api/admin-server.js
const ALLOWED_ORIGINS = [
  'https://admin-al1xif0qv-erwan-henrys-projects.vercel.app',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : null
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range'],
  maxAge: 86400
}));
```

---

## CHECKLIST DE DÉPLOIEMENT

### ✅ Pre-deployment

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Mot de passe fort généré (min 16 caractères)
- [ ] Code testé localement
- [ ] CORS configuré avec whitelist
- [ ] Health check fonctionne

### ✅ Deployment

- [ ] API backend déployée
- [ ] Admin frontend déployé
- [ ] Variables d'environnement vérifiées

### ✅ Post-deployment

- [ ] Tester login sur production
- [ ] Tester accès API sans auth → 401
- [ ] Tester accès API avec auth → 200
- [ ] Tester CORS depuis origin non autorisée → Reject
- [ ] Vérifier logs Vercel pour erreurs

---

## SURVEILLANCE

### Logs à monitorer

```bash
# Vercel CLI
vercel logs https://business-plan-ahefysddy-erwan-henrys-projects.vercel.app
vercel logs https://prospection-system-17iezdksp-erwan-henrys-projects.vercel.app
```

### Alertes à configurer

1. **Tentatives d'accès non autorisé** (401)
2. **Erreurs CORS** (origin non autorisée)
3. **Requêtes suspectes** (rate limit)

---

## ROLLBACK SI PROBLÈME

```bash
# Si problème en production, rollback immédiat
vercel rollback

# Ou redéployer version précédente
git revert HEAD
git push
vercel --prod
```

---

## PROCHAINES ÉTAPES (Semaine 2)

1. **Migrer vers JWT** (plus sécurisé que Basic Auth)
2. **Implémenter rate limiting**
3. **Ajouter validation Joi/Zod**
4. **Configurer security headers**
5. **Audit trail des actions admin**

---

## SUPPORT

### En cas de problème:

1. **Vérifier les logs Vercel**
2. **Tester en local d'abord**
3. **Vérifier les variables d'environnement**
4. **Check CORS origins**

### Commandes de debug:

```bash
# Vérifier auth localement
curl -v -u admin:password http://localhost:3004/api/scenarios

# Tester CORS
curl -H "Origin: https://malicious-site.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://business-plan-ahefysddy-erwan-henrys-projects.vercel.app/api/scenarios
```

---

**Temps total estimé:** 90 minutes
**Niveau de sécurité après:** 60/100 (vs 28/100 avant)
**Prochaine amélioration:** JWT + Rate Limiting → 85/100
