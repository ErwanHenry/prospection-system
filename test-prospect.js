const googleSheetsService = require('./backend/services/googleSheets');

async function test() {
    console.log('\n🧪 Test d\'ajout de prospect dans Google Sheets\n');
    
    // Initialiser
    const connected = await googleSheetsService.initialize();
    if (!connected) {
        console.error('❌ Impossible de se connecter à Google Sheets');
        return;
    }
    
    // Vérifier la structure
    await googleSheetsService.ensureStructure();
    
    // Ajouter un prospect de test
    const testProspect = {
        firstName: 'Jean',
        lastName: 'Dupont',
        company: 'TechCorp',
        position: 'CTO',
        linkedinUrl: 'https://linkedin.com/in/jeandupont',
        email: 'jean.dupont@techcorp.com',
        status: 'Nouveau'
    };
    
    console.log('\n👤 Ajout du prospect:', testProspect.firstName, testProspect.lastName);
    const success = await googleSheetsService.addProspect(testProspect);
    
    if (success) {
        console.log('\n✅ Prospect ajouté avec succès!');
        console.log('\n🔗 Vérifiez le spreadsheet:');
        console.log(googleSheetsService.getSpreadsheetUrl());
        
        // Lire tous les prospects
        console.log('\n📋 Liste des prospects:');
        const prospects = await googleSheetsService.getProspects();
        console.table(prospects);
    } else {
        console.error('\n❌ Erreur lors de l\'ajout');
    }
    
    process.exit(0);
}

test();
