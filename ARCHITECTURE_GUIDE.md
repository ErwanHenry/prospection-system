# 🏗️ Architecture Guide - LinkedIn Prospection System

## 📋 Overview

This document provides a comprehensive view of the system architecture, design patterns, data flow, and technical decisions behind the AI-Powered LinkedIn Prospection System.

## 🎯 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AI-Powered Prospection System                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   Frontend UI   │    │  Backend API    │    │ External APIs   │             │
│  │                 │    │                 │    │                 │             │
│  │ • React-like JS │◄──►│ • Express.js    │◄──►│ • Apollo.io     │             │
│  │ • Modern CSS    │    │ • RESTful API   │    │ • OpenAI GPT    │             │
│  │ • WebSocket     │    │ • Middleware    │    │ • Google APIs   │             │
│  │ • State Mgmt    │    │ • Error Handle  │    │ • LinkedIn      │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│           │                       │                       │                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │  Browser APIs   │    │ Service Layer   │    │  Data Layer     │             │
│  │                 │    │                 │    │                 │             │
│  │ • Local Storage │    │ • Automation    │    │ • Google Sheets │             │
│  │ • Notifications │    │ • LinkedIn Mgmt │    │ • File System   │             │
│  │ • File API      │    │ • Email Service │    │ • Memory Cache  │             │
│  └─────────────────┘    │ • CRM Service   │    │ • Log Files     │             │
│                          └─────────────────┘    └─────────────────┘             │
│                                   │                       │                     │
│                          ┌─────────────────┐    ┌─────────────────┐             │
│                          │ Utility Layer   │    │ Infrastructure  │             │
│                          │                 │    │                 │             │
│                          │ • Logger        │    │ • Node.js       │             │
│                          │ • Validator     │    │ • NPM Packages  │             │
│                          │ • Rate Limiter  │    │ • Process Mgmt  │             │
│                          └─────────────────┘    └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### 1. Frontend Layer (Presentation Tier)

**Technology Stack:**
- Vanilla JavaScript (ES6+)
- HTML5 with semantic markup
- CSS3 with Grid/Flexbox
- Fetch API for HTTP requests

**Key Components:**

```javascript
// Frontend Architecture Pattern
const App = {
  // Application State
  state: {
    prospects: [],
    searchResults: [],
    systemHealth: {},
    userConfig: {}
  },

  // API Communication Layer
  api: {
    search: (query, limit) => fetch('/api/linkedin/search', {...}),
    generateEmail: (prospect) => fetch('/api/automation/generate-email', {...}),
    runWorkflow: (data) => fetch('/api/workflow/run-full-sequence', {...})
  },

  // User Interface Management
  ui: {
    updateResults: (results) => { /* DOM manipulation */ },
    showNotification: (message, type) => { /* Toast notifications */ },
    updateStatus: (status) => { /* Status indicators */ }
  },

  // Event Handling
  events: {
    initializeEventListeners: () => { /* Bind events */ },
    handleSearch: (event) => { /* Search logic */ },
    handleWorkflow: (event) => { /* Workflow logic */ }
  }
};
```

**Design Patterns Used:**
- **Module Pattern**: Encapsulated functionality
- **Observer Pattern**: Event-driven updates
- **Command Pattern**: Action dispatching
- **Factory Pattern**: Component creation

#### 2. Backend Layer (Application Tier)

**Technology Stack:**
- Node.js 18+ with Express.js framework
- RESTful API architecture
- Middleware-based request processing
- Asynchronous programming with async/await

**Core Server Structure:**

