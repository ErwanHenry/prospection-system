const axios = require('axios');
const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api';

async function testAllRequirements() {
    console.log('🧪 COMPREHENSIVE REQUIREMENTS VALIDATION');
    console.log('='.repeat(60));
    
    const results = {
        logs: { passed: false, details: [] },
        crmPersistence: { passed: false, details: [] },
        sequenceButton: { passed: false, details: [] },
        parameterValidation: { passed: false, details: [] },
        crmLocation: { passed: false, details: [] }
    };

    try {
        // ===== REQUIREMENT 1: LOGGING SYSTEM =====
        console.log('\n🔍 TESTING REQUIREMENT 1: Comprehensive Logging');
        console.log('-'.repeat(40));
        
        // Test API logs endpoint
        const logsResponse = await axios.get(`${API_URL}/logs?limit=10`);
        if (logsResponse.data.success && logsResponse.data.logs.length > 0) {
            results.logs.details.push('✅ API logs endpoint working');
            results.logs.details.push(`✅ ${logsResponse.data.logs.length} log entries retrieved`);
            
            // Check log structure
            const log = logsResponse.data.logs[0];
            if (log.timestamp && log.level && log.component && log.message) {
                results.logs.details.push('✅ Log entries have proper structure (timestamp, level, component, message)');
            }
            
            // Test different log levels
            const levels = [...new Set(logsResponse.data.logs.map(l => l.level))];
            results.logs.details.push(`✅ Multiple log levels present: ${levels.join(', ')}`);
            
            results.logs.passed = true;
        } else {
            results.logs.details.push('❌ Logs API not working properly');
        }

        // Test log files
        try {
            const fs = require('fs');
            const logFiles = fs.readdirSync('./logs');
            if (logFiles.length > 0) {
                results.logs.details.push(`✅ Log files created: ${logFiles.join(', ')}`);
            }
        } catch (error) {
            results.logs.details.push('⚠️ Log files directory not accessible');
        }

        // ===== REQUIREMENT 2: CRM DATA PERSISTENCE =====
        console.log('\n🔍 TESTING REQUIREMENT 2: CRM Data Persistence');
        console.log('-'.repeat(40));
        
        // Test Google Sheets integration
        const prospectsResponse = await axios.get(`${API_URL}/prospects`);
        if (prospectsResponse.data.success && prospectsResponse.data.prospects.length > 0) {
            results.crmPersistence.details.push(`✅ ${prospectsResponse.data.prospects.length} prospects persisted in CRM`);
            
            // Check prospect data structure
            const prospect = prospectsResponse.data.prospects[0];
            const requiredFields = ['id', 'name', 'company', 'title', 'linkedinUrl', 'location', 'dateAdded', 'status'];
            const hasAllFields = requiredFields.every(field => prospect.hasOwnProperty(field));
            
            if (hasAllFields) {
                results.crmPersistence.details.push('✅ Prospects have all required fields');
                results.crmPersistence.details.push(`✅ Sample: ${prospect.name} at ${prospect.company}`);
                results.crmPersistence.passed = true;
            } else {
                results.crmPersistence.details.push('❌ Prospects missing required fields');
            }
        } else {
            results.crmPersistence.details.push('❌ No prospects found in CRM or API not working');
        }

        // Test raw Google Sheets data
        const sheetsResponse = await axios.get(`${API_URL}/sheets/data`);
        if (sheetsResponse.data.success && sheetsResponse.data.data.length > 0) {
            const headers = sheetsResponse.data.data[0];
            const expectedHeaders = ['ID', 'Nom', 'Entreprise', 'Poste', 'LinkedIn URL', 'Localisation', 'Date d\'ajout', 'Statut', 'Message envoyé', 'Nb relances', 'Notes'];
            const hasCorrectHeaders = expectedHeaders.every(header => headers.includes(header));
            
            if (hasCorrectHeaders) {
                results.crmPersistence.details.push('✅ Google Sheets has correct French headers');
            } else {
                results.crmPersistence.details.push('❌ Google Sheets headers incorrect');
            }
        }

        // ===== REQUIREMENT 3: SEQUENCE BUTTON IN CRM FRAME =====
        console.log('\n🔍 TESTING REQUIREMENT 3: Sequence Button in CRM Frame');
        console.log('-'.repeat(40));
        
        // Launch browser to test UI
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(BASE_URL);
        await page.waitForTimeout(3000); // Wait for page to load
        
        // Check if sequence button is NOT in LinkedIn search section
        const linkedinSearchSection = await page.$('#searchResults .btn-sequence');
        if (!linkedinSearchSection) {
            results.sequenceButton.details.push('✅ Sequence button NOT in LinkedIn search section');
        } else {
            results.sequenceButton.details.push('❌ Sequence button still in LinkedIn search section');
        }
        
        // Check if sequence button IS in CRM section
        const crmSequenceButton = await page.$('#runFullSequence');
        if (crmSequenceButton) {
            results.sequenceButton.details.push('✅ Sequence button found in CRM section');
            
            // Check if it's in the right container
            const crmSection = await page.$('.sequence-controls #runFullSequence');
            if (crmSection) {
                results.sequenceButton.details.push('✅ Sequence button in sequence-controls container');
                results.sequenceButton.passed = true;
            }
        } else {
            results.sequenceButton.details.push('❌ Sequence button not found in CRM section');
        }

        // ===== REQUIREMENT 4: PARAMETER VALIDATION =====
        console.log('\n🔍 TESTING REQUIREMENT 4: Parameter Validation');
        console.log('-'.repeat(40));
        
        // Test validation elements exist
        const validationButton = await page.$('#validateSequence');
        const emailContext = await page.$('#emailContext');
        const linkedinTemplate = await page.$('#linkedinTemplate');
        const sequenceStatus = await page.$('#sequenceStatus');
        
        if (validationButton && emailContext && linkedinTemplate && sequenceStatus) {
            results.parameterValidation.details.push('✅ All validation UI elements present');
            
            // Test validation logic by clearing required fields
            await page.evaluate(() => {
                document.getElementById('emailContext').value = '';
                document.getElementById('linkedinTemplate').value = '';
            });
            
            // Click validate button
            await page.click('#validateSequence');
            await page.waitForTimeout(1000);
            
            // Check if validation messages appear
            const validationMessages = await page.$$('.validation-message.error');
            if (validationMessages.length > 0) {
                results.parameterValidation.details.push(`✅ Validation errors displayed: ${validationMessages.length} messages`);
                
                // Check if sequence button is disabled
                const isDisabled = await page.$eval('#runFullSequence', button => button.disabled);
                if (isDisabled) {
                    results.parameterValidation.details.push('✅ Sequence button disabled when validation fails');
                    results.parameterValidation.passed = true;
                }
            }
        } else {
            results.parameterValidation.details.push('❌ Validation UI elements missing');
        }

        // ===== REQUIREMENT 5: CRM LOCATION CONFIRMATION =====
        console.log('\n🔍 TESTING REQUIREMENT 5: Button in CRM Frame (Not LinkedIn Search)');
        console.log('-'.repeat(40));
        
        // Scroll to CRM section
        await page.evaluate(() => {
            const crmSection = document.querySelector('.sequence-controls');
            if (crmSection) {
                crmSection.scrollIntoView();
            }
        });
        
        // Take screenshot of CRM section
        await page.screenshot({ 
            path: 'crm-sequence-section.png', 
            fullPage: false,
            clip: { x: 0, y: 400, width: 1200, height: 600 }
        });
        
        // Verify sequence controls are in CRM section and not search section
        const sequenceControlsInCRM = await page.$('.card:has(.sequence-controls)');
        const sequenceControlsInSearch = await page.$('#searchResults .sequence-controls');
        
        if (sequenceControlsInCRM && !sequenceControlsInSearch) {
            results.crmLocation.details.push('✅ Sequence controls in CRM section');
            results.crmLocation.details.push('✅ Sequence controls NOT in search section');
            results.crmLocation.passed = true;
        } else {
            results.crmLocation.details.push('❌ Sequence controls in wrong location');
        }
        
        await browser.close();

        // ===== FINAL RESULTS =====
        console.log('\n📊 FINAL VALIDATION RESULTS');
        console.log('='.repeat(60));
        
        const requirements = [
            { name: '1. Comprehensive Logging System', result: results.logs },
            { name: '2. CRM Data Persistence', result: results.crmPersistence },
            { name: '3. Sequence Button in CRM', result: results.sequenceButton },
            { name: '4. Parameter Validation', result: results.parameterValidation },
            { name: '5. Correct CRM Location', result: results.crmLocation }
        ];
        
        let allPassed = true;
        requirements.forEach(req => {
            const status = req.result.passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`\n${req.name}: ${status}`);
            req.result.details.forEach(detail => console.log(`   ${detail}`));
            if (!req.result.passed) allPassed = false;
        });
        
        console.log(`\n🎯 OVERALL RESULT: ${allPassed ? '✅ ALL REQUIREMENTS MET' : '❌ SOME REQUIREMENTS FAILED'}`);
        
        if (allPassed) {
            console.log('\n🎉 SUCCESS! All requirements have been successfully implemented:');
            console.log('   ✅ Comprehensive logging with API, files, and real-time display');
            console.log('   ✅ Complete CRM data persistence in Google Sheets');
            console.log('   ✅ Sequence button moved to CRM section with parameter validation');
            console.log('   ✅ All parameters validated before sequence execution');
            console.log('   ✅ Button properly located in CRM frame, NOT in LinkedIn search');
        }
        
        return allPassed;
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        return false;
    }
}

testAllRequirements().then(success => {
    process.exit(success ? 0 : 1);
});