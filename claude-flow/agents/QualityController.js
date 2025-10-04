/**
 * QualityController Agent - Claude-Flow
 * Supervisor agent for data validation, workflow coordination, and error handling
 */

// Use mock Claude-Flow for now
let Agent;
try {
  Agent = require('claude-flow').Agent;
} catch (error) {
  Agent = require('../mock/claude-flow-mock').Agent;
}
const logger = require('../../backend/utils/logger');

class QualityControllerAgent extends Agent {
  constructor(options = {}) {
    super({
      name: 'QualityController',
      description: 'Validates data quality, coordinates workflows, and handles errors',
      capabilities: ['data_validation', 'workflow_coordination', 'error_handling', 'quality_scoring'],
      type: 'supervisor',
      ...options
    });
    
    this.validationRules = {
      prospect: {
        name: { required: true, minLength: 2, maxLength: 100 },
        company: { required: true, minLength: 2, maxLength: 100 },
        title: { required: false, maxLength: 100 },
        email: { required: false, format: 'email' },
        linkedinUrl: { required: false, format: 'linkedin_url' },
        location: { required: false, maxLength: 100 }
      },
      email: {
        format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        disposable: ['tempmail.org', '10minutemail.com', 'guerrillamail.com']
      },
      linkedin: {
        format: /linkedin\.com\/(in|pub)\//,
        minPathLength: 5
      }
    };
    
    this.qualityMetrics = {
      totalValidated: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      averageScore: 0
    };
    
    this.errorPatterns = new Map();
    this.workflowStates = new Map();
  }

  async initialize() {
    try {
      logger.info('Initializing QualityController agent', { agent: 'QualityController' });
      
      // Load validation rules from config if available
      await this.loadValidationConfig();
      
      // Initialize error pattern recognition
      this.initializeErrorPatterns();
      
      this.status = 'ready';
      logger.info('QualityController agent initialized successfully', { 
        agent: 'QualityController',
        validationRules: Object.keys(this.validationRules).length
      });
      return true;
      
    } catch (error) {
      logger.error('Failed to initialize QualityController agent', { 
        agent: 'QualityController', 
        error: error.message 
      });
      this.status = 'error';
      return false;
    }
  }

  async validateProspect(prospect, options = {}) {
    try {
      const { strict = false, scoreThreshold = 60 } = options;
      
      logger.debug('Validating prospect', { 
        agent: 'QualityController', 
        prospect: prospect.name,
        strict
      });

      const validation = {
        prospect: prospect.name,
        valid: true,
        score: 0,
        errors: [],
        warnings: [],
        details: {},
        timestamp: new Date().toISOString()
      };

      // Validate required fields
      const requiredFieldsValidation = this.validateRequiredFields(prospect);
      validation.details.requiredFields = requiredFieldsValidation;
      if (!requiredFieldsValidation.valid) {
        validation.errors.push(...requiredFieldsValidation.errors);
        if (strict) validation.valid = false;
      }

      // Validate data formats
      const formatValidation = this.validateDataFormats(prospect);
      validation.details.formats = formatValidation;
      if (!formatValidation.valid) {
        validation.errors.push(...formatValidation.errors);
        if (strict) validation.valid = false;
      }

      // Validate data quality
      const qualityValidation = this.validateDataQuality(prospect);
      validation.details.quality = qualityValidation;
      validation.warnings.push(...qualityValidation.warnings);

      // Calculate quality score
      validation.score = this.calculateQualityScore(prospect, validation);

      // Apply score threshold
      if (validation.score < scoreThreshold) {
        validation.warnings.push(`Quality score ${validation.score} below threshold ${scoreThreshold}`);
        if (strict) {
          validation.valid = false;
          validation.errors.push('Quality score below threshold');
        }
      }

      // Update metrics
      this.updateQualityMetrics(validation);

      logger.debug('Prospect validation completed', { 
        agent: 'QualityController', 
        prospect: prospect.name,
        valid: validation.valid,
        score: validation.score,
        errors: validation.errors.length,
        warnings: validation.warnings.length
      });

      return validation;

    } catch (error) {
      logger.error('Prospect validation failed', { 
        agent: 'QualityController', 
        prospect: prospect.name,
        error: error.message
      });
      
      return {
        prospect: prospect.name,
        valid: false,
        score: 0,
        errors: [error.message],
        warnings: [],
        details: {},
        timestamp: new Date().toISOString()
      };
    }
  }

