const fs = require('fs').promises;
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
        this.recentLogs = []; // Store recent logs in memory for real-time display
        this.maxRecentLogs = 100;
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.logDir, { recursive: true });
            await this.log('info', 'Logger initialized', { component: 'Logger' });
        } catch (error) {
            console.error('Failed to initialize logger:', error);
        }
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const component = meta.component || 'System';
        const formattedMessage = {
            timestamp,
            level: level.toUpperCase(),
            component,
            message,
            meta: { ...meta },
            id: Date.now() + Math.random()
        };
        return formattedMessage;
    }

    async writeToFile(formattedMessage) {
        try {
            const logLine = `${formattedMessage.timestamp} [${formattedMessage.level}] [${formattedMessage.component}] ${formattedMessage.message}`;
            if (formattedMessage.meta && Object.keys(formattedMessage.meta).length > 0) {
                const metaStr = JSON.stringify(formattedMessage.meta);
                await fs.appendFile(this.logFile, `${logLine} | Meta: ${metaStr}\n`);
            } else {
                await fs.appendFile(this.logFile, `${logLine}\n`);
            }
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    addToRecentLogs(formattedMessage) {
        this.recentLogs.unshift(formattedMessage);
        if (this.recentLogs.length > this.maxRecentLogs) {
            this.recentLogs = this.recentLogs.slice(0, this.maxRecentLogs);
        }
    }

    getConsoleColor(level) {
        const colors = {
            INFO: '\x1b[36m',    // Cyan
            SUCCESS: '\x1b[32m', // Green
            WARN: '\x1b[33m',    // Yellow
            ERROR: '\x1b[31m',   // Red
            DEBUG: '\x1b[35m',   // Magenta
            SYSTEM: '\x1b[34m'   // Blue
        };
        return colors[level.toUpperCase()] || '\x1b[37m'; // Default white
    }

    printToConsole(formattedMessage) {
        const color = this.getConsoleColor(formattedMessage.level);
        const reset = '\x1b[0m';
        const time = new Date(formattedMessage.timestamp).toLocaleTimeString();
        
        let output = `${color}[${time}] [${formattedMessage.level}] [${formattedMessage.component}]${reset} ${formattedMessage.message}`;
        
        if (formattedMessage.meta && Object.keys(formattedMessage.meta).length > 0) {
            const importantMeta = {};
            // Only show important meta fields in console
            if (formattedMessage.meta.count !== undefined) importantMeta.count = formattedMessage.meta.count;
            if (formattedMessage.meta.duration !== undefined) importantMeta.duration = formattedMessage.meta.duration;
            if (formattedMessage.meta.status !== undefined) importantMeta.status = formattedMessage.meta.status;
            if (formattedMessage.meta.error !== undefined) importantMeta.error = formattedMessage.meta.error;
            
            if (Object.keys(importantMeta).length > 0) {
                output += ` ${JSON.stringify(importantMeta)}`;
            }
        }
        
        console.log(output);
    }

    async log(level, message, meta = {}) {
        const formattedMessage = this.formatMessage(level, message, meta);
        
        // Print to console
        this.printToConsole(formattedMessage);
        
        // Add to recent logs for real-time display
        this.addToRecentLogs(formattedMessage);
        
        // Write to file asynchronously
        this.writeToFile(formattedMessage).catch(err => {
            console.error('Log file write failed:', err);
        });
    }

    // Convenience methods
    info(message, meta = {}) {
        return this.log('info', message, meta);
    }

    success(message, meta = {}) {
        return this.log('success', message, meta);
    }

    warn(message, meta = {}) {
        return this.log('warn', message, meta);
    }

    error(message, meta = {}) {
        return this.log('error', message, meta);
    }

    debug(message, meta = {}) {
        return this.log('debug', message, meta);
    }

    system(message, meta = {}) {
        return this.log('system', message, meta);
    }

    // Get recent logs for API
    getRecentLogs(limit = 50) {
        return this.recentLogs.slice(0, limit);
    }

    // Performance timing helper
    startTimer(name) {
        const start = Date.now();
        return {
            end: (message, meta = {}) => {
                const duration = Date.now() - start;
                this.info(`${message} (${duration}ms)`, { ...meta, duration, timer: name });
                return duration;
            }
        };
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;