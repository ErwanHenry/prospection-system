/**
 * Test Script for Claude-Flow Integration
 * Tests all major components and workflows of the multi-agent system
 */

const { claudeFlowProspection } = require('./claude-flow');
const logger = require('./backend/utils/logger');

async function runTests() {
  console.log('🧪 Starting Claude-Flow Integration Tests...\n');
  
  const testResults = {
    initialization: false,
    systemHealth: false,
    prospectSearch: false,
    emailEnrichment: false,
    fullWorkflow: false,
    swarmOperations: false,
    performanceMetrics: false,
    errorHandling: false
  };

  try {
    // Test 1: System Initialization
    console.log('📋 Test 1: System Initialization');
    const initResult = await claudeFlowProspection.initialize();
    testResults.initialization = initResult;
    console.log(`   Result: ${initResult ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!initResult) {
      console.log('❌ Cannot proceed with tests - system initialization failed');
      return testResults;
    }

    // Test 2: System Health Check
    console.log('\n📋 Test 2: System Health Check');
    const health = await claudeFlowProspection.getSystemHealth();
    testResults.systemHealth = health.status === 'ready';
    console.log(`   Result: ${health.status === 'ready' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Agents Status: ${JSON.stringify(Object.fromEntries(Object.entries(health.agents).map(([k,v]) => [k, v.success])), null, 2)}`);

    // Test 3: Prospect Search Workflow
    console.log('\n📋 Test 3: Prospect Search Workflow');
    try {
      const searchResult = await claudeFlowProspection.searchProspects('CTO startup Paris', {
        limit: 5,
        extractProfiles: false // Quick search for testing
      });
      
      testResults.prospectSearch = searchResult.success && searchResult.prospects && searchResult.prospects.length > 0;
      console.log(`   Result: ${testResults.prospectSearch ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Found: ${searchResult.prospects ? searchResult.prospects.length : 0} prospects`);
      console.log(`   Execution Time: ${searchResult.executionTime}ms`);
    } catch (error) {
      console.log(`   Result: ❌ FAIL - ${error.message}`);
    }

    // Test 4: Email Enrichment (with mock data)
    console.log('\n📋 Test 4: Email Enrichment Workflow');
    try {
      const mockProspects = [
        {
          id: 'test_1',
          name: 'John Doe',
          company: 'Tech Corp',
          title: 'CTO',
          linkedinUrl: 'https://linkedin.com/in/johndoe'
        },
        {
          id: 'test_2',
          name: 'Jane Smith',
          company: 'Innovation Inc',
          title: 'CEO',
          linkedinUrl: 'https://linkedin.com/in/janesmith'
        }
      ];

      const enrichResult = await claudeFlowProspection.enrichWithEmails(mockProspects, {
        verify: false, // Skip verification for testing
        timeout: 10000
      });

      testResults.emailEnrichment = enrichResult.success;
      console.log(`   Result: ${testResults.emailEnrichment ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Processed: ${enrichResult.processed || 0} prospects`);
      console.log(`   Execution Time: ${enrichResult.executionTime}ms`);
    } catch (error) {
      console.log(`   Result: ❌ FAIL - ${error.message}`);
    }

    // Test 5: Full Prospection Workflow (limited scope)
    console.log('\n📋 Test 5: Full Prospection Workflow');
    try {
      const fullResult = await claudeFlowProspection.runFullProspection('startup founder tech', {
        limit: 3,
        maxEnrichment: 2,
        extractProfiles: false
      });

      testResults.fullWorkflow = fullResult.success;
      console.log(`   Result: ${testResults.fullWorkflow ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Total Processed: ${fullResult.totalProcessed || 0}`);
      console.log(`   Emails Found: ${fullResult.emailsFound || 0}`);
      console.log(`   Execution Time: ${fullResult.executionTime}ms`);
    } catch (error) {
      console.log(`   Result: ❌ FAIL - ${error.message}`);
    }

    // Test 6: Swarm Operations
    console.log('\n📋 Test 6: Swarm Operations (Quick Search)');
    try {
      const swarmResult = await claudeFlowProspection.quickSearch('developer startup', {
        limit: 3
      });

      testResults.swarmOperations = swarmResult.success;
      console.log(`   Result: ${testResults.swarmOperations ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Swarm Size: ${swarmResult.swarmSize || 0}`);
      console.log(`   Successful Agents: ${swarmResult.results ? swarmResult.results.length : 0}`);
      console.log(`   Failed Agents: ${swarmResult.errors ? swarmResult.errors.length : 0}`);
    } catch (error) {
      console.log(`   Result: ❌ FAIL - ${error.message}`);
    }

    // Test 7: Performance Metrics
    console.log('\n📋 Test 7: Performance Metrics');
    try {
      const metrics = claudeFlowProspection.getPerformanceMetrics();
      testResults.performanceMetrics = metrics && typeof metrics.totalWorkflows === 'number';
      console.log(`   Result: ${testResults.performanceMetrics ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Total Workflows: ${metrics.totalWorkflows}`);
      console.log(`   Success Rate: ${metrics.successRate}%`);
      console.log(`   Average Execution Time: ${metrics.averageExecutionTime}ms`);
      console.log(`   Total Prospects Processed: ${metrics.totalProspectsProcessed}`);
    } catch (error) {
      console.log(`   Result: ❌ FAIL - ${error.message}`);
    }

    // Test 8: Error Handling
    console.log('\n📋 Test 8: Error Handling');
    try {
      // Test with invalid workflow
      const errorResult = await claudeFlowProspection.searchProspects('', {
        limit: -1 // Invalid parameters
      });

      // Should handle error gracefully
      testResults.errorHandling = !errorResult.success || errorResult.error;
      console.log(`   Result: ${testResults.errorHandling ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Error handled gracefully: ${errorResult.error ? 'Yes' : 'No'}`);
    } catch (error) {
      // Catching error is also acceptable
      testResults.errorHandling = true;
      console.log(`   Result: ✅ PASS - Error caught and handled`);
    }

  } catch (error) {
    console.error('❌ Critical test error:', error.message);
  }

  // Test Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  const successRate = Math.round((passedTests / totalTests) * 100);

  Object.entries(testResults).forEach(([test, passed]) => {
    console.log(`   ${test.padEnd(20)}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });

  console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} (${successRate}%)`);
  
  if (successRate >= 80) {
    console.log('🎉 Claude-Flow integration is working well!');
  } else if (successRate >= 60) {
    console.log('⚠️ Claude-Flow integration has some issues but is functional');
  } else {
    console.log('❌ Claude-Flow integration needs significant fixes');
  }

  // Performance Test
  console.log('\n🚀 Performance Test:');
  const performanceStart = Date.now();
  
  try {
    await Promise.all([
      claudeFlowProspection.quickSearch('test query 1'),
      claudeFlowProspection.quickSearch('test query 2'),
      claudeFlowProspection.quickSearch('test query 3')
    ]);
    
    const performanceTime = Date.now() - performanceStart;
    console.log(`   Parallel execution time: ${performanceTime}ms`);
    
    if (performanceTime < 15000) {
      console.log('   ✅ Performance: Excellent');
    } else if (performanceTime < 30000) {
      console.log('   ⚠️ Performance: Good');
    } else {
      console.log('   ❌ Performance: Needs optimization');
    }
  } catch (error) {
    console.log(`   ❌ Performance test failed: ${error.message}`);
  }

  // Cleanup
  console.log('\n🧹 Cleaning up test environment...');
  await claudeFlowProspection.cleanup();
  console.log('✅ Cleanup completed');

  return testResults;
}

// HTTP API Test Function
async function testHTTPAPI() {
  console.log('\n🌐 Testing HTTP API Integration...');
  
  const axios = require('axios');
  const baseURL = 'http://localhost:3000/api/claude-flow';
  
  try {
    // Test health endpoint
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log(`   Health Check: ${healthResponse.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    
    // Test metrics endpoint
    const metricsResponse = await axios.get(`${baseURL}/metrics`);
    console.log(`   Metrics: ${metricsResponse.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    
    // Test search endpoint
    const searchResponse = await axios.post(`${baseURL}/quick-search`, {
      query: 'developer',
      options: { limit: 2 }
    });
    console.log(`   Quick Search: ${searchResponse.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log('🎉 HTTP API tests completed successfully!');
    
  } catch (error) {
    console.log(`❌ HTTP API test failed: ${error.message}`);
    console.log('💡 Make sure the server is running on port 3000');
  }
}

// Main execution
async function main() {
  console.log('🚀 Claude-Flow Integration Test Suite');
  console.log('=====================================\n');
  
  // Run core tests
  const coreResults = await runTests();
  
  // Ask if user wants to test HTTP API
  console.log('\n❓ Do you want to test the HTTP API integration?');
  console.log('   (Make sure the server is running with: npm start)');
  console.log('   Press Ctrl+C to skip or wait 5 seconds to continue...\n');
  
  // Wait 5 seconds then test HTTP API
  await new Promise(resolve => setTimeout(resolve, 5000));
  await testHTTPAPI();
  
  console.log('\n🏁 All tests completed!');
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error.message);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

// Run tests if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, testHTTPAPI };