#!/usr/bin/env node

const https = require('https');
const { URL } = require('url');

async function testGoogleDirect() {
  console.log('🔍 TEST GOOGLE DIRECT - Vraies requêtes site:linkedin.com');
  console.log('='.repeat(60));
  
  const testQueries = [
    'site:linkedin.com/in/ "Global HRBP" Paris',
    'site:linkedin.com People Global HRBP Paris',
    'inurl:linkedin.com/in "Global HRBP"',
    'site:linkedin.com "Global HRBP" "Paris"'
  ];
  
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`\n${i + 1}. 🥷 Test: ${query}`);
    console.log('-'.repeat(50));
    
    try {
      const encodedQuery = encodeURIComponent(query);
      const googleUrl = `https://www.google.com/search?q=${encodedQuery}&hl=fr&gl=fr`;
      
      console.log(`📍 URL: ${googleUrl}`);
      
      const html = await makeRequest(googleUrl, userAgent);
      
      if (html.includes('sorry') || html.includes('unusual traffic')) {
        console.log('❌ Google rate limiting détecté');
        console.log('📄 Contenu reçu:', html.substring(0, 200) + '...');
      } else if (html.length < 1000) {
        console.log('⚠️ Réponse trop courte');
        console.log('📄 Contenu:', html);
      } else {
        console.log(`✅ Réponse Google reçue (${html.length} caractères)`);
        
        // Chercher les URLs LinkedIn
        const linkedinUrls = extractLinkedInUrls(html);
        console.log(`🔗 ${linkedinUrls.length} URLs LinkedIn trouvées:`);
        
        linkedinUrls.slice(0, 3).forEach((url, idx) => {
          console.log(`   ${idx + 1}. ${url}`);
        });
        
        // Analyser le contenu pour debug
        if (html.includes('linkedin.com')) {
          console.log('✅ Le mot "linkedin.com" est présent dans la réponse');
        } else {
          console.log('❌ Aucune mention de linkedin.com trouvée');
        }
      }
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
    
    // Délai entre requêtes
    if (i < testQueries.length - 1) {
      console.log('\n⏳ Attente 3 secondes...');
      await delay(3000);
    }
  }
}

function makeRequest(url, userAgent) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'identity', // Pas de compression pour le debug
        'DNT': '1',
        'Connection': 'close',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode} | Headers: ${JSON.stringify(res.headers)}`);
        resolve(data);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

function extractLinkedInUrls(html) {
  const regex = /https:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[0]);
  }
  
  return [...new Set(matches)]; // Remove duplicates
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testGoogleDirect().catch(console.error);