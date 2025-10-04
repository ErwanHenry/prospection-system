# 🚀 Guide de Production Graixl

## Déploiement et Utilisation en Production

Ce guide te permet de déployer et utiliser Graixl en production avec toutes les fonctionnalités avancées.

## 📋 Table des Matières

1. [Configuration Rapide](#configuration-rapide)
2. [Déploiement Docker](#déploiement-docker)
3. [Interface Web](#interface-web)
4. [API REST](#api-rest)
5. [Utilisation Quotidienne](#utilisation-quotidienne)
6. [Monitoring](#monitoring)
7. [Maintenance](#maintenance)

## 🛠️ Configuration Rapide

### 1. Variables d'Environnement

Copie et configure le fichier `.env.production` :

```bash
cp .env.production .env.local
```

**Variables essentielles à configurer :**

```bash
# Email (obligatoire pour envoi réel)
SMTP_HOST=smtp.gmail.com
SMTP_USER=ton-email@gmail.com
SMTP_PASS=ton-mot-de-passe-app

# Claude Code API (recommandé)
CLAUDE_API_KEY=ton-cle-claude

# Sécurité
JWT_SECRET=ton-secret-tres-securise

# Domaines (si déploiement web)
ACME_EMAIL=ton-email@domaine.com
```

### 2. Installation Rapide

```bash
# Cloner le projet
git clone https://github.com/ton-repo/graixl-prospection
cd graixl-prospection

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

## 🐳 Déploiement Docker

### 1. Déploiement Local

```bash
# Construire et démarrer tous les services
docker-compose -f docker-compose.production.yml up -d

# Vérifier le statut
docker-compose -f docker-compose.production.yml ps

# Voir les logs
docker-compose -f docker-compose.production.yml logs -f graixl-app
```

### 2. Déploiement Serveur

```bash
# Sur ton serveur de production
git clone https://github.com/ton-repo/graixl-prospection
cd graixl-prospection

# Configurer les variables d'environnement
cp .env.production .env

# Modifier .env avec tes vraies valeurs
nano .env

# Démarrer en production
docker-compose -f docker-compose.production.yml up -d

# Accès web
# https://graixl.tondomaine.com (application)
# https://dashboard.tondomaine.com (monitoring)
```

## 🌐 Interface Web

### 1. Accès Dashboard

```
URL: http://localhost:3000 (local) ou https://graixl.tondomaine.com (production)
```

### 2. Utilisation Interface

**Analyser un Prospect :**
1. Cliquer sur "Nouveau Prospect"
2. Remplir email (obligatoire) + infos optionnelles
3. Cliquer "Analyser avec IA"
4. Attendre analyse des 7 agents (30-60 secondes)
5. Consulter résultats + email généré
6. Envoyer directement si satisfait

**Lancer une Campagne :**
1. Cliquer "Lancer Campagne"
2. Choisir "Prospect Unique" ou "Campagne de Masse"
3. Suivre le processus guidé

**Métriques en Temps Réel :**
- Prospects analysés
- Emails générés
- Emails envoyés
- Taux de succès

## 🔌 API REST

### 1. Endpoints Principaux

**Base URL :** `http://localhost:3000/api/v1` (local) ou `https://graixl.tondomaine.com/api/v1` (production)

### 2. Analyser un Prospect

```bash
curl -X POST http://localhost:3000/api/v1/prospects/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prospect@entreprise.com",
    "name": "Jean Dupont",
    "company": "TechCorp",
    "title": "CEO",
    "industry": "tech"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "prospect": {...},
  "analysis": {
    "target": {
      "opportunityScore": 85,
      "industry": "tech",
      "seniority": "senior"
    }
  },
  "email": {
    "subject": "Jean Dupont, optimisez votre prospection avec Graixl",
    "body": "Bonjour Jean Dupont, ..."
  },
  "readyToSend": true
}
```

### 3. Envoyer un Email

```bash
curl -X POST http://localhost:3000/api/v1/emails/send \
  -H "Content-Type: application/json" \
  -d '{
    "email": {
      "to": "prospect@entreprise.com",
      "subject": "Sujet personnalisé",
      "body": "Contenu de l email..."
    },
    "prospect": {
      "email": "prospect@entreprise.com",
      "name": "Jean Dupont"
    }
  }'
```

### 4. Campagne de Masse

```bash
curl -X POST http://localhost:3000/api/v1/campaigns/launch \
  -H "Content-Type: application/json" \
  -d '{
    "campaignName": "Campagne Q1 2024",
    "prospects": [
      {
        "email": "prospect1@entreprise.com",
        "name": "Prospect 1",
        "company": "Corp1"
      },
      {
        "email": "prospect2@entreprise.com", 
        "name": "Prospect 2",
        "company": "Corp2"
      }
    ]
  }'
```

## 📊 Utilisation Quotidienne

### 1. Workflow Type

**Prospection Individual :**
1. **Input** : Email + infos prospect
2. **Analyse** : 7 agents IA (30-60s)
3. **Validation** : Score qualité + efficacité
4. **Email** : Généré par Claude Code
5. **Envoi** : Validation finale + envoi
6. **Tracking** : Métriques mises à jour

**Campagne de Masse :**
1. **Import** : Liste CSV ou API
2. **Traitement** : Analyse en parallèle
3. **Génération** : Emails personnalisés
4. **Validation** : Tests qualité automatiques
5. **Envoi** : Batch intelligent
6. **Reporting** : Analytics complets

### 2. Bonnes Pratiques

**Qualité des Données :**
- Email obligatoire et valide
- Nom et entreprise recommandés
- Titre/poste améliore la personnalisation
- Industrie optimise l'approche

**Timing d'Envoi :**
- Mardi-Jeudi : meilleurs jours
- 9h-11h et 14h-16h : créneaux optimaux
- Éviter lundi matin et vendredi après-midi
- Adapter selon le fuseau horaire

**Suivi des Résultats :**
- Surveiller taux d'ouverture (objectif > 25%)
- Optimiser selon taux de réponse (objectif > 15%)
- Ajuster selon retours prospects
- A/B tester les approches

## 📈 Monitoring

### 1. Métriques Applicatives

**Dashboard Intégré :**
```
URL: http://localhost:3000/api/v1/metrics
```

**Métriques Clés :**
- Prospects analysés / jour
- Emails générés / jour  
- Emails envoyés / jour
- Taux de succès global
- Performance des agents IA
- Temps de traitement moyen

### 2. Monitoring Infrastructure

**Grafana Dashboard :**
```
URL: https://dashboard.tondomaine.com (production)
Login: admin / [GRAFANA_PASSWORD]
```

**Métriques Surveillées :**
- CPU / RAM / Disque
- Latence des APIs
- Santé des conteneurs
- Logs d'erreurs
- Backup automatique

### 3. Alertes

**Prometheus Alerts :**
- API down > 5 minutes
- Taux d'erreur > 5%
- Mémoire > 80%
- Disque > 90%
- Email service down

## 🔧 Maintenance

### 1. Backup Automatique

```bash
# Backup manuel de la base de données
docker-compose -f docker-compose.production.yml run --rm graixl-backup

# Backup automatique (cron)
0 2 * * * cd /path/to/graixl && docker-compose -f docker-compose.production.yml run --rm graixl-backup
```

### 2. Mise à Jour

```bash
# Arrêter les services
docker-compose -f docker-compose.production.yml down

# Mettre à jour le code
git pull origin main

# Rebuilder et redémarrer
docker-compose -f docker-compose.production.yml up -d --build

# Vérifier la santé
docker-compose -f docker-compose.production.yml ps
```

### 3. Logs et Debug

```bash
# Logs application
docker-compose -f docker-compose.production.yml logs -f graixl-app

# Logs base de données
docker-compose -f docker-compose.production.yml logs -f graixl-mongo

# Entrer dans le conteneur
docker exec -it graixl-app /bin/sh

# Vérifier santé API
curl http://localhost:3000/health
```

### 4. Scaling

**Scaling Horizontal :**
```bash
# Augmenter les réplicas de l'app
docker-compose -f docker-compose.production.yml up -d --scale graixl-app=3
```

**Optimisation Performance :**
- Ajuster les limits de ressources Docker
- Configurer le cache Redis
- Optimiser les requêtes MongoDB
- Monitoring continu des performances

## 🚨 Troubleshooting

### 1. Problèmes Courants

**API ne répond pas :**
```bash
# Vérifier status conteneurs
docker-compose ps

# Redémarrer application
docker-compose restart graixl-app

# Vérifier logs
docker-compose logs graixl-app
```

**Emails non envoyés :**
1. Vérifier configuration SMTP dans .env
2. Tester avec un email simple
3. Consulter logs d'envoi
4. Vérifier quotas fournisseur email

**Base de données inaccessible :**
```bash
# Vérifier MongoDB
docker-compose logs graixl-mongo

# Se connecter à MongoDB
docker exec -it graixl-mongo mongosh
```

### 2. Support

**Logs Importants :**
- Application : `/app/logs/`
- MongoDB : logs Docker
- Nginx/Traefik : logs Docker
- Système : `/var/log/`

**Contacts :**
- Documentation : Ce guide
- Issues : GitHub repository
- Email : support@graixl.com

## 🎯 Résultats Attendus

Avec une configuration optimale, tu peux t'attendre à :

- **Analyse** : 1 prospect en 30-60 secondes
- **Qualité** : Score > 90% avec validation PM
- **Personnalisation** : Adapté au persona et industrie
- **Taux de réponse** : 15-25% (vs 2-5% standard)
- **Gain de temps** : 80% vs prospection manuelle
- **Scalabilité** : 100+ prospects/heure

---

🚀 **Graixl est maintenant prêt pour optimiser ta prospection B2B !**

*Système multi-agents propulsé par Claude Code - La révolution de la prospection intelligente*