#!/usr/bin/env node

/**
 * Test simple du cookie LinkedIn
 * Vérifie juste si le cookie fonctionne sans timeout
 */

require('dotenv').config();

async function testLinkedInCookie() {
  console.log('🍪 TEST SIMPLE DU COOKIE LINKEDIN');
  console.log('='.repeat(50));
  
  const linkedinCookie = process.env.LINKEDIN_COOKIE;
  
  if (!linkedinCookie) {
    console.log('❌ Cookie LinkedIn manquant dans .env');
    return;
  }
  
  console.log('✅ Cookie trouvé:', linkedinCookie.substring(0, 20) + '...');
  
  // Test avec curl pour éviter les problèmes de navigateur
  console.log('\n🌐 Test de connexion avec curl...');
  
  const { exec } = require('child_process');
  
  return new Promise((resolve) => {
    const curlCommand = `curl -s -H "Cookie: li_at=${linkedinCookie}" "https://www.linkedin.com/feed/" | grep -o "Welcome\\|feed-identity" | head -1`;
    
    exec(curlCommand, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Erreur de connexion:', error.message);
        console.log('💡 Le cookie est probablement expiré');
        resolve(false);
      } else {
        const response = stdout.trim();
        if (response.includes('feed-identity') || response.includes('Welcome')) {
          console.log('✅ Cookie valide - Connexion réussie !');
          resolve(true);
        } else {
          console.log('❌ Cookie invalide - Pas de connexion détectée');
          console.log('💡 Le cookie doit être renouvelé');
          resolve(false);
        }
      }
    });
  });
}

async function testWithFetchAPI() {
  console.log('\n🔗 Test avec l\'API Fetch...');
  
  const linkedinCookie = process.env.LINKEDIN_COOKIE;
  
  try {
    const response = await fetch('https://www.linkedin.com/feed/', {
      method: 'GET',
      headers: {
        'Cookie': `li_at=${linkedinCookie}`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      redirect: 'follow'
    });
    
    if (response.ok) {
      const text = await response.text();
      
      if (text.includes('feed-identity') || text.includes('globalNav') || text.includes('LinkedIn') && !text.includes('Sign in')) {
        console.log('✅ Cookie valide avec Fetch API !');
        return true;
      } else {
        console.log('❌ Cookie invalide - Redirection vers login détectée');
        return false;
      }
    } else {
      console.log('❌ Erreur HTTP:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur Fetch:', error.message);
    return false;
  }
}

async function main() {
  // Test 1: Cookie avec curl
  const curlResult = await testLinkedInCookie();
  
  // Test 2: Cookie avec fetch API
  const fetchResult = await testWithFetchAPI();
  
  console.log('\n📊 RÉSULTATS:');
  console.log('='.repeat(30));
  console.log(`Curl test: ${curlResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Fetch test: ${fetchResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (curlResult || fetchResult) {
    console.log('\n✅ COOKIE VALIDE !');
    console.log('🔧 Le problème vient du navigateur Puppeteer, pas du cookie');
    console.log('💡 Solutions possibles:');
    console.log('   - Augmenter les timeouts');
    console.log('   - Utiliser un mode headless');
    console.log('   - Optimiser les paramètres du navigateur');
  } else {
    console.log('\n❌ COOKIE INVALIDE');
    console.log('🔧 Actions requises:');
    console.log('   1. Connectez-vous à LinkedIn dans votre navigateur');
    console.log('   2. Récupérez un nouveau cookie li_at');
    console.log('   3. Mettez à jour la variable LINKEDIN_COOKIE dans .env');
  }
}

main().catch(console.error);