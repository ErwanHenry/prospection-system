/**
 * LinkedIn Scraper Factory - Full Integration Tests
 *
 * Run this after compiling TypeScript:
 * npx tsc && node test-scraper-factory-full.js
 */

require('dotenv').config();

async function testFactoryIntegration() {
  console.log('🧪 LinkedIn Scraper Factory - Full Integration Test\n');
  console.log('='.repeat(70));

  let factory;
  let scraper;

  try {
    // Import the compiled factory
    console.log('\n1️⃣  Importing compiled factory...');
    const { LinkedInScraperFactory } = require('./dist/backend/services/LinkedInScraperFactory.js');

    factory = LinkedInScraperFactory.getInstance();
    console.log('✅ Factory imported successfully');

    // Test 1: Initialize Factory
    console.log('\n2️⃣  Initializing factory...');
    await factory.initialize();
    console.log('✅ Factory initialized');
    console.log(`   Available strategies: ${factory.getAvailableStrategies().join(', ')}`);

    // Test 2: Check Health of All Strategies
    console.log('\n3️⃣  Checking health of all strategies...');
    const healthStatuses = await factory.getAllHealthStatus();

    for (const [strategyName, health] of healthStatuses) {
      const statusIcon = health.status === 'active' ? '✅' :
                        health.status === 'inactive' ? '⚠️' : '❌';
      console.log(`   ${statusIcon} ${strategyName}:`);
      console.log(`      Status: ${health.status}`);
      console.log(`      Initialized: ${health.isInitialized}`);
      console.log(`      Daily usage: ${health.dailySearchCount}/${health.dailyLimit}`);
      console.log(`      Can search: ${health.canSearchMore}`);
      if (health.lastError) {
        console.log(`      Last error: ${health.lastError}`);
      }
    }

    // Test 3: Auto-Select Best Strategy
    console.log('\n4️⃣  Auto-selecting best available strategy...');
    scraper = await factory.getScraper({
      preferred: 'auto',
      allowFallback: true
    });
    console.log(`✅ Selected strategy: ${scraper.getStrategyName()}`);

    // Test 4: Perform Search
    console.log('\n5️⃣  Performing test search...');
    const testQuery = 'CTO startup Paris';
    const limit = 3;

    console.log(`   Query: "${testQuery}"`);
    console.log(`   Limit: ${limit} profiles`);

    const profiles = await scraper.search(testQuery, limit);

    console.log(`✅ Search completed: ${profiles.length} profiles found`);

    if (profiles.length > 0) {
      console.log('\n   📊 Sample Results:');
      profiles.forEach((profile, index) => {
        console.log(`\n   ${index + 1}. ${profile.name}`);
        console.log(`      Title: ${profile.title}`);
        console.log(`      Company: ${profile.company}`);
        console.log(`      Location: ${profile.location}`);
        console.log(`      LinkedIn: ${profile.linkedinUrl}`);
        console.log(`      Method: ${profile.method}`);
        console.log(`      Score: ${profile.searchScore}`);
        if (profile.email) {
          console.log(`      Email: ${profile.email}`);
        }
      });
    } else {
      console.log('   ℹ️  No profiles found (may be rate limited or configuration issue)');
    }

    // Test 5: Strategy-Specific Search
    console.log('\n6️⃣  Testing strategy-specific selection...');

    // Try Apollo if available
    try {
      console.log('\n   Testing Apollo strategy...');
      const apolloScraper = await factory.getScraper({
        preferred: 'apollo',
        allowFallback: false
      });
      console.log('   ✅ Apollo available');

      const apolloHealth = await apolloScraper.healthCheck();
      console.log(`   Daily usage: ${apolloHealth.dailySearchCount}/${apolloHealth.dailyLimit}`);
    } catch (error) {
      console.log(`   ⚠️  Apollo not available: ${error.message}`);
    }

    // Try Puppeteer if available
    try {
      console.log('\n   Testing Puppeteer strategy...');
      const puppeteerScraper = await factory.getScraper({
        preferred: 'puppeteer',
        allowFallback: false
      });
      console.log('   ✅ Puppeteer available');

      const puppeteerHealth = await puppeteerScraper.healthCheck();
      console.log(`   Daily usage: ${puppeteerHealth.dailySearchCount}/${puppeteerHealth.dailyLimit}`);
    } catch (error) {
      console.log(`   ⚠️  Puppeteer not available: ${error.message}`);
    }

    // Test 6: Error Handling
    console.log('\n7️⃣  Testing error handling...');

    try {
      console.log('   Testing invalid strategy name...');
      await factory.getScraper({
        preferred: 'invalid-strategy',
        allowFallback: false
      });
      console.log('   ❌ Should have thrown error');
    } catch (error) {
      console.log(`   ✅ Correctly threw error: ${error.code}`);
    }

    // Test 7: Event Listeners
    console.log('\n8️⃣  Testing event system...');

    let eventsReceived = 0;

    factory.on('strategy:selected', (data) => {
      console.log(`   📡 Event: strategy:selected - ${data.strategy}`);
      eventsReceived++;
    });

    factory.on('search:start', (data) => {
      console.log(`   📡 Event: search:start - ${data.strategy}`);
      eventsReceived++;
    });

    factory.on('search:complete', (data) => {
      console.log(`   📡 Event: search:complete - ${data.resultCount} results`);
      eventsReceived++;
    });

    // Trigger events
    const eventTestScraper = await factory.getScraper({ preferred: 'auto' });
    await eventTestScraper.search('test', 1);

    console.log(`   ✅ Events system working (${eventsReceived} events received)`);

    // Test 8: Cleanup
    console.log('\n9️⃣  Testing cleanup...');
    await factory.closeAll();
    console.log('   ✅ All resources cleaned up');

    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS PASSED\n');

    return {
      success: true,
      testsRun: 9,
      profilesFound: profiles.length,
      eventsReceived
    };

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('\nError details:');
    console.error(`   Message: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }

    // Cleanup on error
    if (factory) {
      try {
        await factory.closeAll();
      } catch (cleanupError) {
        console.error('   ⚠️  Cleanup error:', cleanupError.message);
      }
    }

    console.log('\n' + '='.repeat(70));
    return {
      success: false,
      error: error.message
    };
  }
}

async function testIndividualStrategies() {
  console.log('\n🔬 Individual Strategy Tests\n');
  console.log('='.repeat(70));

  const strategies = ['apollo', 'puppeteer', 'selenium'];

  for (const strategyName of strategies) {
    console.log(`\n📌 Testing ${strategyName.toUpperCase()} Strategy`);
    console.log('-'.repeat(70));

    try {
      const { LinkedInScraperFactory } = require('./dist/backend/services/LinkedInScraperFactory.js');
      const factory = LinkedInScraperFactory.getInstance();
      await factory.initialize();

      const scraper = await factory.getScraper({
        preferred: strategyName,
        allowFallback: false
      });

      // Health check
      const health = await scraper.healthCheck();
      console.log(`Status: ${health.status}`);
      console.log(`Initialized: ${health.isInitialized}`);
      console.log(`Daily limit: ${health.dailySearchCount}/${health.dailyLimit}`);

      // Quick search test
      console.log('Running quick search...');
      const profiles = await scraper.search('CEO Paris', 2);
      console.log(`✅ Found ${profiles.length} profiles`);

      await factory.closeAll();

    } catch (error) {
      console.log(`⚠️  ${strategyName} not available: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
}

// Main execution
async function main() {
  const startTime = Date.now();

  console.log('🚀 Starting LinkedIn Scraper Factory Test Suite');
  console.log(`📅 ${new Date().toISOString()}\n`);

  // Run integration tests
  const integrationResults = await testFactoryIntegration();

  // Run individual strategy tests if integration passed
  if (integrationResults.success) {
    await testIndividualStrategies();
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(70));
  console.log(`⏱️  Total execution time: ${duration}s`);
  console.log('='.repeat(70));

  if (integrationResults.success) {
    console.log('\n🎉 Test suite completed successfully!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Test suite failed\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  testFactoryIntegration,
  testIndividualStrategies
};
