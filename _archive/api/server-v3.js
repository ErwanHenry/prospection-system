/**
 * Prospection System V3.0 Server
 *
 * Simplified architecture with 4 AI agents:
 * 1. ProspectQualifierAgent - 100-point scoring, 70% rejection rate
 * 2. MessageGeneratorAgent - "Insolite" messaging (coming soon)
 * 3. WorkflowOrchestratorAgent - Multi-touch sequences (coming soon)
 * 4. EngagementTrackerAgent - Interaction monitoring (coming soon)
 *
 * Goal: 10 qualified demos in 30 days for Graixl.com
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
const prospectsRouter = require('./routes/prospects');
app.use('/api/prospects', prospectsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    agents: {
      ProspectQualifierAgent: 'active',
      MessageGeneratorAgent: 'pending',
      WorkflowOrchestratorAgent: 'pending',
      EngagementTrackerAgent: 'pending'
    },
    environment: {
      nodeVersion: process.version,
      openaiConfigured: !!process.env.OPENAI_API_KEY,
      port: PORT
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Prospection System V3.0',
    description: 'AI-powered B2B prospection for Graixl.com',
    goal: '10 qualified demos in 30 days',
    version: '3.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: 'GET /health',
      qualifySingle: 'POST /api/prospects/qualify',
      qualifyBatch: 'POST /api/prospects/qualify-batch',
      test: 'POST /api/prospects/test'
    }
  });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    version: '3.0.0',
    endpoints: [
      {
        method: 'POST',
        path: '/api/prospects/qualify',
        description: 'Qualify a single prospect with 100-point AI scoring',
        body: {
          firstName: 'string (required)',
          lastName: 'string (required)',
          title: 'string (required)',
          company: 'string (required)',
          companySize: 'string (required)',
          industry: 'string (required)',
          email: 'string (required)',
          bio: 'string (optional)',
          department: 'string (optional)',
          linkedinActivity: 'string (optional)',
          painSignals: 'string (optional)',
          techStack: 'string (optional)'
        },
        response: {
          score: 'number (0-100)',
          status: 'REJECTED | QUALIFIED | HOT',
          workflow: 'null | standard | priority',
          breakdown: 'object (8 dimensions)',
          reasoning: 'string (AI explanation)'
        }
      },
      {
        method: 'POST',
        path: '/api/prospects/qualify-batch',
        description: 'Qualify multiple prospects in parallel',
        body: {
          prospects: 'array (required)',
          concurrency: 'number (optional, default 3)'
        },
        response: {
          results: 'array (qualification results)',
          stats: 'object (aggregated statistics)',
          duration: 'number (seconds)'
        }
      },
      {
        method: 'POST',
        path: '/api/prospects/test',
        description: 'Test qualification with sample prospect',
        body: {},
        response: {
          sample: 'object (test prospect)',
          result: 'object (qualification result)'
        }
      }
    ],
    agents: {
      ProspectQualifierAgent: {
        status: 'ACTIVE',
        description: '100-point AI scoring system with 8 dimensions',
        scoringDimensions: [
          'Company Size (15 pts)',
          'Industry (15 pts)',
          'Growth Signals (10 pts)',
          'Seniority (15 pts)',
          'Department Relevance (15 pts)',
          'LinkedIn Activity (10 pts)',
          'Pain Signals (10 pts)',
          'Tech Stack (10 pts)'
        ],
        thresholds: {
          rejection: '< 70 points',
          qualified: '70-85 points (standard workflow)',
          hot: '> 85 points (priority workflow)'
        }
      },
      MessageGeneratorAgent: {
        status: 'PENDING',
        description: 'Generate "insolite" messages with A/B/C testing',
        comingSoon: 'Week 2 of roadmap'
      },
      WorkflowOrchestratorAgent: {
        status: 'PENDING',
        description: 'Multi-touch sequences with smart timing',
        comingSoon: 'Week 3 of roadmap'
      },
      EngagementTrackerAgent: {
        status: 'PENDING',
        description: 'Track interactions and trigger follow-ups',
        comingSoon: 'Week 4 of roadmap'
      }
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/docs',
      'POST /api/prospects/qualify',
      'POST /api/prospects/qualify-batch',
      'POST /api/prospects/test'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Prospection System V3.0 Server Started');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API docs: http://localhost:${PORT}/api/docs`);
  console.log(`🎯 Goal: 10 qualified demos in 30 days\n`);
  console.log('✅ ProspectQualifierAgent: ACTIVE');
  console.log('⏳ MessageGeneratorAgent: PENDING');
  console.log('⏳ WorkflowOrchestratorAgent: PENDING');
  console.log('⏳ EngagementTrackerAgent: PENDING\n');
});

module.exports = app;
