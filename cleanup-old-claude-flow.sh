#!/bin/bash

# Script de nettoyage des anciens fichiers Claude-Flow
# Exécutez ce script après avoir vérifié que la nouvelle structure fonctionne

echo "🧹 Nettoyage des anciens fichiers Claude-Flow..."

# Sauvegarder les anciens fichiers avant suppression
echo "📦 Création d'une sauvegarde..."
mkdir -p old-claude-flow-backup

# Déplacer les anciens fichiers vers la sauvegarde
if [ -d "claude-flow" ]; then
  mv claude-flow old-claude-flow-backup/
  echo "✅ Dossier claude-flow/ sauvegardé"
fi

if [ -f "claude-flow-config.json" ]; then
  mv claude-flow-config.json old-claude-flow-backup/
  echo "✅ claude-flow-config.json sauvegardé"
fi

if [ -f "test-claude-flow-integration.js" ]; then
  mv test-claude-flow-integration.js old-claude-flow-backup/
  echo "✅ test-claude-flow-integration.js sauvegardé"
fi

if [ -f "CLAUDE_FLOW_GUIDE.md" ]; then
  mv CLAUDE_FLOW_GUIDE.md old-claude-flow-backup/
  echo "✅ CLAUDE_FLOW_GUIDE.md sauvegardé"
fi

if [ -f "INTEGRATION_SUCCESS_REPORT.md" ]; then
  mv INTEGRATION_SUCCESS_REPORT.md old-claude-flow-backup/
  echo "✅ INTEGRATION_SUCCESS_REPORT.md sauvegardé"
fi

echo ""
echo "🎉 Nettoyage terminé !"
echo "📁 Anciens fichiers sauvegardés dans: old-claude-flow-backup/"
echo "📁 Nouveaux fichiers Claude-Flow dans: testClaudeFlow/"
echo ""
echo "🚀 Pour tester la nouvelle structure :"
echo "   npm start"
echo "   npm run test:claude-flow"
echo ""
echo "⚠️  Si tout fonctionne, vous pouvez supprimer:"
echo "   rm -rf old-claude-flow-backup/"