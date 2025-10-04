#!/bin/bash

echo "======================================"
echo "🔍 Vérification du système prospection"
echo "======================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher le statut
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        echo "   $3"
    fi
}

# Vérifier si le répertoire existe
echo "1. Vérification du répertoire..."
if [ -d "$HOME/prospection-system" ]; then
    check_status 0 "Répertoire trouvé: $HOME/prospection-system"
    cd "$HOME/prospection-system"
else
    check_status 1 "Répertoire non trouvé" "Assurez-vous d'être dans le bon répertoire"
    exit 1
fi
echo ""

# Vérifier les fichiers essentiels
echo "2. Vérification des fichiers essentiels..."
FILES_TO_CHECK=(
    ".env"
    "package.json"
    "backend/server.js"
    "backend/services/googleSheets.js"
    "backend/services/linkedinScraper.js"
    "frontend/index.html"
    "frontend/app.js"
    "frontend/style.css"
)

missing_files=0
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✓${NC} $file"
    else
        echo -e "   ${RED}✗${NC} $file manquant"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -eq 0 ]; then
    check_status 0 "Tous les fichiers essentiels sont présents"
else
    check_status 1 "Il manque $missing_files fichier(s)"
fi
echo ""

# Vérifier node_modules
echo "3. Vérification des dépendances..."
if [ -d "node_modules" ]; then
    check_status 0 "Dossier node_modules présent"
else
    check_status 1 "Dossier node_modules manquant" "Exécutez: npm install"
fi
echo ""

# Vérifier les credentials Google
echo "4. Vérification de l'authentification Google..."
if [ -f "credentials.json" ]; then
    check_status 0 "credentials.json trouvé"
    
    # Vérifier si le fichier contient des données valides
    if grep -q "client_id" credentials.json 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} Le fichier semble valide"
    else
        echo -e "   ${YELLOW}⚠${NC}  Vérifiez que credentials.json contient les bonnes données"
    fi
else
    check_status 1 "credentials.json non trouvé" "Ajoutez vos credentials Google OAuth"
fi

if [ -f "token.json" ]; then
    echo -e "   ${GREEN}✓${NC} token.json trouvé (authentification déjà effectuée)"
else
    echo -e "   ${YELLOW}⚠${NC}  token.json non trouvé (authentification nécessaire)"
fi
echo ""

# Vérifier la configuration .env
echo "5. Vérification de la configuration..."
if [ -f ".env" ]; then
    # Vérifier les variables importantes
    if grep -q "GOOGLE_SPREADSHEET_ID=" .env; then
        SHEET_ID=$(grep "GOOGLE_SPREADSHEET_ID=" .env | cut -d'=' -f2)
        if [ -n "$SHEET_ID" ] && [ "$SHEET_ID" != "your-spreadsheet-id" ]; then
            echo -e "   ${GREEN}✓${NC} Google Sheets ID configuré"
        else
            echo -e "   ${RED}✗${NC} Google Sheets ID non configuré"
        fi
    fi
    
    if grep -q "LINKEDIN_COOKIE=" .env; then
        COOKIE=$(grep "LINKEDIN_COOKIE=" .env | cut -d'=' -f2)
        if [ -n "$COOKIE" ] && [ "$COOKIE" != "YOUR_LINKEDIN_COOKIE_HERE" ]; then
            echo -e "   ${GREEN}✓${NC} LinkedIn cookie configuré"
        else
            echo -e "   ${YELLOW}⚠${NC}  LinkedIn cookie non configuré"
            echo "      Consultez LINKEDIN_COOKIE_GUIDE.md pour obtenir votre cookie"
        fi
    fi
else
    check_status 1 ".env non trouvé" "Le fichier de configuration est manquant"
fi
echo ""

# Test de connexion Google Sheets
echo "6. Test de connexion Google Sheets..."
if [ -f "test-connection.js" ]; then
    echo "   Exécution du test..."
    node test-connection.js 2>&1 | sed 's/^/   /'
else
    echo -e "   ${YELLOW}⚠${NC}  Fichier de test non trouvé"
fi
echo ""

# Vérifier si le serveur peut démarrer
echo "7. Test de démarrage du serveur..."
echo "   Tentative de démarrage du serveur pour 5 secondes..."

# Démarrer le serveur en arrière-plan
timeout 5s node backend/server.js > server_test.log 2>&1 &
SERVER_PID=$!

sleep 3

# Vérifier si le serveur répond
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Le serveur répond correctement"
    
    # Afficher le statut de santé
    HEALTH=$(curl -s http://localhost:3000/api/health)
    echo "   Statut:"
    echo "$HEALTH" | grep -o '"googleSheets":"[^"]*"' | sed 's/^/      /'
    echo "$HEALTH" | grep -o '"linkedin":"[^"]*"' | sed 's/^/      /'
else
    echo -e "   ${RED}✗${NC} Le serveur ne répond pas"
    echo "   Vérifiez les logs:"
    tail -5 server_test.log 2>/dev/null | sed 's/^/      /'
fi

# Nettoyer
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null
rm -f server_test.log
echo ""

# Résumé
echo "======================================"
echo "📊 Résumé"
echo "======================================"

all_good=true

if [ ! -f "credentials.json" ]; then
    echo -e "${YELLOW}⚠${NC}  Action requise: Ajoutez credentials.json"
    all_good=false
fi

if [ ! -f "token.json" ]; then
    echo -e "${YELLOW}⚠${NC}  Action requise: Authentifiez-vous avec Google"
    all_good=false
fi

COOKIE=$(grep "LINKEDIN_COOKIE=" .env 2>/dev/null | cut -d'=' -f2)
if [ -z "$COOKIE" ] || [ "$COOKIE" = "YOUR_LINKEDIN_COOKIE_HERE" ]; then
    echo -e "${YELLOW}⚠${NC}  Action recommandée: Configurez votre cookie LinkedIn"
    all_good=false
fi

if [ "$all_good" = true ]; then
    echo -e "${GREEN}✅ Tout est prêt !${NC}"
    echo ""
    echo "Démarrez le serveur avec:"
    echo "  npm start"
    echo "ou"
    echo "  ./start.sh"
    echo ""
    echo "Puis ouvrez: http://localhost:3000"
else
    echo ""
    echo "Corrigez les points ci-dessus avant de démarrer."
fi
echo ""
