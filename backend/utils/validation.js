// Environment validation utilities

function validateEnvironment() {
    const required = [
        'GOOGLE_SPREADSHEET_ID',
        'GOOGLE_CLIENT_ID', 
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_PROJECT_ID'
    ];
    
    const optional = [
        'LINKEDIN_COOKIE',
        'DAILY_LIMIT',
        'DEFAULT_SEARCH_QUERY',
        'CALENDLY_LINK',
        'ENABLE_AI_MESSAGES',
        'ENABLE_AUTO_FOLLOWUP',
        'FOLLOWUP_DELAY_DAYS'
    ];
    
    const missing = [];
    const warnings = [];
    
    // Check required variables
    for (const key of required) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }
    
    // Check optional but important variables
    if (!process.env.LINKEDIN_COOKIE) {
        warnings.push('LINKEDIN_COOKIE not set - LinkedIn scraping will not work');
    }
    
    if (!process.env.DAILY_LIMIT) {
        warnings.push('DAILY_LIMIT not set - using default value of 50');
        process.env.DAILY_LIMIT = '50';
    }
    
    return {
        isValid: missing.length === 0,
        missing,
        warnings,
        config: {
            googleSheetsConfigured: !missing.includes('GOOGLE_SPREADSHEET_ID'),
            linkedinConfigured: !!process.env.LINKEDIN_COOKIE,
            dailyLimit: parseInt(process.env.DAILY_LIMIT) || 50,
            environment: process.env.NODE_ENV || 'development'
        }
    };
}

function logEnvironmentStatus() {
    const validation = validateEnvironment();
    
    console.log('\n📋 Environment Validation:');
    
    if (validation.isValid) {
        console.log('✅ All required environment variables are set');
    } else {
        console.log('❌ Missing required environment variables:');
        validation.missing.forEach(key => {
            console.log(`   - ${key}`);
        });
    }
    
    if (validation.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        validation.warnings.forEach(warning => {
            console.log(`   - ${warning}`);
        });
    }
    
    console.log('\n🔧 Configuration:');
    console.log(`   - Google Sheets: ${validation.config.googleSheetsConfigured ? '✅' : '❌'}`);
    console.log(`   - LinkedIn: ${validation.config.linkedinConfigured ? '✅' : '❌'}`);
    console.log(`   - Daily Limit: ${validation.config.dailyLimit}`);
    console.log(`   - Environment: ${validation.config.environment}`);
    
    return validation;
}

function getSystemInfo() {
    return {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
    };
}

module.exports = {
    validateEnvironment,
    logEnvironmentStatus,
    getSystemInfo
};