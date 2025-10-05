/**
 * Prospects API Routes - V3.0
 *
 * Endpoints:
 * - POST /api/prospects/qualify - Qualify single prospect
 * - POST /api/prospects/qualify-batch - Qualify multiple prospects
 * - GET /api/prospects/stats - Get qualification statistics
 */

const express = require('express');
const router = express.Router();
const ProspectQualifierAgent = require('../agents/ProspectQualifierAgent');

// Initialize qualifier agent
const qualifierAgent = new ProspectQualifierAgent({
  model: process.env.OPENAI_MODEL || 'gpt-4',
  rejectionThreshold: parseInt(process.env.REJECTION_THRESHOLD) || 70,
  hotProspectThreshold: parseInt(process.env.HOT_THRESHOLD) || 85
});

/**
 * POST /api/prospects/qualify
 * Qualify a single prospect
 *
 * Body:
 * {
 *   "id": "prospect-123",
 *   "firstName": "Jean",
 *   "lastName": "Dupont",
 *   "title": "Director of Sales",
 *   "company": "TechCorp SAS",
 *   "companySize": "150",
 *   "industry": "SaaS",
 *   "email": "jean.dupont@techcorp.fr",
 *   "linkedinUrl": "...",
 *   "bio": "Scaling sales team...",
 *   "department": "Sales",
 *   "linkedinActivity": "Active last 7 days",
 *   "painSignals": "Hiring 5 SDRs",
 *   "techStack": "Using spreadsheets for prospection"
 * }
 *
 * Response:
 * {
 *   "prospectId": "prospect-123",
 *   "score": 78,
 *   "status": "QUALIFIED",
 *   "workflow": "standard",
 *   "breakdown": { ... },
 *   "reasoning": "...",
 *   "timestamp": "2025-10-05T..."
 * }
 */
router.post('/qualify', async (req, res) => {
  try {
    const prospect = req.body;

    // Validation
    if (!prospect.email && !prospect.id) {
      return res.status(400).json({
        error: 'Missing required field: email or id'
      });
    }

    if (!prospect.title || !prospect.company) {
      return res.status(400).json({
        error: 'Missing required fields: title and company are mandatory'
      });
    }

    // Qualify prospect
    const result = await qualifierAgent.qualify(prospect);

    // Return result
    res.json(result);

  } catch (error) {
    console.error('❌ Qualification Error:', error);
    res.status(500).json({
      error: 'Internal server error during qualification',
      message: error.message
    });
  }
});

/**
 * POST /api/prospects/qualify-batch
 * Qualify multiple prospects in batch
 *
 * Body:
 * {
 *   "prospects": [ ... ],
 *   "concurrency": 3 (optional, default 3)
 * }
 *
 * Response:
 * {
 *   "results": [ ... ],
 *   "stats": {
 *     "total": 100,
 *     "rejected": 68,
 *     "rejectionRate": 68,
 *     "qualified": 25,
 *     "hot": 7,
 *     "avgScore": 65
 *   },
 *   "duration": 45.2
 * }
 */
router.post('/qualify-batch', async (req, res) => {
  try {
    const { prospects, concurrency = 3 } = req.body;

    if (!Array.isArray(prospects) || prospects.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: prospects must be a non-empty array'
      });
    }

    const startTime = Date.now();

    // Qualify batch with progress tracking
    const results = await qualifierAgent.qualifyBatch(prospects, {
      concurrency,
      onProgress: (progress) => {
        console.log(`📊 Progress: ${progress.processed}/${progress.total} (${progress.percentage}%)`);
      }
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Calculate statistics
    const stats = qualifierAgent.getStats(results);

    res.json({
      results,
      stats,
      duration: parseFloat(duration),
      metadata: {
        totalProcessed: results.length,
        concurrency,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Batch Qualification Error:', error);
    res.status(500).json({
      error: 'Internal server error during batch qualification',
      message: error.message
    });
  }
});

/**
 * GET /api/prospects/stats
 * Get qualification statistics (if results are stored)
 *
 * Query params:
 * - startDate (optional)
 * - endDate (optional)
 *
 * Response:
 * {
 *   "total": 500,
 *   "rejected": 340,
 *   "rejectionRate": 68,
 *   "qualified": 120,
 *   "hot": 40,
 *   "avgScore": 67
 * }
 */
router.get('/stats', async (req, res) => {
  try {
    // TODO: Implement persistent storage for qualification results
    // For now, return empty stats
    res.json({
      message: 'Stats endpoint - coming soon',
      note: 'Implement persistent storage to track qualification history'
    });

  } catch (error) {
    console.error('❌ Stats Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/prospects/test
 * Test endpoint with sample prospect data
 */
router.post('/test', async (req, res) => {
  try {
    // Sample prospect for testing
    const sampleProspect = {
      id: 'test-prospect-001',
      firstName: 'Marie',
      lastName: 'Laurent',
      title: 'VP of Sales',
      company: 'DataFlow Solutions',
      companySize: '180',
      industry: 'SaaS',
      email: 'marie.laurent@dataflow.fr',
      linkedinUrl: 'https://linkedin.com/in/marie-laurent',
      bio: 'Leading sales transformation at DataFlow. Passionate about AI-driven growth. Currently scaling our SDR team from 5 to 15 reps.',
      department: 'Sales',
      linkedinActivity: 'Posted 3 days ago about hiring challenges',
      painSignals: 'Mentioned difficulty in finding qualified leads, hiring 10 SDRs',
      techStack: 'Currently using basic CRM and manual prospection',
      growthSignals: 'Series B funding announced, expansion to 3 new markets',
      lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
    };

    const result = await qualifierAgent.qualify(sampleProspect);

    res.json({
      message: 'Test qualification completed',
      sample: sampleProspect,
      result
    });

  } catch (error) {
    console.error('❌ Test Error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
});

module.exports = router;
