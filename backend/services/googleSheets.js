const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 100, // Google Sheets allows 100 requests per 100 seconds per user
  maxRetries: 5,
  baseDelay: 1000, // 1 second base delay
  maxDelay: 30000 // 30 seconds max delay
};

// Request queue for rate limiting
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.requestTimes = [];
  }

  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      // Clean old request times (older than 1 minute)
      const now = Date.now();
      this.requestTimes = this.requestTimes.filter(time => now - time < 60000);

      // Check if we need to wait
      if (this.requestTimes.length >= RATE_LIMIT.requestsPerMinute) {
        const oldestRequest = Math.min(...this.requestTimes);
        const waitTime = 60000 - (now - oldestRequest);
        console.log(`⏳ Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      const { fn, resolve, reject } = this.queue.shift();
      this.requestTimes.push(now);

      try {
        const result = await this.executeWithRetry(fn);
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  async executeWithRetry(fn, attempt = 1) {
    try {
      return await fn();
    } catch (error) {
      // Check if it's a quota error
      const isQuotaError = error.code === 429 || 
                          (error.message && error.message.includes('quota')) ||
                          (error.message && error.message.includes('rate limit'));

      if (isQuotaError && attempt <= RATE_LIMIT.maxRetries) {
        const delay = Math.min(
          RATE_LIMIT.baseDelay * Math.pow(2, attempt - 1), 
          RATE_LIMIT.maxDelay
        );
        
        console.log(`⏳ Quota exceeded, retrying in ${delay}ms (attempt ${attempt}/${RATE_LIMIT.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(fn, attempt + 1);
      }

      throw error;
    }
  }
}

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly'
];

