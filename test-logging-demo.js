const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function loggingDemo() {
    console.log('🧪 Testing Complete Logging System');
    console.log('='.repeat(50));
    console.log('Monitor the web interface and terminal output to see logs in action!\n');
    
    try {
        // 1. Health check to generate logs
        console.log('1️⃣ Health check...');
        await axios.get(`${BASE_URL}/health`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 2. Search to generate logs
        console.log('2️⃣ LinkedIn search...');
        await axios.post(`${BASE_URL}/linkedin/search`, {
            query: 'CTO AI startup',
            limit: 2,
            method: 'apollo'
        });
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Check logs via API
        console.log('3️⃣ Fetching logs via API...');
        const logsResponse = await axios.get(`${BASE_URL}/logs?limit=10`);
        console.log(`✅ Retrieved ${logsResponse.data.logs.length} log entries`);

        // Display recent logs
        console.log('\n📋 Recent Log Entries:');
        logsResponse.data.logs.slice(0, 5).forEach((log, i) => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            console.log(`   ${i+1}. [${time}] [${log.level}] [${log.component}] ${log.message}`);
        });

        console.log('\n🎯 Logging System Features:');
        console.log('   📺 Terminal: Colored logs with timestamps');
        console.log('   🌐 Web Interface: Real-time log viewer with auto-refresh');
        console.log('   📁 File Logs: Persistent logs saved to logs/ directory');
        console.log('   🔍 API Access: GET /api/logs for programmatic access');
        console.log('   ⚙️ Filtering: Filter by log level (info, success, warn, error, debug)');
        console.log('   ⏱️ Performance: Timer tracking for operations');
        console.log('   📊 Metadata: Rich context data with each log entry');

        console.log('\n✨ Live Demo Complete!');
        console.log('🔗 Visit: http://localhost:3000 to see the live logs interface');

    } catch (error) {
        console.error('❌ Demo failed:', error.message);
    }
}

loggingDemo();