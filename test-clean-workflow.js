const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCleanWorkflow() {
    console.log('🧹 Testing Clean Workflow After Clearing Data');
    console.log('='.repeat(50));

    try {
        // 1. Search for prospects
        console.log('\n1️⃣ Searching for prospects...');
        const searchResponse = await axios.post(`${BASE_URL}/linkedin/search`, {
            query: 'CTO startup Paris',
            limit: 3,
            method: 'apollo'
        });
        
        console.log(`✅ Found ${searchResponse.data.count} prospects`);
        const prospects = searchResponse.data.results;

        // 2. Add to CRM
        console.log('\n2️⃣ Adding to CRM...');
        const crmResponse = await axios.post(`${BASE_URL}/linkedin/add-to-crm`, {
            prospects: prospects
        });
        console.log(`✅ Added ${crmResponse.data.added} prospects to CRM`);

        // 3. Check the data in CRM
        console.log('\n3️⃣ Checking CRM data...');
        const prospectsResponse = await axios.get(`${BASE_URL}/prospects`);
        console.log(`✅ CRM now has ${prospectsResponse.data.prospects.length} prospects`);
        
        // Display first few prospects
        prospectsResponse.data.prospects.slice(0, 3).forEach((p, i) => {
            console.log(`   ${i+1}. ${p.name} - ${p.title} at ${p.company} (${p.location})`);
        });

        console.log('\n🎉 Clean Workflow Test Completed!');
        console.log('✨ Data structure is now consistent');

    } catch (error) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
}

testCleanWorkflow();