```javascript
// Server Architecture Pattern
const server = {
  // Express Application
  app: express(),
  
  // Middleware Stack
  middleware: [
    cors(),              // Cross-origin resource sharing
    express.json(),      // JSON body parsing
    compression(),       // Response compression
    helmet(),            // Security headers
    rateLimit(),         // Rate limiting
    logger.middleware    // Request logging
  ],
  
  // Route Handlers
  routes: {
    '/api/linkedin':     require('./routes/linkedin'),
    '/api/automation':   /* Inline automation routes */,
    '/api/workflow':     /* Inline workflow routes */,
    '/api/prospects':    /* Inline CRM routes */,
    '/api/system':       /* Inline system routes */
  },
  
  // Service Layer Integration
  services: {
    linkedinMaster:      require('./services/linkedinMaster'),
    automationService:   require('./services/automationService'),
    emailNotification:   require('./services/emailNotificationService'),
    googleSheets:        require('./services/googleSheets')
  }
};
```

#### 3. Service Layer (Business Logic Tier)

**Service Architecture Pattern:**

```javascript
// Generic Service Pattern
class BaseService {
  constructor() {
    this.initialized = false;
    this.config = {};
  }

  async initialize() {
    // Service-specific initialization
    this.initialized = true;
  }

  async healthCheck() {
    return {
      service: this.constructor.name,
      status: this.initialized ? 'active' : 'inactive',
      timestamp: new Date().toISOString()
    };
  }

  async performAction(params) {
    if (!this.initialized) {
      await this.initialize();
    }
    // Service-specific logic
  }
}
```

**Key Services:**

1. **LinkedInMaster**: Orchestrates multiple scraping strategies
2. **AutomationService**: Manages workflow execution
3. **EmailNotificationService**: Handles email communications
4. **GoogleSheetsService**: CRM data management

#### 4. Data Layer (Persistence Tier)

**Data Architecture:**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Google Sheets  │    │  File System    │    │  Memory Cache   │
│                 │    │                 │    │                 │
│ • Prospects     │    │ • Logs          │    │ • API Cache     │
│ • Analytics     │    │ • Config        │    │ • Session Data  │
│ • Status Track  │    │ • Credentials   │    │ • Rate Limits   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Data Flow Architecture

### 1. Search Workflow Data Flow

```
User Input → Frontend Validation → API Request → LinkedIn Service
     ↓              ↓                    ↓              ↓
Search Query → Parameter Sanitization → Route Handler → Apollo.io API
     ↓              ↓                    ↓              ↓
Results Display ← Response Formatting ← JSON Response ← Profile Data
```

**Detailed Flow:**

```javascript
// Search Data Flow Implementation
async function searchWorkflow(query, limit) {
  // 1. Frontend Input Validation
  const validatedQuery = validateSearchQuery(query);
  const validatedLimit = Math.min(limit, 100);
  
  // 2. API Request with Error Handling
  try {
    const response = await fetch('/api/linkedin/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: validatedQuery, limit: validatedLimit })
    });
    
    // 3. Backend Processing
    // → Route Handler: /api/linkedin/search
    // → Service: linkedinMaster.search()
    // → External API: Apollo.io
    // → Data Processing: Profile normalization
    // → Response: Standardized JSON
    
    // 4. Frontend Result Processing
    const results = await response.json();
    updateUI(results);
    
  } catch (error) {
    handleSearchError(error);
  }
}
```

### 2. Full Workflow Data Flow

```
Prospect Selection → Configuration → Workflow Execution → Multiple Services
        ↓                ↓                  ↓                    ↓
    UI Selection → Workflow Config → Automation Service → Email Generation
        ↓                ↓                  ↓                    ↓
    CRM Update ← Progress Updates ← Service Coordination ← LinkedIn Actions
        ↓                ↓                  ↓                    ↓
    Email Notification ← Final Results ← Completion Status ← Follow-up Scheduling
```

### 3. CRM Data Flow

```
Prospect Data → Validation → Google Sheets API → Spreadsheet Update
      ↓             ↓              ↓                    ↓
  Field Mapping → Schema Check → Authentication → Row Insertion
      ↓             ↓              ↓                    ↓
  UI Refresh ← Status Response ← API Response ← Success Confirmation
```