  async coordinateWorkflow(workflowId, agents, task) {
    try {
      logger.info('Coordinating workflow', { 
        agent: 'QualityController', 
        workflowId,
        agents: agents.map(a => a.name),
        taskType: task.type
      });

      // Initialize workflow state
      const workflowState = {
        id: workflowId,
        status: 'running',
        startTime: new Date().toISOString(),
        endTime: null,
        agents: agents.map(a => ({ name: a.name, status: 'pending' })),
        task,
        results: [],
        errors: [],
        warnings: []
      };

      this.workflowStates.set(workflowId, workflowState);

      // Execute workflow based on task type
      let result;
      switch (task.type) {
        case 'prospect_search':
          result = await this.coordinateProspectSearch(workflowState, agents, task.data);
          break;
          
        case 'email_enrichment':
          result = await this.coordinateEmailEnrichment(workflowState, agents, task.data);
          break;
          
        case 'full_prospection':
          result = await this.coordinateFullProspection(workflowState, agents, task.data);
          break;
          
        default:
          throw new Error(`Unknown workflow type: ${task.type}`);
      }

      workflowState.status = 'completed';
      workflowState.endTime = new Date().toISOString();

      logger.info('Workflow coordination completed', { 
        agent: 'QualityController', 
        workflowId,
        duration: new Date(workflowState.endTime) - new Date(workflowState.startTime),
        success: result.success
      });

      return result;

    } catch (error) {
      logger.error('Workflow coordination failed', { 
        agent: 'QualityController', 
        workflowId,
        error: error.message
      });
      
      const workflowState = this.workflowStates.get(workflowId);
      if (workflowState) {
        workflowState.status = 'failed';
        workflowState.endTime = new Date().toISOString();
        workflowState.errors.push(error.message);
      }
      
      return {
        success: false,
        error: error.message,
        workflowId
      };
    }
  }

  async coordinateProspectSearch(workflowState, agents, taskData) {
    const prospectSearcher = agents.find(a => a.name === 'ProspectSearcher');
    if (!prospectSearcher) {
      throw new Error('ProspectSearcher agent not available');
    }

    // Execute search
    this.updateAgentStatus(workflowState, 'ProspectSearcher', 'running');
    const searchResult = await prospectSearcher.execute({
      type: 'search',
      data: taskData
    });

    if (!searchResult.success) {
      this.updateAgentStatus(workflowState, 'ProspectSearcher', 'failed');
      throw new Error(`Search failed: ${searchResult.error}`);
    }

    this.updateAgentStatus(workflowState, 'ProspectSearcher', 'completed');

    // Validate found prospects
    const validatedProspects = [];
    for (const prospect of searchResult.prospects) {
      const validation = await this.validateProspect(prospect, { strict: false });
      if (validation.valid || validation.score > 40) {
        validatedProspects.push({
          ...prospect,
          validation
        });
      } else {
        workflowState.warnings.push(`Prospect ${prospect.name} failed validation`);
      }
    }

    return {
      success: true,
      prospects: validatedProspects,
      totalFound: searchResult.prospects.length,
      validated: validatedProspects.length,
      workflowId: workflowState.id
    };
  }

