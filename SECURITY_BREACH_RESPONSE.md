# 🚨 SECURITY BREACH RESPONSE - Git Guardian Alert

**Date:** 2025-10-05
**Severity:** HIGH
**Status:** RESPONDING

---

## 📋 Alert Summary

**Source:** Git Guardian
**File:** `backend/.env.backup`
**Type:** Generic High Entropy Secret
**Repository:** ErwanHenry/prospection-system
**Exposure:** Public on GitHub

---

## 🔓 Compromised Secrets

### 1. Google Cloud Credentials
- **GOOGLE_CLIENT_SECRET:** `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`
- **GOOGLE_CLIENT_ID:** `3414508764-g9k9ka56ibho153qob5l766n8sg1cj1f.apps.googleusercontent.com`
- **GOOGLE_PROJECT_ID:** `graixl-automation`
- **Impact:** Accès Google Sheets API

### 2. LinkedIn Authentication
- **LINKEDIN_COOKIE:** `AQEFAHQBAAAAAA9NtvAAAAGYQRS5w...` (truncated)
- **LINKEDIN_EMAIL:** `erwan@graixl.com`
- **Impact:** Accès compte LinkedIn, scraping non autorisé

### 3. Apollo.io API
- **APOLLO_API_KEY:** `ICPv_X-eejywtBN3cDkZnQ`
- **Impact:** Accès API Apollo.io, consommation crédits

### 4. Gmail App Password
- **GMAIL_USER:** `your-email@gmail.com` (placeholder, probablement pas le vrai)
- **GMAIL_APP_PASSWORD:** `your-app-password` (placeholder)
- **Impact:** Faible (valeurs placeholder)

### 5. Google Sheets
- **GOOGLE_SPREADSHEET_ID:** `15fmtSOPTOWrddhMhfLyz4ZiiFih61Op-i9wAzZx_k4c`
- **Impact:** Exposition données CRM

---

## ✅ Actions Immédiates Prises

### 1. Suppression du Fichier Compromis
```bash
git rm --cached backend/.env.backup
# Status: ✅ FAIT
```

### 2. Renforcement .gitignore
Ajouté patterns stricts pour bloquer TOUS les fichiers .env :
```gitignore
.env
.env.*
*.env
*.env.*
backend/.env
backend/.env.*
**/.env
**/.env.*
```
**Status: ✅ FAIT**

### 3. Vérification Fichiers Trackés
```bash
git ls-files | grep -E "\.env"
# Résultat: Seuls .env.example et .env.production.example (safe)
```
**Status: ✅ VÉRIFIÉ**

---

## 🔴 Actions Critiques Requises (À FAIRE IMMÉDIATEMENT)

### 1. Révoquer Google Cloud Credentials
**Urgence: CRITIQUE**

```bash
# Étapes:
1. Aller sur https://console.cloud.google.com/apis/credentials
2. Projet: graixl-automation
3. Trouver client OAuth avec ID: 3414508764-g9k9ka56ibho153qob5l766n8sg1cj1f
4. SUPPRIMER ou RÉGÉNÉRER les credentials
5. Créer nouvelles credentials
6. Mettre à jour .env local (NE PAS COMMIT)
```

**Impact si non fait:**
- ❌ Attaquant peut accéder au Google Sheets CRM
- ❌ Lecture/modification données prospects
- ❌ Possible exfiltration de données

### 2. Invalider LinkedIn Cookie
**Urgence: CRITIQUE**

```bash
# Étapes:
1. Aller sur https://www.linkedin.com/
2. Se déconnecter de TOUS les appareils
3. Changer le mot de passe LinkedIn
4. Activer 2FA si pas déjà fait
5. Regénérer cookie via processus normal
```

**Impact si non fait:**
- ❌ Accès non autorisé compte LinkedIn
- ❌ Risque de ban pour activité suspecte
- ❌ Possible spam depuis votre compte

### 3. Révoquer Apollo.io API Key
**Urgence: HAUTE**

```bash
# Étapes:
1. Aller sur https://app.apollo.io/settings/integrations/api
2. Révoquer la clé: ICPv_X-eejywtBN3cDkZnQ
3. Générer nouvelle clé
4. Mettre à jour .env local
```

**Impact si non fait:**
- ❌ Consommation de vos crédits Apollo
- ❌ Accès à vos données prospects
- ❌ Possible violation TOS Apollo

### 4. Protéger Google Sheets
**Urgence: MOYENNE**

```bash
# Étapes:
1. Aller sur Google Sheets: 15fmtSOPTOWrddhMhfLyz4ZiiFih61Op-i9wAzZx_k4c
2. Partage → Restreindre accès
3. Activer "Link sharing: Off"
4. Vérifier permissions (seulement vous + service account)
```

**Impact si non fait:**
- ❌ Lecture données CRM publiquement
- ❌ Exposition emails/noms prospects

---

## 🛡️ Actions de Prévention

### 1. Git Hooks Pre-Commit
Créer `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Bloquer commit si fichiers .env détectés
if git diff --cached --name-only | grep -qE "\.env"; then
  echo "❌ ERREUR: Tentative de commit fichier .env détecté!"
  echo "Fichiers bloqués:"
  git diff --cached --name-only | grep -E "\.env"
  exit 1
fi
```

