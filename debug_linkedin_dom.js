/**
 * Debug script to inspect LinkedIn search results DOM structure
 * This will help us find the correct selectors for profile extraction
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function debugLinkedInDOM() {
  const cookie = process.env.LINKEDIN_COOKIE;
  
  if (!cookie) {
    console.log('❌ No LinkedIn cookie found');
    process.exit(1);
  }

  console.log('🔍 Starting LinkedIn DOM inspection...');

  const browser = await puppeteer.launch({
    headless: false, // Set to false so we can see what's happening
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1366,768'
    ],
    defaultViewport: { width: 1366, height: 768 }
  });

  const page = await browser.newPage();
  
  try {
    // Navigate to LinkedIn and set cookie
    console.log('🌐 Navigating to LinkedIn...');
    await page.goto('https://www.linkedin.com', { 
      waitUntil: 'load',
      timeout: 30000 
    });

    await page.setCookie({
      name: 'li_at',
      value: cookie,
      domain: '.linkedin.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    });
    console.log('🍪 Cookie set');

    // Navigate to search
    const searchQuery = 'software engineer';
    const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`;
    console.log('🔍 Navigating to search:', searchUrl);
    
    await page.goto(searchUrl, { 
      waitUntil: 'load',
      timeout: 45000 
    });

    // Wait for page to load
    await page.waitForTimeout(5000);

    console.log('📍 Current URL:', page.url());
    const title = await page.title();
    console.log('📄 Page title:', title);

    // Check if we're blocked or redirected
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/challenge')) {
      console.log('❌ Redirected to login/challenge');
      await browser.close();
      return;
    }

    // Debug: Take a screenshot
    await page.screenshot({ path: 'linkedin_search_debug.png', fullPage: true });
    console.log('📸 Screenshot saved as linkedin_search_debug.png');

    // Inspect the page structure
    console.log('\n🔍 INSPECTING PAGE STRUCTURE...\n');

    // 1. Look for any elements that might contain profiles
    const allElements = await page.evaluate(() => {
      const elements = [];
      
      // Find all elements with interesting classes or attributes
      const selectors = [
        '[data-view-name]',
        '[data-test-id]',
        '[data-testid]',
        '.entity-result',
        '.reusable-search__result-container',
        '.search-result',
        '.search-results',
        '.artdeco-entity-lockup',
        '[class*="result"]',
        '[class*="entity"]',
        '[class*="profile"]',
        '[class*="person"]'
      ];

      selectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        if (found.length > 0) {
          elements.push({
            selector: selector,
            count: found.length,
            sample: found[0] ? {
              tagName: found[0].tagName,
              className: found[0].className,
              id: found[0].id,
              textContent: found[0].textContent?.substring(0, 100) + '...'
            } : null
          });
        }
      });

      return elements;
    });

    console.log('📊 Found elements:');
    allElements.forEach(el => {
      console.log(`  ${el.selector}: ${el.count} elements`);
      if (el.sample) {
        console.log(`    Sample: <${el.sample.tagName} class="${el.sample.className}" id="${el.sample.id}">`);
        console.log(`    Text: ${el.sample.textContent}`);
      }
    });

    // 2. Look for profile links
    const profileLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/in/"]');
      const results = [];
      
      for (let i = 0; i < Math.min(links.length, 5); i++) {
        const link = links[i];
        results.push({
          href: link.href,
          text: link.textContent.trim(),
          className: link.className,
          parentElement: {
            tagName: link.parentElement?.tagName,
            className: link.parentElement?.className
          }
        });
      }
      
      return results;
    });

    console.log('\n🔗 Profile links found:');
    profileLinks.forEach((link, i) => {
      console.log(`  ${i + 1}. ${link.href}`);
      console.log(`     Text: "${link.text}"`);
      console.log(`     Class: "${link.className}"`);
      console.log(`     Parent: <${link.parentElement.tagName} class="${link.parentElement.className}">`);
    });

    // 3. Try to find the main search results container
    const searchStructure = await page.evaluate(() => {
      // Common LinkedIn search container selectors
      const containers = [
        '.search-results-container',
        '.search-results__list',
        '[data-view-name="search-entity-result-universal-template"]',
        '.reusable-search__entity-result-list',
        'main',
        '[role="main"]'
      ];

      const found = [];
      containers.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          found.push({
            selector: selector,
            childrenCount: element.children.length,
            innerHTML: element.innerHTML.substring(0, 500) + '...'
          });
        }
      });

      return found;
    });

    console.log('\n📦 Search containers:');
    searchStructure.forEach(container => {
      console.log(`  ${container.selector}: ${container.childrenCount} children`);
      console.log(`     HTML: ${container.innerHTML}`);
    });

    // Keep browser open for manual inspection
    console.log('\n✅ Debug complete! Check the screenshot and inspect the browser manually.');
    console.log('📌 Browser will stay open for 30 seconds for manual inspection...');
    
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the debug
debugLinkedInDOM().catch(console.error);