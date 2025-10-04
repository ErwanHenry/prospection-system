/**
 * Claude-Flow Integration for Prospection System
 * Main entry point for the multi-agent orchestration system
 */

const AutomationOrchestrator = require('./AutomationOrchestrator');
const logger = require('../backend/utils/logger');

class ClaudeFlowProspection {
  constructor(options = {}) {
    this.orchestrator = new AutomationOrchestrator(options);
    this.isInitialized = false;
  }

  async initialize() {
    try {
      logger.info('Initializing Claude-Flow Prospection System', { component: 'ClaudeFlowProspection' });
      
      const success = await this.orchestrator.initialize();
      if (!success) {
        throw new Error('Failed to initialize AutomationOrchestrator');
      }
      
      this.isInitialized = true;
      logger.info('Claude-Flow Prospection System initialized successfully', { component: 'ClaudeFlowProspection' });
      return true;
      
    } catch (error) {
      logger.error('Failed to initialize Claude-Flow Prospection System', { 
        component: 'ClaudeFlowProspection', 
        error: error.message 
      });
      return false;
    }
  }

  // High-level API methods

  async searchProspects(query, options = {}) {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }

    return await this.orchestrator.executeWorkflow('prospect_search', {
      query,
      options
    });
  }

  async enrichWithEmails(prospects, options = {}) {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }

    return await this.orchestrator.executeWorkflow('email_enrichment', {
      prospects,
      options
    });
  }

  async runFullProspection(query, options = {}) {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }

    return await this.orchestrator.executeWorkflow('full_prospection', {
      query,
      options
    });
  }

  async cleanupCRM(options = {}) {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }

    return await this.orchestrator.executeWorkflow('crm_cleanup', {
      options
    });
  }

  async batchProcess(queries, options = {}) {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }

    return await this.orchestrator.executeWorkflow('batch_processing', {
      queries,
      options
    });
  }

  // Swarm operations for quick tasks

  async quickSearch(query, options = {}) {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }

    return await this.orchestrator.spawnSwarm({
      type: 'search',
      data: { query, options }
    }, {
      size: 2,
      agents: ['ProspectSearcher'],
      timeout: 15000
    });
  }

  async quickEmailFind(prospects, options = {}) {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }

    return await this.orchestrator.spawnSwarm({
      type: 'find_email',
      data: { prospects, options }
    }, {
      size: 3,
      agents: ['EmailFinder'],
      timeout: 30000
    });
  }

  // Monitoring and management

  getPerformanceMetrics() {
    if (!this.isInitialized) {
      return { error: 'System not initialized' };
    }

    return this.orchestrator.getPerformanceMetrics();
  }

  async getSystemHealth() {
    if (!this.isInitialized) {
      return { error: 'System not initialized' };
    }

    const agentHealth = await this.orchestrator.getAgentHealth();
    const performance = this.orchestrator.getPerformanceMetrics();
    
    return {
      status: 'ready',
      initialized: this.isInitialized,
      agents: agentHealth,
      performance,
      timestamp: new Date().toISOString()
    };
  }

  getWorkflowStatus(workflowId) {
    if (!this.isInitialized) {
      return { error: 'System not initialized' };
    }

    return this.orchestrator.getWorkflowStatus(workflowId);
  }

  // Utility methods

  async restart() {
    logger.info('Restarting Claude-Flow Prospection System', { component: 'ClaudeFlowProspection' });
    
    if (this.isInitialized) {
      await this.cleanup();
    }
    
    return await this.initialize();
  }

  async cleanup() {
    if (this.isInitialized) {
      await this.orchestrator.cleanup();
      this.isInitialized = false;
      logger.info('Claude-Flow Prospection System cleaned up', { component: 'ClaudeFlowProspection' });
    }
  }
}

// Export singleton instance
const claudeFlowProspection = new ClaudeFlowProspection();

// Express.js integration middleware
function createExpressIntegration() {
  return {
    // Middleware to initialize Claude-Flow
    initialize: async (req, res, next) => {
      if (!claudeFlowProspection.isInitialized) {
        const success = await claudeFlowProspection.initialize();
        if (!success) {
          return res.status(500).json({ error: 'Failed to initialize Claude-Flow system' });
        }
      }
      next();
    },

    // Routes for Claude-Flow operations
    routes: {
      // Search prospects with Claude-Flow
      searchProspects: async (req, res) => {
        try {
          const { query, options = {} } = req.body;
          const result = await claudeFlowProspection.searchProspects(query, options);
          res.json(result);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

      // Enrich with emails
      enrichWithEmails: async (req, res) => {
        try {
          const { prospects, options = {} } = req.body;
          const result = await claudeFlowProspection.enrichWithEmails(prospects, options);
          res.json(result);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

      // Full prospection workflow
      runFullProspection: async (req, res) => {
        try {
          const { query, options = {} } = req.body;
          const result = await claudeFlowProspection.runFullProspection(query, options);
          res.json(result);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

      // Quick search swarm
      quickSearch: async (req, res) => {
        try {
          const { query, options = {} } = req.body;
          const result = await claudeFlowProspection.quickSearch(query, options);
          res.json(result);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

      // System health check
      systemHealth: async (req, res) => {
        try {
          const health = await claudeFlowProspection.getSystemHealth();
          res.json(health);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

      // Performance metrics
      performanceMetrics: (req, res) => {
        try {
          const metrics = claudeFlowProspection.getPerformanceMetrics();
          res.json(metrics);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

      // Workflow status
      workflowStatus: (req, res) => {
        try {
          const { workflowId } = req.params;
          const status = claudeFlowProspection.getWorkflowStatus(workflowId);
          res.json(status);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
    }
  };
}

module.exports = {
  ClaudeFlowProspection,
  claudeFlowProspection,
  createExpressIntegration,
  
  // Export individual components for advanced usage
  AutomationOrchestrator,
  agents: {
    ProspectSearcher: require('./agents/ProspectSearcher'),
    EmailFinder: require('./agents/EmailFinder'),
    CRMManager: require('./agents/CRMManager'),
    QualityController: require('./agents/QualityController')
  }
};