#!/usr/bin/env node

/**
 * Script de diagnostic LinkedIn complet
 * Teste et répare les problèmes de scraping LinkedIn
 */

require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function diagnosticLinkedIn() {
  console.log('🔍 DIAGNOSTIC LINKEDIN SCRAPER');
  console.log('='.repeat(50));
  
  let browser = null;
  let page = null;
  
  try {
    // 1. Vérifier la configuration
    console.log('\n1️⃣ VÉRIFICATION DE LA CONFIGURATION');
    console.log('-'.repeat(40));
    
    const linkedinCookie = process.env.LINKEDIN_COOKIE;
    const linkedinEmail = process.env.LINKEDIN_EMAIL;
    
    if (!linkedinCookie) {
      console.log('❌ LINKEDIN_COOKIE manquant dans le fichier .env');
      console.log('💡 Solution: Suivez le guide LINKEDIN_COOKIE_GUIDE.md');
      return false;
    }
    
    console.log('✅ Cookie LinkedIn trouvé:', linkedinCookie.substring(0, 20) + '...');
    console.log('✅ Email LinkedIn:', linkedinEmail || 'Non configuré');
    
    // 2. Test de connexion basique
    console.log('\n2️⃣ TEST DE CONNEXION NAVIGATEUR');
    console.log('-'.repeat(40));
    
    browser = await puppeteer.launch({
      headless: false, // Mode visible pour debug
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--window-size=1366,768',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
      defaultViewport: { width: 1366, height: 768 }
    });
    
    console.log('✅ Navigateur Chrome lancé en mode visible');
    
    page = await browser.newPage();
    
    // 3. Configuration des cookies
    console.log('\n3️⃣ CONFIGURATION DES COOKIES');
    console.log('-'.repeat(40));
    
    await page.goto('https://www.linkedin.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('✅ Navigation vers LinkedIn réussie');
    
    await page.setCookie({
      name: 'li_at',
      value: linkedinCookie,
      domain: '.linkedin.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    });
    
    console.log('✅ Cookie LinkedIn configuré');
    
    // 4. Test d'authentification
    console.log('\n4️⃣ TEST D\'AUTHENTIFICATION');
    console.log('-'.repeat(40));
    
    await page.reload({ waitUntil: 'networkidle2', timeout: 15000 });
    
    // Attendre et vérifier si on est connecté
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('📍 URL actuelle:', currentUrl);
    
    // Vérifier les signes de connexion
    const isLoggedIn = await page.evaluate(() => {
      // Vérifier si on n'est PAS sur une page de login/guest
      const isGuest = document.querySelector('.guest-homepage') || 
                     document.querySelector('[data-test-id=\"guest-homepage\"]') ||
                     document.querySelector('input[name=\"session_key\"]') ||
                     document.querySelector('.sign-in-form');
      
      // Vérifier si on a des éléments de navigation connecté
      const hasNavigation = document.querySelector('nav') || 
                           document.querySelector('[data-control-name=\"nav\"]') ||
                           document.querySelector('.global-nav');
      
      console.log('Guest homepage detected:', !!isGuest);
      console.log('Navigation detected:', !!hasNavigation);
      
      return !isGuest && hasNavigation;
    });
    
    if (isLoggedIn) {
      console.log('✅ AUTHENTIFICATION RÉUSSIE - Vous êtes connecté !');
    } else {
      console.log('❌ AUTHENTIFICATION ÉCHOUÉE - Pas connecté');
      console.log('💡 Le cookie LinkedIn est probablement expiré');
      
      // Capturer une capture d'écran pour diagnostic
      await page.screenshot({ path: 'linkedin_debug.png', fullPage: false });
      console.log('📸 Capture d\'écran sauvée: linkedin_debug.png');
      
      // Essayer de naviguer vers le feed
      console.log('🔄 Tentative de navigation vers le feed...');
      try {
        await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 10000 });
        
        const feedUrl = page.url();
        console.log('📍 URL du feed:', feedUrl);
        
        if (feedUrl.includes('/feed/')) {
          console.log('✅ Accès au feed réussi - Authentication OK !');
        } else {
          console.log('❌ Redirection détectée - Cookie invalide');
        }
      } catch (error) {
        console.log('❌ Impossible d\'accéder au feed:', error.message);
      }
    }
    
    // 5. Test de recherche
    if (isLoggedIn) {
      console.log('\n5️⃣ TEST DE RECHERCHE');
      console.log('-'.repeat(40));
      
      try {
        const searchUrl = 'https://www.linkedin.com/search/results/people/?keywords=software%20engineer&origin=GLOBAL_SEARCH_HEADER';
        console.log('🔍 Navigation vers la recherche...');
        
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 20000 });
        
        console.log('✅ Page de recherche chargée');
        
        // Attendre les résultats
        await page.waitForTimeout(3000);
        
        // Vérifier la présence de résultats
        const hasResults = await page.evaluate(() => {
          const selectors = [
            '.reusable-search__result-container',
            '.search-result__wrapper',
            '[data-chameleon-result-urn]',
            '.entity-result'
          ];
          
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              console.log(`Trouvé ${elements.length} résultats avec selector: ${selector}`);
              return true;
            }
          }
          return false;
        });
        
        if (hasResults) {
          console.log('✅ RÉSULTATS DE RECHERCHE TROUVÉS !');
          
          // Extraire quelques profils de test
          const profiles = await page.evaluate(() => {
            const results = [];
            const cards = document.querySelectorAll('.reusable-search__result-container, .entity-result, [data-chameleon-result-urn]');
            
            for (let i = 0; i < Math.min(cards.length, 3); i++) {
              const card = cards[i];
              
              const nameElement = card.querySelector('.entity-result__title-text a span[aria-hidden=\"true\"], .actor-name-with-distance span[aria-hidden=\"true\"]');
              const linkElement = card.querySelector('.entity-result__title-text a, a[data-control-name=\"search_srp_result\"]');
              const titleElement = card.querySelector('.entity-result__primary-subtitle');
              
              if (nameElement && linkElement) {
                results.push({
                  name: nameElement.innerText.trim(),
                  title: titleElement ? titleElement.innerText.trim() : '',
                  linkedinUrl: linkElement.href.split('?')[0]
                });
              }
            }
            
            return results;
          });
          
          console.log(`✅ ${profiles.length} profils extraits avec succès:`);
          profiles.forEach((profile, index) => {
            console.log(`   ${index + 1}. ${profile.name} - ${profile.title}`);
          });
          
        } else {
          console.log('❌ Aucun résultat de recherche trouvé');
          await page.screenshot({ path: 'linkedin_search_debug.png', fullPage: false });
          console.log('📸 Capture de la recherche: linkedin_search_debug.png');
        }
        
      } catch (error) {
        console.log('❌ Erreur lors du test de recherche:', error.message);
      }
    }
    
    // 6. Recommandations
    console.log('\n6️⃣ RECOMMANDATIONS');
    console.log('-'.repeat(40));
    
    if (!isLoggedIn) {
      console.log('🔧 POUR RÉPARER LE COOKIE:');
      console.log('   1. Ouvrez https://www.linkedin.com dans votre navigateur');
      console.log('   2. Connectez-vous à votre compte');
      console.log('   3. Ouvrez les outils de développement (F12)');
      console.log('   4. Allez dans Application > Cookies > linkedin.com');
      console.log('   5. Copiez la valeur du cookie \"li_at\"');
      console.log('   6. Mettez à jour LINKEDIN_COOKIE dans le fichier .env');
      console.log('');
      console.log('💡 CONSEIL: Le cookie expire généralement tous les 30 jours');
    } else {
      console.log('✅ Le scraper LinkedIn devrait fonctionner correctement !');
      console.log('🚀 Vous pouvez maintenant utiliser l\'interface web');
    }
    
    return isLoggedIn;
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    return false;
  } finally {
    console.log('\n🧹 Nettoyage...');
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// Fonction pour mettre à jour automatiquement le cookie
async function updateCookieFromBrowser() {
  console.log('\n🍪 AIDE À LA MISE À JOUR DU COOKIE');
  console.log('-'.repeat(50));
  console.log('');
  console.log('Pour obtenir un nouveau cookie LinkedIn:');
  console.log('');
  console.log('1. Ouvrez votre navigateur et allez sur https://www.linkedin.com');
  console.log('2. Connectez-vous si ce n\'est pas déjà fait');
  console.log('3. Appuyez sur F12 pour ouvrir les outils de développement');
  console.log('4. Allez dans l\'onglet \"Application\" ou \"Storage\"');
  console.log('5. Cliquez sur \"Cookies\" puis sur \"https://www.linkedin.com\"');
  console.log('6. Trouvez le cookie nommé \"li_at\"');
  console.log('7. Copiez sa VALEUR (pas le nom)');
  console.log('8. Remplacez la valeur de LINKEDIN_COOKIE dans le fichier .env');
  console.log('');
  console.log('⚠️  IMPORTANT: Ne partagez jamais votre cookie LinkedIn !');
  console.log('');
}

// Exécution du script
async function main() {
  console.log('🎯 DIAGNOSTIC COMPLET DU SCRAPER LINKEDIN');
  console.log('');
  
  const success = await diagnosticLinkedIn();
  
  if (!success) {
    await updateCookieFromBrowser();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Diagnostic terminé');
}

if (require.main === module) {
  main().catch(console.error);
}