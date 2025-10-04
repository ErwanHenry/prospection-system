const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

/**
 * Security middleware configuration
 */

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.apollo.io", "https://api.anthropic.com"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting configuration
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs, // 15 minutes by default
    max, // Limit each IP to max requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: req.rateLimit.resetTime
      });
    }
  });
};

// Strict rate limiter for sensitive endpoints
const strictRateLimiter = createRateLimiter(15 * 60 * 1000, 10); // 10 requests per 15 min

// Standard rate limiter for API endpoints
const apiRateLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 min

// Lenient rate limiter for health checks
const healthRateLimiter = createRateLimiter(1 * 60 * 1000, 30); // 30 requests per minute

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://graixl-ecosystem.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potential XSS vectors
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

// API key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide a valid API key in X-API-Key header'
    });
  }

  // Validate against environment variable or database
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  next();
};

// Environment validation middleware
const validateEnvironment = () => {
  const required = [
    'ANTHROPIC_API_KEY',
    'APOLLO_API_KEY',
    'GOOGLE_SPREADSHEET_ID'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

module.exports = {
  helmetConfig,
  apiRateLimiter,
  strictRateLimiter,
  healthRateLimiter,
  corsOptions,
  sanitizeInput,
  validateApiKey,
  validateEnvironment,
  createRateLimiter
};
