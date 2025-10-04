/**
 * LinkedIn Automation Service - REAL Implementation
 * Uses Puppeteer to actually send LinkedIn connection requests
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const path = require('path');

puppeteer.use(StealthPlugin());

class LinkedInAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
    this.sessionPath = path.join(__dirname, '../data/linkedin-session.json');
    this.dailyConnectionsSent = 0;
    this.maxDailyConnections = 20; // Safety limit
    this.lastConnectionTime = null;
    this.minDelayBetweenConnections = 60000; // 1 minute between connections
  }

  async detectBrowser() {
    const fs = require('fs');
    const { execSync } = require('child_process');
    
    // Chrome paths to check
    const chromePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/opt/google/chrome/chrome',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];
    
    // Brave paths to check
    const bravePaths = [
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      '/usr/bin/brave-browser',
      '/snap/bin/brave',
      'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
    ];
    
    // Edge paths
    const edgePaths = [
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/usr/bin/microsoft-edge',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    
    // Try Chrome first
    for (const chromePath of chromePaths) {
      if (fs.existsSync(chromePath)) {
        return { name: 'Chrome', path: chromePath };
      }
    }
    
    // Try system Chrome command
    try {
      execSync('which google-chrome', { stdio: 'ignore' });
      return { name: 'Chrome', path: undefined }; // Use system default
    } catch {}
    
    // Try Brave
    for (const bravePath of bravePaths) {
      if (fs.existsSync(bravePath)) {
        return { name: 'Brave Browser', path: bravePath };
      }
    }
    
    // Try Edge
    for (const edgePath of edgePaths) {
      if (fs.existsSync(edgePath)) {
        return { name: 'Microsoft Edge', path: edgePath };
      }
    }
    
    throw new Error(`No supported browser found. Please install one of:
📍 Chrome: https://www.google.com/chrome/
📍 Brave: https://brave.com/
📍 Edge: https://www.microsoft.com/edge/`);
  }

  async initialize() {
    try {
      console.log('🔗 Initialisation LinkedIn automation...');
      
      // Detect available browser
      const browserConfig = await this.detectBrowser();
      console.log(`🚀 Using browser: ${browserConfig.name}`);
      
      // Launch browser with improved settings
      this.browser = await puppeteer.launch({
        headless: false, // Set to true for production
        defaultViewport: null,
        executablePath: browserConfig.path,
        protocolTimeout: 180000, // 3 minutes timeout
        timeout: 120000, // 2 minutes launch timeout
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-mode',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps',
          '--disable-translate',
          '--disable-sync',
          '--disable-web-security',
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Increase page timeouts
      this.page.setDefaultTimeout(60000); // 1 minute
      this.page.setDefaultNavigationTimeout(60000); // 1 minute
      
      // Set realistic viewport and user agent
      await this.page.setViewport({ width: 1366, height: 768 });
      
      // Add stealth configurations
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        
        // Hide chrome.runtime
        delete window.chrome;
        
        // Mock plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [
            {
              0: { type: 'application/x-google-chrome-pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: {} },
              description: 'Portable Document Format',
              filename: 'internal-pdf-viewer',
              length: 1,
              name: 'Chrome PDF Plugin'
            }
          ]
        });
      });
      
      console.log('✅ Browser launched successfully');
      
      // Test browser without loading session first
      await this.testBrowser();
      
      // Load existing session if available
      await this.loadSession();
      
      console.log('✅ LinkedIn automation initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Error initializing LinkedIn automation:', error.message);
      if (this.browser) {
        await this.browser.close().catch(() => {});
      }
      return false;
    }
  }

  async testBrowser() {
    try {
      console.log('🧪 Testing browser functionality...');
      await this.page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
      console.log('✅ Browser test successful');
    } catch (error) {
      console.error('❌ Browser test failed:', error.message);
      throw new Error(`Browser test failed: ${error.message}`);
    }
  }

  async loadSession() {
    try {
      const sessionData = await fs.readFile(this.sessionPath, 'utf8');
      const session = JSON.parse(sessionData);
      
      if (session.cookies) {
        await this.page.setCookie(...session.cookies);
        console.log('📱 LinkedIn session loaded');
        
        // Verify session is still valid with better error handling
        try {
          await this.page.goto('https://www.linkedin.com/feed', { 
            waitUntil: 'networkidle2', 
            timeout: 45000 // Increased timeout
          });
          await this.page.waitForTimeout(3000);
          
          // Check if we're logged in
          const isLoggedIn = await this.page.$('.global-nav__me') !== null;
          if (isLoggedIn) {
            this.isLoggedIn = true;
            console.log('✅ LinkedIn session valid');
          } else {
            console.log('⚠️ LinkedIn session expired, login required');
            await this.promptForLogin();
          }
        } catch (navError) {
          console.log('⚠️ Navigation timeout, trying login:', navError.message);
          await this.promptForLogin();
        }
      } else {
        await this.promptForLogin();
      }
    } catch (error) {
      console.log('📱 No existing LinkedIn session, login required');
      await this.promptForLogin();
    }
  }

  async promptForLogin() {
    try {
      console.log('🔐 Please login to LinkedIn manually in the browser window...');
      
      await this.page.goto('https://www.linkedin.com/login', { 
        waitUntil: 'networkidle2', 
        timeout: 45000 // Increased timeout
      });
      
      // Wait for manual login
      console.log('⏳ Waiting for you to complete LinkedIn login...');
      console.log('💡 After logging in, the automation will continue automatically.');
      console.log('💡 This may take a few minutes - please be patient.');
      
      // Wait for login to complete (check for feed page) with better error handling
      try {
        await this.page.waitForFunction(
          () => {
            return window.location.href.includes('/feed') || 
                   window.location.href.includes('/checkpoint') ||
                   document.querySelector('.global-nav__me') !== null ||
                   document.querySelector('[data-control-name="nav.settings_and_privacy"]') !== null;
          },
          { timeout: 300000, polling: 2000 } // 5 minutes timeout, check every 2 seconds
        );
        
        // Additional check for successful login
        await this.page.waitForTimeout(2000);
        const isLoggedIn = await this.page.evaluate(() => {
          return document.querySelector('.global-nav__me') !== null ||
                 document.querySelector('[data-control-name="nav.settings_and_privacy"]') !== null ||
                 window.location.href.includes('/feed');
        });
        
        if (isLoggedIn) {
          this.isLoggedIn = true;
          console.log('✅ LinkedIn login successful');
          
          // Save session
          await this.saveSession();
        } else {
          throw new Error('Login verification failed');
        }
        
      } catch (waitError) {
        if (waitError.message.includes('timeout')) {
          throw new Error('Login timeout - please try again or check your internet connection');
        }
        throw waitError;
      }
      
    } catch (error) {
      console.error('❌ LinkedIn login error:', error.message);
      throw new Error(`LinkedIn login failed: ${error.message}`);
    }
  }

  async saveSession() {
    try {
      const cookies = await this.page.cookies();
      const session = {
        cookies,
        timestamp: new Date().toISOString()
      };
      
      // Ensure data directory exists
      const dataDir = path.dirname(this.sessionPath);
      await fs.mkdir(dataDir, { recursive: true });
      
      await fs.writeFile(this.sessionPath, JSON.stringify(session, null, 2));
      console.log('💾 LinkedIn session saved');
    } catch (error) {
      console.warn('⚠️ Could not save LinkedIn session:', error.message);
    }
  }

  async sendConnectionRequest(profileUrl, customMessage = '') {
    if (!this.isLoggedIn) {
      throw new Error('Not logged in to LinkedIn');
    }

    if (this.dailyConnectionsSent >= this.maxDailyConnections) {
      throw new Error(`Daily connection limit reached (${this.maxDailyConnections})`);
    }

    // Rate limiting
    if (this.lastConnectionTime) {
      const timeSinceLastConnection = Date.now() - this.lastConnectionTime;
      if (timeSinceLastConnection < this.minDelayBetweenConnections) {
        const waitTime = this.minDelayBetweenConnections - timeSinceLastConnection;
        console.log(`⏳ Waiting ${Math.round(waitTime/1000)}s before next connection...`);
        await this.page.waitForTimeout(waitTime);
      }
    }

    try {
      console.log(`🔗 Sending connection request to: ${profileUrl}`);
      
      // Navigate to profile
      await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
      await this.randomDelay(2000, 4000);

      // Check if already connected
      const connectionStatus = await this.checkConnectionStatus();
      if (connectionStatus !== 'not-connected') {
        throw new Error(`Already connected or pending: ${connectionStatus}`);
      }

      // Find and click Connect button
      const connectButton = await this.page.$('button[aria-label*="Invite"][aria-label*="connect"], button:has-text("Connect"), .pvs-profile-actions__action button[aria-label*="connect"]');
      
      if (!connectButton) {
        throw new Error('Connect button not found on profile');
      }

      await connectButton.click();
      await this.randomDelay(1500, 3000);

      // Handle connection modal
      const modalAppeared = await this.page.waitForSelector('.send-invite', { timeout: 5000 }).catch(() => null);
      
      if (modalAppeared) {
        // If custom message is provided and there's a note option
        if (customMessage) {
          try {
            const addNoteButton = await this.page.$('button[aria-label*="Add a note"]');
            if (addNoteButton) {
              await addNoteButton.click();
              await this.randomDelay(1000, 2000);
              
              const messageTextarea = await this.page.$('#custom-message');
              if (messageTextarea) {
                await messageTextarea.clear();
                await messageTextarea.type(customMessage, { delay: 100 });
                await this.randomDelay(1000, 2000);
              }
            }
          } catch (noteError) {
            console.log('⚠️ Could not add custom message, proceeding without note');
          }
        }

        // Click Send button
        const sendButton = await this.page.$('button[aria-label*="Send invitation"], button[aria-label*="Send now"], .send-invite .artdeco-button--primary');
        if (sendButton) {
          await sendButton.click();
          await this.randomDelay(2000, 4000);
        } else {
          throw new Error('Send button not found');
        }
      } else {
        // Sometimes connection is sent immediately without modal
        console.log('✅ Connection sent immediately');
      }

      // Verify connection was sent
      const success = await this.verifyConnectionSent();
      
      if (success) {
        this.dailyConnectionsSent++;
        this.lastConnectionTime = Date.now();
        
        console.log(`✅ Connection request sent successfully (${this.dailyConnectionsSent}/${this.maxDailyConnections} today)`);
        
        return {
          success: true,
          message: 'Connection request sent',
          dailyCount: this.dailyConnectionsSent,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Could not verify connection was sent');
      }

    } catch (error) {
      console.error('❌ Error sending connection:', error.message);
      throw error;
    }
  }

  async checkConnectionStatus() {
    try {
      // Check for various connection states
      const selectors = [
        'button[aria-label*="Message"]', // Already connected
        'button[aria-label*="Pending"]', // Pending connection
        'button[aria-label*="Follow"]',  // Following
        'button[aria-label*="Connect"]'  // Can connect
      ];

      for (const selector of selectors) {
        const element = await this.page.$(selector);
        if (element) {
          const ariaLabel = await element.evaluate(el => el.getAttribute('aria-label'));
          if (ariaLabel.includes('Message')) return 'connected';
          if (ariaLabel.includes('Pending')) return 'pending';
          if (ariaLabel.includes('Follow')) return 'following';
          if (ariaLabel.includes('Connect')) return 'not-connected';
        }
      }

      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  async verifyConnectionSent() {
    try {
      // Wait a bit for the page to update
      await this.randomDelay(2000, 3000);
      
      // Check for success indicators
      const successIndicators = [
        '.artdeco-inline-feedback--success',
        '[data-test-artdeco-toast-item-type="success"]',
        'button[aria-label*="Pending"]'
      ];

      for (const selector of successIndicators) {
        const element = await this.page.$(selector);
        if (element) return true;
      }

      // Check if Connect button is no longer available
      const connectButton = await this.page.$('button[aria-label*="Connect"]');
      return !connectButton; // If no connect button, connection was likely sent

    } catch (error) {
      return false;
    }
  }

  async randomDelay(min = 1000, max = 3000) {
    const delay = Math.random() * (max - min) + min;
    await this.page.waitForTimeout(delay);
  }

  async sendMessage(profileUrl, message) {
    if (!this.isLoggedIn) {
      throw new Error('Not logged in to LinkedIn');
    }

    try {
      console.log(`💬 Sending message to: ${profileUrl}`);
      
      await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
      await this.randomDelay(2000, 4000);

      // Click Message button
      const messageButton = await this.page.$('button[aria-label*="Message"]');
      if (!messageButton) {
        throw new Error('Message button not found - may not be connected');
      }

      await messageButton.click();
      await this.randomDelay(2000, 4000);

      // Wait for message modal and type message
      await this.page.waitForSelector('.msg-form__contenteditable', { timeout: 10000 });
      
      const messageBox = await this.page.$('.msg-form__contenteditable');
      await messageBox.click();
      await this.randomDelay(500, 1000);
      
      await messageBox.type(message, { delay: 100 });
      await this.randomDelay(1000, 2000);

      // Send message
      const sendButton = await this.page.$('.msg-form__send-button');
      await sendButton.click();
      
      console.log('✅ Message sent successfully');
      
      return {
        success: true,
        message: 'LinkedIn message sent',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending message:', error.message);
      throw error;
    }
  }

  async getStats() {
    return {
      isLoggedIn: this.isLoggedIn,
      dailyConnectionsSent: this.dailyConnectionsSent,
      maxDailyConnections: this.maxDailyConnections,
      canSendMore: this.dailyConnectionsSent < this.maxDailyConnections,
      lastConnectionTime: this.lastConnectionTime
    };
  }

  async resetDailyCounter() {
    this.dailyConnectionsSent = 0;
    console.log('🔄 Daily connection counter reset');
  }

  async testBrowserOnly() {
    try {
      console.log('🧪 Testing browser initialization only...');
      
      // Detect available browser
      const browserConfig = await this.detectBrowser();
      console.log(`🚀 Using browser: ${browserConfig.name}`);
      
      // Launch browser with improved settings
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: browserConfig.path,
        protocolTimeout: 180000,
        timeout: 120000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-background-mode',
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });

      this.page = await this.browser.newPage();
      this.page.setDefaultTimeout(60000);
      
      // Test navigation
      await this.page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
      
      console.log('✅ Browser test completed successfully');
      
      return {
        success: true,
        browser: browserConfig.name,
        message: 'Browser initialized and tested successfully'
      };
      
    } catch (error) {
      console.error('❌ Browser test failed:', error.message);
      if (this.browser) {
        await this.browser.close().catch(() => {});
      }
      return {
        success: false,
        error: error.message,
        message: 'Browser test failed'
      };
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isLoggedIn = false;
    }
  }
}

module.exports = new LinkedInAutomation();