#!/usr/bin/env node

require('dotenv').config();

async function testAllScrapers() {
  console.log('🧪 TEST DE TOUS LES SCRAPERS LINKEDIN');
  console.log('='.repeat(50));
  console.log('🎯 Objectif: Trouver le scraper qui contourne le mieux les protections LinkedIn\n');

  const scrapers = [
    { name: 'API Direct', module: './backend/services/linkedinApiScraper' },
    { name: 'Real API', module: './backend/services/linkedinRealApi' },
    { name: 'Honest Service', module: './backend/services/linkedinHonest' }
  ];

  // Ajouter les scrapers avancés s'ils sont disponibles
  try {
    scrapers.push({ name: 'Selenium Optimized', module: './backend/services/linkedinSeleniumOptimized' });
  } catch (e) {}

  try {
    scrapers.push({ name: 'Selenium Human', module: './backend/services/linkedinSeleniumHuman' });
  } catch (e) {}

  try {
    scrapers.push({ name: 'Playwright', module: './backend/services/linkedinPlaywright' });
  } catch (e) {}

  const results = {};
  const query = 'software engineer';
  const limit = 3;

  for (const scraper of scrapers) {
    console.log(`\n🔍 Test: ${scraper.name}`);
    console.log('-'.repeat(30));
    
    try {
      const scraperInstance = require(scraper.module);
      const startTime = Date.now();
      
      // Test d'initialisation
      console.log('   🚀 Initialisation...');
      const initialized = await scraperInstance.initialize();
      
      if (!initialized) {
        console.log('   ❌ Échec d\'initialisation');
        results[scraper.name] = {
          status: 'failed',
          error: 'Initialization failed',
          profiles: 0,
          time: 0
        };
        continue;
      }
      
      console.log('   ✅ Initialisé');
      
      // Test de recherche
      console.log('   🔍 Recherche...');
      const profiles = await scraperInstance.search(query, limit);
      
      const totalTime = Date.now() - startTime;
      const realProfiles = profiles.filter(p => 
        p.linkedinId && 
        !p.linkedinId.includes('blocked') && 
        !p.linkedinId.includes('access') &&
        p.name !== 'LinkedIn Member' &&
        p.name !== '⚠️ Accès LinkedIn Bloqué'
      );
      
      console.log(`   📊 ${profiles.length} profils trouvés (${realProfiles.length} réels)`);
      console.log(`   ⏱️ Temps: ${totalTime}ms`);
      
      if (realProfiles.length > 0) {
        console.log('   ✅ SUCCÈS - Profils réels extraits !');
        realProfiles.forEach((p, i) => {
          console.log(`      ${i+1}. ${p.name} (${p.linkedinId})`);
        });
      } else {
        console.log('   ⚠️ Aucun profil réel détecté');
      }
      
      results[scraper.name] = {
        status: realProfiles.length > 0 ? 'success' : 'no_real_profiles',
        profiles: profiles.length,
        realProfiles: realProfiles.length,
        time: totalTime,
        method: profiles[0]?.method || 'unknown'
      };
      
      // Fermer le scraper
      if (scraperInstance.close) {
        await scraperInstance.close();
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      results[scraper.name] = {
        status: 'error',
        error: error.message,
        profiles: 0,
        time: 0
      };
    }
  }

  // Rapport final
  console.log('\n📊 RAPPORT FINAL');
  console.log('='.repeat(50));
  
  const successful = Object.entries(results).filter(([name, result]) => result.status === 'success');
  const partial = Object.entries(results).filter(([name, result]) => result.status === 'no_real_profiles');
  const failed = Object.entries(results).filter(([name, result]) => result.status === 'failed' || result.status === 'error');
  
  if (successful.length > 0) {
    console.log('\n🎉 SCRAPERS QUI FONCTIONNENT:');
    successful.forEach(([name, result]) => {
      console.log(`   ✅ ${name}: ${result.realProfiles} profils réels en ${result.time}ms`);
    });
    
    // Recommandation
    const best = successful.reduce((best, current) => 
      current[1].realProfiles > best[1].realProfiles ? current : best
    );
    console.log(`\n🏆 MEILLEUR SCRAPER: ${best[0]}`);
    console.log(`   📊 ${best[1].realProfiles} profils réels`);
    console.log(`   ⚡ ${best[1].time}ms`);
    console.log(`   🛠️ Méthode: ${best[1].method}`);
    
    console.log(`\n💡 RECOMMANDATION: Configurer LINKEDIN_SCRAPER_TYPE=${best[0].toLowerCase().replace(/ /g, '_')}`);
    
  } else {
    console.log('\n❌ AUCUN SCRAPER N\'A RÉUSSI À EXTRAIRE DE VRAIS PROFILS');
    
    if (partial.length > 0) {
      console.log('\n⚠️ Scrapers partiels (extraction mais pas de vrais profils):');
      partial.forEach(([name, result]) => {
        console.log(`   📊 ${name}: ${result.profiles} profils en ${result.time}ms`);
      });
    }
    
    console.log('\n💡 SOLUTIONS POSSIBLES:');
    console.log('   1. Vérifier que le cookie LinkedIn est valide');
    console.log('   2. Utiliser un VPN ou proxy');
    console.log('   3. Attendre quelques heures (rate limiting)');
    console.log('   4. Essayer des proxies rotatifs');
    console.log('   5. Utiliser l\'API LinkedIn officielle (payante)');
  }
  
  console.log('\n📋 RÉSUMÉ COMPLET:');
  Object.entries(results).forEach(([name, result]) => {
    const statusIcon = result.status === 'success' ? '✅' : 
                      result.status === 'no_real_profiles' ? '⚠️' : '❌';
    console.log(`   ${statusIcon} ${name}: ${result.status} (${result.profiles} profils)`);
  });
}

testAllScrapers().catch(console.error);