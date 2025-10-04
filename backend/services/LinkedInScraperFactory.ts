/**
 * LinkedIn Scraper Factory - Strategy Pattern Implementation
 *
 * This factory provides a unified interface for multiple LinkedIn scraping strategies,
 * allowing dynamic strategy selection based on requirements, reliability, and rate limits.
 *
 * @module LinkedInScraperFactory
 * @version 1.0.0
 * @author Graixl Team
 *
 * Architecture Pattern: Strategy Pattern
 * - ILinkedInScraper: Common interface for all strategies
 * - Concrete Strategies: Apollo, Puppeteer, Selenium
 * - Factory: Strategy selection and instantiation logic
 *
 * Design Principles:
 * - Single Responsibility: Each strategy handles one scraping method
 * - Open/Closed: Easy to add new strategies without modifying existing code
 * - Dependency Inversion: Depend on abstractions (ILinkedInScraper), not concretions
 * - Interface Segregation: Clean, focused interface contract
 */

import { EventEmitter } from 'events';

/* ========================================================================
   TYPE DEFINITIONS
   ======================================================================== */

/**
 * LinkedIn profile data structure
 */
export interface LinkedInProfile {
  /** Full name of the person */
  name: string;
  /** Job title or current position */
  title: string;
  /** Current company name */
  company: string;
  /** Geographic location */
  location: string;
  /** Full LinkedIn profile URL */
  linkedinUrl: string;
  /** Relevance score (0-100) based on search criteria */
  searchScore: number;
  /** ISO 8601 timestamp of when the profile was extracted */
  extractedAt: string;
  /** Scraping method used (apollo-api, puppeteer-real, selenium-human) */
  method: string;
  /** LinkedIn profile ID (from URL: linkedin.com/in/{linkedinId}) */
  linkedinId: string;
  /** Data source identifier */
  source?: string;
  /** Additional notes or metadata */
  note?: string;
  /** Email address (if available, primarily from Apollo) */
  email?: string;
  /** Phone number (if available, primarily from Apollo) */
  phone?: string;
  /** Apollo.io specific ID */
  apolloId?: string;
}

/**
 * Search query parameters
 */
export interface SearchQuery {
  /** Search keywords (e.g., "CTO startup Paris", "HR Manager Lyon") */
  keywords: string;
  /** Maximum number of results to return */
  limit?: number;
  /** Geographic location filter */
  location?: string;
  /** Job title filter */
  title?: string;
  /** Company name filter */
  company?: string;
}

/**
 * Scraper health status
 */
export interface HealthStatus {
  /** Current status: active, inactive, error, rate-limited */
  status: 'active' | 'inactive' | 'error' | 'rate-limited';
  /** Whether the scraper is properly initialized */
  isInitialized: boolean;
  /** Number of searches performed today */
  dailySearchCount: number;
  /** Maximum allowed searches per day */
  dailyLimit: number;
  /** Whether more searches can be performed */
  canSearchMore: boolean;
  /** Scraping method identifier */
  method: string;
  /** Additional status information */
  message?: string;
  /** Last error encountered */
  lastError?: string;
  /** Timestamp of last successful operation */
  lastSuccessAt?: string;
}

/**
 * Scraper initialization options
 */
export interface ScraperOptions {
  /** API key or authentication token */
  apiKey?: string;
  /** Session cookie for authenticated scraping */
  cookie?: string;
  /** Daily rate limit */
  dailyLimit?: number;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom user agent string */
  userAgent?: string;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Strategy selection criteria
 */
export interface StrategyPreference {
  /** Preferred strategy name */
  preferred?: 'apollo' | 'puppeteer' | 'selenium' | 'auto';
  /** Whether to allow fallback to other strategies */
  allowFallback?: boolean;
  /** Require email data (only Apollo provides this) */
  requireEmail?: boolean;
  /** Maximum acceptable response time in milliseconds */
  maxResponseTime?: number;
}

/**
 * Scraper error with context
 */
export class ScraperError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly method: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ScraperError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/* ========================================================================
   CORE INTERFACE - Strategy Pattern
   ======================================================================== */

/**
 * ILinkedInScraper - Common interface for all scraping strategies
 *
 * This interface defines the contract that all LinkedIn scraping strategies must implement.
 * It ensures consistency, testability, and interchangeability of strategies.
 *
 * @interface
 */
export interface ILinkedInScraper {
  /**
   * Initialize the scraper with required dependencies
   * Must be called before any search operations
   *
   * @param options - Configuration options for the scraper
   * @returns Promise resolving to true if initialization succeeded
   * @throws {ScraperError} If initialization fails
   */
  initialize(options?: ScraperOptions): Promise<boolean>;

