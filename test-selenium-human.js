#!/usr/bin/env node

require('dotenv').config();
const seleniumScraper = require('./backend/services/linkedinSeleniumHuman');

async function testSeleniumHuman() {
  console.log('🧪 TEST DU SCRAPER SELENIUM HUMAN BEHAVIOR');
  console.log('='.repeat(60));
  console.log('⚡ Ce test simule un comportement humain réaliste pour contourner les protections LinkedIn');
  console.log('🕐 Cela peut prendre quelques minutes...\n');
  
  try {
    // Test d'initialisation
    console.log('1️⃣ Test d\'initialisation Selenium...');
    const startTime = Date.now();
    
    const initialized = await seleniumScraper.initialize();
    
    if (!initialized) {
      console.log('❌ Échec de l\'initialisation');
      return;
    }
    
    const initTime = Date.now() - startTime;
    console.log(`✅ Initialisation réussie en ${initTime}ms !`);
    
    // Test de recherche avec comportement humain
    console.log('\n2️⃣ Test de recherche avec simulation humaine...');
    const searchQuery = 'software engineer';
    console.log(`🔍 Recherche: "${searchQuery}"`);
    console.log('🤖 Simulation en cours: navigation, frappe, lecture, scroll...');
    
    const searchStartTime = Date.now();
    const results = await seleniumScraper.search(searchQuery, 5);
    const searchTime = Date.now() - searchStartTime;
    
    console.log(`\n📊 Résultats obtenus en ${searchTime}ms: ${results.length} profils trouvés`);
    
    if (results.length > 0) {
      console.log('\n📋 PROFILS LINKEDIN EXTRAITS:');
      console.log('='.repeat(50));
      
      let realProfilesCount = 0;
      
      results.forEach((profile, index) => {
        console.log(`\n${index + 1}. 👤 ${profile.name}`);
        console.log(`   📊 Titre: ${profile.title || 'Non spécifié'}`);
        console.log(`   🏢 Entreprise: ${profile.company || 'À extraire du titre'}`);
        console.log(`   📍 Localisation: ${profile.location || 'Non spécifiée'}`);
        console.log(`   🔗 URL LinkedIn: ${profile.linkedinUrl}`);
        console.log(`   🆔 ID LinkedIn: ${profile.linkedinId}`);
        console.log(`   ⚙️ Méthode: ${profile.method}`);
        console.log(`   🎯 Score: ${profile.searchScore}`);
        
        // Vérifier que l'URL LinkedIn est réelle
        if (profile.linkedinUrl && 
            profile.linkedinUrl.includes('/in/') && 
            profile.linkedinId && 
            profile.linkedinId !== 'access-blocked' &&
            !profile.linkedinUrl.includes('fake') &&
            profile.name !== 'LinkedIn Member') {
          console.log(`   ✅ PROFIL LINKEDIN RÉEL DÉTECTÉ`);
          realProfilesCount++;
        } else {
          console.log(`   ❌ Profil suspect ou générique`);
        }
      });
      
      console.log('\n🎯 ANALYSE DES RÉSULTATS:');
      console.log('='.repeat(30));
      console.log(`📊 Total des profils: ${results.length}`);
      console.log(`✅ Profils réels détectés: ${realProfilesCount}`);
      console.log(`🎯 Taux de succès: ${Math.round((realProfilesCount / results.length) * 100)}%`);
      
      if (realProfilesCount > 0) {
        console.log('\n🎉 SUCCÈS ! Le scraper Selenium Human a contourné les protections LinkedIn !');
        console.log('✅ Des profils LinkedIn réels ont été extraits avec succès');
        console.log('🤖 La simulation comportementale humaine fonctionne');
      } else {
        console.log('\n⚠️ Échec partiel: aucun profil réel détecté');
        console.log('💡 Possibles améliorations:');
        console.log('   - Ajuster les délais de simulation humaine');
        console.log('   - Utiliser des proxies rotatifs');
        console.log('   - Modifier les patterns de navigation');
      }
      
    } else {
      console.log('\n❌ Aucun profil trouvé');
      console.log('💡 Causes possibles:');
      console.log('   - LinkedIn a détecté l\'automation malgré la simulation');
      console.log('   - Cookie LinkedIn expiré');
      console.log('   - Captcha ou vérification requise');
      console.log('   - Rate limiting actif');
    }
    
    // Test de santé
    console.log('\n3️⃣ Test de santé du système...');
    const health = await seleniumScraper.healthCheck();
    console.log('✅ État de santé:', JSON.stringify(health, null, 2));
    
    console.log('\n📊 STATISTIQUES DE PERFORMANCE:');
    console.log(`   ⏱️ Temps d'initialisation: ${initTime}ms`);
    console.log(`   ⏱️ Temps de recherche: ${searchTime}ms`);
    console.log(`   🔄 Total: ${initTime + searchTime}ms`);
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    console.log('\n🔧 Solutions de dépannage:');
    console.log('   1. Vérifier que Chrome est installé');
    console.log('   2. Vérifier que le cookie LinkedIn est valide');
    console.log('   3. Essayer avec un VPN');
    console.log('   4. Attendre quelques heures avant de réessayer');
    console.log('   5. Vérifier les logs pour plus de détails');
  } finally {
    console.log('\n🧹 Nettoyage du navigateur...');
    await seleniumScraper.close();
    console.log('✅ Nettoyage terminé');
    
    console.log('\n📝 RAPPORT FINAL:');
    console.log('Le test Selenium Human Behavior est terminé.');
    console.log('Les résultats indiquent l\'efficacité du contournement anti-bot.');
  }
}

// Gérer l'interruption gracieusement
process.on('SIGINT', async () => {
  console.log('\n🛑 Interruption détectée, nettoyage...');
  await seleniumScraper.close();
  process.exit(0);
});

testSeleniumHuman().catch(console.error);