### 2. Git Guardian Integration
- ✅ Déjà activé (a détecté le leak)
- Configurer alerts email
- Activer auto-remediation si possible

### 3. Secrets Management
**Recommandé:** Utiliser un gestionnaire de secrets

**Options:**
- **Vercel Environment Variables** (déjà utilisé) ✅
- **1Password CLI** pour partage équipe
- **AWS Secrets Manager** pour production
- **HashiCorp Vault** pour enterprise

### 4. Documentation Sécurité
Créer `SECURITY.md` avec:
- Policy de gestion secrets
- Procédure incident response
- Contact sécurité

---

## 📊 Timeline de l'Incident

| Heure | Événement |
|-------|-----------|
| ~Unknown | `backend/.env.backup` commité avec secrets |
| 2025-10-05 10:50 | Git Guardian détecte le leak |
| 2025-10-05 10:51 | Alerte reçue par l'utilisateur |
| 2025-10-05 10:52 | Début réponse incident |
| 2025-10-05 10:53 | Suppression fichier de Git (`git rm --cached`) |
| 2025-10-05 10:54 | Renforcement .gitignore |
| 2025-10-05 10:55 | Documentation créée |
| **EN ATTENTE** | Révocation secrets (action utilisateur) |

---

## ✅ Checklist de Résolution

### Fait
- [x] Supprimer `backend/.env.backup` du Git
- [x] Renforcer .gitignore
- [x] Vérifier aucun autre fichier .env tracké
- [x] Documenter l'incident

### À Faire IMMÉDIATEMENT
- [ ] **CRITIQUE:** Révoquer Google Cloud credentials
- [ ] **CRITIQUE:** Invalider LinkedIn cookie
- [ ] **HAUTE:** Révoquer Apollo API key
- [ ] **MOYENNE:** Protéger Google Sheets (permissions)

### À Faire Ensuite
- [ ] Créer git hook pre-commit
- [ ] Configurer Git Guardian auto-remediation
- [ ] Créer SECURITY.md
- [ ] Audit complet autres repos
- [ ] Former équipe sur bonnes pratiques

---

## 🔐 Bonnes Pratiques (Pour Éviter Futurs Leaks)

### 1. JAMAIS Commit de Secrets
```bash
# ❌ MAUVAIS
git add .env
git commit -m "Update config"

# ✅ BON
# 1. Vérifier .gitignore contient .env
# 2. Utiliser .env.example sans valeurs réelles
# 3. Documenter variables dans README
```

### 2. Utiliser .env.example
```bash
# .env.example (SAFE à commiter)
OPENAI_API_KEY=your-key-here
GOOGLE_CLIENT_SECRET=your-secret-here

# .env (JAMAIS commiter)
OPENAI_API_KEY=sk-proj-abc123...
GOOGLE_CLIENT_SECRET=GOCSPX-xyz789...
```

### 3. Rotation Régulière
- API keys: tous les 90 jours
- Passwords: tous les 60 jours
- Tokens: selon expiration

### 4. Least Privilege
- Créer service accounts dédiés
- Permissions minimales requises
- Pas de credentials personnels dans code

---

## 📞 Contacts d'Urgence

**Git Guardian Support:**
- Email: support@gitguardian.com
- Docs: https://docs.gitguardian.com

**Google Cloud Security:**
- Console: https://console.cloud.google.com/iam-admin
- Support: https://cloud.google.com/support

**LinkedIn Security:**
- Help: https://www.linkedin.com/help/linkedin/answer/a1339750

**Apollo.io Support:**
- Email: support@apollo.io
- Docs: https://apolloio.zendesk.com

---

## 📝 Lessons Learned

### Ce qui a mal fonctionné
1. Fichier `.env.backup` créé sans être dans .gitignore
2. Pattern `.env.*` manquant dans .gitignore initial
3. Pas de git hook pre-commit pour bloquer

### Ce qui a bien fonctionné
1. ✅ Git Guardian a détecté rapidement
2. ✅ Vercel env vars isolées (pas compromises)
3. ✅ Réaction rapide (< 5 min)

### Améliorations Futures
1. Git hooks automatiques sur tous les repos
2. Formation équipe sur secrets management
3. Audit trimestriel de sécurité
4. Policy de rotation obligatoire

---

## 🎯 Next Steps

### Immédiat (Aujourd'hui)
1. **RÉVOQUER TOUS LES SECRETS** (30 min)
2. Commit les changements de sécurité
3. Vérifier autres repos

### Court Terme (Cette Semaine)
1. Mettre en place git hooks
2. Créer SECURITY.md
3. Configurer rotation automatique

### Long Terme (Ce Mois)
1. Implémenter HashiCorp Vault ou similaire
2. Former l'équipe
3. Audit sécurité complet

---

**Préparé par:** Claude Code
**Date:** 2025-10-05
**Classification:** SECURITY INCIDENT RESPONSE
**Status:** IN PROGRESS - AWAITING SECRET REVOCATION