  /**
   * Search for LinkedIn profiles based on query
   *
   * @param query - Search query string or structured query object
   * @param limit - Maximum number of results (default: 10)
   * @returns Promise resolving to array of LinkedIn profiles
   * @throws {ScraperError} If search fails or rate limit exceeded
   */
  search(query: string | SearchQuery, limit?: number): Promise<LinkedInProfile[]>;

  /**
   * Get current health status of the scraper
   *
   * @returns Promise resolving to health status object
   */
  healthCheck(): Promise<HealthStatus>;

  /**
   * Close and cleanup scraper resources
   * Should be called when scraper is no longer needed
   *
   * @returns Promise resolving when cleanup is complete
   */
  close(): Promise<void>;

  /**
   * Get the strategy name/identifier
   *
   * @returns String identifier for this strategy
   */
  getStrategyName(): string;
}

/* ========================================================================
   CONCRETE STRATEGIES - Apollo, Puppeteer, Selenium
   ======================================================================== */

/**
 * ApolloStrategy - Wraps Apollo.io API for verified LinkedIn profiles
 *
 * Advantages:
 * - Provides verified email addresses and phone numbers
 * - Fast response times (API-based)
 * - High data quality (275M+ verified profiles)
 * - No browser automation overhead
 *
 * Limitations:
 * - Requires API key (free tier: 60 exports/month)
 * - Daily rate limits
 * - Costs money for higher tiers
 *
 * Best for: High-quality leads with contact information
 */
export class ApolloStrategy extends EventEmitter implements ILinkedInScraper {
  private apolloService: any;
  private isInitialized: boolean = false;
  private options: ScraperOptions = {};

  constructor() {
    super();
  }

  /**
   * Initialize Apollo.io API client
   */
  async initialize(options: ScraperOptions = {}): Promise<boolean> {
    try {
      this.options = options;

      // Dynamically import the existing Apollo service
      const LinkedInApollo = require('./linkedinApollo.js');
      this.apolloService = new LinkedInApollo();

      // Initialize the Apollo service
      const initialized = await this.apolloService.initialize();

      if (!initialized) {
        throw new ScraperError(
          'Apollo.io API key not configured or invalid',
          'APOLLO_INIT_FAILED',
          'apollo',
          { message: 'Add APOLLO_API_KEY to .env file' }
        );
      }

      this.isInitialized = true;
      this.emit('initialized', { strategy: 'apollo', success: true });

      return true;
    } catch (error) {
      this.emit('error', { strategy: 'apollo', error });
      throw new ScraperError(
        `Apollo initialization failed: ${error instanceof Error ? error.message : String(error)}`,
        'APOLLO_INIT_ERROR',
        'apollo',
        error
      );
    }
  }

  /**
   * Search using Apollo.io API
   */
  async search(query: string | SearchQuery, limit: number = 10): Promise<LinkedInProfile[]> {
    if (!this.isInitialized) {
      await this.initialize(this.options);
    }

    try {
      const searchString = typeof query === 'string' ? query : query.keywords;
      const searchLimit = typeof query === 'object' && query.limit ? query.limit : limit;

      this.emit('search:start', { strategy: 'apollo', query: searchString, limit: searchLimit });

      const profiles = await this.apolloService.search(searchString, searchLimit);

      this.emit('search:complete', {
        strategy: 'apollo',
        query: searchString,
        resultCount: profiles.length
      });

      return profiles as LinkedInProfile[];
    } catch (error) {
      this.emit('search:error', { strategy: 'apollo', error });
      throw new ScraperError(
        `Apollo search failed: ${error instanceof Error ? error.message : String(error)}`,
        'APOLLO_SEARCH_ERROR',
        'apollo',
        error
      );
    }
  }

