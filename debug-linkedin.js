// debug-linkedin.js
// Script pour diagnostiquer les problèmes de connexion LinkedIn

require('dotenv').config();

async function debugLinkedIn() {
    console.log('\n🔍 Diagnostic du système LinkedIn\n');
    
    // 1. Vérifier le cookie
    const cookie = process.env.LINKEDIN_COOKIE;
    console.log('1️⃣ Cookie LinkedIn:');
    if (!cookie) {
        console.log('   ❌ Aucun cookie trouvé dans .env');
    } else if (cookie === 'PASTE_YOUR_LI_AT_COOKIE_HERE') {
        console.log('   ❌ Cookie placeholder, non configuré');
    } else {
        console.log('   ✅ Cookie trouvé:', cookie.substring(0, 20) + '...');
    }
    
    // 2. Vérifier les processus
    console.log('\n2️⃣ Processus en cours:');
    const { exec } = require('child_process');
    
    exec('ps aux | grep -E "node|chrome" | grep -v grep', (error, stdout) => {
        if (stdout) {
            console.log('   Processus trouvés:');
            stdout.split('\n').forEach(line => {
                if (line.includes('node')) console.log('   - Node:', line.substring(0, 80));
                if (line.includes('chrome')) console.log('   - Chrome:', line.substring(0, 80));
            });
        } else {
            console.log('   ✅ Aucun processus node/chrome en cours');
        }
    });
    
    // 3. Vérifier Puppeteer
    console.log('\n3️⃣ Test Puppeteer simple:');
    try {
        const puppeteer = require('puppeteer');
        console.log('   ✅ Puppeteer installé');
        
        // Test rapide
        console.log('   🧪 Lancement d\'un navigateur test...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto('https://www.google.com', { timeout: 10000 });
        console.log('   ✅ Navigation Google OK');
        
        await browser.close();
        console.log('   ✅ Fermeture OK');
        
    } catch (error) {
        console.log('   ❌ Erreur Puppeteer:', error.message);
    }
    
    // 4. Vérifier les ports
    console.log('\n4️⃣ Ports utilisés:');
    exec('lsof -i :3000 -i :3001', (error, stdout) => {
        if (stdout) {
            console.log('   Ports occupés:', stdout);
        } else {
            console.log('   ✅ Ports 3000 et 3001 libres');
        }
    });
    
    // 5. Solutions proposées
    console.log('\n💡 Solutions recommandées:');
    console.log('   1. Tuer tous les processus: pkill -f "node|chrome"');
    console.log('   2. Vérifier le cookie: nano .env');
    console.log('   3. Redémarrer proprement: npm start');
    console.log('   4. Mode debug: Mettre headless: false dans linkedinScraper.js');
    
    process.exit(0);
}

debugLinkedIn();