## 🎨 Design Patterns

### 1. Service Layer Patterns

**Singleton Pattern** (Service Instances):
```javascript
// services/googleSheets.js
class GoogleSheetsService {
  // Implementation
}
module.exports = new GoogleSheetsService(); // Singleton instance
```

**Factory Pattern** (LinkedIn Scrapers):
```javascript
// services/linkedinMaster.js
class LinkedInMaster {
  availableScrapers = {
    apollo: require('./linkedinApollo'),
    selenium: require('./linkedinSelenium'),
    puppeteer: require('./linkedinPuppeteer')
  };

  createScraper(type) {
    return this.availableScrapers[type] || this.availableScrapers.apollo;
  }
}
```

**Strategy Pattern** (Multiple Scraping Methods):
```javascript
class ScrapingStrategy {
  async search(query, limit) {
    // Strategy-specific implementation
  }
}

class ApolloStrategy extends ScrapingStrategy {
  async search(query, limit) {
    // Apollo.io API implementation
  }
}

class SeleniumStrategy extends ScrapingStrategy {
  async search(query, limit) {
    // Selenium automation implementation
  }
}
```

**Chain of Responsibility** (Error Handling):
```javascript
class ErrorHandler {
  setNext(handler) {
    this.next = handler;
    return handler;
  }

  handle(error) {
    if (this.canHandle(error)) {
      return this.process(error);
    }
    if (this.next) {
      return this.next.handle(error);
    }
    throw error;
  }
}
```

### 2. Frontend Patterns

**Module Pattern** (Code Organization):
```javascript
const ProspectionApp = (function() {
  // Private variables and functions
  let state = {};
  let config = {};

  function initializeApp() {
    // Private initialization
  }

  // Public API
  return {
    init: initializeApp,
    search: searchProspects,
    workflow: runWorkflow
  };
})();
```

**Observer Pattern** (Event Handling):
```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}
```

## 🛠️ Technology Stack Deep Dive

### Backend Technologies

#### Node.js & Express.js
```javascript
// Server Configuration
const express = require('express');
const app = express();

// Middleware Stack
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);
```

#### Service Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "googleapis": "^126.0.1",
    "nodemailer": "^6.9.4",
    "puppeteer-extra": "^3.3.6",
    "puppeteer-extra-plugin-stealth": "^2.11.2",
    "winston": "^3.10.0",
    "axios": "^1.5.0"
  }
}
```

### External API Integration

#### Apollo.io API Integration
```javascript
class ApolloService {
  constructor() {
    this.apiKey = process.env.APOLLO_API_KEY;
    this.baseURL = 'https://app.apollo.io/api/v1';
    this.requestsToday = 0;
    this.dailyLimit = 60; // Free tier
  }

  async searchPeople(query) {
    if (this.requestsToday >= this.dailyLimit) {
      throw new Error('Daily API limit exceeded');
    }

    const response = await axios.post(`${this.baseURL}/mixed_people/search`, {
      q: query,
      page: 1,
      per_page: 25
    }, {
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    this.requestsToday++;
    return this.normalizeResults(response.data);
  }
}
```

#### Google APIs Integration
```javascript
class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
  }

  async initialize() {
    const credentials = require('../credentials.json');
    this.auth = new google.auth.OAuth2(
      credentials.installed.client_id,
      credentials.installed.client_secret,
      credentials.installed.redirect_uris[0]
    );

    // Token handling
    const token = require('../token.json');
    this.auth.setCredentials(token);
    
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }
}
```

## 🔒 Security Architecture

### Authentication & Authorization

```javascript
// OAuth 2.0 Flow Implementation
class AuthenticationService {
  async initiateGoogleAuth(req, res) {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    });
    res.redirect(authUrl);
  }

  async handleCallback(code) {
    const { tokens } = await this.oAuth2Client.getToken(code);
    await this.saveTokens(tokens);
    return tokens;
  }
}
```

### Input Validation & Sanitization

```javascript
// Request Validation Middleware
const { body, validationResult } = require('express-validator');

