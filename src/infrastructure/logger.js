/**
 * Logger moderne
 * Utilise winston pour un logging structuré
 */

const winston = require('winston');
const path = require('path');

class ModernLogger {
  constructor() {
    this.logger = this.createLogger();
  }

  createLogger() {
    const logDir = path.join(__dirname, '../../logs');
    
    // Format personnalisé
    const customFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, component, ...meta }) => {
        let logMessage = `[${timestamp}] [${level.toUpperCase()}]`;
        
        if (component) {
          logMessage += ` [${component}]`;
        }
        
        logMessage += ` ${message}`;
        
        // Ajouter les métadonnées si présentes
        if (Object.keys(meta).length > 0) {
          logMessage += ` ${JSON.stringify(meta)}`;
        }
        
        return logMessage;
      })
    );

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: customFormat,
      transports: [
        // Console avec couleurs pour développement
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            customFormat
          )
        }),
        
        // Fichier pour tous les logs
        new winston.transports.File({
          filename: path.join(logDir, 'app.log'),
          maxsize: 10000000, // 10MB
          maxFiles: 5
        }),
        
        // Fichier séparé pour les erreurs
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 10000000,
          maxFiles: 3
        })
      ],
      
      // Gérer les erreurs de logging
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, 'exceptions.log')
        })
      ],
      
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, 'rejections.log')
        })
      ]
    });
  }

  // Méthodes de logging avec support des métadonnées
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Méthodes utilitaires
  logRequest(req, res, duration) {
    const meta = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    const level = res.statusCode >= 400 ? 'warn' : 'info';
    this[level](`${req.method} ${req.url}`, meta);
  }

  logError(error, context = {}) {
    this.error(error.message, {
      ...context,
      stack: error.stack,
      name: error.name
    });
  }

  // Créer un logger enfant avec un composant fixe
  child(component) {
    return {
      info: (message, meta = {}) => this.info(message, { component, ...meta }),
      warn: (message, meta = {}) => this.warn(message, { component, ...meta }),
      error: (message, meta = {}) => this.error(message, { component, ...meta }),
      debug: (message, meta = {}) => this.debug(message, { component, ...meta })
    };
  }
}

// Export singleton
module.exports = new ModernLogger();