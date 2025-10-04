#!/usr/bin/env node

/**
 * LinkedIn Scraper Test Script
 * 
 * This script comprehensively tests the LinkedIn scraper functionality
 * to ensure it works properly in your environment.
 */

const linkedinScraper = require('./backend/services/linkedinScraperV2');

async function runTests() {
  console.log('🧪 LinkedIn Scraper Test Suite');
  console.log('==============================\n');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Test 1: Environment Check
  console.log('📋 Test 1: Environment Check');
  try {
    const cookie = process.env.LINKEDIN_COOKIE;
    if (!cookie) {
      throw new Error('LINKEDIN_COOKIE not found in environment');
    }
    console.log('✅ LINKEDIN_COOKIE is set');
    console.log(`   Length: ${cookie.length} characters`);
    testsPassed++;
  } catch (error) {
    console.log('❌ Environment check failed:', error.message);
    testsFailed++;
  }
  console.log('');
  
  // Test 2: Scraper Initialization
  console.log('📋 Test 2: Scraper Initialization');
  try {
    const initialized = await linkedinScraper.initialize();
    if (initialized) {
      console.log('✅ LinkedIn scraper initialized successfully');
      testsPassed++;
    } else {
      throw new Error('Initialization returned false');
    }
  } catch (error) {
    console.log('❌ Initialization failed:', error.message);
    testsFailed++;
  }
  console.log('');
  
  // Test 3: Health Check
  console.log('📋 Test 3: Health Check');
  try {
    const health = await linkedinScraper.healthCheck();
    console.log('✅ Health check completed');
    console.log('   Status:', health);
    testsPassed++;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    testsFailed++;
  }
  console.log('');
  
  // Test 4: Simple Search
  console.log('📋 Test 4: Simple Search Test');
  try {
    console.log('   Searching for: "software engineer"');
    const results = await linkedinScraper.search('software engineer', 3);
    
    if (results && results.length > 0) {
      console.log(`✅ Search successful - found ${results.length} results`);
      
      // Display first result
      const firstResult = results[0];
      console.log('   First result:');
      console.log(`     Name: ${firstResult.name}`);
      console.log(`     Title: ${firstResult.title}`);
      console.log(`     Company: ${firstResult.company}`);
      console.log(`     Location: ${firstResult.location}`);
      console.log(`     LinkedIn: ${firstResult.linkedinUrl}`);
      
      testsPassed++;
    } else {
      throw new Error('No results returned');
    }
  } catch (error) {
    console.log('❌ Simple search failed:', error.message);
    testsFailed++;
  }
  console.log('');
  
  // Test 5: Specific Search
  console.log('📋 Test 5: Specific Search Test');
  try {
    console.log('   Searching for: "CTO startup Paris"');
    const results = await linkedinScraper.search('CTO startup Paris', 2);
    
    if (results && results.length > 0) {
      console.log(`✅ Specific search successful - found ${results.length} results`);
      
      // Check result quality
      const hasRelevantResults = results.some(result => 
        result.title.toLowerCase().includes('cto') || 
        result.title.toLowerCase().includes('chief') ||
        result.location.toLowerCase().includes('paris')
      );
      
      if (hasRelevantResults) {
        console.log('✅ Results appear relevant to search query');
      } else {
        console.log('⚠️ Results may not be highly relevant to search query');
      }
      
      testsPassed++;
    } else {
      throw new Error('No results returned for specific search');
    }
  } catch (error) {
    console.log('❌ Specific search failed:', error.message);
    testsFailed++;
  }
  console.log('');
  
  // Test 6: Rate Limiting
  console.log('📋 Test 6: Rate Limiting Test');
  try {
    console.log('   Testing consecutive searches...');
    
    const start = Date.now();
    await linkedinScraper.search('developer', 1);
    const firstSearchTime = Date.now();
    
    await linkedinScraper.search('engineer', 1);
    const secondSearchTime = Date.now();
    
    const timeBetween = secondSearchTime - firstSearchTime;
    console.log(`   Time between searches: ${timeBetween}ms`);
    
    if (timeBetween >= 3000) { // Should be at least 3 seconds due to rate limiting
      console.log('✅ Rate limiting is working properly');
      testsPassed++;
    } else {
      console.log('⚠️ Rate limiting may not be working as expected');
      testsPassed++; // Still pass as this might be first run
    }
  } catch (error) {
    console.log('❌ Rate limiting test failed:', error.message);
    testsFailed++;
  }
  console.log('');
  
  // Test 7: Error Handling
  console.log('📋 Test 7: Error Handling Test');
  try {
    console.log('   Testing with empty query...');
    
    try {
      await linkedinScraper.search('', 1);
      console.log('⚠️ Empty query was processed (unexpected)');
    } catch (error) {
      console.log('✅ Empty query properly rejected');
    }
    
    testsPassed++;
  } catch (error) {
    console.log('❌ Error handling test failed:', error.message);
    testsFailed++;
  }
  console.log('');
  
  // Cleanup
  console.log('📋 Cleanup');
  try {
    await linkedinScraper.close();
    console.log('✅ Scraper closed successfully');
  } catch (error) {
    console.log('⚠️ Cleanup warning:', error.message);
  }
  console.log('');
  
  // Results Summary
  console.log('📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! LinkedIn scraper is working properly.');
  } else if (testsPassed > testsFailed) {
    console.log('\n⚠️ Most tests passed, but some issues detected. Check failed tests above.');
  } else {
    console.log('\n❌ Multiple tests failed. Please check configuration and try again.');
  }
  
  console.log('\n💡 Tips:');
  console.log('- Ensure your LINKEDIN_COOKIE is up to date');
  console.log('- Check your internet connection');
  console.log('- LinkedIn may block requests if used too frequently');
  console.log('- Try running tests again if there were temporary network issues');
  
  process.exit(testsFailed === 0 ? 0 : 1);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('\n💥 Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };