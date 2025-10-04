#!/bin/bash

# Script de déploiement automatique pour le système de prospection
# Usage: ./deploy.sh

set -e

echo "🚀 Démarrage du déploiement du système de prospection..."

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json introuvable. Assurez-vous d'être dans le dossier prospection-system"
    exit 1
fi

# Vérifier que Git est initialisé
if [ ! -d ".git" ]; then
    echo "❌ Erreur: Dépôt Git non trouvé. Lancez d'abord l'initialisation Git"
    exit 1
fi

echo "📦 Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances npm..."
    npm install
fi

echo "🔍 Vérification de l'installation de Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "📥 Installation de Vercel CLI..."
    npm install -g vercel
fi

echo "📋 Ajout des fichiers au dépôt Git..."
git add .

echo "📝 Création du commit initial..."
git commit -m "🚀 Initial commit: Graixl prospection system

- Système de prospection B2B intelligent
- Architecture multi-agents avec Claude Code
- Intégration LinkedIn, Google Sheets, Email
- API REST avec Express.js
- Frontend avec interface de gestion

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>" || echo "ℹ️  Aucun changement à commiter"

echo "🌐 Déploiement sur Vercel..."
vercel --prod

echo "✅ Déploiement terminé avec succès!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurez vos variables d'environnement sur Vercel"
echo "2. Ajoutez vos credentials Google Sheets"
echo "3. Testez l'application déployée"
echo ""
echo "🔗 Accédez à votre dashboard Vercel: https://vercel.com/dashboard"