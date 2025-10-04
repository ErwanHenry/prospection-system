#!/usr/bin/env node

/**
 * Test script for enhanced LinkedIn scraping with human behavior simulation
 * This script tests the new features implemented for avoiding LinkedIn detection
 */

require('dotenv').config();
const linkedinScraper = require('./backend/services/linkedinScraper');

async function testEnhancedFeatures() {
  console.log('🧪 Testing Enhanced LinkedIn Scraper Features\n');
  
  try {
    // Test 1: Initialize with random viewport and user agent
    console.log('1️⃣ Testing initialization with randomized browser settings...');
    const initialized = await linkedinScraper.initialize();
    
    if (initialized) {
      console.log('✅ Scraper initialized successfully');
      console.log(`   Viewport: ${linkedinScraper.currentSession.viewport.width}x${linkedinScraper.currentSession.viewport.height}`);
      console.log(`   User Agent: ${linkedinScraper.currentSession.userAgent.substring(0, 50)}...`);
    } else {
      console.log('❌ Failed to initialize scraper');
      return;
    }
    
    // Test 2: Search with enhanced human behavior
    console.log('\n2️⃣ Testing search with human behavior simulation...');
    const testQuery = process.env.DEFAULT_SEARCH_QUERY || 'CTO startup Paris';
    console.log(`   Searching for: "${testQuery}"`);
    
    const startTime = Date.now();
    const results = await linkedinScraper.search(testQuery, 3);
    const endTime = Date.now();
    
    console.log(`✅ Search completed in ${(endTime - startTime) / 1000}s`);
    console.log(`   Found ${results.length} profiles`);
    
    // Test 3: Analyze search results quality
    console.log('\n3️⃣ Analyzing search results quality...');
    
    if (results.length > 0) {
      results.forEach((profile, index) => {
        console.log(`   Profile ${index + 1}:`);
        console.log(`     Name: ${profile.name}`);
        console.log(`     Title: ${profile.title}`);
        console.log(`     Company: ${profile.company || 'Not extracted'}`);
        console.log(`     Location: ${profile.location}`);
        console.log(`     URL: ${profile.linkedinUrl}`);
        console.log(`     Layout used: ${profile.layout}`);
        console.log(`     Extracted at: ${profile.extractedAt}`);
        console.log('');
      });
      
      // Validate profile data quality
      const validProfiles = results.filter(p => 
        p.name && 
        p.name.length > 2 && 
        p.linkedinUrl && 
        p.linkedinUrl.includes('/in/')
      );
      
      console.log(`   Data Quality: ${validProfiles.length}/${results.length} profiles are valid`);
      
      // Check for company extraction
      const profilesWithCompany = results.filter(p => p.company && p.company.length > 0);
      console.log(`   Company Extraction: ${profilesWithCompany.length}/${results.length} profiles have company data`);
      
    } else {
      console.log('⚠️ No profiles found - this could indicate:');
      console.log('   - LinkedIn cookie needs renewal');
      console.log('   - Search query too specific');
      console.log('   - LinkedIn page layout changes');
      console.log('   - Rate limiting or detection');
    }
    
    // Test 4: Check session tracking
    console.log('\n4️⃣ Testing session tracking...');
    console.log(`   Session searches: ${linkedinScraper.currentSession.searchCount}`);
    console.log(`   Daily searches: ${linkedinScraper.dailySearchCount}/${linkedinScraper.dailyLimit}`);
    console.log(`   Session duration: ${Math.round((Date.now() - linkedinScraper.currentSession.sessionStartTime) / 1000)}s`);
    
    // Test 5: Rate limiting behavior
    console.log('\n5️⃣ Testing rate limiting and adaptive behavior...');
    const currentHour = new Date().getHours();
    console.log(`   Current time: ${new Date().toLocaleTimeString()}`);
    console.log(`   Rate limit delay: ${linkedinScraper.rateLimitDelay}ms`);
    
    if (currentHour < 9 || currentHour > 18) {
      console.log('   ✅ Off-hours detected - using cautious timing');
    } else {
      console.log('   ✅ Business hours detected - using normal timing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('LINKEDIN_COOKIE')) {
      console.log('\n💡 Tip: Make sure LINKEDIN_COOKIE is set in .env file');
    } else if (error.message.includes('unusual activity')) {
      console.log('\n💡 Tip: LinkedIn may have detected automation. Wait and try again.');
    } else if (error.message.includes('Daily search limit')) {
      console.log('\n💡 Tip: Daily search limit reached. Try again tomorrow.');
    }
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await linkedinScraper.close();
    console.log('✅ Test completed');
  }
}

// Enhanced features summary
function displayEnhancedFeatures() {
  console.log('🚀 Enhanced LinkedIn Scraper Features:');
  console.log('');
  console.log('🎭 Human Behavior Simulation:');
  console.log('   • Random viewport sizes (1366x768, 1920x1080, etc.)');
  console.log('   • Rotating user agents');
  console.log('   • Variable scrolling patterns');
  console.log('   • Mouse movement simulation');
  console.log('   • Human-like typing delays');
  console.log('');
  console.log('⏰ Adaptive Timing:');
  console.log('   • Time-based behavior adjustment');
  console.log('   • Session duration awareness');
  console.log('   • Variable delays between actions');
  console.log('   • Rate limiting based on time of day');
  console.log('');
  console.log('🔍 Enhanced Profile Extraction:');
  console.log('   • Multiple selector strategies');
  console.log('   • Support for different LinkedIn layouts');
  console.log('   • Better company extraction from titles');
  console.log('   • Improved error handling and logging');
  console.log('');
  console.log('🛡️ Detection Avoidance:');
  console.log('   • Stealth plugin integration');
  console.log('   • Random browser fingerprinting');
  console.log('   • Human interaction simulation');
  console.log('   • Pattern randomization');
  console.log('');
}

// Main execution
async function main() {
  displayEnhancedFeatures();
  console.log(''.padEnd(50, '='));
  await testEnhancedFeatures();
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testEnhancedFeatures, displayEnhancedFeatures };