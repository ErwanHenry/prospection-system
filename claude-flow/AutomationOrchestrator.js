/**
 * AutomationOrchestrator - Claude-Flow Master Controller
 * Queen agent that orchestrates all prospection workflows with intelligent coordination
 */

// Use mock Claude-Flow for now
let HiveMind;
try {
  HiveMind = require('claude-flow').HiveMind;
} catch (error) {
  HiveMind = require('./mock/claude-flow-mock').HiveMind;
}
const ProspectSearcherAgent = require('./agents/ProspectSearcher');
const EmailFinderAgent = require('./agents/EmailFinder');
const CRMManagerAgent = require('./agents/CRMManager');
const QualityControllerAgent = require('./agents/QualityController');
const logger = require('../backend/utils/logger');

class AutomationOrchestrator {
  constructor(options = {}) {
    this.hive = new HiveMind({
      name: 'ProspectionHive',
      description: 'Intelligent prospection automation system',
      ...options
    });
    
    this.agents = new Map();
    this.workflows = new Map();
    this.performance = {
      totalWorkflows: 0,
      successfulWorkflows: 0,
      averageExecutionTime: 0,
      totalProspectsProcessed: 0,
      totalEmailsFound: 0
    };
    
    this.isInitialized = false;
  }

  async initialize() {
    try {
      logger.info('Initializing AutomationOrchestrator', { component: 'AutomationOrchestrator' });
      
      // Initialize the hive mind
      await this.hive.initialize();
      
      // Create and register agents
      await this.createAgents();
      
      // Register workflows
      this.registerWorkflows();
      
      // Setup agent communication patterns
      this.setupCommunication();
      
      this.isInitialized = true;
      
      logger.info('AutomationOrchestrator initialized successfully', { 
        component: 'AutomationOrchestrator',
        agents: this.agents.size,
        workflows: this.workflows.size
      });
      
      return true;
      
    } catch (error) {
      logger.error('Failed to initialize AutomationOrchestrator', { 
        component: 'AutomationOrchestrator', 
        error: error.message 
      });
      return false;
    }
  }

  async createAgents() {
    // Create quality controller first (supervisor)
    const qualityController = new QualityControllerAgent();
    await qualityController.initialize();
    this.agents.set('QualityController', qualityController);
    await this.hive.addAgent(qualityController);

    // Create worker agents
    const prospectSearcher = new ProspectSearcherAgent();
    await prospectSearcher.initialize();
    this.agents.set('ProspectSearcher', prospectSearcher);
    await this.hive.addAgent(prospectSearcher);

    const emailFinder = new EmailFinderAgent();
    await emailFinder.initialize();
    this.agents.set('EmailFinder', emailFinder);
    await this.hive.addAgent(emailFinder);

    const crmManager = new CRMManagerAgent();
    await crmManager.initialize();
    this.agents.set('CRMManager', crmManager);
    await this.hive.addAgent(crmManager);

    logger.info('All agents created and registered', { 
      component: 'AutomationOrchestrator',
      agents: Array.from(this.agents.keys())
    });
  }

  registerWorkflows() {
    // Register different workflow types
    this.workflows.set('prospect_search', this.createProspectSearchWorkflow());
    this.workflows.set('email_enrichment', this.createEmailEnrichmentWorkflow());
    this.workflows.set('full_prospection', this.createFullProspectionWorkflow());
    this.workflows.set('crm_cleanup', this.createCRMCleanupWorkflow());
    this.workflows.set('batch_processing', this.createBatchProcessingWorkflow());
    
    logger.info('Workflows registered', { 
      component: 'AutomationOrchestrator',
      workflows: Array.from(this.workflows.keys())
    });
  }

  setupCommunication() {
    // Setup agent communication patterns and event handlers
    this.hive.on('agent_error', this.handleAgentError.bind(this));
    this.hive.on('workflow_complete', this.handleWorkflowComplete.bind(this));
    this.hive.on('performance_alert', this.handlePerformanceAlert.bind(this));
  }

  // Main orchestration methods

