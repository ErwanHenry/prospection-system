/**
 * CRMManager Agent - Claude-Flow
 * Specialized agent for Google Sheets CRM operations and data management
 */

// Use mock Claude-Flow for now
let Agent;
try {
  Agent = require('claude-flow').Agent;
} catch (error) {
  Agent = require('../mock/claude-flow-mock').Agent;
}
const googleSheets = require('../../backend/services/googleSheets');
const logger = require('../../backend/utils/logger');

class CRMManagerAgent extends Agent {
  constructor(options = {}) {
    super({
      name: 'CRMManager',
      description: 'Manages Google Sheets CRM operations with intelligent data processing',
      capabilities: ['sheets_operations', 'duplicate_detection', 'data_sync', 'analytics'],
      ...options
    });
    
    this.operationQueue = [];
    this.batchSize = 10;
    this.processingBatch = false;
    this.duplicateDetectionCache = new Map();
    this.analytics = {
      totalProspects: 0,
      duplicatesRemoved: 0,
      operationsPerformed: 0,
      lastSync: null
    };
  }

  async initialize() {
    try {
      logger.info('Initializing CRMManager agent', { agent: 'CRMManager' });
      
      // Initialize Google Sheets connection
      const sheetsReady = await googleSheets.initialize();
      if (!sheetsReady) {
        throw new Error('Google Sheets not available - authentication required');
      }
      
      // Setup headers if needed
      await googleSheets.setupHeaders();
      
      // Load initial analytics
      await this.updateAnalytics();
      
      // Start batch processing
      this.startBatchProcessor();
      
      this.status = 'ready';
      logger.info('CRMManager agent initialized successfully', { 
        agent: 'CRMManager',
        totalProspects: this.analytics.totalProspects
      });
      return true;
      
    } catch (error) {
      logger.error('Failed to initialize CRMManager agent', { 
        agent: 'CRMManager', 
        error: error.message 
      });
      this.status = 'error';
      return false;
    }
  }

  async addProspect(prospect, options = {}) {
    try {
      const { 
        checkDuplicates = true, 
        batch = false,
        updateIfExists = false 
      } = options;

      logger.info('Adding prospect to CRM', { 
        agent: 'CRMManager', 
        prospect: prospect.name,
        batch,
        checkDuplicates
      });

      // Validate prospect data
      const validatedProspect = this.validateProspectData(prospect);
      if (!validatedProspect.valid) {
        throw new Error(`Invalid prospect data: ${validatedProspect.errors.join(', ')}`);
      }

      // Check for duplicates if requested
      if (checkDuplicates) {
        const duplicateCheck = await this.checkForDuplicates(prospect);
        if (duplicateCheck.isDuplicate) {
          if (updateIfExists) {
            return await this.updateProspect(duplicateCheck.existingProspect.id, prospect);
          } else {
            return {
              success: false,
              error: 'Duplicate prospect found',
              duplicate: duplicateCheck.existingProspect,
              prospect: prospect.name
            };
          }
        }
      }

      // Prepare data for Google Sheets
      const formattedData = this.formatProspectForSheets(prospect);

      // Add to batch queue or process immediately
      const operation = {
        type: 'add',
        data: formattedData,
        prospect,
        timestamp: new Date().toISOString()
      };

      if (batch) {
        this.operationQueue.push(operation);
        return {
          success: true,
          message: 'Added to batch queue',
          prospect: prospect.name,
          queueSize: this.operationQueue.length
        };
      } else {
        const result = await this.executeOperation(operation);
        await this.updateAnalytics();
        return result;
      }

    } catch (error) {
      logger.error('Failed to add prospect to CRM', { 
        agent: 'CRMManager', 
        prospect: prospect.name,
        error: error.message
      });
      
      return {
        success: false,
        error: error.message,
        prospect: prospect.name
      };
    }
  }

  async updateProspect(prospectId, updates, options = {}) {
    try {
      const { batch = false } = options;

      logger.info('Updating prospect in CRM', { 
        agent: 'CRMManager', 
        prospectId,
        batch
      });

      // Find the prospect row
      const existingData = await this.findProspectById(prospectId);
      if (!existingData) {
        throw new Error('Prospect not found');
      }

      // Merge updates with existing data
      const updatedProspect = { ...existingData.prospect, ...updates };
      const formattedData = this.formatProspectForSheets(updatedProspect);

      const operation = {
        type: 'update',
        data: formattedData,
        row: existingData.row,
        prospectId,
        timestamp: new Date().toISOString()
      };

      if (batch) {
        this.operationQueue.push(operation);
        return {
          success: true,
          message: 'Added to batch queue',
          prospectId,
          queueSize: this.operationQueue.length
        };
      } else {
        return await this.executeOperation(operation);
      }

    } catch (error) {
      logger.error('Failed to update prospect in CRM', { 
        agent: 'CRMManager', 
        prospectId,
        error: error.message
      });
      
      return {
        success: false,
        error: error.message,
        prospectId
      };
    }
  }

