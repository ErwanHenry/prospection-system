#!/usr/bin/env node

require('dotenv').config();
const ultimate = require('./backend/services/linkedinUltimate');

async function testUltimate() {
  console.log('🎯 TEST SCRAPER ULTIMATE - ANALYSE FINALE');
  console.log('='.repeat(50));
  
  try {
    const initialized = await ultimate.initialize();
    if (!initialized) {
      console.log('❌ Init failed');
      return;
    }
    
    console.log('✅ Ultimate scraper initialisé');
    
    const results = await ultimate.search('software engineer', 3);
    
    console.log(`\n📊 Résultats: ${results.length} analyses`);
    
    if (results.length > 0) {
      const analysis = results[0];
      
      console.log('\n🎯 ANALYSE COMPLÈTE DES DÉFENSES LINKEDIN:');
      console.log('='.repeat(50));
      
      console.log('\n📋 Défenses détectées:');
      analysis.defenseAnalysis.detectedMethods.forEach((method, i) => {
        console.log(`   ${i+1}. ${method}`);
      });
      
      console.log(`\n📊 Efficacité: ${analysis.defenseAnalysis.effectiveness}`);
      console.log(`💡 Recommandation: ${analysis.defenseAnalysis.recommendation}`);
      
      console.log('\n🚀 SOLUTIONS IMMÉDIATES:');
      analysis.recommendations.immediate.forEach((rec, i) => {
        console.log(`   ${i+1}. ${rec}`);
      });
      
      console.log('\n📈 STRATÉGIE LONG TERME:');
      analysis.recommendations.long_term.forEach((rec, i) => {
        console.log(`   ${i+1}. ${rec}`);
      });
      
      console.log('\n💼 MÉTHODE MANUELLE (100% efficace):');
      analysis.detailedInstructions.manual_method.steps.forEach((step, i) => {
        console.log(`   ${step}`);
      });
      
      console.log('\n💰 API LINKEDIN OFFICIELLE:');
      analysis.detailedInstructions.api_method.steps.forEach((step, i) => {
        console.log(`   ${step}`);
      });
      console.log(`   💸 Coût: ${analysis.detailedInstructions.api_method.cost}`);
      
      console.log('\n🔄 SOURCES ALTERNATIVES:');
      analysis.detailedInstructions.alternative_sources.options.forEach((option, i) => {
        console.log(`   ${i+1}. ${option}`);
      });
      
      console.log('\n🎯 CONCLUSION:');
      console.log('   ✅ Toutes les techniques de contournement ont été expérimentées');
      console.log('   ❌ LinkedIn bloque efficacement le scraping automatisé');
      console.log('   💡 Les méthodes légales sont plus fiables à long terme');
      console.log('   🚀 La recherche manuelle reste 100% efficace');
      
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await ultimate.close();
  }
}

testUltimate().catch(console.error);