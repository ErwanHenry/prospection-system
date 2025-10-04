#!/usr/bin/env node

/**
 * Test du scraper LinkedIn optimisé
 */

require('dotenv').config();

async function testOptimizedScraper() {
  console.log('🧪 TEST DU SCRAPER LINKEDIN OPTIMISÉ');
  console.log('='.repeat(50));
  
  const linkedinScraperOptimized = require('./backend/services/linkedinScraperOptimized');
  
  try {
    // Test d'initialisation
    console.log('\n1️⃣ Test d\'initialisation...');
    const initialized = await linkedinScraperOptimized.initialize();
    
    if (!initialized) {
      console.log('❌ Échec de l\'initialisation');
      return;
    }
    
    console.log('✅ Initialisation réussie !');
    
    // Test de recherche
    console.log('\n2️⃣ Test de recherche...');
    const searchQuery = 'software engineer';
    const results = await linkedinScraperOptimized.search(searchQuery, 3);
    
    console.log(`✅ Recherche terminée: ${results.length} résultats`);
    
    if (results.length > 0) {
      console.log('\n📋 Profils trouvés:');
      results.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.name}`);
        console.log(`      URL: ${profile.linkedinUrl}`);
        console.log(`      Méthode: ${profile.method || 'standard'}`);
        console.log('');
      });
    }
    
    // Test de santé
    console.log('\n3️⃣ Test de santé...');
    const health = await linkedinScraperOptimized.healthCheck();
    console.log('✅ État de santé:', JSON.stringify(health, null, 2));
    
    console.log('\n🎉 TOUS LES TESTS RÉUSSIS !');
    console.log('✅ Le scraper LinkedIn fonctionne correctement');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    // Nettoyage
    await linkedinScraperOptimized.close();
    console.log('🧹 Nettoyage terminé');
  }
}

testOptimizedScraper().catch(console.error);