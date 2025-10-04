require('dotenv').config();
const linkedInScraper = require('./backend/services/linkedinScraper');
const googleSheetsService = require('./backend/services/googleSheets');

async function testLinkedInSearch() {
    console.log('\n🧪 Test de recherche LinkedIn avec Puppeteer\n');
    
    try {
        // 1. Vérifier le cookie
        const cookie = process.env.LINKEDIN_COOKIE;
        if (!cookie || cookie === 'PASTE_YOUR_LI_AT_COOKIE_HERE') {
            console.error('❌ Cookie LinkedIn non configuré!');
            console.log('\n📝 Pour configurer:');
            console.log('1. nano ~/prospection-system/.env');
            console.log('2. Remplacez PASTE_YOUR_LI_AT_COOKIE_HERE par votre cookie li_at');
            console.log('3. Sauvegardez et relancez ce script\n');
            return;
        }
        
        console.log('✅ Cookie trouvé dans .env');
        console.log('Cookie (preview):', cookie.substring(0, 20) + '...');
        
        // 2. Initialiser Puppeteer
        console.log('\n🎭 Initialisation de Puppeteer...');
        const initialized = await linkedInScraper.initialize(cookie);
        
        if (!initialized || !linkedInScraper.isAuthenticated) {
            console.error('❌ Échec de l\'authentification LinkedIn');
            console.log('Vérifiez que votre cookie est valide et non expiré');
            return;
        }
        
        console.log('✅ Connecté à LinkedIn avec succès!');
        
        // 3. Effectuer une recherche
        const query = 'CTO startup Paris';
        console.log(`\n🔍 Recherche: "${query}"...`);
        console.log('(Cela peut prendre 10-30 secondes)\n');
        
        const profiles = await linkedInScraper.searchProfiles(query, 5);
        
        // 4. Afficher les résultats
        console.log(`\n✅ ${profiles.length} profils trouvés:\n`);
        
        profiles.forEach((profile, i) => {
            console.log(`${i + 1}. ${profile.firstName} ${profile.lastName}`);
            console.log(`   ${profile.position} ${profile.company ? 'chez ' + profile.company : ''}`);
            console.log(`   📍 ${profile.location || 'Localisation non renseignée'}`);
            console.log(`   🔗 ${profile.linkedinUrl}`);
            console.log('');
        });
        
        // 5. Initialiser Google Sheets
        console.log('📄 Connexion à Google Sheets...');
        const sheetsConnected = await googleSheetsService.initialize();
        
        if (sheetsConnected) {
            await googleSheetsService.ensureStructure();
            console.log('✅ Google Sheets connecté!');
            console.log('🔗 URL:', googleSheetsService.getSpreadsheetUrl());
            
            // Proposer d'ajouter au CRM
            if (profiles.length > 0) {
                console.log('\n💾 Ajout du premier profil au CRM comme test...');
                const testProspect = {
                    ...profiles[0],
                    status: 'Nouveau',
                    notes: 'Import test depuis Puppeteer'
                };
                
                const success = await googleSheetsService.addProspect(testProspect);
                if (success) {
                    console.log('✅ Prospect ajouté avec succès au CRM!');
                }
            }
        }
        
    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        console.error(error);
    } finally {
        // Fermer Puppeteer
        console.log('\n🎬 Fermeture de Puppeteer...');
        await linkedInScraper.close();
        console.log('✅ Terminé!');
        process.exit(0);
    }
}

// Lancer le test
testLinkedInSearch();
