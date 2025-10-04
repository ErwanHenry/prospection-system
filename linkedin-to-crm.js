#!/usr/bin/env node

const linkedinScraper = require('./backend/services/linkedinScraper');
const googleSheets = require('./backend/services/googleSheets');
require('dotenv').config();

console.log(`
🚀 LinkedIn to CRM - Automated Import
====================================
`);

async function main() {
    try {
        // Parse command line arguments
        const args = process.argv.slice(2);
        const query = args[0] || process.env.DEFAULT_SEARCH_QUERY || 'CTO startup Paris';
        const limit = parseInt(args[1]) || 10;
        
        console.log(`🔍 Search query: "${query}"`);
        console.log(`📊 Limit: ${limit} prospects\n`);
        
        // Initialize services
        console.log('⚙️  Initializing services...');
        const sheetsReady = await googleSheets.initialize();
        if (!sheetsReady) {
            console.error('❌ Google Sheets not connected. Please authenticate first.');
            console.log('\nRun the web interface and authenticate with Google.');
            process.exit(1);
        }
        
        const linkedinReady = await linkedinScraper.initialize();
        if (!linkedinReady) {
            console.error('❌ LinkedIn scraper initialization failed');
            process.exit(1);
        }
        
        console.log('✅ Services initialized\n');
        
        // Search LinkedIn
        console.log('🔍 Searching LinkedIn...');
        const results = await linkedinScraper.search(query, limit);
        console.log(`✅ Found ${results.length} prospects\n`);
        
        if (results.length === 0) {
            console.log('No results found. Try a different search query.');
            await linkedinScraper.close();
            process.exit(0);
        }
        
        // Display results
        console.log('📋 Results:');
        results.forEach((prospect, index) => {
            console.log(`\n${index + 1}. ${prospect.name}`);
            console.log(`   Title: ${prospect.title || 'N/A'}`);
            console.log(`   Company: ${prospect.company || 'N/A'}`);
            console.log(`   Location: ${prospect.location || 'N/A'}`);
        });
        
        // Ask for confirmation
        console.log(`\n\n❓ Add these ${results.length} prospects to CRM? (y/n): `);
        
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
            readline.question('', ans => {
                readline.close();
                resolve(ans.toLowerCase());
            });
        });
        
        if (answer !== 'y' && answer !== 'yes') {
            console.log('\n❌ Cancelled');
            await linkedinScraper.close();
            process.exit(0);
        }
        
        // Add to CRM
        console.log('\n📝 Adding to Google Sheets CRM...');
        await googleSheets.setupHeaders();
        
        const rows = results.map(prospect => [
            Date.now().toString(), // ID
            new Date().toISOString().split('T')[0], // Date Added
            prospect.name || '',
            prospect.title || '',
            prospect.company || '',
            prospect.location || '',
            prospect.linkedinUrl || '',
            '', // Email
            '', // Phone
            'New', // Status
            '', // Last Contact
            '', // Message Sent
            '', // Response
            '', // Notes
            query, // Tags (search query)
            '0' // Score
        ]);
        
        await googleSheets.appendToSheet(rows);
        console.log(`✅ Successfully added ${rows.length} prospects to CRM`);
        
        // Get enriched details for first 3 prospects (optional)
        console.log('\n🔍 Getting detailed info for first 3 prospects...');
        for (let i = 0; i < Math.min(3, results.length); i++) {
            try {
                const details = await linkedinScraper.getProfileDetails(results[i].linkedinUrl);
                console.log(`\n${i + 1}. ${details.name}`);
                if (details.about) {
                    console.log(`   About: ${details.about.substring(0, 100)}...`);
                }
                if (details.email) {
                    console.log(`   Email: ${details.email}`);
                }
            } catch (err) {
                console.log(`   ⚠️  Could not get details`);
            }
        }
        
        console.log('\n✨ Done!');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await linkedinScraper.close();
        process.exit(0);
    }
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error('\n❌ Unhandled error:', error);
    linkedinScraper.close().then(() => process.exit(1));
});

// Run
main();
