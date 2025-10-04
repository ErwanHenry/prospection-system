/**
 * Direct LinkedIn selector capture runner
 */

// Set environment variable
process.env.LINKEDIN_COOKIE = "AQEFAHQBAAAAAA9NtvAAAAGYQRS5wwAAAZixok2STQAAF3VybjpsaTptZW1iZXI6MjA2MzQ1Njk3WNUl08Fs9Qymdqx5TE5sMHBHmgkAFxWtNZ4ndGkFrS6AQ9aYMF7U04LPr3YHjCcN8L58oTMt0r4bX6NWA9MVmZl8XKRRYjxmDO-pfvcY2bk8pp6LKn5bUjz5mClSJSHCMwDCy2hlaLhfTBtSxDjIXgwgOnh4ENe3aXb0D-eU6Q94wg2dhP9qoEOSHG6U0wbmT0MJZw";

const linkedinSelectorCapture = require('./backend/services/linkedinSelectorCapture');

async function runCapture() {
  try {
    console.log('🚀 Running LinkedIn DOM selector capture...');
    const analysis = await linkedinSelectorCapture.captureCurrentSelectors();
    
    console.log('\n✅ CAPTURE COMPLETE!');
    console.log('📁 Files created:');
    console.log('  - linkedin_working_capture.png');
    console.log('  - linkedin_working_analysis.json');
    
    // Show summary
    if (analysis.profileLinks.length > 0) {
      console.log(`\n🔗 Found ${analysis.profileLinks.length} profile links`);
      console.log('📋 Sample profile link:', analysis.profileLinks[0].href);
    }
    
    const workingSelectors = Object.entries(analysis.workingSelectors)
      .filter(([_, data]) => data.hasProfileLinks && data.count > 0)
      .sort((a, b) => b[1].count - a[1].count);
    
    console.log('\n🎯 TOP WORKING SELECTORS:');
    workingSelectors.slice(0, 3).forEach(([selector, data]) => {
      console.log(`  ${selector}: ${data.count} elements`);
    });
    
    if (analysis.detailedAnalysis && analysis.detailedAnalysis.length > 0) {
      const best = analysis.detailedAnalysis[0];
      console.log('\n✨ RECOMMENDED SELECTOR:');
      console.log(`  ${best.selector}`);
      if (best.profileInfo.nameSpan !== 'NOT_FOUND') {
        console.log(`  ✅ Name extraction working: "${best.profileInfo.nameSpan}"`);
      }
    }
    
  } catch (error) {
    console.error('❌ Capture failed:', error.message);
  }
}

runCapture();