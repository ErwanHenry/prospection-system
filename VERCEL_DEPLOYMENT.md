# 🚀 Déploiement Vercel - Graixl

## Instructions Rapides de Déploiement

### 1. Prérequis

```bash
# Installer Vercel CLI si pas déjà fait
npm install -g vercel

# Se connecter à Vercel
vercel login
```

### 2. Configuration Locale

```bash
# Copier le fichier d'environnement
cp .env.production.example .env

# Éditer avec tes vraies valeurs (optionnel pour démo)
nano .env
```

### 3. Déploiement

```bash
# Premier déploiement
vercel

# Répondre aux questions :
# ? Set up and deploy "~/prospection-system"? [Y/n] y
# ? Which scope do you want to deploy to? [ton-username]
# ? Link to existing project? [y/N] n  
# ? What's your project's name? graixl-prospection
# ? In which directory is your code located? ./

# Déploiements suivants
vercel --prod
```

### 4. Variables d'Environnement (Optionnel)

```bash
# Ajouter variables sur Vercel dashboard ou CLI
vercel env add CLAUDE_API_KEY
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add JWT_SECRET
```

### 5. Accès Application

Après déploiement, ton application sera disponible à :
- **URL automatique** : `https://graixl-prospection-[hash].vercel.app`
- **Dashboard** : `/dashboard/`
- **API** : `/api/v1/docs`

### 6. Test Rapide

```bash
# Tester l'API
curl https://ton-url.vercel.app/api/health

# Tester prospect analysis
curl -X POST https://ton-url.vercel.app/api/v1/prospects/analyze \
  -H "Content-Type: application/json" \
  -d '{"email":"erwanhenry@hotmail.com","name":"Erwan Henry","company":"Graixl","title":"CEO"}'
```

## 🎯 Fonctionnalités Disponibles

✅ **Dashboard Web Complet**
- Interface moderne et responsive
- Analyse prospects en temps réel
- Métriques et statistiques
- Génération d'emails IA

✅ **API REST Complète**
- 7 agents IA simulés
- Endpoints pour prospects, emails, campagnes
- Documentation intégrée
- Optimisé pour Vercel

✅ **Système Multi-Agents**
- Product Manager (validation)
- Planificateur (stratégie)
- Testeur (qualité)
- Développeurs (backend, frontend, devops)
- Chef de projet (coordination)

## 📊 URLs Importantes

- **Dashboard** : `https://ton-url.vercel.app/`
- **API Docs** : `https://ton-url.vercel.app/api/v1/docs`
- **Health Check** : `https://ton-url.vercel.app/api/health`
- **Metrics** : `https://ton-url.vercel.app/api/v1/metrics`

## 🔧 Personnalisation

1. **Domaine Personnalisé** : Configure dans Vercel dashboard
2. **Analytics** : Ajoute ANALYTICS_ID en variable d'environnement
3. **Email Réel** : Configure SMTP_* pour envoi réel
4. **Claude API** : Ajoute CLAUDE_API_KEY pour IA avancée

---

🚀 **Graixl est maintenant en ligne et prêt à révolutionner ta prospection !**