  async removeDuplicates(options = {}) {
    try {
      const { dryRun = false } = options;

      logger.info('Starting duplicate removal process', { 
        agent: 'CRMManager',
        dryRun
      });

      // Get all prospects
      const data = await googleSheets.getSheetData();
      if (!data || data.length <= 1) {
        return {
          success: true,
          duplicatesFound: 0,
          duplicatesRemoved: 0,
          message: 'No data to process'
        };
      }

      const headers = data[0];
      const prospects = data.slice(1);
      
      // Find duplicates based on LinkedIn URL or Name+Company combination
      const duplicateMap = new Map();
      const duplicateIndices = [];
      
      prospects.forEach((row, index) => {
        const linkedinUrl = row[4]?.trim() || '';
        const name = row[1]?.trim() || '';
        const company = row[2]?.trim() || '';
        
        // Create unique identifier
        let identifier = '';
        if (linkedinUrl) {
          identifier = linkedinUrl.toLowerCase();
        } else if (name && company) {
          identifier = `${name.toLowerCase()}_${company.toLowerCase()}`;
        } else {
          identifier = `${name.toLowerCase()}_${index}`; // Fallback with index
        }
        
        if (duplicateMap.has(identifier)) {
          duplicateIndices.push({
            row: index + 2, // +2 because of header row and 1-based indexing
            identifier,
            data: row
          });
        } else {
          duplicateMap.set(identifier, {
            row: index + 2,
            data: row
          });
        }
      });

      if (duplicateIndices.length === 0) {
        return {
          success: true,
          duplicatesFound: 0,
          duplicatesRemoved: 0,
          message: 'No duplicates found'
        };
      }

      let duplicatesRemoved = 0;
      if (!dryRun) {
        // Remove duplicates by clearing rows (from bottom to top to avoid index issues)
        duplicateIndices.sort((a, b) => b.row - a.row); // Descending order
        
        for (const duplicate of duplicateIndices) {
          try {
            const range = `A${duplicate.row}:K${duplicate.row}`;
            await googleSheets.sheets.spreadsheets.values.clear({
              spreadsheetId: googleSheets.spreadsheetId,
              range,
            });
            duplicatesRemoved++;
          } catch (error) {
            logger.warn('Failed to remove duplicate row', {
              agent: 'CRMManager',
              row: duplicate.row,
              error: error.message
            });
          }
        }
        
        this.analytics.duplicatesRemoved += duplicatesRemoved;
        await this.updateAnalytics();
      }

      logger.info('Duplicate removal completed', {
        agent: 'CRMManager',
        duplicatesFound: duplicateIndices.length,
        duplicatesRemoved,
        dryRun
      });

      return {
        success: true,
        duplicatesFound: duplicateIndices.length,
        duplicatesRemoved,
        duplicates: duplicateIndices.map(d => ({
          row: d.row,
          identifier: d.identifier,
          name: d.data[1],
          company: d.data[2]
        })),
        message: dryRun ? 
          `Found ${duplicateIndices.length} duplicates (dry run)` : 
          `Removed ${duplicatesRemoved} duplicates`
      };

    } catch (error) {
      logger.error('Duplicate removal failed', {
        agent: 'CRMManager',
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getAnalytics() {
    try {
      await this.updateAnalytics();
      
      // Get detailed statistics
      const data = await googleSheets.getSheetData();
      if (!data || data.length <= 1) {
        return this.analytics;
      }

      const prospects = data.slice(1);
      
      // Analyze by status
      const statusCounts = prospects.reduce((acc, row) => {
        const status = row[9] || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Analyze by source/tags
      const sourceCounts = prospects.reduce((acc, row) => {
        const tags = row[14] || 'Unknown';
        acc[tags] = (acc[tags] || 0) + 1;
        return acc;
      }, {});

      // Recent activity (last 10 prospects)
      const recentActivity = prospects
        .slice(-10)
        .map(row => ({
          name: row[1] || 'Unknown',
          company: row[2] || '',
          dateAdded: row[8] || '',
          status: row[9] || 'Unknown'
        }))
        .reverse();

      return {
        ...this.analytics,
        statusCounts,
        sourceCounts,
        recentActivity,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to get CRM analytics', {
        agent: 'CRMManager',
        error: error.message
      });
      return this.analytics;
    }
  }

  // Internal methods

  validateProspectData(prospect) {
    const errors = [];
    
    if (!prospect.name || prospect.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!prospect.company || prospect.company.trim() === '') {
      errors.push('Company is required');
    }
    
    if (prospect.email && !this.isValidEmail(prospect.email)) {
      errors.push('Invalid email format');
    }
    
    if (prospect.linkedinUrl && !this.isValidLinkedInUrl(prospect.linkedinUrl)) {
      errors.push('Invalid LinkedIn URL format');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidLinkedInUrl(url) {
    return url.includes('linkedin.com/in/') || url.includes('linkedin.com/pub/');
  }

  formatProspectForSheets(prospect) {
    return [
      prospect.id || this.generateId(),
      prospect.name || 'Nom non spécifié',
      prospect.company || 'Entreprise non spécifiée',
      prospect.title || 'Titre non spécifié',
      prospect.linkedinUrl || '',
      prospect.email || '',
      prospect.emailSource || '',
      prospect.location || '',
      prospect.dateAdded || new Date().toISOString().split('T')[0],
      prospect.status || 'Nouveau',
      prospect.messageSent || '',
      prospect.followupCount || '0',
      prospect.notes || this.formatNotes(prospect)
    ];
  }

  formatNotes(prospect) {
    const notes = [];
    
    if (prospect.score) notes.push(`Score: ${prospect.score}`);
    if (prospect.tags) notes.push(`Tags: ${prospect.tags}`);
    if (prospect.source) notes.push(`Source: ${prospect.source}`);
    if (prospect.agentId) notes.push(`Agent: ${prospect.agentId}`);
    
    return notes.join(' | ');
  }

  async checkForDuplicates(prospect) {
    try {
      const cacheKey = this.generateDuplicateKey(prospect);
      
      // Check cache first
      if (this.duplicateDetectionCache.has(cacheKey)) {
        return this.duplicateDetectionCache.get(cacheKey);
      }

      // Search for duplicates in CRM
      const data = await googleSheets.getSheetData();
      if (!data || data.length <= 1) {
        return { isDuplicate: false };
      }

      const prospects = data.slice(1);
      
      for (let i = 0; i < prospects.length; i++) {
        const row = prospects[i];
        const existingLinkedInUrl = row[4]?.trim().toLowerCase() || '';
        const existingName = row[1]?.trim().toLowerCase() || '';
        const existingCompany = row[2]?.trim().toLowerCase() || '';
        
        const prospectLinkedInUrl = prospect.linkedinUrl?.trim().toLowerCase() || '';
        const prospectName = prospect.name?.trim().toLowerCase() || '';
        const prospectCompany = prospect.company?.trim().toLowerCase() || '';
        
        // Check for LinkedIn URL match
        if (prospectLinkedInUrl && existingLinkedInUrl && 
            prospectLinkedInUrl === existingLinkedInUrl) {
          const result = {
            isDuplicate: true,
            existingProspect: {
              id: row[0],
              name: row[1],
              company: row[2],
              linkedinUrl: row[4],
              row: i + 2
            },
            matchType: 'linkedin_url'
          };
          
          this.duplicateDetectionCache.set(cacheKey, result);
          return result;
        }
        
        // Check for name + company match
        if (prospectName && existingName && prospectCompany && existingCompany &&
            prospectName === existingName && prospectCompany === existingCompany) {
          const result = {
            isDuplicate: true,
            existingProspect: {
              id: row[0],
              name: row[1],
              company: row[2],
              linkedinUrl: row[4],
              row: i + 2
            },
            matchType: 'name_company'
          };
          
          this.duplicateDetectionCache.set(cacheKey, result);
          return result;
        }
      }

      const result = { isDuplicate: false };
      this.duplicateDetectionCache.set(cacheKey, result);
      return result;

    } catch (error) {
      logger.error('Duplicate check failed', {
        agent: 'CRMManager',
        prospect: prospect.name,
        error: error.message
      });
      return { isDuplicate: false, error: error.message };
    }
  }

  generateDuplicateKey(prospect) {
    const name = prospect.name?.toLowerCase().trim() || '';
    const company = prospect.company?.toLowerCase().trim() || '';
    const linkedinUrl = prospect.linkedinUrl?.toLowerCase().trim() || '';
    return `${name}_${company}_${linkedinUrl}`.replace(/[^a-z0-9_]/g, '');
  }

  async findProspectById(prospectId) {
    try {
      const data = await googleSheets.getSheetData();
      if (!data || data.length <= 1) {
        return null;
      }

      const prospects = data.slice(1);
      
      for (let i = 0; i < prospects.length; i++) {
        const row = prospects[i];
        if (row[0] === prospectId) {
          return {
            prospect: {
              id: row[0],
              name: row[1],
              company: row[2],
              title: row[3],
              linkedinUrl: row[4],
              email: row[5],
              emailSource: row[6],
              location: row[7],
              dateAdded: row[8],
              status: row[9],
              messageSent: row[10],
              followupCount: row[11],
              notes: row[12]
            },
            row: i + 2
          };
        }
      }

      return null;

    } catch (error) {
      logger.error('Failed to find prospect by ID', {
        agent: 'CRMManager',
        prospectId,
        error: error.message
      });
      return null;
    }
  }

  async executeOperation(operation) {
    try {
      let result;
      
      switch (operation.type) {
        case 'add':
          result = await googleSheets.appendToSheet([operation.data]);
          break;
          
        case 'update':
          const range = `A${operation.row}:M${operation.row}`;
          result = await googleSheets.sheets.spreadsheets.values.update({
            spreadsheetId: googleSheets.spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: { values: [operation.data] }
          });
          break;
          
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }
      
      this.analytics.operationsPerformed++;
      
      return {
        success: true,
        operation: operation.type,
        prospect: operation.prospect?.name || operation.prospectId,
        timestamp: operation.timestamp
      };
      
    } catch (error) {
      logger.error('Operation execution failed', {
        agent: 'CRMManager',
        operation: operation.type,
        error: error.message
      });
      
      return {
        success: false,
        error: error.message,
        operation: operation.type
      };
    }
  }

  startBatchProcessor() {
    setInterval(async () => {
      if (this.operationQueue.length > 0 && !this.processingBatch) {
        await this.processBatchOperations();
      }
    }, 5000); // Process batch every 5 seconds
  }

  async processBatchOperations() {
    if (this.processingBatch || this.operationQueue.length === 0) {
      return;
    }

    this.processingBatch = true;
    
    try {
      const batch = this.operationQueue.splice(0, this.batchSize);
      
      logger.info('Processing batch operations', {
        agent: 'CRMManager',
        batchSize: batch.length
      });

      const results = [];
      for (const operation of batch) {
        const result = await this.executeOperation(operation);
        results.push(result);
      }

      const successful = results.filter(r => r.success).length;
      
      logger.info('Batch processing completed', {
        agent: 'CRMManager',
        processed: batch.length,
        successful,
        failed: batch.length - successful
      });

    } catch (error) {
      logger.error('Batch processing failed', {
        agent: 'CRMManager',
        error: error.message
      });
    } finally {
      this.processingBatch = false;
    }
  }

  async updateAnalytics() {
    try {
      const data = await googleSheets.getSheetData();
      this.analytics.totalProspects = data ? Math.max(0, data.length - 1) : 0;
      this.analytics.lastSync = new Date().toISOString();
    } catch (error) {
      logger.warn('Failed to update analytics', {
        agent: 'CRMManager',
        error: error.message
      });
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // Agent interface methods
  async execute(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'add_prospect':
        return await this.addProspect(data.prospect, data.options);
      
      case 'update_prospect':
        return await this.updateProspect(data.prospectId, data.updates, data.options);
      
      case 'remove_duplicates':
        return await this.removeDuplicates(data.options);
      
      case 'get_analytics':
        return await this.getAnalytics();
      
      case 'batch_add':
        return await this.batchAddProspects(data.prospects, data.options);
      
      case 'health_check':
        return {
          success: true,
          status: this.status,
          analytics: this.analytics,
          queueSize: this.operationQueue.length,
          processingBatch: this.processingBatch
        };
      
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  async batchAddProspects(prospects, options = {}) {
    const results = [];
    
    for (const prospect of prospects) {
      const result = await this.addProspect(prospect, { ...options, batch: true });
      results.push(result);
    }
    
    return {
      success: true,
      results,
      processed: results.length,
      successful: results.filter(r => r.success).length,
      queueSize: this.operationQueue.length
    };
  }

  async cleanup() {
    this.operationQueue = [];
    this.duplicateDetectionCache.clear();
    logger.info('CRMManager agent cleaned up', { agent: 'CRMManager' });
  }
}

module.exports = CRMManagerAgent;