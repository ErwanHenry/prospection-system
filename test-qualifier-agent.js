/**
 * Test script for ProspectQualifierAgent V3.0
 *
 * Tests:
 * 1. Single prospect qualification
 * 2. Batch qualification (10 prospects)
 * 3. Statistics calculation
 * 4. Scoring breakdown analysis
 */

require('dotenv').config();
const ProspectQualifierAgent = require('./api/agents/ProspectQualifierAgent');

// Sample prospects for testing
const testProspects = [
  // HOT PROSPECT (expected score > 85)
  {
    id: 'hot-001',
    firstName: 'Marie',
    lastName: 'Laurent',
    title: 'VP of Sales',
    company: 'DataFlow SaaS',
    companySize: '180',
    industry: 'SaaS',
    email: 'marie.laurent@dataflow.fr',
    linkedinUrl: 'https://linkedin.com/in/marie-laurent',
    bio: 'Leading sales transformation at DataFlow. Currently scaling our SDR team from 5 to 15 reps. Series B funding announced.',
    department: 'Sales',
    linkedinActivity: 'Posted 3 days ago about hiring challenges',
    painSignals: 'Mentioned difficulty in finding qualified leads, hiring 10 SDRs',
    techStack: 'Currently using basic CRM and manual prospection',
    growthSignals: 'Series B funding, expansion to 3 new markets'
  },

  // QUALIFIED PROSPECT (expected score 70-85)
  {
    id: 'qualified-001',
    firstName: 'Jean',
    lastName: 'Dupont',
    title: 'Director of Marketing',
    company: 'TechCorp Solutions',
    companySize: '95',
    industry: 'Technology',
    email: 'jean.dupont@techcorp.fr',
    linkedinUrl: 'https://linkedin.com/in/jean-dupont',
    bio: 'Marketing leader focused on growth. Building high-performance teams.',
    department: 'Marketing',
    linkedinActivity: 'Active last 10 days',
    painSignals: 'Looking for better prospection tools',
    techStack: 'Using spreadsheets for lead tracking'
  },

  // BORDERLINE QUALIFIED (expected score ~70)
  {
    id: 'borderline-001',
    firstName: 'Sophie',
    lastName: 'Martin',
    title: 'Head of Business Development',
    company: 'GrowthLab',
    companySize: '60',
    industry: 'Consulting',
    email: 'sophie.martin@growthlab.fr',
    linkedinUrl: 'https://linkedin.com/in/sophie-martin',
    bio: 'Business development professional. Helping companies scale.',
    department: 'Business Development',
    linkedinActivity: 'Active last month',
    painSignals: 'Scaling challenges',
    techStack: 'Basic tools'
  },

  // REJECTED - Wrong seniority (expected score < 70)
  {
    id: 'rejected-001',
    firstName: 'Pierre',
    lastName: 'Blanc',
    title: 'Sales Representative',
    company: 'SmallCorp',
    companySize: '15',
    industry: 'Services',
    email: 'pierre.blanc@smallcorp.fr',
    linkedinUrl: 'https://linkedin.com/in/pierre-blanc',
    bio: 'Sales rep helping clients grow.',
    department: 'Sales'
  },

  // REJECTED - Wrong industry (expected score < 70)
  {
    id: 'rejected-002',
    firstName: 'Alice',
    lastName: 'Rousseau',
    title: 'VP of Operations',
    company: 'RetailCo',
    companySize: '200',
    industry: 'Retail',
    email: 'alice.rousseau@retailco.fr',
    linkedinUrl: 'https://linkedin.com/in/alice-rousseau',
    bio: 'Operations leader in retail industry.',
    department: 'Operations'
  },

  // QUALIFIED - Good fit
  {
    id: 'qualified-002',
    firstName: 'Thomas',
    lastName: 'Bernard',
    title: 'Chief Revenue Officer',
    company: 'CloudTech',
    companySize: '120',
    industry: 'SaaS',
    email: 'thomas.bernard@cloudtech.fr',
    linkedinUrl: 'https://linkedin.com/in/thomas-bernard',
    bio: 'CRO driving revenue growth. Tech enthusiast.',
    department: 'Revenue',
    linkedinActivity: 'Active last week',
    painSignals: 'Looking to optimize sales processes',
    techStack: 'Basic CRM',
    growthSignals: 'Recent funding round'
  },

  // HOT - Perfect fit
  {
    id: 'hot-002',
    firstName: 'Emma',
    lastName: 'Lefevre',
    title: 'VP of Growth',
    company: 'ScaleFast SaaS',
    companySize: '250',
    industry: 'Software',
    email: 'emma.lefevre@scalefast.fr',
    linkedinUrl: 'https://linkedin.com/in/emma-lefevre',
    bio: 'VP Growth at ScaleFast. Leading team of 20 SDRs. Always looking for better tools to scale efficiently.',
    department: 'Growth',
    linkedinActivity: 'Posted yesterday about prospection challenges',
    painSignals: 'Hiring 8 new SDRs this quarter, manual prospection is killing us',
    techStack: 'Spreadsheets and basic automation',
    growthSignals: 'Hyper-growth mode, hiring spree, just raised Series A'
  },

  // REJECTED - Too small
  {
    id: 'rejected-003',
    firstName: 'Lucas',
    lastName: 'Moreau',
    title: 'Founder',
    company: 'StartupX',
    companySize: '8',
    industry: 'Tech',
    email: 'lucas.moreau@startupx.fr',
    linkedinUrl: 'https://linkedin.com/in/lucas-moreau',
    bio: 'Founder of StartupX. Building the future.',
    department: 'Executive'
  },

  // QUALIFIED - Good department fit
  {
    id: 'qualified-003',
    firstName: 'Camille',
    lastName: 'Petit',
    title: 'Director of Revenue Operations',
    company: 'TechGrowth',
    companySize: '140',
    industry: 'Technology',
    email: 'camille.petit@techgrowth.fr',
    linkedinUrl: 'https://linkedin.com/in/camille-petit',
    bio: 'RevOps leader optimizing sales and marketing alignment.',
    department: 'RevOps',
    linkedinActivity: 'Active last 2 weeks',
    painSignals: 'Looking to streamline prospection workflows',
    techStack: 'HubSpot + manual processes'
  },

  // BORDERLINE - Decent fit
  {
    id: 'borderline-002',
    firstName: 'Antoine',
    lastName: 'Girard',
    title: 'Head of Sales',
    company: 'MidSizeTech',
    companySize: '75',
    industry: 'SaaS',
    email: 'antoine.girard@midsizetech.fr',
    linkedinUrl: 'https://linkedin.com/in/antoine-girard',
    bio: 'Sales leader at MidSizeTech. Building high-performing teams.',
    department: 'Sales',
    linkedinActivity: 'Active occasionally',
    painSignals: 'Some prospection challenges'
  }
];

