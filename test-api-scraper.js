#!/usr/bin/env node

require('dotenv').config();

async function testApiScraper() {
  console.log('🧪 TEST DU SCRAPER LINKEDIN API');
  console.log('='.repeat(50));
  
  const linkedinApiScraper = require('./backend/services/linkedinApiScraper');
  
  try {
    // Test d'initialisation
    console.log('\n1️⃣ Test d\'initialisation...');
    const initialized = await linkedinApiScraper.initialize();
    
    if (!initialized) {
      console.log('❌ Échec de l\'initialisation');
      return;
    }
    
    console.log('✅ Initialisation réussie !');
    
    // Test de recherche
    console.log('\n2️⃣ Test de recherche...');
    const searchQuery = 'software engineer';
    const results = await linkedinApiScraper.search(searchQuery, 5);
    
    console.log(`✅ Recherche terminée: ${results.length} résultats`);
    
    if (results.length > 0) {
      console.log('\n📋 Profils trouvés:');
      results.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.name}`);
        console.log(`      Titre: ${profile.title || 'Non spécifié'}`);
        console.log(`      Entreprise: ${profile.company || 'Non spécifiée'}`);
        console.log(`      URL: ${profile.linkedinUrl}`);
        console.log(`      Méthode: ${profile.method}`);
        console.log('');
      });
      
      console.log('🎉 LE SCRAPER API FONCTIONNE !');
    } else {
      console.log('⚠️ Aucun résultat trouvé');
    }
    
    // Test de santé
    console.log('\n3️⃣ Test de santé...');
    const health = await linkedinApiScraper.healthCheck();
    console.log('✅ État de santé:', JSON.stringify(health, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await linkedinApiScraper.close();
    console.log('🧹 Nettoyage terminé');
  }
}

testApiScraper().catch(console.error);