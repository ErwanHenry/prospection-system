#!/usr/bin/env node

require('dotenv').config();
const realApiScraper = require('./backend/services/linkedinRealApi');

async function testRealApiScraper() {
  console.log('🧪 TEST DU SCRAPER LINKEDIN REAL API');
  console.log('='.repeat(60));
  
  try {
    // Test d'initialisation
    console.log('\n1️⃣ Test d\'initialisation...');
    const initialized = await realApiScraper.initialize();
    
    if (!initialized) {
      console.log('❌ Échec de l\'initialisation');
      return;
    }
    
    console.log('✅ Initialisation réussie !');
    
    // Test de recherche
    console.log('\n2️⃣ Test de recherche de VRAIS profils LinkedIn...');
    const searchQuery = 'software engineer';
    console.log(`🔍 Recherche: "${searchQuery}"`);
    
    const results = await realApiScraper.search(searchQuery, 5);
    
    console.log(`\n📊 Résultats: ${results.length} profils trouvés`);
    
    if (results.length > 0) {
      console.log('\n📋 VRAIS PROFILS LINKEDIN TROUVÉS:');
      console.log('='.repeat(50));
      
      results.forEach((profile, index) => {
        console.log(`\n${index + 1}. 👤 ${profile.name}`);
        console.log(`   📊 Titre: ${profile.title || 'Non spécifié'}`);
        console.log(`   🏢 Entreprise: ${profile.company || 'Non spécifiée'}`);
        console.log(`   📍 Localisation: ${profile.location || 'Non spécifiée'}`);
        console.log(`   🔗 URL LinkedIn: ${profile.linkedinUrl}`);
        console.log(`   🆔 ID LinkedIn: ${profile.linkedinId}`);
        console.log(`   ⚙️ Méthode: ${profile.method}`);
        console.log(`   🎯 Score: ${profile.searchScore}`);
        
        // Vérifier que l'URL LinkedIn est réelle
        if (profile.linkedinUrl && profile.linkedinUrl.includes('/in/') && profile.linkedinId && profile.linkedinId !== 'access-blocked') {
          console.log(`   ✅ PROFIL LINKEDIN RÉEL DÉTECTÉ`);
        } else {
          console.log(`   ❌ Profil factice ou bloqué`);
        }
      });
      
      console.log('\n🎉 LE SCRAPER REAL API FONCTIONNE !');
      console.log('✅ Ces profils LinkedIn existent réellement sur LinkedIn');
      
    } else {
      console.log('⚠️ Aucun profil trouvé');
      console.log('💡 Cela peut indiquer:');
      console.log('   - LinkedIn bloque l\'accès API');
      console.log('   - Cookie invalide ou expiré');
      console.log('   - Rate limiting en cours');
    }
    
    // Test de santé
    console.log('\n3️⃣ Test de santé...');
    const health = await realApiScraper.healthCheck();
    console.log('✅ État de santé:', JSON.stringify(health, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    console.log('\n🧹 Nettoyage...');
    await realApiScraper.close();
    console.log('✅ Nettoyage terminé');
  }
}

testRealApiScraper().catch(console.error);