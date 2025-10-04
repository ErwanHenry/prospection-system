/**
 * Configuration centralisée
 * Suit le pattern de configuration moderne avec validation
 */

const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../../.env') });

class ConfigManager {
  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  loadConfig() {
    return {
      // Server Configuration
      server: {
        port: parseInt(process.env.PORT, 10) || 3000,
        host: process.env.HOST || 'localhost',
        env: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'info'
      },

      // Database Configuration (Google Sheets)
      database: {
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        credentialsPath: path.join(__dirname, '../../credentials.json'),
        tokenPath: path.join(__dirname, '../../token.json')
      },

      // External APIs
      apis: {
        apollo: {
          apiKey: process.env.APOLLO_API_KEY,
          baseUrl: 'https://app.apollo.io/api/v1',
          rateLimit: {
            requests: 60,
            window: 24 * 60 * 60 * 1000 // 24 heures
          }
        },
        hunter: {
          apiKey: process.env.HUNTER_API_KEY,
          baseUrl: 'https://api.hunter.io/v2'
        },
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
        }
      },

      // Email Configuration
      email: {
        service: 'gmail',
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_APP_PASSWORD,
        from: process.env.EMAIL_FROM || process.env.GMAIL_USER
      },

      // LinkedIn Configuration
      linkedin: {
        cookie: process.env.LINKEDIN_COOKIE,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timeout: 30000,
        retries: 3
      },

      // Application Features
      features: {
        emailFinding: {
          enabled: true,
          sources: ['apollo', 'hunter', 'patterns'],
          timeout: 10000
        },
        bulkProcessing: {
          threshold: 10, // Plus de 10 prospects = mode bulk
          batchSize: 5,
          delay: 500
        },
        caching: {
          enabled: true,
          ttl: 3600 // 1 heure
        }
      },

      // Security
      security: {
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 1000, // limit each IP to 1000 requests per windowMs (développement)
          standardHeaders: true,
          legacyHeaders: false
        },
        cors: {
          origin: process.env.CORS_ORIGIN || '*',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          allowedHeaders: ['Content-Type', 'Authorization']
        }
      }
    };
  }

  validateConfig() {
    const required = {
      'GOOGLE_SPREADSHEET_ID': this.config.database.spreadsheetId,
      'GMAIL_USER': this.config.email.user,
      'GMAIL_APP_PASSWORD': this.config.email.password
    };

    const missing = [];
    for (const [key, value] of Object.entries(required)) {
      if (!value) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Configuration manquante: ${missing.join(', ')}`);
    }
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
  }

  isDevelopment() {
    return this.config.server.env === 'development';
  }

  isProduction() {
    return this.config.server.env === 'production';
  }
}

module.exports = new ConfigManager();