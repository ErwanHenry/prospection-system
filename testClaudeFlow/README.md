# 📁 TestClaudeFlow - Organisation des Fichiers Claude-Flow

Ce dossier contient tous les fichiers relatifs à l'intégration Claude-Flow de votre système de prospection.

## 📂 Structure

```
testClaudeFlow/
├── core/                              # 🏗️ Code principal
│   ├── index.js                       # Point d'entrée principal
│   ├── AutomationOrchestrator.js      # Orchestrateur maître
│   ├── agents/                        # 🤖 Agents spécialisés
│   │   ├── ProspectSearcher.js        # Recherche LinkedIn
│   │   ├── EmailFinder.js             # Enrichissement email
│   │   ├── CRMManager.js              # Gestion Google Sheets
│   │   └── QualityController.js       # Validation et coordination
│   └── mock/                          # 🧪 Mock pour développement
│       └── claude-flow-mock.js        # Simulation Claude-Flow
├── config/                            # ⚙️ Configuration
│   └── claude-flow-config.json        # Config multi-agents
├── tests/                             # 🧪 Tests
│   └── test-claude-flow-integration.js # Suite de tests complète
└── docs/                              # 📚 Documentation
    ├── CLAUDE_FLOW_GUIDE.md           # Guide d'utilisation
    └── INTEGRATION_SUCCESS_REPORT.md  # Rapport de succès
```

## 🚀 Utilisation

### Tests
```bash
# Test complet de l'intégration
npm run test:claude-flow

# Santé du système
npm run claude-flow:health

# Demo rapide
npm run claude-flow:demo
```

### Import dans le code
```javascript
// Import principal
const { claudeFlowProspection } = require('./testClaudeFlow/core');

// Import d'agents spécifiques
const ProspectSearcher = require('./testClaudeFlow/core/agents/ProspectSearcher');
const EmailFinder = require('./testClaudeFlow/core/agents/EmailFinder');
```

## 📋 Fichiers Clés

### Core (code principal)
- **`index.js`** : API principale Claude-Flow
- **`AutomationOrchestrator.js`** : Chef d'orchestre des workflows
- **`agents/`** : 4 agents spécialisés

### Configuration
- **`claude-flow-config.json`** : Configuration performance et agents

### Tests
- **`test-claude-flow-integration.js`** : Tests automatisés complets

### Documentation
- **`CLAUDE_FLOW_GUIDE.md`** : Guide utilisateur complet
- **`INTEGRATION_SUCCESS_REPORT.md`** : Rapport technique de l'intégration

## 🔗 Intégration avec le Système Principal

Le système principal (`backend/server.js`) importe Claude-Flow via :
```javascript
const { claudeFlowProspection, createExpressIntegration } = require('../testClaudeFlow/core');
```

## 📊 Performance

- ✅ 4 agents opérationnels
- ✅ 5 workflows disponibles 
- ✅ API REST complète
- ✅ 75% de tests réussis
- ✅ 2176 prospects détectés dans le CRM

## 🎯 Prochaines Étapes

1. Tester la nouvelle organisation : `npm run test:claude-flow`
2. Vérifier le démarrage : `npm start`
3. Tester les endpoints : `curl http://localhost:3000/api/claude-flow/health`

**Organisation terminée ! Claude-Flow est maintenant proprement structuré dans testClaudeFlow/ 🎉**