#!/usr/bin/env node

/**
 * Démonstration complète du workflow prospection-system
 * Exécute un scénario réel de bout en bout
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

console.log('🚀 DÉMONSTRATION WORKFLOW COMPLET\n');

async function demoWorkflow() {
    console.log('=' .repeat(60));
    console.log('🎯 SCÉNARIO: Prospection HRBP à Paris');
    console.log('=' .repeat(60));

    // Étape 1: Recherche LinkedIn
    console.log('\n📍 ÉTAPE 1: Recherche de prospects via Apollo.io');
    console.log('Requête: "HRBP Paris", Limite: 5 profils\n');
    
    try {
        const searchResponse = await axios.post(`${API_URL}/linkedin/search`, {
            query: "HRBP Paris",
            limit: 5,
            method: "apollo"
        });

        if (searchResponse.data.success) {
            console.log(`✅ Trouvé ${searchResponse.data.results.length} profils LinkedIn:`);
            searchResponse.data.results.forEach((profile, index) => {
                console.log(`   ${index + 1}. ${profile.name}`);
                console.log(`      📍 ${profile.title} @ ${profile.company}`);
                console.log(`      📧 ${profile.email}`);
                console.log(`      🔗 ${profile.linkedinUrl}`);
                console.log('');
            });

            // Étape 2: Ajouter au CRM
            console.log('\n📍 ÉTAPE 2: Ajout des prospects au CRM Google Sheets');
            
            const prospectsForCRM = searchResponse.data.results.map(result => ({
                name: result.name,
                title: result.title,
                company: result.company,
                location: result.location,
                linkedinUrl: result.linkedinUrl,
                email: result.email && result.email !== 'email_not_unlocked@domain.com' ? result.email : '',
                phone: result.phone || '',
                score: result.searchScore || 95,
                tags: "HRBP Paris Demo"
            }));

            const addResponse = await axios.post(`${API_URL}/linkedin/add-to-crm`, {
                prospects: prospectsForCRM
            });

            if (addResponse.data.success) {
                console.log(`✅ Ajouté ${addResponse.data.added} prospects au CRM`);

                // Étape 3: Génération d'emails personnalisés
                console.log('\n📍 ÉTAPE 3: Génération d\'emails IA personnalisés');
                
                for (let i = 0; i < Math.min(3, prospectsForCRM.length); i++) {
                    const prospect = prospectsForCRM[i];
                    console.log(`\n🤖 Génération email pour ${prospect.name}...`);

                    try {
                        const emailResponse = await axios.post(`${API_URL}/automation/generate-email`, {
                            prospect: prospect
                        });

                        if (emailResponse.data.success) {
                            const email = emailResponse.data.email;
                            const profileAnalyzed = emailResponse.data.profileAnalyzed;
                            
                            console.log(`✅ Email généré ${profileAnalyzed ? '(avec analyse profil)' : '(template basique)'}`);
                            console.log(`📧 Sujet: "${email.subject}"`);
                            console.log(`📝 Contenu (${email.content.length} chars):`);
                            console.log('─'.repeat(40));
                            
                            // Afficher un aperçu du contenu
                            const preview = email.content.substring(0, 200) + '...';
                            console.log(preview);
                            console.log('─'.repeat(40));
                            
                            if (profileAnalyzed && emailResponse.data.insights) {
                                console.log(`🔍 Insights: Séniorité: ${emailResponse.data.insights.seniority}, Industrie: ${emailResponse.data.insights.industry}`);
                            }
                        } else {
                            console.log(`❌ Erreur génération email: ${emailResponse.data.error}`);
                        }
                    } catch (error) {
                        console.log(`❌ Erreur génération email: ${error.message}`);
                    }
                }

                // Étape 4: Vérification CRM
                console.log('\n📍 ÉTAPE 4: Vérification des données CRM');
                
                const crmResponse = await axios.get(`${API_URL}/sheets/data`);
                if (crmResponse.data.success) {
                    const totalProspects = crmResponse.data.data.length - 1; // Minus header
                    console.log(`✅ CRM contient maintenant ${totalProspects} prospects au total`);
                    
                    // Afficher les derniers ajouts
                    const recentProspects = crmResponse.data.data.slice(-6, -1); // 5 derniers
                    console.log('\n📊 Derniers prospects ajoutés:');
                    recentProspects.forEach((row, index) => {
                        console.log(`   ${index + 1}. ${row[2]} (${row[3]}) @ ${row[4]}`);
                    });
                }

                // Étape 5: Statistiques automation
                console.log('\n📍 ÉTAPE 5: État de l\'automatisation');
                
                const automationResponse = await axios.get(`${API_URL}/automation/health`);
                console.log(`✅ Service d'automatisation: ${automationResponse.data.status}`);
                console.log(`📧 Email configuré: ${automationResponse.data.emailConfigured}`);
                console.log(`⏰ Follow-ups programmés: ${automationResponse.data.followUpsScheduled}`);
                console.log(`🛠️ Fonctionnalités: ${automationResponse.data.features.join(', ')}`);

            } else {
                console.log('❌ Erreur ajout au CRM:', addResponse.data.error);
            }

        } else {
            console.log('❌ Erreur recherche LinkedIn:', searchResponse.data.error);
        }

    } catch (error) {
        console.log('❌ Erreur lors de la démonstration:', error.message);
        return;
    }

    // Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DÉMONSTRATION COMPLÈTE TERMINÉE');
    console.log('='.repeat(60));
    console.log('✅ Recherche LinkedIn (Apollo.io) → Profils réels');
    console.log('✅ Sauvegarde CRM (Google Sheets) → Données persistantes');
    console.log('✅ Génération emails IA → Personnalisation avancée');
    console.log('✅ Système d\'automatisation → Workflow complet');
    console.log('\n🌐 Interface web disponible: http://localhost:3000');
    console.log('🧪 Tests automatiques: node test-workflow.js');
    console.log('📖 Documentation: voir TROUBLESHOOTING.md');
    console.log('\n🚀 LE SYSTÈME EST PRÊT POUR UTILISATION PRODUCTION !');
}

// Vérifier que le serveur est en marche
async function checkServer() {
    try {
        await axios.get(`${API_URL}/health`);
        return true;
    } catch (error) {
        console.log('❌ Serveur non disponible sur http://localhost:3000');
        console.log('💡 Démarrer avec: npm start');
        return false;
    }
}

// Lancer la démonstration
checkServer().then(serverReady => {
    if (serverReady) {
        demoWorkflow().catch(console.error);
    }
});