const validateSearchRequest = [
  body('query')
    .isLength({ min: 1, max: 200 })
    .trim()
    .escape(),
  body('limit')
    .isInt({ min: 1, max: 100 })
    .toInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];
```

### Rate Limiting Architecture

```javascript
// Multi-tier Rate Limiting
const rateLimitConfig = {
  // General API rate limiting
  general: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP'
  },
  
  // Search-specific rate limiting
  search: {
    windowMs: 60 * 1000,
    max: 10,
    message: 'Too many search requests'
  },
  
  // Workflow rate limiting
  workflow: {
    windowMs: 60 * 1000,
    max: 5,
    message: 'Too many workflow executions'
  }
};
```

## 📊 Data Architecture

### Google Sheets Schema

```
Prospects Sheet Structure:
┌────────────┬─────────────┬─────────────┬──────────────┬──────────────┐
│ Column A   │ Column B    │ Column C    │ Column D     │ Column E     │
│ ID         │ Nom         │ Entreprise  │ Poste        │ LinkedIn URL │
├────────────┼─────────────┼─────────────┼──────────────┼──────────────┤
│ Generated  │ Full Name   │ Company     │ Job Title    │ Profile URL  │
│ Timestamp  │ String      │ String      │ String       │ URL          │
└────────────┴─────────────┴─────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┬──────────┬──────────────┬──────────────┐
│ Column F     │ Column G     │ Column H │ Column I     │ Column J     │
│ Localisation │ Date d'ajout │ Statut   │ Message      │ Nb relances  │
├──────────────┼──────────────┼──────────┼──────────────┼──────────────┤
│ Location     │ Date Added   │ Status   │ Message Sent │ Follow-ups   │
│ String       │ YYYY-MM-DD   │ Enum     │ Boolean      │ Integer      │
└──────────────┴──────────────┴──────────┴──────────────┴──────────────┘

┌──────────────┐
│ Column K     │
│ Notes        │
├──────────────┤
│ Additional   │
│ JSON String  │
└──────────────┘
```

### Data Normalization

```javascript
// Prospect Data Normalization
class DataNormalizer {
  static normalizeProspect(rawData) {
    return {
      id: this.generateId(),
      name: this.sanitizeName(rawData.name),
      company: this.sanitizeCompany(rawData.company),
      title: this.sanitizeTitle(rawData.title),
      linkedinUrl: this.validateURL(rawData.linkedinUrl),
      location: this.normalizeLocation(rawData.location),
      dateAdded: new Date().toISOString().split('T')[0],
      status: 'Nouveau',
      messageSent: '',
      followupCount: '0',
      notes: this.buildNotes(rawData)
    };
  }

  static buildNotes(data) {
    const notes = [];
    if (data.score) notes.push(`Score: ${data.score}`);
    if (data.tags) notes.push(`Tags: ${data.tags}`);
    if (data.email) notes.push(`Email: ${data.email}`);
    return notes.join(' | ');
  }
}
```

## 🔄 Error Handling Architecture

### Multi-Layer Error Handling

```javascript
// 1. Service Level Error Handling
class ServiceError extends Error {
  constructor(message, code, service) {
    super(message);
    this.code = code;
    this.service = service;
    this.timestamp = new Date().toISOString();
  }
}

