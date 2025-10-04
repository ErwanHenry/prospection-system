# 🚀 Guide d'utilisation : LinkedIn to CRM

## 🎯 Fonctionnalités disponibles

### 1. **Recherche LinkedIn avec import automatique**
- Recherche de profils LinkedIn par mots-clés
- Sélection multiple de profils
- Import direct dans Google Sheets
- Enrichissement automatique des données

### 2. **CRM Google Sheets intégré**
- Synchronisation en temps réel
- Gestion des statuts (Nouveau, Contacté, Répondu)
- Historique des actions
- Export des données

### 3. **Interface web moderne**
- Dashboard avec statistiques
- Recherche et filtrage
- Import CSV
- Ajout manuel de prospects

## 🔧 Configuration

### Étape 1 : Récupérer le cookie LinkedIn

1. **Connectez-vous à LinkedIn** dans votre navigateur
2. **Ouvrez les outils développeur** (F12)
3. **Allez dans l'onglet Application** (Chrome) ou Stockage (Firefox)
4. **Cookies → linkedin.com**
5. **Cherchez "li_at"**
6. **Copiez la valeur complète**

### Étape 2 : Configurer le système

```bash
# Éditer le fichier .env
cd ~/prospection-system
nano .env

# Remplacer PASTE_YOUR_LI_AT_COOKIE_HERE par votre cookie
LINKEDIN_COOKIE=AQEDAx...votre_cookie_ici...xYZ==
```

## 🚀 Utilisation

### 1. Lancer le système

```bash
cd ~/prospection-system
./start.sh
# ou
npm start
```

### 2. Ouvrir l'interface

http://localhost:3000

### 3. Utiliser la recherche LinkedIn

#### Via l'interface web :
1. Cliquez sur "Recherche LinkedIn"
2. Entrez votre recherche (ex: "CTO startup Paris")
3. Définissez le nombre de résultats (max 20)
4. Cliquez sur "Rechercher"
5. Sélectionnez les profils intéressants
6. Cliquez sur "Importer dans le CRM"

#### Via le script CLI :
```bash
node linkedin-to-crm.js
```

### 4. Exemples de recherches efficaces

- **Par poste** : "CTO startup", "Head of Sales SaaS", "VP Marketing"
- **Par localisation** : "CEO Paris", "Founder Lyon", "Director Nice"
- **Par secteur** : "fintech founder", "AI engineer", "blockchain developer"
- **Combinées** : "Growth Manager B2B Paris", "Product Owner fintech remote"

## 📊 Google Sheets CRM

### Structure des données

| Colonne | Description | Exemple |
|---------|-------------|---------|
| ID | Identifiant unique | 1753713441304 |
| Prénom | Prénom du prospect | Marie |
| Nom | Nom du prospect | Dupont |
| Email | Email (si disponible) | marie@company.com |
| LinkedIn URL | Profil LinkedIn | https://linkedin.com/in/marie-dupont |
| Entreprise | Société actuelle | TechCorp |
| Poste | Position actuelle | CTO |
| Statut | État du prospect | Nouveau |
| Date d'ajout | Date d'import | 2025-07-28 |
| Dernière action | Historique | Importé depuis LinkedIn |
| Notes | Commentaires | Intéressé par notre solution |
| Score | Score de qualification | 8/10 |

### Accès direct au CRM

https://docs.google.com/spreadsheets/d/15fmtSOPTOWrddhMhfLyz4ZiiFih61Op-i9wAzZx_k4c

## 🛡️ Bonnes pratiques

### Limites recommandées
- **50-100 actions par jour** sur LinkedIn
- **Attendre 2-5 secondes** entre chaque action
- **Varier les recherches** pour éviter la détection
- **Ne pas envoyer plus de 20 messages** par jour

### Sécurité
- **Renouveler le cookie** toutes les 2-3 semaines
- **Ne jamais partager** votre cookie li_at
- **Utiliser un VPN** si nécessaire
- **Respecter les CGU** de LinkedIn

## 🔄 Workflow recommandé

1. **Recherche quotidienne**
   - 2-3 recherches ciblées
   - 10-20 profils par recherche
   - Import sélectif dans le CRM

2. **Qualification**
   - Enrichir avec email/téléphone
   - Noter la pertinence (score)
   - Ajouter des notes contextuelles

3. **Outreach**
   - Messages personnalisés
   - Suivi après 3-5 jours
   - Mise à jour des statuts

4. **Analyse**
   - Taux de réponse par type de profil
   - Messages les plus efficaces
   - Optimisation continue

## 🐛 Résolution des problèmes

### Cookie expiré
```
Erreur: Non authentifié sur LinkedIn
```
→ Récupérer un nouveau cookie et le mettre à jour

### Limite de recherche atteinte
```
Erreur: Too many requests
```
→ Attendre 1-2 heures avant de réessayer

### Profils non trouvés
- Vérifier l'orthographe
- Utiliser des termes plus génériques
- Essayer en anglais

## 📈 Métriques à suivre

- **Nombre de prospects importés** par jour/semaine
- **Taux de réponse** aux messages
- **Taux de conversion** prospect → client
- **Temps moyen** de réponse
- **Score moyen** des prospects

## 🚧 Limitations actuelles

- Pas d'accès aux emails directs depuis LinkedIn
- Pas d'envoi automatique de messages LinkedIn
- Cookie à renouveler manuellement
- Maximum 20 résultats par recherche

## 🔮 Évolutions futures

- [ ] Enrichissement automatique des emails
- [ ] Templates de messages avec IA
- [ ] Campagnes de relance automatiques
- [ ] Intégration avec Gmail
- [ ] Analytics avancées
- [ ] Export PDF de rapports

## 💡 Tips avancés

1. **Recherches booléennes**
   - Utilisez AND, OR, NOT
   - Ex: "CTO AND (startup OR scale-up) NOT consulting"

2. **Ciblage par entreprise**
   - Recherchez d'abord l'entreprise
   - Puis les employés clés

3. **Import par lots**
   - Groupez par secteur/poste
   - Facilitez le suivi

4. **Notes structurées**
   - Utilisez des tags (#interested, #budget_ok)
   - Facilitez les filtres futurs

## 📞 Support

En cas de problème :
1. Vérifier les logs : `npm start`
2. Consulter ce guide
3. Vérifier le cookie LinkedIn
4. Redémarrer le serveur

---

**Rappel** : Utilisez cet outil de manière éthique et responsable. 
Respecter la vie privée des prospects est essentiel pour bâtir des relations durables.