  async coordinateEmailEnrichment(workflowState, agents, taskData) {
    const emailFinder = agents.find(a => a.name === 'EmailFinder');
    const crmManager = agents.find(a => a.name === 'CRMManager');
    
    if (!emailFinder) {
      throw new Error('EmailFinder agent not available');
    }

    const results = [];
    
    for (const prospect of taskData.prospects) {
      try {
        // Find email
        this.updateAgentStatus(workflowState, 'EmailFinder', 'running');
        const emailResult = await emailFinder.execute({
          type: 'find_email',
          data: { prospect, options: taskData.options }
        });

        if (emailResult.success) {
          // Validate email
          const emailValidation = this.validateEmail(emailResult.email);
          
          if (emailValidation.valid) {
            prospect.email = emailResult.email;
            prospect.emailSource = emailResult.source;
            prospect.emailVerified = emailResult.verified;

            // Update CRM if available
            if (crmManager) {
              this.updateAgentStatus(workflowState, 'CRMManager', 'running');
              await crmManager.execute({
                type: 'update_prospect',
                data: {
                  prospectId: prospect.id,
                  updates: {
                    email: emailResult.email,
                    emailSource: emailResult.source
                  }
                }
              });
              this.updateAgentStatus(workflowState, 'CRMManager', 'completed');
            }

            results.push({
              prospect: prospect.name,
              success: true,
              email: emailResult.email,
              source: emailResult.source
            });
          } else {
            workflowState.warnings.push(`Invalid email found for ${prospect.name}: ${emailResult.email}`);
            results.push({
              prospect: prospect.name,
              success: false,
              error: 'Invalid email format'
            });
          }
        } else {
          results.push({
            prospect: prospect.name,
            success: false,
            error: emailResult.error
          });
        }
      } catch (error) {
        workflowState.errors.push(`Error processing ${prospect.name}: ${error.message}`);
        results.push({
          prospect: prospect.name,
          success: false,
          error: error.message
        });
      }
    }

    this.updateAgentStatus(workflowState, 'EmailFinder', 'completed');

    return {
      success: true,
      results,
      processed: results.length,
      successful: results.filter(r => r.success).length,
      workflowId: workflowState.id
    };
  }

  async coordinateFullProspection(workflowState, agents, taskData) {
    // This is a complex workflow that combines search, enrichment, and CRM operations
    const { query, options = {} } = taskData;
    
    // Step 1: Search for prospects
    const searchResult = await this.coordinateProspectSearch(workflowState, agents, {
      query,
      options: { ...options, limit: options.limit || 20 }
    });

    if (!searchResult.success) {
      throw new Error('Prospect search failed');
    }

    // Step 2: Enrich with emails
    const enrichmentResult = await this.coordinateEmailEnrichment(workflowState, agents, {
      prospects: searchResult.prospects.slice(0, options.maxEnrichment || 10),
      options: { verify: true }
    });

    // Step 3: Save to CRM
    const crmManager = agents.find(a => a.name === 'CRMManager');
    if (crmManager) {
      this.updateAgentStatus(workflowState, 'CRMManager', 'running');
      
      const enrichedProspects = enrichmentResult.results
        .filter(r => r.success)
        .map(r => searchResult.prospects.find(p => p.name === r.prospect));

      if (enrichedProspects.length > 0) {
        await crmManager.execute({
          type: 'batch_add',
          data: {
            prospects: enrichedProspects,
            options: { checkDuplicates: true, updateIfExists: true }
          }
        });
      }
      
      this.updateAgentStatus(workflowState, 'CRMManager', 'completed');
    }

    return {
      success: true,
      searchResults: searchResult,
      enrichmentResults: enrichmentResult,
      totalProcessed: searchResult.prospects.length,
      emailsFound: enrichmentResult.successful,
      workflowId: workflowState.id
    };
  }

  // Validation helper methods

