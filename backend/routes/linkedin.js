const express = require('express');
const router = express.Router();
const linkedinScraper = require('../services/linkedinMaster');
const googleSheets = require('../services/googleSheets');
const linkedinSelectorCapture = require('../services/linkedinSelectorCapture');
const logger = require('../utils/logger');

// Search LinkedIn profiles
router.post('/search', async (req, res) => {
  const timer = logger.startTimer('linkedin-search');
  
  try {
    const { query, limit = 10, method } = req.body;
    
    logger.info('LinkedIn search initiated', { 
      component: 'LinkedIn', 
      query, 
      limit, 
      method: method || 'default'
    });
    
    if (!query) {
      logger.warn('LinkedIn search failed: Missing query', { component: 'LinkedIn' });
      return res.status(400).json({ error: 'Query is required' });
    }

    // Changer temporairement le scraper si une méthode spécifique est demandée
    const originalMethod = linkedinScraper.preferredScraper;
    if (method && linkedinScraper.availableScrapers[method]) {
      logger.info(`Switching to ${method} scraper for this search`, { 
        component: 'LinkedIn',
        from: originalMethod,
        to: method
      });
      linkedinScraper.preferredScraper = method;
      process.env.LINKEDIN_SCRAPER_TYPE = method;
    }

    logger.info(`Starting LinkedIn search: "${query}"`, { 
      component: 'LinkedIn',
      query,
      limit: parseInt(limit),
      scraper: linkedinScraper.preferredScraper
    });
    
    const results = await linkedinScraper.search(query, parseInt(limit));
    
    // Restaurer le scraper original si nécessaire
    if (method && originalMethod !== method) {
      linkedinScraper.preferredScraper = originalMethod;
      logger.info(`Restored original scraper: ${originalMethod}`, { component: 'LinkedIn' });
    }
    
    timer.end(`LinkedIn search completed`, { 
      component: 'LinkedIn',
      resultsCount: results.length,
      query
    });
    
    res.json({
      success: true,
      query,
      limit: parseInt(limit),
      count: results.length,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('LinkedIn search failed', { 
      component: 'LinkedIn', 
      error: error.message,
      query: req.body.query
    });
    res.status(500).json({ error: error.message });
  }
});

// Get profile details
router.post('/profile', async (req, res) => {
  try {
    const { profileUrl } = req.body;
    
    if (!profileUrl) {
      return res.status(400).json({ error: 'Profile URL is required' });
    }

    console.log(`👤 Getting profile details: ${profileUrl}`);
    const details = await linkedinScraper.getProfileDetails(profileUrl);
    
    res.json({
      success: true,
      profile: details
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add prospects to CRM
router.post('/add-to-crm', async (req, res) => {
  const timer = logger.startTimer('add-to-crm');
  
  try {
    const { prospects } = req.body;
    
    logger.info('Adding prospects to CRM initiated', { 
      component: 'CRM', 
      count: prospects ? prospects.length : 0
    });
    
    if (!prospects || !Array.isArray(prospects)) {
      logger.warn('CRM addition failed: Invalid prospects data', { component: 'CRM' });
      return res.status(400).json({ error: 'Prospects array is required' });
    }

    logger.info('Initializing Google Sheets connection', { component: 'CRM' });
    // Initialize Google Sheets if not already done
    const initialized = await googleSheets.initialize();
    if (!initialized) {
      logger.error('CRM addition failed: Google Sheets not initialized', { component: 'CRM' });
      return res.status(500).json({ error: 'Google Sheets not initialized' });
    }

    // Setup headers if needed
    logger.info('Setting up Google Sheets headers', { component: 'CRM' });
    await googleSheets.setupHeaders();

    logger.info('Preparing prospect data for Google Sheets', { 
      component: 'CRM',
      prospectsCount: prospects.length
    });

    // Prepare prospects data for the enhanced duplicate-prevention method
    const formattedProspects = prospects.map((prospect, index) => {
      logger.debug(`Processing prospect ${index + 1}/${prospects.length}`, {
        component: 'CRM',
        prospectName: prospect.name,
        prospectCompany: prospect.company
      });
      
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: prospect.name || '',
        company: prospect.company || '',
        title: prospect.title || '',
        linkedinUrl: prospect.linkedinUrl || '',
        email: prospect.email || '',
        emailSource: prospect.emailSource || '',
        location: prospect.location || '',
        dateAdded: new Date().toISOString().split('T')[0],
        status: 'Nouveau',
        messageSent: '',
        followUps: 0,
        notes: `Score: ${prospect.score || 0} | Tags: ${prospect.tags || ''} | Email: ${prospect.email || ''}`
      };
    });

    logger.info('Writing prospects to Google Sheets with duplicate prevention', { 
      component: 'CRM',
      prospectsCount: formattedProspects.length
    });

    // Add to sheet with duplicate prevention and rate limiting
    const result = await googleSheets.addProspectsToSheet(formattedProspects);
    
    timer.end('Prospects successfully added to CRM', {
      component: 'CRM',
      added: result.added || 0,
      duplicatesSkipped: result.duplicatesSkipped || 0
    });
    
    res.json({
      success: true,
      added: result.added || 0,
      duplicatesSkipped: result.duplicatesSkipped || 0,
      total: prospects.length,
      message: result.message || `Added ${result.added || 0} prospects to CRM`
    });
  } catch (error) {
    logger.error('CRM addition failed', { 
      component: 'CRM', 
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/send-message', async (req, res) => {
  try {
    const { profileUrl, message } = req.body;
    
    if (!profileUrl || !message) {
      return res.status(400).json({ error: 'Profile URL and message are required' });
    }

    console.log(`📨 Sending message to: ${profileUrl}`);
    const success = await linkedinScraper.sendMessage(profileUrl, message);
    
    res.json({
      success,
      message: success ? 'Message sent successfully' : 'Failed to send message'
    });
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize scraper
router.post('/initialize', async (req, res) => {
  try {
    const success = await linkedinScraper.initialize();
    res.json({
      success,
      message: success ? 'LinkedIn scraper initialized' : 'Failed to initialize'
    });
  } catch (error) {
    console.error('Initialize error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Close scraper
router.post('/close', async (req, res) => {
  try {
    await linkedinScraper.close();
    res.json({
      success: true,
      message: 'LinkedIn scraper closed'
    });
  } catch (error) {
    console.error('Close error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check for LinkedIn scraper
router.get('/health', async (req, res) => {
  try {
    const health = await linkedinScraper.healthCheck();
    res.json({
      success: true,
      health
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test LinkedIn scraper
router.post('/test', async (req, res) => {
  try {
    const testResults = await linkedinScraper.testScraper();
    res.json({
      success: true,
      testResults
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Switch service mode
router.post('/switch-mode', async (req, res) => {
  try {
    const { mode } = req.body; // 'real' or 'fallback'
    
    let success = false;
    if (mode === 'real') {
      success = await linkedinScraper.switchToRealScraper();
    } else if (mode === 'fallback') {
      await linkedinScraper.switchToFallback();
      success = true;
    } else {
      return res.status(400).json({ error: 'Invalid mode. Use "real" or "fallback"' });
    }
    
    const serviceInfo = linkedinScraper.getServiceInfo();
    
    res.json({
      success,
      mode: serviceInfo.currentService,
      message: `Switched to ${serviceInfo.currentService} mode`,
      serviceInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get service info
router.get('/service-info', (req, res) => {
  try {
    const serviceInfo = linkedinScraper.getServiceInfo();
    res.json({
      success: true,
      serviceInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test search with specific parameters
router.post('/test-search', async (req, res) => {
  try {
    const { query = 'software engineer', limit = 3 } = req.body;
    
    console.log(`🧪 Testing LinkedIn search: "${query}" (limit: ${limit})`);
    
    const results = await linkedinScraper.search(query, limit);
    
    res.json({
      success: true,
      query,
      limit,
      count: results.length,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test search error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Capture current LinkedIn DOM selectors
router.post('/capture-selectors', async (req, res) => {
  try {
    console.log('🔍 Starting LinkedIn DOM selector capture...');
    const analysis = await linkedinSelectorCapture.captureCurrentSelectors();
    
    res.json({
      success: true,
      message: 'DOM selectors captured successfully',
      analysis: analysis,
      files: [
        'linkedin_working_capture.png',
        'linkedin_working_analysis.json'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Selector capture error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
