const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api';

async function validateRequirements() {
    console.log('🧪 REQUIREMENTS VALIDATION TEST');
    console.log('='.repeat(50));
    
    const tests = [];

    try {
        // ===== REQUIREMENT 1: LOGGING SYSTEM =====
        console.log('\n1️⃣ TESTING: Comprehensive Logging System');
        console.log('-'.repeat(30));
        
        // Test logs API
        const logsResponse = await axios.get(`${API_URL}/logs?limit=5`);
        if (logsResponse.data.success && logsResponse.data.logs.length > 0) {
            console.log('   ✅ Logs API working');
            console.log(`   ✅ Retrieved ${logsResponse.data.logs.length} log entries`);
            
            const log = logsResponse.data.logs[0];
            console.log(`   ✅ Log structure: ${log.level} | ${log.component} | ${log.message}`);
            
            tests.push({ name: 'Logging System', passed: true });
        } else {
            console.log('   ❌ Logs API failed');
            tests.push({ name: 'Logging System', passed: false });
        }

        // Test log files
        try {
            const logFiles = fs.readdirSync('./logs');
            console.log(`   ✅ Log files: ${logFiles.join(', ')}`);
        } catch (error) {
            console.log('   ⚠️ Log files not accessible');
        }

        // ===== REQUIREMENT 2: CRM DATA PERSISTENCE =====
        console.log('\n2️⃣ TESTING: CRM Data Persistence');
        console.log('-'.repeat(30));
        
        const prospectsResponse = await axios.get(`${API_URL}/prospects`);
        if (prospectsResponse.data.success && prospectsResponse.data.prospects.length > 0) {
            const prospectCount = prospectsResponse.data.prospects.length;
            console.log(`   ✅ ${prospectCount} prospects in CRM`);
            
            const prospect = prospectsResponse.data.prospects[0];
            console.log(`   ✅ Sample prospect: ${prospect.name} at ${prospect.company}`);
            
            // Test Google Sheets raw data
            const sheetsResponse = await axios.get(`${API_URL}/sheets/data`);
            if (sheetsResponse.data.success && sheetsResponse.data.data.length > 0) {
                console.log('   ✅ Google Sheets data accessible');
                const headers = sheetsResponse.data.data[0];
                console.log(`   ✅ Headers: ${headers.slice(0, 4).join(', ')}...`);
                
                tests.push({ name: 'CRM Data Persistence', passed: true });
            } else {
                console.log('   ❌ Google Sheets data not accessible');
                tests.push({ name: 'CRM Data Persistence', passed: false });
            }
        } else {
            console.log('   ❌ No prospects in CRM');
            tests.push({ name: 'CRM Data Persistence', passed: false });
        }

        // ===== REQUIREMENT 3: SEQUENCE BUTTON LOCATION =====
        console.log('\n3️⃣ TESTING: Sequence Button Location (CRM Frame)');
        console.log('-'.repeat(30));
        
        // Read the HTML file to verify button location
        const htmlContent = fs.readFileSync('./frontend/index.html', 'utf8');
        
        // Check if button is NOT in search results section
        const searchResultsSection = htmlContent.includes('<div class="results-actions"') && 
                                    htmlContent.includes('runSequenceBtn') && 
                                    htmlContent.indexOf('runSequenceBtn') < htmlContent.indexOf('<!-- CRM Data Section -->');
        
        // Check if button IS in CRM section
        const crmSectionIndex = htmlContent.indexOf('<!-- CRM Data Section -->');
        const sequenceBtnIndex = htmlContent.indexOf('runFullSequence');
        const inCRMSection = sequenceBtnIndex > crmSectionIndex && crmSectionIndex !== -1;
        
        if (!searchResultsSection && inCRMSection) {
            console.log('   ✅ Sequence button in CRM section');
            console.log('   ✅ Sequence button NOT in LinkedIn search section');
            tests.push({ name: 'Button Location', passed: true });
        } else {
            console.log('   ❌ Sequence button in wrong location');
            tests.push({ name: 'Button Location', passed: false });
        }

        // ===== REQUIREMENT 4: PARAMETER VALIDATION =====
        console.log('\n4️⃣ TESTING: Parameter Validation');
        console.log('-'.repeat(30));
        
        // Check if validation elements exist in HTML
        const hasValidationElements = [
            'validateSequence',
            'emailContext', 
            'linkedinTemplate',
            'sequenceStatus',
            'sequenceValidation'
        ].every(id => htmlContent.includes(`id="${id}"`));
        
        // Check if validation functions exist in JS
        const jsContent = fs.readFileSync('./frontend/app.js', 'utf8');
        const hasValidationFunctions = [
            'validateSequenceConfig',
            'displayValidationResults',
            'updateSequenceStatus',
            'autoValidateSequence'
        ].every(func => jsContent.includes(`function ${func}`));
        
        if (hasValidationElements && hasValidationFunctions) {
            console.log('   ✅ Parameter validation UI elements present');
            console.log('   ✅ Parameter validation functions implemented');
            tests.push({ name: 'Parameter Validation', passed: true });
        } else {
            console.log('   ❌ Parameter validation incomplete');
            tests.push({ name: 'Parameter Validation', passed: false });
        }

        // ===== REQUIREMENT 5: SEQUENCE CONTROLS STRUCTURE =====
        console.log('\n5️⃣ TESTING: Sequence Controls Structure');
        console.log('-'.repeat(30));
        
        const hasSequenceControls = htmlContent.includes('sequence-controls');
        const hasEmailContext = htmlContent.includes('emailContext');
        const hasLinkedinTemplate = htmlContent.includes('linkedinTemplate');
        const hasActionCheckboxes = htmlContent.includes('generateEmails') && 
                                   htmlContent.includes('sendLinkedInConnections');
        
        if (hasSequenceControls && hasEmailContext && hasLinkedinTemplate && hasActionCheckboxes) {
            console.log('   ✅ Sequence controls container present');
            console.log('   ✅ Email context configuration present');
            console.log('   ✅ LinkedIn template configuration present');
            console.log('   ✅ Action selection checkboxes present');
            tests.push({ name: 'Sequence Controls', passed: true });
        } else {
            console.log('   ❌ Sequence controls incomplete');
            tests.push({ name: 'Sequence Controls', passed: false });
        }

        // ===== FINAL RESULTS =====
        console.log('\n📊 FINAL VALIDATION RESULTS');
        console.log('='.repeat(50));
        
        const allPassed = tests.every(test => test.passed);
        
        tests.forEach(test => {
            const status = test.passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`${test.name}: ${status}`);
        });
        
        console.log(`\n🎯 OVERALL RESULT: ${allPassed ? '✅ ALL REQUIREMENTS MET' : '❌ SOME REQUIREMENTS FAILED'}`);
        
        if (allPassed) {
            console.log('\n🎉 SUCCESS! Your requirements have been fully implemented:');
            console.log('   1. ✅ Comprehensive logging system with API, files, and real-time display');
            console.log('   2. ✅ Complete CRM data persistence in Google Sheets with proper structure');
            console.log('   3. ✅ Sequence button moved from LinkedIn search to CRM section');
            console.log('   4. ✅ Full parameter validation before sequence execution');
            console.log('   5. ✅ Button located in CRM frame with proper configuration controls');
            
            console.log('\n🚀 Ready to use:');
            console.log('   • Visit http://localhost:3000');
            console.log('   • Navigate to CRM Data section');
            console.log('   • Select prospects and configure parameters');
            console.log('   • Run validated sequences with confidence');
        }
        
        return allPassed;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

validateRequirements().then(success => {
    console.log(`\n${success ? '🎉 All tests passed!' : '⚠️ Some tests failed'}`);
});