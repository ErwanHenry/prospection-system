# LinkedIn Scraper Factory - Quick Reference Card

## Installation & Setup

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Run tests
npm run test:factory
```

## Basic Usage

```javascript
const { scraperFactory } = require('./dist/backend/services/LinkedInScraperFactory.js');

// 1. Initialize
await scraperFactory.initialize();

// 2. Get scraper (auto-select best)
const scraper = await scraperFactory.getScraper({ preferred: 'auto' });

// 3. Search
const profiles = await scraper.search('CTO startup Paris', 10);

// 4. Cleanup
await scraperFactory.closeAll();
```

## Strategy Selection

| Preference | Use Case | Config Required |
|------------|----------|-----------------|
| `'auto'` | Let factory choose (recommended) | Any strategy configured |
| `'apollo'` | Need emails, high quality | `APOLLO_API_KEY` |
| `'puppeteer'` | Fast, free scraping | `LINKEDIN_COOKIE` |
| `'selenium'` | Anti-detection critical | `LINKEDIN_COOKIE` + ChromeDriver |

## Common Patterns

### Pattern 1: Auto-Selection
```javascript
const scraper = await scraperFactory.getScraper({
  preferred: 'auto',
  allowFallback: true
});
```

### Pattern 2: Require Email
```javascript
const scraper = await scraperFactory.getScraper({
  requireEmail: true  // Forces Apollo
});
```

### Pattern 3: Specific Strategy
```javascript
const scraper = await scraperFactory.getScraper({
  preferred: 'apollo',
  allowFallback: false
});
```

### Pattern 4: Health Check
```javascript
const health = await scraper.healthCheck();
if (health.canSearchMore) {
  const profiles = await scraper.search(query, limit);
}
```

### Pattern 5: Event Monitoring
```javascript
scraperFactory.on('strategy:selected', (data) => {
  console.log(`Using: ${data.strategy}`);
});

scraperFactory.on('search:complete', (data) => {
  console.log(`Found: ${data.resultCount} profiles`);
});
```

## Search Options

### String Query
```javascript
await scraper.search('CTO Paris', 10);
```

### Structured Query
```javascript
await scraper.search({
  keywords: 'HR Manager',
  location: 'Lyon',
  title: 'HRBP',
  limit: 20
});
```

## Profile Data Structure

```typescript
{
  name: string;           // "John Doe"
  title: string;          // "CTO"
  company: string;        // "Startup Inc"
  location: string;       // "Paris, France"
  linkedinUrl: string;    // "https://linkedin.com/in/john-doe"
  searchScore: number;    // 95
  extractedAt: string;    // "2025-10-04T18:00:00.000Z"
  method: string;         // "apollo-api"
  linkedinId: string;     // "john-doe"
  email?: string;         // "john@startup.com" (Apollo only)
  phone?: string;         // "+33..." (Apollo only)
}
```

## Error Handling

```javascript
try {
  const scraper = await scraperFactory.getScraper({ preferred: 'apollo' });
  const profiles = await scraper.search('query', 10);
} catch (error) {
  if (error.code === 'APOLLO_INIT_FAILED') {
    // Handle Apollo not available
  } else if (error.code === 'NO_STRATEGY_AVAILABLE') {
    // No strategies configured
  }
}
```

## Common Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| `APOLLO_INIT_FAILED` | API key missing/invalid | Add `APOLLO_API_KEY` to .env |
| `PUPPETEER_INIT_FAILED` | Cookie missing/invalid | Add `LINKEDIN_COOKIE` to .env |
| `SELENIUM_INIT_FAILED` | ChromeDriver issue | Install ChromeDriver |
| `NO_STRATEGY_AVAILABLE` | No strategies working | Configure at least one |
| `STRATEGY_NOT_FOUND` | Invalid strategy name | Use valid name |

## Environment Variables

```bash
# .env file
APOLLO_API_KEY=your_apollo_api_key_here
LINKEDIN_COOKIE=your_li_at_cookie_value_here
DAILY_LIMIT=50
```

## NPM Scripts

```bash
npm run build              # Compile TypeScript
npm run build:watch        # Auto-recompile on changes
npm run test:factory       # Run full tests
npm run test:factory:quick # Quick verification
```

## Strategy Comparison

| Feature | Apollo | Puppeteer | Selenium |
|---------|:------:|:---------:|:--------:|
| Speed | ⚡⚡⚡ | ⚡⚡ | ⚡ |
| Emails | ✅ | ❌ | ❌ |
| Free | ❌ | ✅ | ✅ |
| Rate Limit | 60/day | 50/day | 50/day |

## Health Status

```javascript
const healthMap = await scraperFactory.getAllHealthStatus();

// Returns:
Map {
  'apollo' => {
    status: 'active',
    isInitialized: true,
    dailySearchCount: 5,
    dailyLimit: 60,
    canSearchMore: true,
    method: 'apollo-api'
  },
  // ...
}
```

## Events

| Event | Data | When |
|-------|------|------|
| `factory:initialized` | `{ strategiesCount, strategies }` | Factory initialized |
| `strategy:selected` | `{ strategy, reason }` | Strategy chosen |
| `search:start` | `{ strategy, query, limit }` | Search starts |
| `search:complete` | `{ strategy, resultCount }` | Search completes |
| `search:error` | `{ strategy, error }` | Search fails |
| `factory:closed` | `{}` | Factory closed |

## TypeScript Usage

```typescript
import {
  scraperFactory,
  ILinkedInScraper,
  LinkedInProfile,
  StrategyPreference
} from './backend/services/LinkedInScraperFactory';

const preference: StrategyPreference = {
  preferred: 'auto',
  allowFallback: true
};

const scraper: ILinkedInScraper = await scraperFactory.getScraper(preference);
const profiles: LinkedInProfile[] = await scraper.search('query', 10);
```

## Files Reference

| File | Purpose |
|------|---------|
| `LinkedInScraperFactory.ts` | Main implementation |
| `SCRAPER_FACTORY_GUIDE.md` | Full documentation (21KB) |
| `IMPLEMENTATION_SUMMARY.md` | Implementation details |
| `test-scraper-factory-full.js` | Integration tests |
| `scraper-factory-example.js` | Usage examples |
| `QUICK_REFERENCE.md` | This file |

## Resources

- **Full Guide**: `/SCRAPER_FACTORY_GUIDE.md`
- **Examples**: `/scraper-factory-example.js`
- **Tests**: `/test-scraper-factory-full.js`
- **Summary**: `/IMPLEMENTATION_SUMMARY.md`

## Support

**Getting Help**:
1. Check `SCRAPER_FACTORY_GUIDE.md` (troubleshooting section)
2. Review `scraper-factory-example.js` for patterns
3. Run tests to verify setup: `npm run test:factory`

---

**Quick Tip**: Always use `preferred: 'auto'` for maximum reliability!