  validateRequiredFields(prospect) {
    const errors = [];
    const rules = this.validationRules.prospect;
    
    for (const [field, rule] of Object.entries(rules)) {
      if (rule.required && (!prospect[field] || prospect[field].trim() === '')) {
        errors.push(`Required field '${field}' is missing`);
      }
      
      if (prospect[field] && rule.minLength && prospect[field].length < rule.minLength) {
        errors.push(`Field '${field}' is too short (minimum ${rule.minLength} characters)`);
      }
      
      if (prospect[field] && rule.maxLength && prospect[field].length > rule.maxLength) {
        errors.push(`Field '${field}' is too long (maximum ${rule.maxLength} characters)`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateDataFormats(prospect) {
    const errors = [];
    
    // Email format validation
    if (prospect.email && !this.validationRules.email.format.test(prospect.email)) {
      errors.push('Invalid email format');
    }
    
    // LinkedIn URL validation
    if (prospect.linkedinUrl && !this.validationRules.linkedin.format.test(prospect.linkedinUrl)) {
      errors.push('Invalid LinkedIn URL format');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateDataQuality(prospect) {
    const warnings = [];
    
    // Check for suspicious patterns
    if (prospect.name && prospect.name.toLowerCase().includes('test')) {
      warnings.push('Name contains test data');
    }
    
    if (prospect.company && prospect.company.toLowerCase().includes('test')) {
      warnings.push('Company contains test data');
    }
    
    // Check for disposable email domains
    if (prospect.email) {
      const domain = prospect.email.split('@')[1]?.toLowerCase();
      if (this.validationRules.email.disposable.includes(domain)) {
        warnings.push('Email uses disposable domain');
      }
    }
    
    // Check for incomplete LinkedIn URLs
    if (prospect.linkedinUrl && prospect.linkedinUrl.split('/').pop().length < this.validationRules.linkedin.minPathLength) {
      warnings.push('LinkedIn URL appears incomplete');
    }
    
    return {
      warnings
    };
  }

  validateEmail(email) {
    if (!email) {
      return { valid: false, errors: ['Email is required'] };
    }
    
    const errors = [];
    
    if (!this.validationRules.email.format.test(email)) {
      errors.push('Invalid email format');
    }
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (this.validationRules.email.disposable.includes(domain)) {
      errors.push('Disposable email domain not allowed');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  calculateQualityScore(prospect, validation) {
    let score = 0;
    
    // Base score for required fields
    if (prospect.name && prospect.name.trim()) score += 20;
    if (prospect.company && prospect.company.trim()) score += 20;
    
    // Bonus for optional but valuable fields
    if (prospect.title && prospect.title.trim()) score += 15;
    if (prospect.email && validation.details.formats?.valid !== false) score += 20;
    if (prospect.linkedinUrl && validation.details.formats?.valid !== false) score += 15;
    if (prospect.location && prospect.location.trim()) score += 10;
    
    // Deduct for errors and warnings
    score -= validation.errors.length * 10;
    score -= validation.warnings.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  updateQualityMetrics(validation) {
    this.qualityMetrics.totalValidated++;
    
    if (validation.valid) {
      this.qualityMetrics.passed++;
    } else {
      this.qualityMetrics.failed++;
    }
    
    if (validation.warnings.length > 0) {
      this.qualityMetrics.warnings++;
    }
    
    // Update average score
    const totalScore = this.qualityMetrics.averageScore * (this.qualityMetrics.totalValidated - 1) + validation.score;
    this.qualityMetrics.averageScore = Math.round(totalScore / this.qualityMetrics.totalValidated);
  }

  updateAgentStatus(workflowState, agentName, status) {
    const agent = workflowState.agents.find(a => a.name === agentName);
    if (agent) {
      agent.status = status;
      agent.timestamp = new Date().toISOString();
    }
  }

  async loadValidationConfig() {
    // Load custom validation rules from config file if available
    // This could be extended to load from external sources
  }

  initializeErrorPatterns() {
    // Initialize common error patterns for recognition and handling
    this.errorPatterns.set('rate_limit', /rate limit|too many requests/i);
    this.errorPatterns.set('auth_failed', /authentication|unauthorized|invalid credentials/i);
    this.errorPatterns.set('network_error', /network|connection|timeout/i);
    this.errorPatterns.set('data_format', /format|invalid|malformed/i);
  }

  classifyError(error) {
    const errorMessage = error.message?.toLowerCase() || '';
    
    for (const [pattern, regex] of this.errorPatterns) {
      if (regex.test(errorMessage)) {
        return pattern;
      }
    }
    
    return 'unknown';
  }

  // Agent interface methods
  async execute(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'validate_prospect':
        return await this.validateProspect(data.prospect, data.options);
      
      case 'coordinate_workflow':
        return await this.coordinateWorkflow(data.workflowId, data.agents, data.task);
      
      case 'get_quality_metrics':
        return this.qualityMetrics;
      
      case 'get_workflow_status':
        return this.workflowStates.get(data.workflowId) || null;
      
      case 'health_check':
        return {
          success: true,
          status: this.status,
          qualityMetrics: this.qualityMetrics,
          activeWorkflows: this.workflowStates.size
        };
      
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  async cleanup() {
    this.workflowStates.clear();
    this.qualityMetrics = {
      totalValidated: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      averageScore: 0
    };
    logger.info('QualityController agent cleaned up', { agent: 'QualityController' });
  }
}

module.exports = QualityControllerAgent;