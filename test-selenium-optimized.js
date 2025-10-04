#!/usr/bin/env node

require('dotenv').config();
const seleniumOptimized = require('./backend/services/linkedinSeleniumOptimized');

async function testSeleniumOptimized() {
  console.log('⚡ TEST SELENIUM OPTIMIZED - CONTOURNEMENT RAPIDE');
  console.log('='.repeat(55));
  
  const timeout = setTimeout(() => {
    console.log('⏰ Timeout de 90 secondes atteint, arrêt du test...');
    seleniumOptimized.close();
    process.exit(1);
  }, 90000);
  
  try {
    console.log('🚀 Initialisation rapide...');
    const start = Date.now();
    
    const initialized = await seleniumOptimized.initialize();
    if (!initialized) {
      console.log('❌ Échec initialisation');
      return;
    }
    
    console.log(`✅ Initialisé en ${Date.now() - start}ms`);
    
    console.log('🔍 Recherche test...');
    const searchStart = Date.now();
    
    const results = await seleniumOptimized.search('software engineer', 3);
    const searchTime = Date.now() - searchStart;
    
    console.log(`📊 ${results.length} profils en ${searchTime}ms`);
    
    if (results.length > 0) {
      console.log('\n✅ PROFILS TROUVÉS:');
      results.forEach((p, i) => {
        console.log(`${i+1}. ${p.name} - ${p.linkedinId}`);
        console.log(`   URL: ${p.linkedinUrl}`);
      });
      
      const realCount = results.filter(p => 
        p.linkedinId && 
        !p.linkedinId.includes('blocked') && 
        p.name !== 'LinkedIn Member'
      ).length;
      
      console.log(`\n🎯 ${realCount}/${results.length} profils réels détectés`);
      
      if (realCount > 0) {
        console.log('🎉 SUCCÈS ! Contournement anti-bot réussi !');
      }
    } else {
      console.log('❌ Aucun profil trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    clearTimeout(timeout);
    console.log('🧹 Nettoyage...');
    await seleniumOptimized.close();
    console.log('✅ Test terminé');
  }
}

process.on('SIGINT', async () => {
  await seleniumOptimized.close();
  process.exit(0);
});

testSeleniumOptimized().catch(console.error);