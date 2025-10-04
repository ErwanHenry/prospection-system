// Test Google Sheets connection
const googleSheets = require('./backend/services/googleSheets');

async function test() {
    console.log('Testing Google Sheets connection...');
    const connected = await googleSheets.initialize();
    console.log('Result:', connected ? '✅ Connected' : '❌ Not connected');
    
    if (!connected) {
        console.log('\nTo authenticate:');
        console.log('1. Start the server: npm start');
        console.log('2. Open http://localhost:3000');
        console.log('3. Click on Settings and authenticate with Google');
    }
}

test();
