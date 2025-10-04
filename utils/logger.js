const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console(),

  // Error log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),

  // Combined log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
];

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Export logger with helper methods
module.exports = logger;

module.exports.logScraperActivity = (scraper, action, details) => {
  logger.info(`[${scraper}] ${action}`, {
    scraper,
    action,
    details,
    timestamp: new Date().toISOString()
  });
};

module.exports.logEmailActivity = (type, recipient, status) => {
  logger.info(`[Email] ${type} to ${recipient}: ${status}`, {
    type,
    recipient,
    status,
    timestamp: new Date().toISOString()
  });
};

module.exports.logAPICall = (endpoint, method, statusCode, duration) => {
  logger.http(`${method} ${endpoint} - ${statusCode} (${duration}ms)`, {
    endpoint,
    method,
    statusCode,
    duration,
    timestamp: new Date().toISOString()
  });
};

module.exports.logAgentActivity = (agentName, task, result) => {
  logger.info(`[Agent:${agentName}] ${task}`, {
    agent: agentName,
    task,
    result,
    timestamp: new Date().toISOString()
  });
};

module.exports.logError = (error, context = {}) => {
  logger.error(error.message, {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context,
    timestamp: new Date().toISOString()
  });
};
