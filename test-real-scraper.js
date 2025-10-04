#!/usr/bin/env node

require('dotenv').config();
const realScraper = require('./backend/services/linkedinPuppeteerReal');

async function testRealScraper() {
  console.log('🧪 TEST DU SCRAPER LINKEDIN RÉEL (PUPPETEER)');
  console.log('='.repeat(60));
  
  try {
    // Test d'initialisation
    console.log('\n1️⃣ Test d\'initialisation...');
    const initialized = await realScraper.initialize();
    
    if (!initialized) {
      console.log('❌ Échec de l\'initialisation');
      return;
    }
    
    console.log('✅ Initialisation réussie !');
    
    // Test de recherche
    console.log('\n2️⃣ Test de recherche de VRAIS profils LinkedIn...');
    const searchQuery = 'software engineer france';
    console.log(`🔍 Recherche: "${searchQuery}"`);
    
    const results = await realScraper.search(searchQuery, 3);
    
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
        console.log(`   📅 Extrait le: ${profile.extractedAt}`);
        
        // Vérifier que l'URL LinkedIn est réelle
        if (profile.linkedinUrl && profile.linkedinUrl.includes('/in/') && profile.linkedinId !== 'access-blocked') {
          console.log(`   ✅ PROFIL LINKEDIN RÉEL DÉTECTÉ`);
        } else {
          console.log(`   ❌ Profil factice ou bloqué`);
        }
      });
      
      console.log('\n🎉 LE SCRAPER RÉEL FONCTIONNE !');
      console.log('✅ Ces profils LinkedIn existent réellement sur LinkedIn');
      
    } else {
      console.log('⚠️ Aucun profil trouvé');
      console.log('💡 Cela peut indiquer un problème de scraping ou de détection anti-bot');
    }
    
    // Test de santé
    console.log('\n3️⃣ Test de santé...');
    const health = await realScraper.healthCheck();
    console.log('✅ État de santé:', JSON.stringify(health, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('\n💡 Solutions possibles:');
    console.log('   - Vérifier que Puppeteer est correctement installé');
    console.log('   - Vérifier que le cookie LinkedIn est valide');
    console.log('   - Essayer avec un proxy ou VPN');
    console.log('   - Attendre quelques minutes avant de réessayer');
  } finally {
    console.log('\n🧹 Nettoyage...');
    await realScraper.close();
    console.log('✅ Nettoyage terminé');
  }
}

testRealScraper().catch(console.error);