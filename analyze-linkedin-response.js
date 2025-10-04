#!/usr/bin/env node

require('dotenv').config();
const linkedinApiScraper = require('./backend/services/linkedinApiScraper');
const fs = require('fs').promises;

async function analyzeResponse() {
  console.log('🔍 ANALYSE DE LA RÉPONSE LINKEDIN RÉELLE');
  console.log('='.repeat(50));
  
  try {
    await linkedinApiScraper.initialize();
    
    // Faire une recherche et intercepter le HTML
    console.log('📡 Récupération du HTML LinkedIn...');
    
    // Modifier temporairement la méthode pour capturer le HTML
    const originalParseMethod = linkedinApiScraper.parseProfilesFromHtml;
    let capturedHtml = '';
    
    linkedinApiScraper.parseProfilesFromHtml = function(html, limit) {
      capturedHtml = html;
      console.log(`📄 HTML capturé: ${html.length} caractères`);
      
      // Sauvegarder le HTML pour analyse
      fs.writeFile('linkedin_captured.html', html).catch(console.error);
      
      // Analyser le contenu
      console.log('\n🔍 ANALYSE DU CONTENU:');
      
      // Rechercher des éléments spécifiques
      const patterns = [
        { name: 'Profils /in/', regex: /\/in\/[a-zA-Z0-9\-]+/g },
        { name: 'Liens profils', regex: /<a[^>]*href="[^"]*\/in\/[^"]*"/g },
        { name: 'Noms (span)', regex: /<span[^>]*aria-hidden="true"[^>]*>([^<]+)<\/span>/g },
        { name: 'JSON data', regex: /"elements":\s*\[/g },
        { name: 'Search results', regex: /search-result/gi },
        { name: 'Entity results', regex: /entity-result/gi },
        { name: 'Profile cards', regex: /profile-card/gi }
      ];
      
      patterns.forEach(pattern => {
        const matches = html.match(pattern.regex) || [];
        console.log(`   ${pattern.name}: ${matches.length} occurrences`);
        if (matches.length > 0 && matches.length < 10) {
          console.log(`     Exemples: ${matches.slice(0, 3).join(', ')}`);
        }
      });
      
      // Chercher du contenu spécifique
      if (html.includes('guest-homepage')) {
        console.log('⚠️ Page d\'invité détectée - pas connecté');
      }
      
      if (html.includes('session_key')) {
        console.log('⚠️ Page de connexion détectée');
      }
      
      if (html.includes('LinkedIn')) {
        console.log('✅ Contenu LinkedIn détecté');
      }
      
      // Analyser le début et la fin
      console.log('\n📄 DÉBUT DU HTML (200 premiers caractères):');
      console.log(html.substring(0, 200));
      
      console.log('\n📄 FIN DU HTML (200 derniers caractères):');
      console.log(html.substring(html.length - 200));
      
      // Retourner la méthode originale
      return originalParseMethod.call(this, html, limit);
    };
    
    // Faire la recherche
    const results = await linkedinApiScraper.search('software engineer', 5);
    console.log(`\n✅ Résultats: ${results.length} profils`);
    
    // Restaurer la méthode originale
    linkedinApiScraper.parseProfilesFromHtml = originalParseMethod;
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await linkedinApiScraper.close();
  }
}

analyzeResponse().catch(console.error);