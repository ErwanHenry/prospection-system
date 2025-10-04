require('dotenv').config();
const linkedInScraper = require('./backend/services/linkedinScraper');

async function testBraveLinkedIn() {
    console.log('\n🧪 Test LinkedIn avec Brave Browser\n');
    
    try {
        // Vérifier le cookie
        const cookie = process.env.LINKEDIN_COOKIE;
        if (!cookie || cookie === 'PASTE_YOUR_LI_AT_COOKIE_HERE') {
            console.error('❌ Cookie LinkedIn non configuré!');
            return;
        }
        
        console.log('✅ Cookie trouvé (longueur:', cookie.length, 'caractères)');
        
        // Initialiser avec Brave
        console.log('\n🎭 Lancement de Brave Browser...');
        console.log('(Une fenêtre Brave va s\'ouvrir)');
        
        const initialized = await linkedInScraper.initialize(cookie);
        
        if (!initialized) {
            console.error('❌ Échec de l\'initialisation');
            return;
        }
        
        if (!linkedInScraper.isAuthenticated) {
            console.error('❌ Authentification échouée - Vérifiez votre cookie');
            console.log('\nPour obtenir un nouveau cookie:');
            console.log('1. Connectez-vous à LinkedIn dans Brave');
            console.log('2. Ouvrez les Developer Tools (F12)');
            console.log('3. Application > Cookies > linkedin.com');
            console.log('4. Copiez la valeur de "li_at"');
            return;
        }
        
        console.log('✅ Connecté à LinkedIn via Brave!');
        
        // Test de recherche
        console.log('\n🔍 Test de recherche: "Global HRBP"');
        console.log('Patientez pendant le scraping...');
        
        const profiles = await linkedInScraper.searchProfiles('Global HRBP', 5);
        
        console.log(`\n✅ ${profiles.length} profils trouvés:`);
        profiles.forEach((p, i) => {
            console.log(`\n${i + 1}. ${p.firstName} ${p.lastName}`);
            console.log(`   ${p.position} - ${p.company}`);
            console.log(`   📍 ${p.location}`);
        });
        
        console.log('\n🎉 Test réussi!');
        
    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        console.error(error.stack);
    } finally {
        console.log('\n🎬 Fermeture de Brave...');
        await linkedInScraper.close();
        process.exit(0);
    }
}

testBraveLinkedIn();
