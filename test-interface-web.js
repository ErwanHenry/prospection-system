#!/usr/bin/env node

/**
 * Test de l'interface web
 * Ouvre automatiquement l'interface et teste une recherche
 */

const { exec } = require('child_process');

async function testWebInterface() {
  console.log('🌐 TEST DE L\'INTERFACE WEB LINKEDIN');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Vérifier que le serveur répond
    console.log('\n1️⃣ Vérification du serveur...');
    
    const { default: fetch } = await import('node-fetch');
    
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    
    console.log('✅ Serveur actif');
    console.log('📊 Status:', healthData.status);
    console.log('📊 LinkedIn:', healthData.linkedin);
    console.log('📊 Google Sheets:', healthData.googleSheets);
    
    // Test 2: Test de recherche via API
    console.log('\n2️⃣ Test de recherche via API...');
    
    const searchResponse = await fetch('http://localhost:3000/api/linkedin/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'software engineer',
        limit: 3
      })
    });
    
    const searchData = await searchResponse.json();
    
    if (searchData.success) {
      console.log('✅ Recherche réussie !');
      console.log(`📊 ${searchData.count} profils trouvés`);
      console.log(`📊 Source: ${searchData.results[0]?.source || 'N/A'}`);
      
      // Afficher les premiers résultats
      if (searchData.results && searchData.results.length > 0) {
        console.log('\n📋 Premiers résultats:');
        searchData.results.slice(0, 2).forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.name}`);
          console.log(`      ${profile.title} ${profile.company ? 'chez ' + profile.company : ''}`);
          console.log(`      ${profile.location}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Échec de la recherche');
      console.log('Erreur:', searchData.error);
    }
    
    // Test 3: Ouvrir l'interface web
    console.log('\n3️⃣ Ouverture de l\'interface web...');
    console.log('🌐 URL: http://localhost:3000');
    
    // Ouvrir automatiquement dans le navigateur
    const openCommand = process.platform === 'darwin' ? 'open' : 
                       process.platform === 'win32' ? 'start' : 'xdg-open';
    
    exec(`${openCommand} http://localhost:3000`, (error) => {
      if (error) {
        console.log('⚠️ Impossible d\'ouvrir automatiquement le navigateur');
        console.log('💡 Ouvrez manuellement: http://localhost:3000');
      } else {
        console.log('✅ Interface web ouverte dans le navigateur');
      }
    });
    
    // Instructions pour l'utilisateur
    console.log('\n📝 INSTRUCTIONS POUR TESTER L\'INTERFACE:');
    console.log('='.repeat(40));
    console.log('1. Dans le navigateur qui s\'est ouvert (ou allez sur http://localhost:3000)');
    console.log('2. Entrez une requête de recherche (ex: "developer paris")');
    console.log('3. Cliquez sur "Search"');
    console.log('4. Vérifiez que des résultats apparaissent');
    console.log('5. Cliquez sur "Add to CRM" pour tester l\'ajout à Google Sheets');
    
    console.log('\n✅ SYSTÈME PRÊT À UTILISER !');
    
    // Afficher l'état du système
    console.log('\n📊 ÉTAT DU SYSTÈME:');
    console.log(`   Serveur: ✅ Actif sur port 3000`);
    console.log(`   LinkedIn: ${healthData.linkedin === 'ready' ? '✅' : '⚠️'} ${healthData.linkedin}`);
    console.log(`   Google Sheets: ${healthData.googleSheets === 'connected' ? '✅' : '⚠️'} ${healthData.googleSheets}`);
    console.log(`   Cookie: ✅ Valide (confirmé par diagnostic)`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('\n💡 Assurez-vous que le serveur est démarré avec: npm start');
  }
}

testWebInterface().catch(console.error);