#!/usr/bin/env node

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000';

// Get all prospects without emails
async function getProspectsWithoutEmails() {
  const response = await fetch(`${API_URL}/api/prospects`);
  const data = await response.json();
  
  return data.prospects.filter(p => !p.email || p.email === '' || p.email === 'email_not_unlocked@domain.com');
}

// Find email for a prospect
async function findEmail(prospect) {
  try {
    const response = await fetch(`${API_URL}/api/automation/find-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospect })
    });
    
    const result = await response.json();
    if (result.success && result.email) {
      console.log(`✅ ${prospect.name}: ${result.email}`);
      return result.email;
    }
    return null;
  } catch (error) {
    console.log(`❌ ${prospect.name}: ${error.message}`);
    return null;
  }
}

// Update email in CRM
async function updateEmail(prospectIndex, email) {
  const row = prospectIndex + 2; // +1 for header, +1 for 1-based indexing
  
  const response = await fetch(`${API_URL}/api/prospects/bulk-update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      updates: [{ row, column: 'F', value: email }]
    })
  });
  
  return await response.json();
}

async function main() {
  console.log('🔍 Finding emails for all prospects...\n');
  
  const prospects = await getProspectsWithoutEmails();
  console.log(`Found ${prospects.length} prospects without emails\n`);
  
  let found = 0;
  let errors = 0;
  
  for (let i = 0; i < Math.min(prospects.length, 15); i++) { // Limit to 15 for now
    const prospect = prospects[i];
    
    console.log(`\n[${i+1}/${Math.min(prospects.length, 15)}] Processing ${prospect.name} @ ${prospect.company}`);
    
    const email = await findEmail(prospect);
    if (email) {
      // Find the original index in the full list
      const originalIndex = await getOriginalIndex(prospect);
      if (originalIndex !== -1) {
        const updateResult = await updateEmail(originalIndex, email);
        if (updateResult.success) {
          console.log(`  💾 Updated in CRM`);
          found++;
        } else {
          console.log(`  ❌ Failed to update CRM`);
          errors++;
        }
      }
    } else {
      errors++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n🎯 Results: ${found} emails found, ${errors} errors`);
}

async function getOriginalIndex(targetProspect) {
  const response = await fetch(`${API_URL}/api/prospects`);
  const data = await response.json();
  
  return data.prospects.findIndex(p => 
    p.name === targetProspect.name && p.company === targetProspect.company
  );
}

main().catch(console.error);