  async executeWorkflow(workflowType, data, options = {}) {
    try {
      if (!this.isInitialized) {
        throw new Error('AutomationOrchestrator not initialized');
      }

      const workflowId = this.generateWorkflowId();
      const startTime = Date.now();
      
      logger.info('Starting workflow execution', { 
        component: 'AutomationOrchestrator',
        workflowId,
        workflowType,
        options
      });

      const workflow = this.workflows.get(workflowType);
      if (!workflow) {
        throw new Error(`Unknown workflow type: ${workflowType}`);
      }

      // Execute workflow with the hive mind
      const result = await this.hive.executeWorkflow(workflow, {
        id: workflowId,
        data,
        options,
        startTime
      });

      const executionTime = Date.now() - startTime;
      
      // Update performance metrics
      this.updatePerformanceMetrics(result, executionTime);

      logger.info('Workflow execution completed', { 
        component: 'AutomationOrchestrator',
        workflowId,
        success: result.success,
        executionTime
      });

      return {
        ...result,
        workflowId,
        executionTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Workflow execution failed', { 
        component: 'AutomationOrchestrator',
        workflowType,
        error: error.message
      });
      
      return {
        success: false,
        error: error.message,
        workflowType,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Workflow definitions

  createProspectSearchWorkflow() {
    return {
      name: 'prospect_search',
      description: 'Search for prospects with quality validation',
      steps: [
        {
          agent: 'ProspectSearcher',
          action: 'search',
          parallel: false
        },
        {
          agent: 'QualityController',
          action: 'validate_prospects',
          parallel: false
        }
      ],
      coordinator: 'QualityController'
    };
  }

  createEmailEnrichmentWorkflow() {
    return {
      name: 'email_enrichment',
      description: 'Find and verify emails for prospects',
      steps: [
        {
          agent: 'EmailFinder',
          action: 'batch_find',
          parallel: true,
          concurrency: 3
        },
        {
          agent: 'QualityController',
          action: 'validate_emails',
          parallel: false
        },
        {
          agent: 'CRMManager',
          action: 'update_prospects',
          parallel: false
        }
      ],
      coordinator: 'QualityController'
    };
  }

  createFullProspectionWorkflow() {
    return {
      name: 'full_prospection',
      description: 'Complete prospection pipeline with CRM integration',
      steps: [
        {
          agent: 'ProspectSearcher',
          action: 'search',
          parallel: false
        },
        {
          agent: 'QualityController',
          action: 'validate_prospects',
          parallel: false
        },
        {
          agent: 'EmailFinder',
          action: 'batch_find',
          parallel: true,
          concurrency: 3
        },
        {
          agent: 'QualityController',
          action: 'validate_emails',
          parallel: false
        },
        {
          agent: 'CRMManager',
          action: 'batch_add',
          parallel: false
        }
      ],
      coordinator: 'QualityController'
    };
  }

  createCRMCleanupWorkflow() {
    return {
      name: 'crm_cleanup',
      description: 'Clean and optimize CRM data',
      steps: [
        {
          agent: 'CRMManager',
          action: 'remove_duplicates',
          parallel: false
        },
        {
          agent: 'QualityController',
          action: 'validate_data_quality',
          parallel: false
        },
        {
          agent: 'CRMManager',
          action: 'update_analytics',
          parallel: false
        }
      ],
      coordinator: 'QualityController'
    };
  }

  createBatchProcessingWorkflow() {
    return {
      name: 'batch_processing',
      description: 'High-performance batch processing for large datasets',
      steps: [
        {
          agent: 'ProspectSearcher',
          action: 'search',
          parallel: true,
          concurrency: 5
        },
        {
          agent: 'EmailFinder',
          action: 'batch_find',
          parallel: true,
          concurrency: 10
        },
        {
          agent: 'CRMManager',
          action: 'batch_add',
          parallel: true,
          concurrency: 3
        }
      ],
      coordinator: 'QualityController',
      performance_optimized: true
    };
  }

  // Swarm operations for quick tasks

  async spawnSwarm(task, options = {}) {
    try {
      const { 
        size = 3, 
        timeout = 30000,
        agents = ['ProspectSearcher', 'EmailFinder'] 
      } = options;

      logger.info('Spawning agent swarm', { 
        component: 'AutomationOrchestrator',
        task: task.type,
        size,
        agents
      });

      const swarmAgents = agents.map(agentName => this.agents.get(agentName))
                                .filter(agent => agent && agent.status === 'ready');

      if (swarmAgents.length === 0) {
        throw new Error('No available agents for swarm');
      }

      // Execute task in parallel across swarm
      const swarmPromises = swarmAgents.slice(0, size).map((agent, index) => 
        this.executeSwarmTask(agent, task, { ...options, swarmIndex: index })
      );

      const results = await Promise.allSettled(swarmPromises);
      const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failed = results.filter(r => r.status === 'rejected').map(r => r.reason);

      logger.info('Swarm execution completed', { 
        component: 'AutomationOrchestrator',
        successful: successful.length,
        failed: failed.length
      });

      return {
        success: true,
        results: successful,
        errors: failed,
        swarmSize: swarmAgents.length
      };

    } catch (error) {
      logger.error('Swarm execution failed', { 
        component: 'AutomationOrchestrator',
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeSwarmTask(agent, task, options) {
    const timeout = options.timeout || 30000;
    
    return Promise.race([
      agent.execute(task),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Swarm task timeout')), timeout)
      )
    ]);
  }

  // Performance and monitoring

  updatePerformanceMetrics(result, executionTime) {
    this.performance.totalWorkflows++;
    
    if (result.success) {
      this.performance.successfulWorkflows++;
    }
    
    // Update average execution time
    const totalTime = this.performance.averageExecutionTime * (this.performance.totalWorkflows - 1) + executionTime;
    this.performance.averageExecutionTime = Math.round(totalTime / this.performance.totalWorkflows);
    
    // Update prospect metrics
    if (result.prospects) {
      this.performance.totalProspectsProcessed += result.prospects.length;
    }
    
    if (result.emailsFound) {
      this.performance.totalEmailsFound += result.emailsFound;
    }
  }

  getPerformanceMetrics() {
    return {
      ...this.performance,
      successRate: this.performance.totalWorkflows > 0 ? 
        Math.round((this.performance.successfulWorkflows / this.performance.totalWorkflows) * 100) : 0,
      agentStatus: Object.fromEntries(
        Array.from(this.agents.entries()).map(([name, agent]) => [name, agent.status])
      ),
      timestamp: new Date().toISOString()
    };
  }

  // Event handlers

  handleAgentError(error, agent) {
    logger.error('Agent error detected', { 
      component: 'AutomationOrchestrator',
      agent: agent.name,
      error: error.message
    });
    
    // Implement error recovery strategies
    this.attemptAgentRecovery(agent, error);
  }

  handleWorkflowComplete(workflow, result) {
    logger.info('Workflow completed', { 
      component: 'AutomationOrchestrator',
      workflow: workflow.name,
      success: result.success
    });
  }

  handlePerformanceAlert(alert) {
    logger.warn('Performance alert', { 
      component: 'AutomationOrchestrator',
      alert: alert.message
    });
  }

  async attemptAgentRecovery(agent, error) {
    try {
      logger.info('Attempting agent recovery', { 
        component: 'AutomationOrchestrator',
        agent: agent.name
      });
      
      // Simple recovery: reinitialize the agent
      await agent.initialize();
      
      if (agent.status === 'ready') {
        logger.info('Agent recovery successful', { 
          component: 'AutomationOrchestrator',
          agent: agent.name
        });
      }
    } catch (recoveryError) {
      logger.error('Agent recovery failed', { 
        component: 'AutomationOrchestrator',
        agent: agent.name,
        error: recoveryError.message
      });
    }
  }

  // Utility methods

  generateWorkflowId() {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getWorkflowStatus(workflowId) {
    return this.hive.getWorkflowStatus(workflowId);
  }

  async getAgentHealth() {
    const health = {};
    
    for (const [name, agent] of this.agents) {
      try {
        const agentHealth = await agent.execute({ type: 'health_check' });
        health[name] = agentHealth;
      } catch (error) {
        health[name] = { success: false, error: error.message };
      }
    }
    
    return health;
  }

  async cleanup() {
    logger.info('Cleaning up AutomationOrchestrator', { component: 'AutomationOrchestrator' });
    
    // Cleanup all agents
    for (const [name, agent] of this.agents) {
      try {
        await agent.cleanup();
      } catch (error) {
        logger.warn('Agent cleanup failed', { agent: name, error: error.message });
      }
    }
    
    // Cleanup hive mind
    await this.hive.cleanup();
    
    this.agents.clear();
    this.workflows.clear();
    this.isInitialized = false;
  }
}

module.exports = AutomationOrchestrator;