const TOKEN_PATH = path.join(__dirname, '../../token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.drive = null;
    this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    this.requestQueue = new RequestQueue();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  async initialize() {
    try {
      // Check if credentials exist
      try {
        await fs.access(CREDENTIALS_PATH);
      } catch (error) {
        console.error('❌ credentials.json not found. Please add your Google OAuth credentials.');
        console.log('📝 Create credentials at: https://console.cloud.google.com/apis/credentials');
        return false;
      }

      const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      
      if (!client_secret || !client_id || !redirect_uris) {
        console.error('❌ Invalid credentials.json format');
        return false;
      }
      
      this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      // Check for existing token
      try {
        const token = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf8'));
        this.auth.setCredentials(token);
        
        // Test if token is still valid
        await this.auth.getAccessToken();
        
        // Test spreadsheet access
        if (this.spreadsheetId) {
          this.sheets = google.sheets({ version: 'v4', auth: this.auth });
          await this.sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
        }
      } catch (error) {
        console.log('⚠️ Token not found or expired. Please authenticate via /api/auth/google');
        return false;
      }

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      console.log('✅ Google Sheets service initialized');
      console.log('📊 Spreadsheet ID:', this.spreadsheetId);
      return true;
    } catch (error) {
      console.error('Error initializing Google Sheets:', error.message);
      return false;
    }
  }

  async getAuthUrl() {
    const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    return oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
  }

  async saveToken(code) {
    try {
      const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      
      const { tokens } = await oAuth2Client.getToken(code);
      await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
      
      console.log('✅ Token saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving token:', error);
      return false;
    }
  }

  async getSheetData(range = 'A:Z', useCache = true) {
    try {
      const cacheKey = `sheet_data_${range}`;
      
      // Check cache first
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('📋 Using cached sheet data');
          return cached.data;
        }
      }

      // Use request queue for API call
      const response = await this.requestQueue.execute(async () => {
        return await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.spreadsheetId,
          range,
        });
      });

      const data = response.data.values || [];
      
      // Cache the result
      if (useCache) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error('Error reading sheet:', error);
      throw error;
    }
  }

  async appendToSheet(values, range = 'A:Z') {
    try {
      // Clear cache since we're modifying data
      this.clearCache();

      // Use request queue for API call
      const response = await this.requestQueue.execute(async () => {
        return await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: Array.isArray(values[0]) ? values : [values],
          },
        });
      });

      return response.data;
    } catch (error) {
      console.error('Error appending to sheet:', error);
      throw error;
    }
  }

  async updateCell(range, value) {
    try {
      // Clear cache since we're modifying data
      this.clearCache();

      // Use request queue for API call
      const response = await this.requestQueue.execute(async () => {
        return await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[value]],
          },
        });
      });

      return response.data;
    } catch (error) {
      console.error('Error updating cell:', error);
      throw error;
    }
  }

  async clearSheet(range = 'A2:M1000') {
    try {
      // Clear cache since we're modifying data
      this.clearCache();

      // Use request queue for API call
      await this.requestQueue.execute(async () => {
        return await this.sheets.spreadsheets.values.clear({
          spreadsheetId: this.spreadsheetId,
          range,
        });
      });
      
      console.log('✅ Sheet cleared');
    } catch (error) {
      console.error('Error clearing sheet:', error);
      throw error;
    }
  }

  async validateSpreadsheet() {
    try {
      if (!this.spreadsheetId) {
        throw new Error('No spreadsheet ID configured');
      }
      
      // Use request queue for API call
      const response = await this.requestQueue.execute(async () => {
        return await this.sheets.spreadsheets.get({
          spreadsheetId: this.spreadsheetId
        });
      });
      
      console.log('✅ Spreadsheet found:', response.data.properties.title);
      return true;
    } catch (error) {
      console.error('❌ Spreadsheet validation failed:', error.message);
      if (error.code === 404) {
        console.log('📝 Create a new spreadsheet or check the ID in .env');
      }
      return false;
    }
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Google Sheets cache cleared');
  }

  async addProspectsToSheet(prospects, retryCount = 0) {
    const maxRetries = 3;

    try {
      console.log(`🔍 Starting duplicate check for ${prospects.length} prospects (attempt ${retryCount + 1}/${maxRetries + 1})`);

      // Get existing data to check for duplicates
      const existingData = await this.getSheetData();
      const uniqueProspects = await this.filterDuplicates(prospects, existingData);

      if (uniqueProspects.length === 0) {
        console.log('📝 No new prospects to add (all were duplicates)');
        return { updatedRows: 0, message: 'All prospects were duplicates' };
      }

      console.log(`✅ Found ${uniqueProspects.length} unique prospects out of ${prospects.length}`);

      // Convert prospect objects to array format for Google Sheets
      const rows = uniqueProspects.map(prospect => {
        // Make sure we have all expected fields in the right order
        return [
          prospect.id || '',
          prospect.name || '',
          prospect.company || '',
          prospect.title || '',
          prospect.linkedinUrl || '',
          prospect.email || '',
          prospect.emailSource || '',
          prospect.location || '',
          prospect.dateAdded || new Date().toISOString().split('T')[0],
          prospect.status || 'new',
          prospect.messageSent || '',
          prospect.followUps || 0,
          prospect.notes || ''
        ];
      });

      // Split into batches to avoid overwhelming API
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < rows.length; i += batchSize) {
        batches.push(rows.slice(i, i + batchSize));
      }

      console.log(`📦 Processing ${batches.length} batches of max ${batchSize} prospects each`);

      let totalAdded = 0;
      let result = null;

      for (let i = 0; i < batches.length; i++) {
        try {
          console.log(`📤 Batch ${i + 1}/${batches.length}: Adding ${batches[i].length} prospects`);
          result = await this.appendToSheet(batches[i]);
          totalAdded += batches[i].length;

          // Small delay between batches
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (batchError) {
          console.error(`⚠️ Batch ${i + 1} failed, continuing with next batch:`, batchError.message);
          // Continue with other batches instead of failing completely
        }
      }

      console.log(`✅ Successfully added ${totalAdded} unique prospects to CRM`);

      return {
        ...result,
        added: totalAdded,
        duplicatesSkipped: prospects.length - uniqueProspects.length,
        message: `Added ${totalAdded} prospects, skipped ${prospects.length - uniqueProspects.length} duplicates`
      };
    } catch (error) {
      console.error(`❌ Error adding prospects to sheet (attempt ${retryCount + 1}):`, error.message);

      // Retry with exponential backoff
      if (retryCount < maxRetries) {
        const delay = 1000 * Math.pow(2, retryCount);
        console.log(`🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.addProspectsToSheet(prospects, retryCount + 1);
      }

      // All retries failed - return partial success
      console.error('❌ All retry attempts exhausted, returning error');
      throw error;
    }
  }

  async filterDuplicates(prospects, existingData) {
    const uniqueProspects = [];
    const existingIdentifiers = new Set();
    
    // Build set of existing identifiers from sheet data
    if (existingData && existingData.length > 1) {
      const headers = existingData[0];
      const nameIndex = headers.indexOf('Nom');
      const companyIndex = headers.indexOf('Entreprise');
      const linkedinIndex = headers.indexOf('LinkedIn URL');
      
      for (let i = 1; i < existingData.length; i++) {
        const row = existingData[i];
        const name = row[nameIndex]?.trim().toLowerCase() || '';
        const company = row[companyIndex]?.trim().toLowerCase() || '';
        const linkedinUrl = row[linkedinIndex]?.trim().toLowerCase() || '';
        
        // Create unique identifiers
        if (linkedinUrl && linkedinUrl !== '') {
          existingIdentifiers.add(linkedinUrl);
        }
        if (name && company && name !== '' && company !== '') {
          existingIdentifiers.add(`${name}_${company}`);
        }
      }
    }
    
    // Filter out duplicates from new prospects
    for (const prospect of prospects) {
      const name = prospect.name?.trim().toLowerCase() || '';
      const company = prospect.company?.trim().toLowerCase() || '';
      const linkedinUrl = prospect.linkedinUrl?.trim().toLowerCase() || '';
      
      let isDuplicate = false;
      
      // Check LinkedIn URL duplicate
      if (linkedinUrl && linkedinUrl !== '') {
        if (existingIdentifiers.has(linkedinUrl)) {
          console.log(`🔄 Skipping duplicate (LinkedIn): ${prospect.name} @ ${prospect.company}`);
          isDuplicate = true;
        }
      }
      
      // Check name + company duplicate
      if (!isDuplicate && name && company && name !== '' && company !== '') {
        const identifier = `${name}_${company}`;
        if (existingIdentifiers.has(identifier)) {
          console.log(`🔄 Skipping duplicate (Name+Company): ${prospect.name} @ ${prospect.company}`);
          isDuplicate = true;
        }
      }
      
      if (!isDuplicate) {
        uniqueProspects.push(prospect);
        
        // Add to existing identifiers to prevent duplicates within the current batch
        if (linkedinUrl && linkedinUrl !== '') {
          existingIdentifiers.add(linkedinUrl);
        }
        if (name && company && name !== '' && company !== '') {
          existingIdentifiers.add(`${name}_${company}`);
        }
      }
    }
    
    return uniqueProspects;
  }

  async setupHeaders() {
    const headers = [
      'ID',
      'Nom',
      'Entreprise',
      'Poste',
      'LinkedIn URL',
      'Email',
      'Source Email',
      'Localisation',
      'Date d\'ajout',
      'Statut',
      'Message envoyé',
      'Nb relances',
      'Notes'
    ];

    try {
      // Validate spreadsheet first
      const isValid = await this.validateSpreadsheet();
      if (!isValid) {
        throw new Error('Invalid spreadsheet');
      }
      
      // Check if headers exist
      const currentData = await this.getSheetData('A1:M1');
      if (!currentData.length || currentData[0].length === 0) {
        await this.appendToSheet([headers], 'A1');
        console.log('✅ Headers created');
      } else {
        console.log('✅ Headers already exist');
      }
    } catch (error) {
      console.error('Error setting up headers:', error.message);
      throw error;
    }
  }
}

module.exports = new GoogleSheetsService();
