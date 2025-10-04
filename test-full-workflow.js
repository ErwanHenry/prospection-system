const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testFullWorkflow() {
    console.log('🧪 Testing Complete Workflow');
    console.log('='.repeat(50));

    try {
        // 1. Test system health
        console.log('\n1️⃣ Testing System Health...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ System Health:', healthResponse.data);

        // 2. Test Google Sheets connection  
        console.log('\n2️⃣ Testing Google Sheets Connection...');
        const sheetsDataResponse = await axios.get(`${BASE_URL}/sheets/data`);
        console.log('✅ Google Sheets Data:', sheetsDataResponse.data.success ? 'Connected' : 'Failed');

        // 3. Test prospect search
        console.log('\n3️⃣ Testing Prospect Search...');
        const searchResponse = await axios.post(`${BASE_URL}/linkedin/search`, {
            query: 'CTO startup Paris',
            limit: 3,
            method: 'apollo'
        });
        console.log('✅ Search Results:', searchResponse.data.count, 'prospects found');
        
        if (searchResponse.data.results.length === 0) {
            console.log('❌ No prospects found - stopping test');
            return;
        }

        const prospects = searchResponse.data.results.slice(0, 2); // Take first 2 for testing

        // 4. Test adding to CRM
        console.log('\n4️⃣ Testing Add to CRM...');
        const crmResponse = await axios.post(`${BASE_URL}/linkedin/add-to-crm`, {
            prospects: prospects
        });
        console.log('✅ CRM Addition:', crmResponse.data);

        // 5. Test retrieving prospects from CRM
        console.log('\n5️⃣ Testing CRM Data Retrieval...');
        const crmDataResponse = await axios.get(`${BASE_URL}/sheets/data`);
        console.log('✅ CRM Data Retrieved:', crmDataResponse.data.data.length - 1, 'prospects in CRM');

        // 6. Test AI email generation
        console.log('\n6️⃣ Testing AI Email Generation...');
        for (const prospect of prospects) {
            try {
                const emailResponse = await axios.post(`${BASE_URL}/automation/generate-email`, {
                    prospect: prospect,
                    context: 'We help startups scale their technology teams with AI-powered recruitment tools.'
                });
                console.log(`✅ Email generated for ${prospect.name}: ${emailResponse.data.success}`);
            } catch (error) {
                console.log(`⚠️ Email generation failed for ${prospect.name}:`, error.response?.data?.error || error.message);
            }
        }

        // 7. Test automation health
        console.log('\n7️⃣ Testing Automation Health...');
        try {
            const automationHealthResponse = await axios.get(`${BASE_URL}/automation/health`);
            console.log('✅ Automation Health:', automationHealthResponse.data);
        } catch (error) {
            console.log('⚠️ Automation health check failed:', error.response?.data?.error || error.message);
        }

        console.log('\n🎉 Complete Workflow Test Finished!');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('❌ Workflow Test Failed:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

// Run the test
testFullWorkflow();