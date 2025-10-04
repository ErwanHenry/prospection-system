#!/usr/bin/env node

/**
 * Script de debug pour analyser la structure HTML de LinkedIn
 * et améliorer le parsing des profils
 */

require('dotenv').config();
const https = require('https');
const fs = require('fs').promises;

async function analyzeLinkedInStructure() {
  console.log('🔍 ANALYSE DE LA STRUCTURE HTML LINKEDIN');
  console.log('='.repeat(50));
  
  const cookie = process.env.LINKEDIN_COOKIE;
  
  if (!cookie) {
    console.log('❌ Cookie LinkedIn manquant');
    return;
  }
  
  try {
    // Faire une requête vers LinkedIn
    console.log('\n1️⃣ Récupération de la page LinkedIn...');
    
    // Tester d'abord avec la page feed pour valider l'accès
    console.log('   Test d\'accès via /feed/...');
    let feedHtml = await makeRequest('https://www.linkedin.com/feed/', cookie);
    
    if (feedHtml.startsWith('REDIRECT:')) {
      console.log('❌ Redirection détectée même sur /feed/, problème d\'authentification');
      return;
    }
    
    console.log('✅ Accès feed OK, tentative de recherche...');
    
    // Tester différentes approches
    let html = null;
    
    console.log('   Tentative 1: API Voyager LinkedIn...');
    try {
      let apiUrl = 'https://www.linkedin.com/voyager/api/search/hits?keywords=software%20engineer&count=10&filters=List(resultType-%3EPEOPLE)&origin=FACETED_SEARCH&q=all&start=0';
      let apiHtml = await makeRequest(apiUrl, cookie);
      console.log('✅ API Response length:', apiHtml.length);
      if (apiHtml.length > 1000) {
        html = apiHtml;
      }
    } catch (error) {
      console.log('❌ API failed:', error.message);
    }
    
    if (!html || html.length < 1000) {
      console.log('   Tentative 2: Version desktop avec headers adaptés...');
      try {
        html = await makeRequest('https://www.linkedin.com/search/results/people/?keywords=software%20engineer&origin=GLOBAL_SEARCH_HEADER', cookie);
      } catch (error) {
        console.log('❌ Desktop failed:', error.message);
        console.log('   Tentative 3: Version mobile...');
        html = await makeRequest('https://www.linkedin.com/m/search/results/people/?keywords=software%20engineer', cookie);
      }
    }
    
    // Gérer la redirection mobile
    if (html.startsWith('REDIRECT:')) {
      const desktopUrl = html.substring(9);
      console.log('🔄 Retry avec URL desktop:', desktopUrl);
      html = await makeRequest(desktopUrl, cookie);
    }
    
    console.log('✅ Page récupérée, taille:', html.length, 'caractères');
    
    // Sauvegarder le HTML pour analyse
    await fs.writeFile('linkedin_debug.html', html);
    console.log('✅ HTML sauvé dans linkedin_debug.html');
    
    // Analyser la structure
    console.log('\n2️⃣ Analyse de la structure...');
    
    // Chercher les liens de profil
    const profileLinks = html.match(/\/in\/[a-zA-Z0-9\-]+/g) || [];
    const uniqueProfileIds = [...new Set(profileLinks)];
    console.log(`🔗 ${uniqueProfileIds.length} profils uniques trouvés`);
    
    // Chercher les noms (spans avec aria-hidden)
    const nameMatches = html.match(/<span[^>]*aria-hidden="true"[^>]*>([^<]+)<\/span>/g) || [];
    const names = nameMatches
      .map(match => {
        const nameMatch = match.match(/>([^<]+)</);
        return nameMatch ? nameMatch[1].trim() : '';
      })
      .filter(name => name.length > 2 && !name.includes('LinkedIn') && !name.includes('View'))
      .slice(0, 10);
    
    console.log(`👤 ${names.length} noms extraits:`, names.slice(0, 5));
    
    // Chercher les sélecteurs de cartes
    const cardSelectors = [
      '.reusable-search__result-container',
      '.entity-result__item',
      '.search-result',
      '[data-chameleon-result-urn]',
      '.entity-result'
    ];
    
    console.log('\n3️⃣ Test des sélecteurs de cartes...');
    cardSelectors.forEach(selector => {
      const selectorRegex = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = html.match(selectorRegex) || [];
      console.log(`   ${selector}: ${matches.length} occurrences`);
    });
    
    // Chercher des patterns spécifiques
    console.log('\n4️⃣ Recherche de patterns spécifiques...');
    
    // Pattern pour les noms avec liens
    const nameWithLinkPattern = /<a[^>]+href="[^"]*\/in\/([^"\/\?]+)[\?"\/][^"]*"[^>]*>[\s\S]*?<span[^>]*aria-hidden="true"[^>]*>([^<]+)<\/span>/gi;
    let match;
    const profiles = [];
    
    while ((match = nameWithLinkPattern.exec(html)) && profiles.length < 5) {
      const linkedinId = match[1];
      const name = match[2].trim();
      
      if (name.length > 2) {
        profiles.push({
          linkedinId,
          name,
          url: `https://www.linkedin.com/in/${linkedinId}/`
        });
      }
    }
    
    console.log(`✅ ${profiles.length} profils extraits avec le nouveau pattern:`);
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.name} (${profile.linkedinId})`);
    });
    
    // Analyser la structure JSON intégrée
    console.log('\n5️⃣ Recherche de données JSON intégrées...');
    
    const jsonPatterns = [
      /window\.__APOLLO_STATE__\s*=\s*({.+?});/,
      /data-pre-rendered="([^"]+)"/,
      /"entities":\s*({.+?})/,
      /"elements":\s*(\[.+?\])/
    ];
    
    jsonPatterns.forEach((pattern, index) => {
      const jsonMatch = html.match(pattern);
      if (jsonMatch) {
        console.log(`   Pattern ${index + 1}: Données JSON trouvées (${jsonMatch[1].substring(0, 100)}...)`);
      } else {
        console.log(`   Pattern ${index + 1}: Aucune donnée JSON`);
      }
    });
    
    console.log('\n🎯 RECOMMANDATIONS POUR LE PARSING:');
    console.log('1. Utiliser le pattern regex amélioré pour extraire nom + ID');
    console.log('2. Fallback sur extraction simple d\'IDs LinkedIn + noms séparément');
    console.log('3. Améliorer la validation des noms extraits');
    
    return profiles;
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

function makeRequest(url, cookie) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'Cookie': `li_at=${cookie}`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/vnd.linkedin.normalized+json+2.1,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Referer': 'https://www.linkedin.com/',
        'Origin': 'https://www.linkedin.com',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else if (res.statusCode >= 300 && res.statusCode < 400) {
          // Gérer la redirection intelligemment
          const location = res.headers.location;
          if (location && location.includes('/m/')) {
            console.log('🔄 Redirection mobile détectée, retry avec version desktop');
            const desktopUrl = location.replace('/m/', '/');
            resolve(`REDIRECT:${desktopUrl}`);
          } else {
            reject(new Error(`Redirected to ${location}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

analyzeLinkedInStructure().catch(console.error);