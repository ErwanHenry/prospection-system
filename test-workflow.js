#!/usr/bin/env node

/**
 * Test complet du workflow prospection-system
 * Diagnostique et teste chaque étape du processus
 */

const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3000/api';

console.log('🧪 DÉBUT DES TESTS WORKFLOW COMPLET\n');

async function runTests() {
    const results = {
        systemHealth: null,
        linkedinSearch: null,
        crmAdd: null,
        crmData: null,
        emailGeneration: null,
        automationHealth: null,
        webInterface: null,
        errors: []
    };

    // Test 1: System Health
    try {
        console.log('📊 Test 1: System Health...');
        const response = await axios.get(`${API_URL}/health`);
        results.systemHealth = {
            success: true,
            data: response.data
        };
        console.log('✅ System Health OK');
        console.log(`   - Google Sheets: ${response.data.googleSheets}`);
        console.log(`   - LinkedIn: ${response.data.linkedin}`);
        console.log(`   - Status: ${response.data.status}\n`);
    } catch (error) {
        results.systemHealth = { success: false, error: error.message };
        results.errors.push('System Health failed');
        console.log('❌ System Health FAILED:', error.message, '\n');
    }

    // Test 2: LinkedIn Search
    try {
        console.log('🔍 Test 2: LinkedIn Search...');
        const searchData = {
            query: "HRBP Paris",
            limit: 2,
            method: "apollo"
        };
        
        const response = await axios.post(`${API_URL}/linkedin/search`, searchData);
        results.linkedinSearch = {
            success: response.data.success,
            count: response.data.results ? response.data.results.length : 0,
            data: response.data
        };
        
        if (response.data.success && response.data.results.length > 0) {
            console.log('✅ LinkedIn Search OK');
            console.log(`   - Found: ${response.data.results.length} profiles`);
            console.log(`   - First profile: ${response.data.results[0].name} @ ${response.data.results[0].company}`);
        } else {
            console.log('⚠️ LinkedIn Search returned no results');
            results.errors.push('LinkedIn Search returned no results');
        }
        console.log('');
    } catch (error) {
        results.linkedinSearch = { success: false, error: error.message };
        results.errors.push('LinkedIn Search failed');
        console.log('❌ LinkedIn Search FAILED:', error.message, '\n');
    }

    // Test 3: Add to CRM
    try {
        console.log('📝 Test 3: Add to CRM...');
        const testProspect = {
            name: "Test Workflow User",
            title: "HRBP Test",
            company: "Test Workflow Company",
            location: "Paris, France",
            linkedinUrl: "https://www.linkedin.com/in/test-workflow-user",
            email: "test.workflow@example.com",
            phone: "+33123456789",
            score: 98,
            tags: "Test Workflow HRBP"
        };
        
        const response = await axios.post(`${API_URL}/linkedin/add-to-crm`, {
            prospects: [testProspect]
        });
        
        results.crmAdd = {
            success: response.data.success,
            added: response.data.added,
            data: response.data
        };
        
        if (response.data.success) {
            console.log('✅ Add to CRM OK');
            console.log(`   - Added: ${response.data.added} prospects`);
        } else {
            console.log('❌ Add to CRM FAILED');
            results.errors.push('Add to CRM failed');
        }
        console.log('');
    } catch (error) {
        results.crmAdd = { success: false, error: error.message };
        results.errors.push('Add to CRM failed');
        console.log('❌ Add to CRM FAILED:', error.message, '\n');
    }

    // Test 4: CRM Data Retrieval
    try {
        console.log('📊 Test 4: CRM Data Retrieval...');
        const response = await axios.get(`${API_URL}/sheets/data`);
        results.crmData = {
            success: response.data.success,
            count: response.data.data ? response.data.data.length : 0,
            data: response.data
        };
        
        if (response.data.success) {
            console.log('✅ CRM Data Retrieval OK');
            console.log(`   - Total entries: ${response.data.data.length}`);
            
            if (response.data.data.length > 1) {
                const sampleRow = response.data.data[1]; // Skip header
                console.log(`   - Sample entry: ${sampleRow[2]} (${sampleRow[3]}) @ ${sampleRow[4]}`);
            }
        } else {
            console.log('❌ CRM Data Retrieval FAILED');
            results.errors.push('CRM Data Retrieval failed');
        }
        console.log('');
    } catch (error) {
        results.crmData = { success: false, error: error.message };
        results.errors.push('CRM Data Retrieval failed');
        console.log('❌ CRM Data Retrieval FAILED:', error.message, '\n');
    }

    // Test 5: Email Generation
    try {
        console.log('🤖 Test 5: AI Email Generation...');
        const testProspect = {
            name: "Marie Dubois",
            title: "HRBP",
            company: "L'Oréal",
            location: "Paris, France",
            linkedinUrl: "https://www.linkedin.com/in/marie-dubois-loreal",
            tags: "HRBP Paris Test"
        };
        
        const response = await axios.post(`${API_URL}/automation/generate-email`, {
            prospect: testProspect
        });
        
        results.emailGeneration = {
            success: response.data.success,
            profileAnalyzed: response.data.profileAnalyzed,
            data: response.data
        };
        
        if (response.data.success) {
            console.log('✅ AI Email Generation OK');
            console.log(`   - Profile analyzed: ${response.data.profileAnalyzed ? 'Yes' : 'No'}`);
            console.log(`   - Subject: ${response.data.email.subject}`);
            console.log(`   - Content length: ${response.data.email.content.length} chars`);
        } else {
            console.log('❌ AI Email Generation FAILED');
            results.errors.push('AI Email Generation failed');
        }
        console.log('');
    } catch (error) {
        results.emailGeneration = { success: false, error: error.message };
        results.errors.push('AI Email Generation failed');
        console.log('❌ AI Email Generation FAILED:', error.message, '\n');
    }

    // Test 6: Automation Health
    try {
        console.log('🤖 Test 6: Automation Health...');
        const response = await axios.get(`${API_URL}/automation/health`);
        results.automationHealth = {
            success: true,
            data: response.data
        };
        
        console.log('✅ Automation Health OK');
        console.log(`   - Status: ${response.data.status}`);
        console.log(`   - Email configured: ${response.data.emailConfigured}`);
        console.log(`   - Follow-ups scheduled: ${response.data.followUpsScheduled}`);
        console.log(`   - Features: ${response.data.features.length}`);
        console.log('');
    } catch (error) {
        results.automationHealth = { success: false, error: error.message };
        results.errors.push('Automation Health failed');
        console.log('❌ Automation Health FAILED:', error.message, '\n');
    }

    // Test 7: Web Interface
    try {
        console.log('🌐 Test 7: Web Interface...');
        const response = await axios.get('http://localhost:3000');
        results.webInterface = {
            success: response.status === 200,
            status: response.status,
            contentLength: response.data.length
        };
        
        if (response.status === 200) {
            console.log('✅ Web Interface OK');
            console.log(`   - Status: ${response.status}`);
            console.log(`   - Content length: ${response.data.length} bytes`);
        } else {
            console.log('❌ Web Interface FAILED');
            results.errors.push('Web Interface failed');
        }
        console.log('');
    } catch (error) {
        results.webInterface = { success: false, error: error.message };
        results.errors.push('Web Interface failed');
        console.log('❌ Web Interface FAILED:', error.message, '\n');
    }

    // Résumé final
    console.log('=' .repeat(60));
    console.log('📋 RÉSUMÉ DES TESTS:');
    console.log('=' .repeat(60));
    
    const tests = [
        ['System Health', results.systemHealth?.success],
        ['LinkedIn Search', results.linkedinSearch?.success],
        ['Add to CRM', results.crmAdd?.success],
        ['CRM Data Retrieval', results.crmData?.success],
        ['AI Email Generation', results.emailGeneration?.success],
        ['Automation Health', results.automationHealth?.success],
        ['Web Interface', results.webInterface?.success]
    ];
    
    let passedTests = 0;
    tests.forEach(([testName, success]) => {
        const status = success ? '✅ PASS' : '❌ FAIL';
        console.log(`${testName.padEnd(25)} : ${status}`);
        if (success) passedTests++;
    });
    
    console.log('=' .repeat(60));
    console.log(`🎯 RÉSULTAT GLOBAL: ${passedTests}/${tests.length} tests réussis`);
    
    if (results.errors.length > 0) {
        console.log('❌ ERREURS DÉTECTÉES:');
        results.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
    }
    
    if (passedTests === tests.length) {
        console.log('🎉 TOUS LES TESTS SONT RÉUSSIS! Le workflow est opérationnel.');
    } else {
        console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
    }
    
    // Sauvegarder les résultats
    fs.writeFileSync('./test-results.json', JSON.stringify(results, null, 2));
    console.log('💾 Résultats sauvegardés dans test-results.json');
    
    return results;
}

// Lancer les tests
runTests().catch(console.error);