  /**
   * Get Apollo service health status
   */
  async healthCheck(): Promise<HealthStatus> {
    try {
      const health = await this.apolloService.healthCheck();

      return {
        status: health.status === 'active' ? 'active' : 'inactive',
        isInitialized: this.isInitialized,
        dailySearchCount: health.dailyRequestCount || 0,
        dailyLimit: health.dailyLimit || 60,
        canSearchMore: (health.dailyRequestCount || 0) < (health.dailyLimit || 60),
        method: 'apollo-api',
        message: health.description
      };
    } catch (error) {
      return {
        status: 'error',
        isInitialized: false,
        dailySearchCount: 0,
        dailyLimit: 60,
        canSearchMore: false,
        method: 'apollo-api',
        lastError: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Close Apollo service
   */
  async close(): Promise<void> {
    if (this.apolloService) {
      await this.apolloService.close();
    }
    this.isInitialized = false;
    this.emit('closed', { strategy: 'apollo' });
  }

  getStrategyName(): string {
    return 'apollo';
  }
}

/**
 * PuppeteerStrategy - Wraps Puppeteer-based LinkedIn scraping
 *
 * Advantages:
 * - Fast browser automation
 * - Good for headless scraping
 * - No API costs
 * - Access to public LinkedIn data
 *
 * Limitations:
 * - Requires LinkedIn session cookie
 * - Can be detected by anti-bot systems
 * - No email/phone data
 * - Resource intensive
 *
 * Best for: Large-scale scraping without contact info needs
 */
export class PuppeteerStrategy extends EventEmitter implements ILinkedInScraper {
  private puppeteerService: any;
  private isInitialized: boolean = false;
  private options: ScraperOptions = {};

  constructor() {
    super();
  }

  /**
   * Initialize Puppeteer scraper
   */
  async initialize(options: ScraperOptions = {}): Promise<boolean> {
    try {
      this.options = options;

      // Dynamically import the existing Puppeteer service
      const linkedinPuppeteerReal = require('./linkedinPuppeteerReal.js');
      this.puppeteerService = linkedinPuppeteerReal;

      // Initialize the Puppeteer service
      const initialized = await this.puppeteerService.initialize();

      if (!initialized) {
        throw new ScraperError(
          'Puppeteer initialization failed - check LINKEDIN_COOKIE',
          'PUPPETEER_INIT_FAILED',
          'puppeteer',
          { message: 'Verify LINKEDIN_COOKIE in .env file' }
        );
      }

      this.isInitialized = true;
      this.emit('initialized', { strategy: 'puppeteer', success: true });

      return true;
    } catch (error) {
      this.emit('error', { strategy: 'puppeteer', error });
      throw new ScraperError(
        `Puppeteer initialization failed: ${error instanceof Error ? error.message : String(error)}`,
        'PUPPETEER_INIT_ERROR',
        'puppeteer',
        error
      );
    }
  }

  /**
   * Search using Puppeteer
   */
  async search(query: string | SearchQuery, limit: number = 10): Promise<LinkedInProfile[]> {
    if (!this.isInitialized) {
      await this.initialize(this.options);
    }

    try {
      const searchString = typeof query === 'string' ? query : query.keywords;
      const searchLimit = typeof query === 'object' && query.limit ? query.limit : limit;

      this.emit('search:start', { strategy: 'puppeteer', query: searchString, limit: searchLimit });

      const profiles = await this.puppeteerService.search(searchString, searchLimit);

      this.emit('search:complete', {
        strategy: 'puppeteer',
        query: searchString,
        resultCount: profiles.length
      });

      return profiles as LinkedInProfile[];
    } catch (error) {
      this.emit('search:error', { strategy: 'puppeteer', error });
      throw new ScraperError(
        `Puppeteer search failed: ${error instanceof Error ? error.message : String(error)}`,
        'PUPPETEER_SEARCH_ERROR',
        'puppeteer',
        error
      );
    }
  }

  /**
   * Get Puppeteer service health status
   */
  async healthCheck(): Promise<HealthStatus> {
    try {
      const health = await this.puppeteerService.healthCheck();

      return {
        status: health.status === 'active' ? 'active' : 'inactive',
        isInitialized: this.isInitialized,
        dailySearchCount: health.dailySearchCount || 0,
        dailyLimit: health.dailyLimit || 50,
        canSearchMore: (health.dailySearchCount || 0) < (health.dailyLimit || 50),
        method: 'puppeteer-real'
      };
    } catch (error) {
      return {
        status: 'error',
        isInitialized: false,
        dailySearchCount: 0,
        dailyLimit: 50,
        canSearchMore: false,
        method: 'puppeteer-real',
        lastError: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Close Puppeteer browser
   */
  async close(): Promise<void> {
    if (this.puppeteerService) {
      await this.puppeteerService.close();
    }
    this.isInitialized = false;
    this.emit('closed', { strategy: 'puppeteer' });
  }

  getStrategyName(): string {
    return 'puppeteer';
  }
}

/**
 * SeleniumStrategy - Wraps Selenium-based human behavior simulation
 *
 * Advantages:
 * - Advanced anti-detection capabilities
 * - Human behavior simulation
 * - More reliable against LinkedIn's protections
 * - Can handle complex scenarios
 *
 * Limitations:
 * - Slower than other methods
 * - Higher resource consumption
 * - Requires ChromeDriver setup
 * - No email/phone data
 *
 * Best for: Anti-detection critical scenarios
 */
export class SeleniumStrategy extends EventEmitter implements ILinkedInScraper {
  private seleniumService: any;
  private isInitialized: boolean = false;
  private options: ScraperOptions = {};

  constructor() {
    super();
  }

  /**
   * Initialize Selenium scraper
   */
  async initialize(options: ScraperOptions = {}): Promise<boolean> {
    try {
      this.options = options;

      // Dynamically import the existing Selenium service
      const linkedinSeleniumHuman = require('./linkedinSeleniumHuman.js');
      this.seleniumService = linkedinSeleniumHuman;

      // Initialize the Selenium service
      const initialized = await this.seleniumService.initialize();

      if (!initialized) {
        throw new ScraperError(
          'Selenium initialization failed - check LINKEDIN_COOKIE and ChromeDriver',
          'SELENIUM_INIT_FAILED',
          'selenium',
          { message: 'Verify LINKEDIN_COOKIE and ChromeDriver installation' }
        );
      }

      this.isInitialized = true;
      this.emit('initialized', { strategy: 'selenium', success: true });

      return true;
    } catch (error) {
      this.emit('error', { strategy: 'selenium', error });
      throw new ScraperError(
        `Selenium initialization failed: ${error instanceof Error ? error.message : String(error)}`,
        'SELENIUM_INIT_ERROR',
        'selenium',
        error
      );
    }
  }

  /**
   * Search using Selenium with human behavior
   */
  async search(query: string | SearchQuery, limit: number = 10): Promise<LinkedInProfile[]> {
    if (!this.isInitialized) {
      await this.initialize(this.options);
    }

    try {
      const searchString = typeof query === 'string' ? query : query.keywords;
      const searchLimit = typeof query === 'object' && query.limit ? query.limit : limit;

      this.emit('search:start', { strategy: 'selenium', query: searchString, limit: searchLimit });

      const profiles = await this.seleniumService.search(searchString, searchLimit);

      this.emit('search:complete', {
        strategy: 'selenium',
        query: searchString,
        resultCount: profiles.length
      });

      return profiles as LinkedInProfile[];
    } catch (error) {
      this.emit('search:error', { strategy: 'selenium', error });
      throw new ScraperError(
        `Selenium search failed: ${error instanceof Error ? error.message : String(error)}`,
        'SELENIUM_SEARCH_ERROR',
        'selenium',
        error
      );
    }
  }

  /**
   * Get Selenium service health status
   */
  async healthCheck(): Promise<HealthStatus> {
    try {
      const health = await this.seleniumService.healthCheck();

      return {
        status: health.status === 'active' ? 'active' : 'inactive',
        isInitialized: this.isInitialized,
        dailySearchCount: health.dailySearchCount || 0,
        dailyLimit: health.dailyLimit || 50,
        canSearchMore: (health.dailySearchCount || 0) < (health.dailyLimit || 50),
        method: 'selenium-human'
      };
    } catch (error) {
      return {
        status: 'error',
        isInitialized: false,
        dailySearchCount: 0,
        dailyLimit: 50,
        canSearchMore: false,
        method: 'selenium-human',
        lastError: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Close Selenium WebDriver
   */
  async close(): Promise<void> {
    if (this.seleniumService) {
      await this.seleniumService.close();
    }
    this.isInitialized = false;
    this.emit('closed', { strategy: 'selenium' });
  }

  getStrategyName(): string {
    return 'selenium';
  }
}

/* ========================================================================
   FACTORY - Strategy Selection & Instantiation
   ======================================================================== */

/**
 * LinkedInScraperFactory - Centralized factory for strategy selection
 *
 * Responsibilities:
 * - Instantiate appropriate scraping strategies
 * - Implement intelligent fallback logic
 * - Manage strategy lifecycle
 * - Provide unified access to all strategies
 *
 * Strategy Selection Algorithm:
 * 1. Check user preference if specified
 * 2. If preference not available/failed, use auto-selection:
 *    - Apollo (if API key available and email required)
 *    - Puppeteer (if fast results needed and cookie available)
 *    - Selenium (if anti-detection critical)
 * 3. Fallback to alternative strategies on failure
 *
 * @class
 */
export class LinkedInScraperFactory extends EventEmitter {
  private static instance: LinkedInScraperFactory;
  private strategies: Map<string, ILinkedInScraper> = new Map();
  private initialized: boolean = false;

  private constructor() {
    super();
  }

  /**
   * Get singleton instance of the factory
   */
  static getInstance(): LinkedInScraperFactory {
    if (!LinkedInScraperFactory.instance) {
      LinkedInScraperFactory.instance = new LinkedInScraperFactory();
    }
    return LinkedInScraperFactory.instance;
  }

  /**
   * Initialize the factory and register all available strategies
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('🏭 Initializing LinkedIn Scraper Factory...');

    // Register all available strategies
    this.strategies.set('apollo', new ApolloStrategy());
    this.strategies.set('puppeteer', new PuppeteerStrategy());
    this.strategies.set('selenium', new SeleniumStrategy());

    this.initialized = true;
    this.emit('factory:initialized', {
      strategiesCount: this.strategies.size,
      strategies: Array.from(this.strategies.keys())
    });

    console.log(`✅ Factory initialized with ${this.strategies.size} strategies`);
  }

  /**
   * Get a scraper instance based on preference and availability
   *
   * @param preference - Strategy selection preferences
   * @returns Promise resolving to initialized scraper instance
   * @throws {ScraperError} If no suitable strategy found
   */
  async getScraper(preference: StrategyPreference = {}): Promise<ILinkedInScraper> {
    if (!this.initialized) {
      await this.initialize();
    }

    const { preferred = 'auto', allowFallback = true, requireEmail = false } = preference;

    try {
      // Auto-selection logic
      if (preferred === 'auto') {
        return await this.autoSelectStrategy(preference);
      }

      // Try preferred strategy
      const strategy = this.strategies.get(preferred);
      if (!strategy) {
        throw new ScraperError(
          `Strategy '${preferred}' not found`,
          'STRATEGY_NOT_FOUND',
          'factory',
          { availableStrategies: Array.from(this.strategies.keys()) }
        );
      }

      // Try to initialize the preferred strategy
      try {
        const initialized = await strategy.initialize();
        if (initialized) {
          this.emit('strategy:selected', { strategy: preferred, method: 'direct' });
          return strategy;
        }
      } catch (error) {
        console.warn(`⚠️ Preferred strategy '${preferred}' failed to initialize:`, error);

        if (!allowFallback) {
          throw error;
        }
      }

      // Fallback logic if allowed
      if (allowFallback) {
        console.log('🔄 Attempting fallback to alternative strategies...');
        return await this.autoSelectStrategy(preference);
      }

      throw new ScraperError(
        `Failed to initialize strategy '${preferred}' and fallback not allowed`,
        'STRATEGY_INIT_FAILED',
        'factory'
      );

    } catch (error) {
      this.emit('strategy:error', { error });
      throw error;
    }
  }

  /**
   * Intelligent auto-selection of best available strategy
   *
   * Priority order:
   * 1. Apollo (if requireEmail=true or API key available)
   * 2. Puppeteer (good balance of speed and reliability)
   * 3. Selenium (fallback with strongest anti-detection)
   */
  private async autoSelectStrategy(preference: StrategyPreference): Promise<ILinkedInScraper> {
    const { requireEmail = false } = preference;

    // If email required, only Apollo can provide it
    if (requireEmail) {
      const apollo = this.strategies.get('apollo');
      if (apollo) {
        try {
          await apollo.initialize();
          this.emit('strategy:selected', { strategy: 'apollo', reason: 'email-required' });
          return apollo;
        } catch (error) {
          throw new ScraperError(
            'Apollo required for email data but initialization failed',
            'APOLLO_REQUIRED_FAILED',
            'factory',
            error
          );
        }
      }
    }

    // Try strategies in priority order
    const priorityOrder = ['apollo', 'puppeteer', 'selenium'];

    for (const strategyName of priorityOrder) {
      const strategy = this.strategies.get(strategyName);
      if (!strategy) continue;

      try {
        console.log(`🔍 Trying strategy: ${strategyName}...`);
        await strategy.initialize();

        // Verify it's actually working
        const health = await strategy.healthCheck();
        if (health.status === 'active' && health.canSearchMore) {
          console.log(`✅ Selected strategy: ${strategyName}`);
          this.emit('strategy:selected', {
            strategy: strategyName,
            reason: 'auto-selection',
            health
          });
          return strategy;
        }
      } catch (error) {
        console.warn(`⚠️ Strategy '${strategyName}' not available:`,
          error instanceof Error ? error.message : String(error));
        continue;
      }
    }

    throw new ScraperError(
      'No working scraping strategy available',
      'NO_STRATEGY_AVAILABLE',
      'factory',
      { triedStrategies: priorityOrder }
    );
  }

  /**
   * Get health status of all registered strategies
   */
  async getAllHealthStatus(): Promise<Map<string, HealthStatus>> {
    const healthStatuses = new Map<string, HealthStatus>();

    for (const [name, strategy] of this.strategies) {
      try {
        const health = await strategy.healthCheck();
        healthStatuses.set(name, health);
      } catch (error) {
        healthStatuses.set(name, {
          status: 'error',
          isInitialized: false,
          dailySearchCount: 0,
          dailyLimit: 0,
          canSearchMore: false,
          method: name,
          lastError: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return healthStatuses;
  }

  /**
   * Close all strategies and cleanup resources
   */
  async closeAll(): Promise<void> {
    console.log('🛑 Closing all scraper strategies...');

    const closePromises = Array.from(this.strategies.values()).map(async (strategy) => {
      try {
        await strategy.close();
      } catch (error) {
        console.warn(`⚠️ Error closing strategy:`, error);
      }
    });

    await Promise.all(closePromises);

    this.strategies.clear();
    this.initialized = false;
    this.emit('factory:closed');

    console.log('✅ All strategies closed');
  }

  /**
   * Get list of available strategy names
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Check if factory is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/* ========================================================================
   EXPORTS
   ======================================================================== */

// Export singleton instance for easy consumption
export const scraperFactory = LinkedInScraperFactory.getInstance();

// Export factory class for advanced usage
export default LinkedInScraperFactory;
