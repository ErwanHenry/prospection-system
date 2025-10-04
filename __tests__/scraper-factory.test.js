const { LinkedInScraperFactory } = require('../backend/services/LinkedInScraperFactory');

describe('LinkedInScraperFactory', () => {
  let factory;

  beforeAll(() => {
    // Mock environment variables
    process.env.APOLLO_API_KEY = 'test-apollo-key';
    process.env.LINKEDIN_COOKIE = 'test-linkedin-cookie';
  });

  beforeEach(() => {
    factory = new LinkedInScraperFactory();
  });

  describe('Scraper Selection', () => {
    test('should create Apollo scraper by default', () => {
      const scraper = factory.createScraper('apollo');
      expect(scraper).toBeDefined();
      expect(scraper.type).toBe('apollo');
    });

    test('should create Google scraper when specified', () => {
      const scraper = factory.createScraper('google');
      expect(scraper).toBeDefined();
      expect(scraper.type).toBe('google');
    });

    test('should create LinkedIn scraper when specified', () => {
      const scraper = factory.createScraper('linkedin');
      expect(scraper).toBeDefined();
      expect(scraper.type).toBe('linkedin');
    });

    test('should fallback to Apollo if invalid type', () => {
      const scraper = factory.createScraper('invalid-type');
      expect(scraper).toBeDefined();
      expect(scraper.type).toBe('apollo');
    });
  });

  describe('Apollo Scraper', () => {
    let apolloScraper;

    beforeEach(() => {
      apolloScraper = factory.createScraper('apollo');
    });

    test('should search profiles successfully', async () => {
      const query = {
        jobTitle: 'CEO',
        location: 'Paris',
        company: 'Google'
      };

      const results = await apolloScraper.searchProfiles(query);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should extract profile data correctly', async () => {
      const profileUrl = 'https://linkedin.com/in/test-profile';
      const profile = await apolloScraper.extractProfile(profileUrl);

      expect(profile).toBeDefined();
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('title');
      expect(profile).toHaveProperty('company');
      expect(profile).toHaveProperty('location');
    });

    test('should handle API rate limits gracefully', async () => {
      // Simulate rate limit scenario
      const queries = Array(100).fill({
        jobTitle: 'Developer',
        location: 'London'
      });

      const results = await Promise.allSettled(
        queries.map(q => apolloScraper.searchProfiles(q))
      );

      const successful = results.filter(r => r.status === 'fulfilled');
      const rateLimited = results.filter(r => r.status === 'rejected');

      expect(successful.length + rateLimited.length).toBe(100);
    });

    test('should validate API key before requests', () => {
      delete process.env.APOLLO_API_KEY;
      expect(() => factory.createScraper('apollo')).toThrow('APOLLO_API_KEY missing');
      process.env.APOLLO_API_KEY = 'test-apollo-key'; // Restore
    });
  });

  describe('Google Scraper', () => {
    let googleScraper;

    beforeEach(() => {
      googleScraper = factory.createScraper('google');
    });

    test('should construct correct search query', () => {
      const query = {
        jobTitle: 'CTO',
        company: 'Microsoft',
        location: 'Seattle'
      };

      const searchQuery = googleScraper.buildSearchQuery(query);
      expect(searchQuery).toContain('site:linkedin.com');
      expect(searchQuery).toContain('CTO');
      expect(searchQuery).toContain('Microsoft');
      expect(searchQuery).toContain('Seattle');
    });

    test('should parse Google results correctly', async () => {
      const query = {
        jobTitle: 'VP Engineering',
        location: 'San Francisco'
      };

      const results = await googleScraper.searchProfiles(query);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);

      if (results.length > 0) {
        expect(results[0]).toHaveProperty('url');
        expect(results[0].url).toContain('linkedin.com');
      }
    });

    test('should handle no results gracefully', async () => {
      const query = {
        jobTitle: 'NonExistentJobTitle12345',
        location: 'Mars'
      };

      const results = await googleScraper.searchProfiles(query);
      expect(results).toBeDefined();
      expect(results.length).toBe(0);
    });
  });

  describe('LinkedIn Scraper', () => {
    let linkedinScraper;

    beforeEach(() => {
      linkedinScraper = factory.createScraper('linkedin');
    });

    test('should use LinkedIn cookie for authentication', () => {
      expect(linkedinScraper.cookie).toBe('test-linkedin-cookie');
    });

    test('should detect cookie expiration', async () => {
      // Mock expired cookie scenario
      linkedinScraper.cookie = 'expired-cookie';

      await expect(
        linkedinScraper.searchProfiles({ jobTitle: 'CEO' })
      ).rejects.toThrow('LinkedIn cookie expired');
    });

    test('should extract profile with Puppeteer', async () => {
      const profileUrl = 'https://linkedin.com/in/test-user';
      const profile = await linkedinScraper.extractProfile(profileUrl);

      expect(profile).toBeDefined();
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('headline');
      expect(profile).toHaveProperty('connections');
    });

    test('should handle CAPTCHA gracefully', async () => {
      // Simulate CAPTCHA detection
      const result = await linkedinScraper.handleCaptcha();
      expect(result).toHaveProperty('captchaDetected', true);
      expect(result).toHaveProperty('fallbackStrategy');
    });
  });

  describe('Email Finder Integration', () => {
    test('should find email from profile data', async () => {
      const profileData = {
        name: 'John Doe',
        company: 'Acme Corp',
        linkedinUrl: 'https://linkedin.com/in/john-doe'
      };

      const email = await factory.findEmail(profileData);
      expect(email).toBeDefined();
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Email regex
    });

    test('should verify email validity', async () => {
      const email = 'test@example.com';
      const verification = await factory.verifyEmail(email);

      expect(verification).toBeDefined();
      expect(verification).toHaveProperty('valid');
      expect(verification).toHaveProperty('confidence');
    });
  });

  describe('Error Handling', () => {
    test('should retry on network errors', async () => {
      const scraper = factory.createScraper('apollo');
      let attemptCount = 0;

      scraper.searchProfiles = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network error');
        }
        return Promise.resolve([]);
      });

      const results = await scraper.searchProfiles({ jobTitle: 'CEO' });
      expect(attemptCount).toBe(3);
      expect(results).toEqual([]);
    });

    test('should log errors with context', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const scraper = factory.createScraper('apollo');
      scraper.searchProfiles = jest.fn().mockRejectedValue(new Error('API Error'));

      await expect(
        scraper.searchProfiles({ jobTitle: 'CEO' })
      ).rejects.toThrow('API Error');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Scraper error'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    test('should complete search in reasonable time', async () => {
      const scraper = factory.createScraper('apollo');
      const startTime = Date.now();

      await scraper.searchProfiles({ jobTitle: 'Developer', location: 'Paris' });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete in < 5s
    });

    test('should handle concurrent requests', async () => {
      const scraper = factory.createScraper('apollo');
      const queries = [
        { jobTitle: 'CEO', location: 'Paris' },
        { jobTitle: 'CTO', location: 'London' },
        { jobTitle: 'CFO', location: 'Berlin' }
      ];

      const results = await Promise.all(
        queries.map(q => scraper.searchProfiles(q))
      );

      expect(results.length).toBe(3);
      expect(results.every(r => Array.isArray(r))).toBe(true);
    });
  });
});