// 2. API Level Error Handling
app.use((error, req, res, next) => {
  logger.error('API Error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  if (error instanceof ServiceError) {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: error.code,
      service: error.service
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 3. Frontend Error Handling
class ErrorHandler {
  static async handleAPIError(response) {
    if (!response.ok) {
      const error = await response.json();
      this.showUserError(error.error);
      throw new Error(error.error);
    }
    return response.json();
  }

  static showUserError(message) {
    // Display user-friendly error message
    updateStatus(`❌ ${message}`, 'error');
  }
}
```

## 🚀 Performance Architecture

### Caching Strategy

```javascript
// Multi-level Caching
const NodeCache = require('node-cache');

class CacheManager {
  constructor() {
    this.memoryCache = new NodeCache({ 
      stdTTL: 300, // 5 minutes default
      maxKeys: 1000 
    });
    this.searchCache = new NodeCache({ 
      stdTTL: 3600 // 1 hour for search results
    });
  }

  // Google Sheets caching
  async getSheetData(sheetId, useCache = true) {
    const cacheKey = `sheet_${sheetId}`;
    
    if (useCache) {
      const cached = this.memoryCache.get(cacheKey);
      if (cached) return cached;
    }

    const data = await this.fetchSheetData(sheetId);
    this.memoryCache.set(cacheKey, data);
    return data;
  }

  // Search results caching
  cacheSearchResults(query, results) {
    const cacheKey = `search_${this.hashQuery(query)}`;
    this.searchCache.set(cacheKey, results);
  }
}
```

### Async Processing Architecture

```javascript
// Queue-based Processing
class WorkflowQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxConcurrent = 3;
    this.activeJobs = 0;
  }

  async addJob(jobData) {
    const job = {
      id: this.generateJobId(),
      data: jobData,
      status: 'pending',
      createdAt: new Date(),
      retries: 0
    };
    
    this.queue.push(job);
    this.processQueue();
    return job.id;
  }

  async processQueue() {
    if (this.processing || this.activeJobs >= this.maxConcurrent) {
      return;
    }

    this.processing = true;
    
    while (this.queue.length > 0 && this.activeJobs < this.maxConcurrent) {
      const job = this.queue.shift();
      this.activeJobs++;
      
      this.processJob(job)
        .finally(() => {
          this.activeJobs--;
          this.processQueue();
        });
    }
    
    this.processing = false;
  }
}
```

## 📈 Monitoring Architecture

### Logging System

```javascript
// Winston Logger Configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'prospection-system' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Structured Logging
logger.info('Workflow started', {
  component: 'Automation',
  workflowId: 'workflow_123',
  prospectCount: 25,
  userId: 'user_456'
});
```

### Health Check System

```javascript
class HealthCheckService {
  async getSystemHealth() {
    const checks = await Promise.allSettled([
      this.checkGoogleSheets(),
      this.checkApolloAPI(),
      this.checkEmailService(),
      this.checkDiskSpace(),
      this.checkMemoryUsage()
    ]);

    return {
      status: this.calculateOverallStatus(checks),
      timestamp: new Date().toISOString(),
      checks: this.formatHealthChecks(checks)
    };
  }

  async checkGoogleSheets() {
    try {
      await googleSheets.healthCheck();
      return { status: 'healthy', service: 'GoogleSheets' };
    } catch (error) {
      return { status: 'unhealthy', service: 'GoogleSheets', error: error.message };
    }
  }
}
```

## 🔧 Configuration Architecture

### Environment Configuration

```javascript
// Configuration Management
class ConfigManager {
  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  loadConfig() {
    return {
      server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
      },
      apis: {
        apollo: {
          apiKey: process.env.APOLLO_API_KEY,
          baseURL: 'https://app.apollo.io/api/v1',
          rateLimit: 60
        },
        google: {
          spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }
      },
      email: {
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_APP_PASSWORD,
        service: 'gmail'
      }
    };
  }

  validateConfig() {
    const required = [
      'APOLLO_API_KEY',
      'GOOGLE_SPREADSHEET_ID',
      'GMAIL_USER',
      'GMAIL_APP_PASSWORD'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}
```

This architecture guide provides a comprehensive overview of the system's technical foundation, design patterns, and implementation details. The architecture is designed for scalability, maintainability, and reliability while supporting complex prospection workflows.