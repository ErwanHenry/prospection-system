/**
 * LinkedIn Scraper Factory - Quick Integration Example
 *
 * This file demonstrates how to integrate the factory into your existing code
 */

require('dotenv').config();

async function basicExample() {
  console.log('📘 Example 1: Basic Usage\n');

  // Import factory (after compilation)
  const { scraperFactory } = require('./dist/backend/services/LinkedInScraperFactory.js');

  try {
    // Initialize
    await scraperFactory.initialize();

    // Get best available scraper
    const scraper = await scraperFactory.getScraper({ preferred: 'auto' });

    // Search
    const profiles = await scraper.search('CTO startup Paris', 5);

    // Display results
    console.log(`Found ${profiles.length} profiles:\n`);
    profiles.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   ${p.title} at ${p.company}`);
      console.log(`   ${p.location}`);
      console.log(`   ${p.linkedinUrl}`);
      if (p.email) console.log(`   Email: ${p.email}`);
      console.log('');
    });

    // Cleanup
    await scraperFactory.closeAll();

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function strategySelectionExample() {
  console.log('\n📘 Example 2: Strategy Selection\n');

  const { scraperFactory } = require('./dist/backend/services/LinkedInScraperFactory.js');

  await scraperFactory.initialize();

  // Try Apollo first (for email data)
  try {
    console.log('Trying Apollo (with emails)...');
    const apolloScraper = await scraperFactory.getScraper({
      preferred: 'apollo',
      allowFallback: false
    });

    const profiles = await apolloScraper.search('HR Manager Lyon', 3);
    console.log(`Apollo: Found ${profiles.length} profiles`);
    if (profiles[0]?.email) {
      console.log(`First email: ${profiles[0].email}`);
    }
  } catch (error) {
    console.log(`Apollo failed: ${error.message}`);

    // Fallback to Puppeteer
    console.log('\nFalling back to Puppeteer...');
    const puppeteerScraper = await scraperFactory.getScraper({
      preferred: 'puppeteer',
      allowFallback: false
    });

    const profiles = await puppeteerScraper.search('HR Manager Lyon', 3);
    console.log(`Puppeteer: Found ${profiles.length} profiles`);
  }

  await scraperFactory.closeAll();
}

async function healthMonitoringExample() {
  console.log('\n📘 Example 3: Health Monitoring\n');

  const { scraperFactory } = require('./dist/backend/services/LinkedInScraperFactory.js');

  await scraperFactory.initialize();

  // Check health of all strategies
  const healthMap = await scraperFactory.getAllHealthStatus();

  console.log('Strategy Health Status:\n');
  for (const [strategy, health] of healthMap) {
    const statusIcon = health.status === 'active' ? '✅' :
                      health.status === 'inactive' ? '⚠️' : '❌';

    console.log(`${statusIcon} ${strategy.toUpperCase()}`);
    console.log(`   Status: ${health.status}`);
    console.log(`   Initialized: ${health.isInitialized}`);
    console.log(`   Daily usage: ${health.dailySearchCount}/${health.dailyLimit}`);
    console.log(`   Can search more: ${health.canSearchMore}`);
    console.log('');
  }

  await scraperFactory.closeAll();
}

async function eventMonitoringExample() {
  console.log('\n📘 Example 4: Event Monitoring\n');

  const { scraperFactory } = require('./dist/backend/services/LinkedInScraperFactory.js');

  // Set up event listeners
  scraperFactory.on('factory:initialized', (data) => {
    console.log(`✅ Factory initialized with ${data.strategiesCount} strategies`);
  });

  scraperFactory.on('strategy:selected', (data) => {
    console.log(`🎯 Selected strategy: ${data.strategy}`);
    if (data.reason) {
      console.log(`   Reason: ${data.reason}`);
    }
  });

  scraperFactory.on('search:start', (data) => {
    console.log(`🔍 Search started: "${data.query}" (limit: ${data.limit})`);
  });

  scraperFactory.on('search:complete', (data) => {
    console.log(`✅ Search complete: ${data.resultCount} results`);
  });

  scraperFactory.on('search:error', (data) => {
    console.error(`❌ Search error in ${data.strategy}:`, data.error.message);
  });

  // Perform operations (events will be logged)
  await scraperFactory.initialize();
  const scraper = await scraperFactory.getScraper({ preferred: 'auto' });
  await scraper.search('Product Manager Berlin', 5);

  await scraperFactory.closeAll();
}

async function errorHandlingExample() {
  console.log('\n📘 Example 5: Error Handling\n');

  const { ScraperError, scraperFactory } = require('./dist/backend/services/LinkedInScraperFactory.js');

  await scraperFactory.initialize();

  try {
    // Try invalid strategy
    const scraper = await scraperFactory.getScraper({
      preferred: 'invalid-strategy',
      allowFallback: false
    });
  } catch (error) {
    if (error instanceof ScraperError) {
      console.log('Caught ScraperError:');
      console.log(`  Code: ${error.code}`);
      console.log(`  Message: ${error.message}`);
      console.log(`  Method: ${error.method}`);
      if (error.details) {
        console.log(`  Details:`, error.details);
      }
    }
  }

  try {
    // Try strategy that requires configuration
    const scraper = await scraperFactory.getScraper({
      preferred: 'apollo',
      requireEmail: true,
      allowFallback: false
    });
    // This will fail if APOLLO_API_KEY not set
  } catch (error) {
    console.log(`\nExpected error: ${error.message}`);
    console.log('Set APOLLO_API_KEY in .env to enable Apollo');
  }

  await scraperFactory.closeAll();
}

// Main menu
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   LinkedIn Scraper Factory - Integration Examples       ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  console.log('Prerequisites:');
  console.log('  1. Compile TypeScript: npm run build');
  console.log('  2. Configure .env with at least one strategy');
  console.log('  3. Run: node scraper-factory-example.js\n');

  console.log('Available Examples:');
  console.log('  1. Basic Usage');
  console.log('  2. Strategy Selection');
  console.log('  3. Health Monitoring');
  console.log('  4. Event Monitoring');
  console.log('  5. Error Handling\n');

  // Run all examples
  try {
    await basicExample();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await strategySelectionExample();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await healthMonitoringExample();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await eventMonitoringExample();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await errorHandlingExample();

    console.log('\n✅ All examples completed successfully!\n');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('dist/')) {
      console.error('\n❌ Error: TypeScript not compiled yet');
      console.error('\nPlease run: npm run build\n');
    } else {
      console.error('\n❌ Error running examples:', error.message);
      console.error('\nMake sure you have:');
      console.error('  - Compiled TypeScript (npm run build)');
      console.error('  - Configured .env with API keys/cookies');
      console.error('  - Installed all dependencies (npm install)\n');
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  basicExample,
  strategySelectionExample,
  healthMonitoringExample,
  eventMonitoringExample,
  errorHandlingExample
};