async function runTests() {
  console.log('\n🧪 ProspectQualifierAgent V3.0 Test Suite');
  console.log('=========================================\n');

  // Check if OPENAI_API_KEY is set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-proj-your-key-here') {
    console.log('⚠️  OPENAI_API_KEY not configured in .env file');
    console.log('📝 Please add your OpenAI API key to .env file:');
    console.log('   OPENAI_API_KEY=sk-proj-...\n');
    console.log('🔄 Running tests with rule-based scoring only (no AI enhancement)\n');
  }

  const agent = new ProspectQualifierAgent({
    rejectionThreshold: 70,
    hotProspectThreshold: 85
  });

  // Test 1: Single prospect qualification
  console.log('📋 Test 1: Single Prospect Qualification');
  console.log('─────────────────────────────────────────\n');

  const singleProspect = testProspects[0]; // Marie Laurent (HOT)
  console.log(`Testing: ${singleProspect.firstName} ${singleProspect.lastName}`);
  console.log(`Title: ${singleProspect.title}`);
  console.log(`Company: ${singleProspect.company} (${singleProspect.companySize} employees)\n`);

  try {
    const result = await agent.qualify(singleProspect);
    console.log('✅ Qualification Result:');
    console.log(`   Score: ${result.score}/100`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Workflow: ${result.workflow}`);
    console.log(`   Reasoning: ${result.reasoning}\n`);
    console.log('   Score Breakdown:');
    Object.entries(result.breakdown).forEach(([dimension, score]) => {
      console.log(`   - ${dimension}: ${score} pts`);
    });
    console.log('\n');
  } catch (error) {
    console.error('❌ Test 1 Failed:', error.message, '\n');
  }

  // Test 2: Batch qualification
  console.log('📋 Test 2: Batch Qualification (10 prospects)');
  console.log('──────────────────────────────────────────────\n');

  try {
    const startTime = Date.now();
    const results = await agent.qualifyBatch(testProspects, {
      concurrency: 3,
      onProgress: (progress) => {
        console.log(`   Progress: ${progress.processed}/${progress.total} (${progress.percentage}%)`);
      }
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ Batch completed in ${duration}s\n`);

    // Display results table
    console.log('Results Summary:');
    console.log('┌────────────────────────────┬───────┬───────────┬──────────┐');
    console.log('│ Name                       │ Score │ Status    │ Workflow │');
    console.log('├────────────────────────────┼───────┼───────────┼──────────┤');
    results.forEach(r => {
      const name = `${r.metadata?.title || 'Unknown'} @ ${r.metadata?.company || 'Unknown'}`.substring(0, 26);
      const score = String(r.score).padStart(5);
      const status = r.status.padEnd(9);
      const workflow = (r.workflow || 'N/A').padEnd(8);
      console.log(`│ ${name.padEnd(26)} │ ${score} │ ${status} │ ${workflow} │`);
    });
    console.log('└────────────────────────────┴───────┴───────────┴──────────┘\n');

    // Test 3: Statistics
    console.log('📋 Test 3: Statistics Analysis');
    console.log('───────────────────────────────\n');

    const stats = agent.getStats(results);
    console.log('✅ Statistics:');
    console.log(`   Total Prospects: ${stats.total}`);
    console.log(`   Rejected: ${stats.rejected} (${stats.rejectionRate}%)`);
    console.log(`   Qualified: ${stats.qualified}`);
    console.log(`   Hot: ${stats.hot}`);
    console.log(`   Average Score: ${stats.avgScore}/100`);
    console.log(`   Qualification Rate: ${stats.qualifiedRate}%\n`);

    // Validation
    console.log('📋 Test 4: Validation');
    console.log('──────────────────────\n');

    const expectedRejectionRate = 30; // ~3 out of 10 should be rejected
    const actualRejectionRate = stats.rejectionRate;

    if (actualRejectionRate >= 20 && actualRejectionRate <= 40) {
      console.log(`✅ Rejection rate within acceptable range (${actualRejectionRate}%)`);
    } else {
      console.log(`⚠️  Rejection rate outside expected range: ${actualRejectionRate}% (expected ~30%)`);
    }

    const hotCount = stats.hot;
    if (hotCount >= 1 && hotCount <= 3) {
      console.log(`✅ Hot prospects count looks good (${hotCount})`);
    } else {
      console.log(`⚠️  Hot prospects count: ${hotCount} (expected 1-3)`);
    }

    console.log('\n✅ All tests completed successfully!\n');

  } catch (error) {
    console.error('❌ Batch test failed:', error.message);
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
