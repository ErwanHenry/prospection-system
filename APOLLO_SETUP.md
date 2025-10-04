# 🚀 Configuration Apollo.io - VRAIS Profils LinkedIn

## 💰 **Plan Gratuit Apollo.io**

Apollo.io offre un **plan gratuit** avec :
- ✅ **10,000 crédits email/mois**
- ✅ **60 exports mobile/mois**  
- ✅ **Accès à 275M+ profils vérifiés**
- ✅ **Recherche par entreprise, poste, localisation**
- ✅ **Emails et téléphones inclus**

## 📋 **Étapes de Configuration**

### 1. **Créer un compte Apollo.io gratuit**
```bash
# Aller sur https://apollo.io
# Cliquer sur "Sign Up"
# Créer un compte gratuit
```

### 2. **Obtenir votre API Key**
```bash
# 1. Se connecter à Apollo.io
# 2. Aller dans Settings > API  
# 3. Cliquer sur "Create API Key"
# 4. Copier la clé générée
```

### 3. **Ajouter la clé à votre .env**
```bash
# Dans le fichier .env, ajouter :
APOLLO_API_KEY=your_apollo_api_key_here
```

### 4. **Configurer le scraper**
```bash
# Dans .env, changer :
LINKEDIN_SCRAPER_TYPE=apollo
```

### 5. **Redémarrer le serveur**
```bash
npm start
```

## 🎯 **Test de l'API**

Une fois configuré, testez avec :
```bash
curl -X POST http://localhost:3000/api/linkedin/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Data Scientist Paris", "limit": 3}'
```

## ✅ **Résultats attendus**

Avec Apollo.io, vous obtiendrez :
- **VRAIS profils LinkedIn** (pas de faux)
- **Emails vérifiés** inclus
- **Numéros de téléphone** 
- **Entreprises réelles**
- **URLs LinkedIn authentiques**

## 📊 **Limites du Plan Gratuit**

- **60 recherches/mois** maximum
- Pas d'export en masse
- Support limité

## 💡 **Upgrade Payant**

Si vous dépassez les limites :
- **Starter** : 49$/mois - 1,000 crédits
- **Basic** : 79$/mois - 3,000 crédits  
- **Professional** : 159$/mois - 6,000 crédits

## 🔧 **Alternative si Apollo ne fonctionne pas**

Si vous ne voulez pas utiliser Apollo.io, d'autres options :

1. **ZoomInfo** - Base de données B2B premium
2. **Sales Navigator** - LinkedIn officiel 
3. **Lusha** - Extension Chrome pour LinkedIn
4. **Hunter.io** - Pour les emails professionnels

---

**Apollo.io reste la meilleure option gratuite pour obtenir de VRAIS profils LinkedIn avec emails vérifiés.**