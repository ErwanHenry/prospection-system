# LinkedIn Scraper Factory - Complete Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [Strategy Details](#strategy-details)
6. [Usage Patterns](#usage-patterns)
7. [API Reference](#api-reference)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The LinkedIn Scraper Factory implements the **Strategy Pattern** to provide a unified, flexible interface for multiple LinkedIn scraping methods. It intelligently selects the best available strategy based on configuration, rate limits, and requirements.

### Key Features

- **3 Scraping Strategies**: Apollo.io API, Puppeteer, Selenium
- **Intelligent Fallback**: Auto-selects best available method
- **Type-Safe**: Full TypeScript implementation
- **Event-Driven**: Real-time progress monitoring
- **Resource Management**: Automatic cleanup and connection pooling
- **Rate Limit Aware**: Respects daily limits across all strategies

### Why Use This Factory?

**Before:**
```javascript
// Tight coupling to specific scraper
const apollo = require('./linkedinApollo.js');
await apollo.initialize();
const profiles = await apollo.search('CTO Paris', 10);

// If Apollo fails, manually switch to another scraper
// Code duplication, error-prone
```

**After:**
```typescript
// Loose coupling, automatic fallback
import { scraperFactory } from './LinkedInScraperFactory';

await scraperFactory.initialize();
const scraper = await scraperFactory.getScraper({ preferred: 'auto' });
const profiles = await scraper.search('CTO Paris', 10);
// Factory handles failures and fallbacks automatically
```

---

## Architecture

### Design Pattern: Strategy Pattern

```
┌─────────────────────────────────────────────────────────┐
│               LinkedInScraperFactory                    │
│                    (Singleton)                          │
│                                                         │
│  + getScraper(preference): ILinkedInScraper            │
│  + getAllHealthStatus(): Map<string, HealthStatus>     │
│  + closeAll(): Promise<void>                           │
└─────────────────────────────────────────────────────────┘
                           │
                           │ creates
                           ▼
┌─────────────────────────────────────────────────────────┐
│              ILinkedInScraper (Interface)               │
│                                                         │
│  + initialize(options): Promise<boolean>               │
│  + search(query, limit): Promise<LinkedInProfile[]>    │
│  + healthCheck(): Promise<HealthStatus>                │
│  + close(): Promise<void>                              │
│  + getStrategyName(): string                           │
└─────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ ApolloStrategy  │ │PuppeteerStrategy│ │SeleniumStrategy │
│                 │ │                 │ │                 │
│ Wraps:          │ │ Wraps:          │ │ Wraps:          │
│ linkedinApollo  │ │linkedinPuppeteer│ │linkedinSelenium │
│     .js         │ │    Real.js      │ │   Human.js      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **ILinkedInScraper** | Define common contract for all strategies |
| **Concrete Strategies** | Wrap existing scrapers, implement interface |
| **Factory** | Strategy selection, instantiation, lifecycle management |
| **ScraperError** | Consistent error handling across strategies |

### Key Design Principles Applied

1. **Single Responsibility**: Each strategy handles one scraping method
2. **Open/Closed**: Add new strategies without modifying existing code
3. **Dependency Inversion**: Depend on ILinkedInScraper abstraction
4. **Interface Segregation**: Clean, focused interface contract
5. **DRY**: No code duplication across strategies

---

## Installation

### Step 1: Install Dependencies

```bash
cd ~/prospection-system
npm install --save-dev typescript @types/node @types/express
```

### Step 2: Compile TypeScript

```bash
npm run build
# or with auto-recompile on changes:
npm run build:watch
```

### Step 3: Verify Installation

```bash
npm run test:factory:quick
```

---

## Quick Start

### Basic Usage

```typescript
import { scraperFactory } from './backend/services/LinkedInScraperFactory';

async function searchLinkedIn() {
  // 1. Initialize factory (loads all strategies)
  await scraperFactory.initialize();

  // 2. Get best available scraper
  const scraper = await scraperFactory.getScraper({
    preferred: 'auto',      // Let factory choose
    allowFallback: true     // Enable fallback on failure
  });

  // 3. Perform search
  const profiles = await scraper.search('CTO startup Paris', 10);

  // 4. Use results
  profiles.forEach(profile => {
    console.log(`${profile.name} - ${profile.title} at ${profile.company}`);
    if (profile.email) {
      console.log(`Email: ${profile.email}`);
    }
  });

  // 5. Cleanup
  await scraperFactory.closeAll();
}

searchLinkedIn();
```

### JavaScript Usage (Post-Compilation)

```javascript
const { scraperFactory } = require('./dist/backend/services/LinkedInScraperFactory.js');

async function searchLinkedIn() {
  await scraperFactory.initialize();

  const scraper = await scraperFactory.getScraper({ preferred: 'auto' });
  const profiles = await scraper.search('HR Manager Lyon', 5);

  console.log(`Found ${profiles.length} profiles`);

  await scraperFactory.closeAll();
}
```

---

## Strategy Details

### 1. Apollo Strategy (apollo-api)

**Best for**: High-quality leads with verified contact information

**Configuration Required**:
```bash
# .env
APOLLO_API_KEY=your_apollo_api_key_here
```

**Advantages**:
- ✅ Provides verified email addresses and phone numbers
- ✅ Fast response times (API-based, no browser overhead)
- ✅ Access to 275M+ verified profiles
- ✅ High data quality
- ✅ No anti-bot concerns

**Limitations**:
- ❌ Requires API key (free tier: 60 exports/month)
- ❌ Costs money for higher usage tiers
- ❌ Daily rate limits

**Usage**:
```typescript
const scraper = await scraperFactory.getScraper({
  preferred: 'apollo',
  allowFallback: false
});
```

---

### 2. Puppeteer Strategy (puppeteer-real)

**Best for**: Large-scale scraping without contact info needs

**Configuration Required**:
```bash
# .env
LINKEDIN_COOKIE=your_li_at_cookie_value
```

**Advantages**:
- ✅ No API costs
- ✅ Fast browser automation
- ✅ Good for headless environments
- ✅ Access to public LinkedIn data

**Limitations**:
- ❌ Requires valid LinkedIn session cookie
- ❌ No email/phone data
- ❌ Can be detected by anti-bot systems
- ❌ Resource intensive (browser instance)

**Usage**:
```typescript
const scraper = await scraperFactory.getScraper({
  preferred: 'puppeteer',
  allowFallback: true
});
```

---

### 3. Selenium Strategy (selenium-human)

**Best for**: Anti-detection critical scenarios

**Configuration Required**:
```bash
# .env
LINKEDIN_COOKIE=your_li_at_cookie_value
```

**System Requirements**:
- ChromeDriver installed and in PATH

**Advantages**:
- ✅ Advanced anti-detection capabilities
- ✅ Human behavior simulation (typing delays, mouse movements)
- ✅ More reliable against LinkedIn protections
- ✅ Handles complex scenarios

**Limitations**:
- ❌ Slowest method (human simulation)
- ❌ Highest resource consumption
- ❌ Requires ChromeDriver setup
- ❌ No email/phone data

**Usage**:
```typescript
const scraper = await scraperFactory.getScraper({
  preferred: 'selenium',
  allowFallback: false
});
```

---

## Usage Patterns

### Pattern 1: Auto-Selection (Recommended)

Let the factory choose the best available strategy:

```typescript
const scraper = await scraperFactory.getScraper({
  preferred: 'auto',
  allowFallback: true
});
```

**Selection Priority**:
1. Apollo (if `APOLLO_API_KEY` available and not rate-limited)
2. Puppeteer (if `LINKEDIN_COOKIE` available)
3. Selenium (fallback with best anti-detection)

### Pattern 2: Require Email Data

Force Apollo usage (only strategy with email data):

```typescript
const scraper = await scraperFactory.getScraper({
  preferred: 'auto',
  requireEmail: true  // Forces Apollo
});
```

### Pattern 3: Strategy-Specific

Explicitly choose a strategy without fallback:

```typescript
try {
  const scraper = await scraperFactory.getScraper({
    preferred: 'apollo',
    allowFallback: false
  });
  // Use Apollo only
} catch (error) {
  if (error.code === 'APOLLO_INIT_FAILED') {
    console.error('Apollo not available');
  }
}
```

### Pattern 4: Event Monitoring

Monitor scraper events in real-time:

```typescript
scraperFactory.on('strategy:selected', (data) => {
  console.log(`Using strategy: ${data.strategy}`);
  console.log(`Reason: ${data.reason}`);
});

scraperFactory.on('search:start', (data) => {
  console.log(`Searching: ${data.query} (limit: ${data.limit})`);
});

scraperFactory.on('search:complete', (data) => {
  console.log(`Found ${data.resultCount} profiles`);
});

scraperFactory.on('search:error', (data) => {
  console.error(`Search failed:`, data.error);
});
```

### Pattern 5: Health Monitoring

Check health of all strategies before usage:

```typescript
const healthMap = await scraperFactory.getAllHealthStatus();

for (const [strategy, health] of healthMap) {
  console.log(`${strategy}:`);
  console.log(`  Status: ${health.status}`);
  console.log(`  Daily Usage: ${health.dailySearchCount}/${health.dailyLimit}`);
  console.log(`  Can Search: ${health.canSearchMore}`);
}

// Use only healthy strategies
const healthyStrategies = Array.from(healthMap.entries())
  .filter(([_, health]) => health.status === 'active' && health.canSearchMore)
  .map(([name, _]) => name);

console.log(`Healthy strategies: ${healthyStrategies.join(', ')}`);
```

### Pattern 6: Structured Queries

Use structured query objects for more control:

```typescript
const profiles = await scraper.search({
  keywords: 'HRBP',
  location: 'Paris',
  title: 'HR Business Partner',
  limit: 20
});
```

---

## API Reference

### LinkedInScraperFactory

#### Methods

##### `initialize(): Promise<void>`

Initialize the factory and register all strategies.

```typescript
await scraperFactory.initialize();
```

##### `getScraper(preference?: StrategyPreference): Promise<ILinkedInScraper>`

Get a scraper instance based on preferences.

**Parameters**:
```typescript
interface StrategyPreference {
  preferred?: 'apollo' | 'puppeteer' | 'selenium' | 'auto';
  allowFallback?: boolean;     // Default: true
  requireEmail?: boolean;       // Default: false
  maxResponseTime?: number;     // Default: undefined
}
```

**Returns**: Promise<ILinkedInScraper>

**Throws**: ScraperError if no strategy available

##### `getAllHealthStatus(): Promise<Map<string, HealthStatus>>`

Get health status of all registered strategies.

**Returns**:
```typescript
Map<string, {
  status: 'active' | 'inactive' | 'error' | 'rate-limited';
  isInitialized: boolean;
  dailySearchCount: number;
  dailyLimit: number;
  canSearchMore: boolean;
  method: string;
  message?: string;
  lastError?: string;
}>
```

##### `closeAll(): Promise<void>`

Close all strategies and cleanup resources.

```typescript
await scraperFactory.closeAll();
```

##### `getAvailableStrategies(): string[]`

Get list of registered strategy names.

```typescript
const strategies = scraperFactory.getAvailableStrategies();
// ['apollo', 'puppeteer', 'selenium']
```

---

### ILinkedInScraper

All strategies implement this interface.

#### Methods

##### `initialize(options?: ScraperOptions): Promise<boolean>`

Initialize the scraper.

**Parameters**:
```typescript
interface ScraperOptions {
  apiKey?: string;
  cookie?: string;
  dailyLimit?: number;
  verbose?: boolean;
  userAgent?: string;
  timeout?: number;
}
```

##### `search(query: string | SearchQuery, limit?: number): Promise<LinkedInProfile[]>`

Search for LinkedIn profiles.

**Parameters**:
```typescript
// String query
await scraper.search('CTO startup Paris', 10);

// Structured query
await scraper.search({
  keywords: 'Data Scientist',
  location: 'London',
  limit: 15
});
```

**Returns**:
```typescript
interface LinkedInProfile {
  name: string;
  title: string;
  company: string;
  location: string;
  linkedinUrl: string;
  searchScore: number;
  extractedAt: string;
  method: string;
  linkedinId: string;
  source?: string;
  note?: string;
  email?: string;        // Apollo only
  phone?: string;        // Apollo only
  apolloId?: string;     // Apollo only
}
```

##### `healthCheck(): Promise<HealthStatus>`

Get scraper health status.

##### `close(): Promise<void>`

Close scraper and cleanup resources.

##### `getStrategyName(): string`

Get strategy identifier.

---

## Error Handling

### ScraperError Class

All errors extend the custom `ScraperError` class:

```typescript
class ScraperError extends Error {
  code: string;      // Error code (e.g., 'APOLLO_INIT_FAILED')
  method: string;    // Strategy that threw the error
  details?: unknown; // Additional error context
}
```

### Error Codes

| Code | Description | Recovery |
|------|-------------|----------|
| `APOLLO_INIT_FAILED` | Apollo API key missing/invalid | Add valid `APOLLO_API_KEY` |
| `APOLLO_SEARCH_ERROR` | Apollo search failed | Check API limits, retry |
| `PUPPETEER_INIT_FAILED` | Puppeteer initialization failed | Verify `LINKEDIN_COOKIE` |
| `PUPPETEER_SEARCH_ERROR` | Puppeteer search failed | Check cookie validity |
| `SELENIUM_INIT_FAILED` | Selenium initialization failed | Install ChromeDriver |
| `SELENIUM_SEARCH_ERROR` | Selenium search failed | Check browser setup |
| `STRATEGY_NOT_FOUND` | Invalid strategy name | Use valid strategy name |
| `NO_STRATEGY_AVAILABLE` | No working strategy found | Configure at least one |

### Error Handling Patterns

#### Pattern 1: Try-Catch with Fallback

```typescript
try {
  const scraper = await scraperFactory.getScraper({
    preferred: 'apollo',
    allowFallback: false
  });
  const profiles = await scraper.search('CTO Paris', 10);
} catch (error) {
  if (error.code === 'APOLLO_INIT_FAILED') {
    console.warn('Apollo not available, trying Puppeteer');
    const scraper = await scraperFactory.getScraper({ preferred: 'puppeteer' });
    const profiles = await scraper.search('CTO Paris', 10);
  }
}
```

#### Pattern 2: Automatic Fallback

```typescript
// Factory handles fallback automatically
const scraper = await scraperFactory.getScraper({
  preferred: 'apollo',
  allowFallback: true  // Automatically try other strategies
});
```

#### Pattern 3: Error Event Handling

```typescript
scraperFactory.on('error', (data) => {
  console.error(`Strategy ${data.strategy} error:`, data.error);
  // Log to monitoring service
  logToSentry(data.error);
});
```

---

## Testing

### Run All Tests

```bash
# Quick test (setup verification)
npm run test:factory:quick

# Full integration test
npm run test:factory
```

### Manual Testing

#### Test 1: Factory Initialization

```typescript
const { scraperFactory } = require('./dist/backend/services/LinkedInScraperFactory.js');

await scraperFactory.initialize();
console.log('Available strategies:', scraperFactory.getAvailableStrategies());
```

#### Test 2: Health Check

```typescript
const healthMap = await scraperFactory.getAllHealthStatus();
console.log(JSON.stringify(Array.from(healthMap), null, 2));
```

#### Test 3: Search Test

```typescript
const scraper = await scraperFactory.getScraper({ preferred: 'auto' });
const profiles = await scraper.search('CEO Paris', 3);
console.log(`Found ${profiles.length} profiles`);
console.log(profiles[0]);
```

---

## Best Practices

### 1. Always Initialize Factory First

```typescript
// ✅ GOOD
await scraperFactory.initialize();
const scraper = await scraperFactory.getScraper();

// ❌ BAD
const scraper = await scraperFactory.getScraper(); // May fail
```

### 2. Use Auto-Selection for Resilience

```typescript
// ✅ GOOD - Resilient
const scraper = await scraperFactory.getScraper({
  preferred: 'auto',
  allowFallback: true
});

// ❌ RISKY - Single point of failure
const scraper = await scraperFactory.getScraper({
  preferred: 'apollo',
  allowFallback: false
});
```

### 3. Always Cleanup Resources

```typescript
// ✅ GOOD
try {
  await scraperFactory.initialize();
  const scraper = await scraperFactory.getScraper();
  const profiles = await scraper.search('query', 10);
} finally {
  await scraperFactory.closeAll(); // Always cleanup
}
```

### 4. Monitor Health Before Heavy Usage

```typescript
// ✅ GOOD
const health = await scraper.healthCheck();
if (health.canSearchMore) {
  const profiles = await scraper.search('query', 10);
} else {
  console.warn('Rate limit reached, skipping search');
}
```

### 5. Use Structured Queries for Clarity

```typescript
// ✅ GOOD - Clear intent
await scraper.search({
  keywords: 'HR Manager',
  location: 'Paris',
  limit: 20
});

// ❌ LESS CLEAR
await scraper.search('HR Manager Paris', 20);
```

---

## Troubleshooting

### Issue: "No working scraping strategy available"

**Cause**: None of the strategies could initialize

**Solution**:
1. Check `.env` configuration:
   ```bash
   # At least one of these required:
   APOLLO_API_KEY=your_key
   LINKEDIN_COOKIE=your_cookie
   ```
2. Verify strategy-specific requirements:
   - Apollo: Valid API key
   - Puppeteer/Selenium: Valid LinkedIn cookie
   - Selenium: ChromeDriver installed

### Issue: TypeScript compilation errors

**Cause**: Missing type definitions or TypeScript not installed

**Solution**:
```bash
npm install --save-dev typescript @types/node
npm run build
```

### Issue: "Module not found" when importing factory

**Cause**: TypeScript not compiled to JavaScript

**Solution**:
```bash
npm run build
# Then import from dist/
const { scraperFactory } = require('./dist/backend/services/LinkedInScraperFactory.js');
```

### Issue: Apollo returns "Limit reached"

**Cause**: Daily API limit exceeded (60/day on free tier)

**Solution**:
1. Wait until next day for reset
2. Upgrade Apollo plan
3. Use fallback strategy:
   ```typescript
   const scraper = await scraperFactory.getScraper({
     preferred: 'puppeteer',  // Skip Apollo
     allowFallback: true
   });
   ```

### Issue: Puppeteer/Selenium cookie expired

**Cause**: LinkedIn session cookie expired

**Solution**:
1. Get fresh cookie:
   - Login to LinkedIn in browser
   - Open DevTools > Application > Cookies
   - Copy `li_at` cookie value
2. Update `.env`:
   ```bash
   LINKEDIN_COOKIE=new_cookie_value
   ```
3. Restart application

---

## Advanced Topics

### Custom Strategy Implementation

Add a new scraping strategy:

```typescript
// 1. Create strategy class implementing ILinkedInScraper
class CustomStrategy extends EventEmitter implements ILinkedInScraper {
  async initialize() { /* ... */ }
  async search(query, limit) { /* ... */ }
  async healthCheck() { /* ... */ }
  async close() { /* ... */ }
  getStrategyName() { return 'custom'; }
}

// 2. Register in factory
scraperFactory.strategies.set('custom', new CustomStrategy());

// 3. Use it
const scraper = await scraperFactory.getScraper({ preferred: 'custom' });
```

### Performance Optimization

For high-throughput scenarios:

```typescript
// Keep factory initialized throughout application lifecycle
const factory = LinkedInScraperFactory.getInstance();
await factory.initialize();

// Reuse scraper instances
const scraper = await factory.getScraper({ preferred: 'auto' });

// Batch searches
const queries = ['query1', 'query2', 'query3'];
const results = await Promise.all(
  queries.map(q => scraper.search(q, 10))
);

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  await factory.closeAll();
});
```

---

## Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting) section
- Review test files for usage examples
- Check existing service implementations in `backend/services/`

---

**Last Updated**: 2025-10-04
**Version**: 1.0.0
**Author**: Graixl Team
