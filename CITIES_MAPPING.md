# 🌍 Mapping Géographique Apollo.io - Toutes les Villes

## 🇫🇷 **VILLES FRANÇAISES SUPPORTÉES**

### Grandes métropoles :
- **Paris** → `Paris, France` + `Île-de-France, France`
- **Lyon** → `Lyon, France` + `Auvergne-Rhône-Alpes, France`
- **Marseille** → `Marseille, France` + `Provence-Alpes-Côte d'Azur, France`
- **Toulouse** → `Toulouse, France` + `Occitanie, France`
- **Nice** → `Nice, France` + `Provence-Alpes-Côte d'Azur, France`
- **Nantes** → `Nantes, France` + `Pays de la Loire, France`
- **Montpellier** → `Montpellier, France` + `Occitanie, France`
- **Strasbourg** → `Strasbourg, France` + `Grand Est, France`
- **Bordeaux** → `Bordeaux, France` + `Nouvelle-Aquitaine, France`
- **Lille** → `Lille, France` + `Hauts-de-France, France`

### Villes moyennes :
- **Rennes** → `Rennes, France` + `Bretagne, France`
- **Reims** → `Reims, France` + `Grand Est, France`
- **Saint-Étienne** → `Saint-Étienne, France` + `Auvergne-Rhône-Alpes, France`
- **Toulon** → `Toulon, France` + `Provence-Alpes-Côte d'Azur, France`
- **Grenoble** → `Grenoble, France` + `Auvergne-Rhône-Alpes, France`
- **Dijon** → `Dijon, France` + `Bourgogne-Franche-Comté, France`
- **Angers** → `Angers, France` + `Pays de la Loire, France`
- **Nîmes** → `Nîmes, France` + `Occitanie, France`
- **Villeurbanne** → `Villeurbanne, France` + `Auvergne-Rhône-Alpes, France`
- **Le Havre** → `Le Havre, France` + `Normandie, France`
- **Clermont-Ferrand** → `Clermont-Ferrand, France` + `Auvergne-Rhône-Alpes, France`

## 🌍 **VILLES INTERNATIONALES SUPPORTÉES**

### Europe de l'Ouest :
- **London** → `London, United Kingdom` + `Greater London, United Kingdom`
- **Berlin** → `Berlin, Germany` + `Berlin Area, Germany`
- **Amsterdam** → `Amsterdam, Netherlands` + `Amsterdam Area, Netherlands`
- **Barcelona** → `Barcelona, Spain` + `Barcelona Area, Spain`
- **Madrid** → `Madrid, Spain` + `Madrid Area, Spain`
- **Milan** → `Milan, Italy` + `Milan Area, Italy`
- **Zurich** → `Zurich, Switzerland` + `Zurich Area, Switzerland`
- **Brussels** → `Brussels, Belgium` + `Brussels Area, Belgium`
- **Dublin** → `Dublin, Ireland` + `Dublin Area, Ireland`
- **Munich** → `Munich, Germany` + `Munich Area, Germany`

### Europe du Nord :
- **Stockholm** → `Stockholm, Sweden` + `Stockholm Area, Sweden`
- **Copenhagen** → `Copenhagen, Denmark` + `Copenhagen Area, Denmark`
- **Oslo** → `Oslo, Norway` + `Oslo Area, Norway`
- **Helsinki** → `Helsinki, Finland` + `Helsinki Area, Finland`

### Europe du Sud :
- **Lisbon** → `Lisbon, Portugal` + `Lisbon Area, Portugal`
- **Rome** → `Rome, Italy` + `Rome Area, Italy`

### Europe de l'Est :
- **Warsaw** → `Warsaw, Poland` + `Warsaw Area, Poland`
- **Prague** → `Prague, Czech Republic` + `Prague Area, Czech Republic`
- **Budapest** → `Budapest, Hungary` + `Budapest Area, Hungary`
- **Vienna** → `Vienna, Austria` + `Vienna Area, Austria`

### International :
- **New York** → `New York, United States` + `New York, NY, United States`

## 🗺️ **PAYS ENTIERS SUPPORTÉS**

Si vous ne spécifiez que le pays (sans ville), le système cherchera dans tout le pays :

### Europe :
- `France`, `United Kingdom`, `UK`, `Germany`, `Netherlands`, `Spain`, `Italy`
- `Switzerland`, `Belgium`, `Ireland`, `Austria`, `Sweden`, `Denmark`
- `Norway`, `Finland`, `Portugal`, `Poland`, `Czech Republic`, `Hungary`

## 🤖 **DÉTECTION AUTOMATIQUE**

Si une ville n'est pas dans la liste ci-dessus, le système essaiera de la détecter automatiquement :

### Exemples :
- `"HRBP Nantes"` → Détectera automatiquement `Nantes, France`
- `"CTO Cannes"` → Détectera automatiquement `Cannes, France`
- `"HR Manager Rouen"` → Détectera automatiquement `Rouen, France`

### Règles de détection :
1. **Dernier mot commençant par une majuscule** → Considéré comme une ville
2. **Deux derniers mots avec majuscules** → Ville composée (ex: "New York")
3. **Par défaut** → Paris, France si aucune ville détectée

## 🎯 **Exemples de recherches multi-villes :**

### France :
```
"HRBP Lyon"
"Talent Acquisition Manager Marseille"
"People Operations Toulouse" 
"HR Technology Manager Nantes"
"CHRO Bordeaux"
"Process Improvement Manager Lille"
```

### International :
```
"HRBP London"
"Talent Acquisition Manager Berlin"
"People Operations Amsterdam"
"HR Technology Manager Barcelona"
"CHRO Zurich"
"Process Improvement Manager Stockholm"
```

### Pays entiers :
```
"HRBP Germany"
"Talent Acquisition Manager Netherlands"
"People Operations Spain"
"HR Technology Manager Switzerland"
```

## 🚀 **Utilisation :**

Le système détecte automatiquement la ville dans votre requête. Utilisez simplement :
- **Format recommandé :** `"[TITRE] [VILLE]"`
- **Exemples :** `"HRBP Lyon"`, `"CTO Berlin"`, `"HR Manager Barcelona"`

**Toutes les villes européennes principales sont maintenant supportées !** 🌍