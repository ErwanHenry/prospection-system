#!/usr/bin/env node

require('dotenv').config();
const playwright = require('./backend/services/linkedinPlaywright');

async function testPlaywright() {
  console.log('🎭 TEST PLAYWRIGHT - SCRAPER MODERNE');
  console.log('='.repeat(40));
  
  const timeout = setTimeout(() => {
    console.log('⏰ Timeout 60s, arrêt...');
    playwright.close();
    process.exit(1);
  }, 60000);
  
  try {
    console.log('🚀 Init...');
    const start = Date.now();
    
    const init = await playwright.initialize();
    if (!init) {
      console.log('❌ Init failed');
      return;
    }
    
    console.log(`✅ Init: ${Date.now() - start}ms`);
    
    console.log('🔍 Search...');
    const searchStart = Date.now();
    
    const results = await playwright.search('software engineer', 3);
    
    console.log(`📊 ${results.length} profiles (${Date.now() - searchStart}ms)`);
    
    if (results.length > 0) {
      console.log('\n✅ FOUND:');
      results.forEach((p, i) => {
        console.log(`${i+1}. ${p.name} (${p.linkedinId})`);
      });
      
      const real = results.filter(p => p.linkedinId && !p.linkedinId.includes('blocked')).length;
      console.log(`\n🎯 ${real}/${results.length} real profiles`);
      
      if (real > 0) {
        console.log('🎉 SUCCESS! Anti-bot bypassed!');
      }
    } else {
      console.log('❌ No profiles found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    clearTimeout(timeout);
    await playwright.close();
    console.log('✅ Done');
  }
}

testPlaywright().catch(console.error);