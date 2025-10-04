#!/usr/bin/env node

require('dotenv').config();
const googleScraper = require('./backend/services/linkedinGoogleScraper');

async function testGoogleLinkedIn() {
  console.log('🔍 TEST SCRAPER GOOGLE LINKEDIN - APPROCHE INNOVANTE');
  console.log('='.repeat(60));
  console.log('💡 Cette approche contourne LinkedIn en passant par Google Search');
  console.log('🎯 Utilise des commandes Google avancées: site:, inurl:, intitle:');
  console.log('');
  
  try {
    console.log('1️⃣ Initialisation du scraper Google...');
    const initialized = await googleScraper.initialize();
    
    if (!initialized) {
      console.log('❌ Échec d\'initialisation');
      return;
    }
    
    console.log('✅ Scraper Google initialisé avec succès');
    
    // Test avec différentes requêtes
    const testQueries = [
      'software engineer',
      'frontend developer',
      'product manager'
    ];
    
    for (const query of testQueries) {
      console.log(`\n2️⃣ Test recherche: "${query}"`);
      console.log('-'.repeat(40));
      
      const startTime = Date.now();
      const results = await googleScraper.search(query, 5);
      const searchTime = Date.now() - startTime;
      
      console.log(`📊 ${results.length} profils trouvés en ${searchTime}ms`);
      
      if (results.length > 0) {
        console.log('\n📋 PROFILS LINKEDIN VIA GOOGLE:');
        
        let realProfilesCount = 0;
        
        results.forEach((profile, index) => {
          console.log(`\n   ${index + 1}. 👤 ${profile.name}`);
          console.log(`      📊 Titre: ${profile.title || 'Non spécifié'}`);
          console.log(`      🔗 URL: ${profile.linkedinUrl}`);
          console.log(`      🆔 ID: ${profile.linkedinId}`);
          console.log(`      ⚙️ Méthode: ${profile.method}`);
          console.log(`      🎯 Score: ${profile.searchScore}`);
          
          // Vérification de validité
          if (profile.linkedinUrl && 
              profile.linkedinUrl.includes('linkedin.com/in/') && 
              profile.linkedinId && 
              profile.linkedinId.length > 2 &&
              profile.name && 
              profile.name.length > 3 &&
              !profile.name.includes('LinkedIn')) {
            console.log(`      ✅ PROFIL LINKEDIN RÉEL DÉTECTÉ`);
            realProfilesCount++;
          } else {
            console.log(`      ⚠️ Profil suspect ou incomplet`);
          }
        });
        
        console.log(`\n📈 ANALYSE: ${realProfilesCount}/${results.length} profils réels (${Math.round((realProfilesCount/results.length)*100)}%)`);
        
        if (realProfilesCount > 0) {
          console.log('🎉 SUCCÈS ! L\'approche Google fonctionne !');
          console.log('✅ Contournement des protections LinkedIn réussi');
          console.log('🔍 Google indexe et expose les profils LinkedIn publics');
        } else {
          console.log('⚠️ Aucun profil réel validé');
        }
        
      } else {
        console.log('❌ Aucun résultat trouvé');
        console.log('💡 Causes possibles:');
        console.log('   - Google rate limiting actif');
        console.log('   - Captcha Google détecté');
        console.log('   - Requête trop spécifique');
      }
      
      // Délai entre les tests
      if (testQueries.indexOf(query) < testQueries.length - 1) {
        console.log('\n⏳ Attente de 3 secondes pour éviter rate limiting...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('\n3️⃣ Test de santé...');
    const health = await googleScraper.healthCheck();
    console.log('✅ État:', JSON.stringify(health, null, 2));
    
    console.log('\n🎯 AVANTAGES DE L\'APPROCHE GOOGLE:');
    console.log('   ✅ Contourne complètement les protections LinkedIn');
    console.log('   ✅ Accès aux profils publics indexés par Google');
    console.log('   ✅ Utilise les commandes de recherche avancées');
    console.log('   ✅ Pas besoin de cookie LinkedIn');
    console.log('   ✅ Plus stable que le scraping direct');
    
    console.log('\n⚠️ LIMITATIONS:');
    console.log('   - Seuls les profils publics sont accessibles');
    console.log('   - Google peut appliquer un rate limiting');
    console.log('   - Informations parfois limitées dans Google');
    console.log('   - Dépend de l\'indexation Google');
    
    console.log('\n💡 COMMANDES GOOGLE UTILISÉES:');
    console.log('   - site:linkedin.com/in/ "query"');
    console.log('   - inurl:linkedin.com/in "query"');
    console.log('   - intitle:"query" site:linkedin.com');
    console.log('   - Variations avec synonymes et métiers');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('   1. Vérifier la connexion Internet');
    console.log('   2. Attendre quelques minutes (rate limiting Google)');
    console.log('   3. Utiliser un VPN si Google bloque l\'IP');
    console.log('   4. Ajuster les délais entre requêtes');
  } finally {
    console.log('\n🧹 Nettoyage...');
    await googleScraper.close();
    console.log('✅ Test Google LinkedIn terminé');
    
    console.log('\n📝 CONCLUSION:');
    console.log('Cette approche via Google représente une innovation majeure');
    console.log('pour contourner les protections anti-scraping de LinkedIn.');
    console.log('Elle exploite le fait que Google indexe les profils publics.');
  }
}

testGoogleLinkedIn().catch(console.error);