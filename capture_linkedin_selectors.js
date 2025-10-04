/**
 * Automated LinkedIn DOM Selector Capture
 * This script will visit LinkedIn, take screenshots, and extract current selectors
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;

puppeteer.use(StealthPlugin());

async function captureLinkedInSelectors() {
  const cookie = process.env.LINKEDIN_COOKIE;
  
  if (!cookie) {
    console.log('❌ Set LINKEDIN_COOKIE environment variable first');
    process.exit(1);
  }

  console.log('🔍 Starting LinkedIn selector capture...');

  const browser = await puppeteer.launch({
    headless: false, // Keep visible so we can see what's happening
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1400,900'
    ],
    defaultViewport: { width: 1400, height: 900 }
  });

  const page = await browser.newPage();
  
  try {
    console.log('🌐 Navigating to LinkedIn...');
    await page.goto('https://www.linkedin.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Set cookie
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

    // Navigate to search with a common query
    const searchQuery = 'software engineer';
    const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`;
    console.log('🔍 Navigating to search...');
    
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2',
      timeout: 45000 
    });

    // Wait for results to load
    console.log('⏳ Waiting for search results to load...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Take screenshot
    await page.screenshot({ 
      path: 'linkedin_current_structure.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved: linkedin_current_structure.png');

    // Check if we're on the right page
    const currentUrl = page.url();
    const title = await page.title();
    console.log('📍 Current URL:', currentUrl);
    console.log('📄 Page title:', title);

    if (currentUrl.includes('/login') || currentUrl.includes('/challenge')) {
      console.log('❌ Redirected to login/challenge - cookie may be expired');
      await browser.close();
      return;
    }

    console.log('\n🔍 ANALYZING CURRENT LINKEDIN STRUCTURE...\n');

    // Capture all the information we need
    const selectorAnalysis = await page.evaluate(() => {
      const analysis = {
        profileLinks: [],
        potentialProfileCards: [],
        currentSelectors: {},
        recommendations: []
      };

      // 1. Find all profile links
      const profileLinks = document.querySelectorAll('a[href*="/in/"]');
      console.log(`Found ${profileLinks.length} profile links`);
      
      for (let i = 0; i < Math.min(profileLinks.length, 5); i++) {
        const link = profileLinks[i];
        analysis.profileLinks.push({
          href: link.href,
          text: link.textContent.trim(),
          className: link.className,
          parentClasses: link.parentElement?.className || '',
          grandParentClasses: link.parentElement?.parentElement?.className || ''
        });
      }

      // 2. Find potential profile cards by looking at parent containers of profile links
      const cardCandidates = new Set();
      profileLinks.forEach(link => {
        // Check parent, grandparent, and great-grandparent
        let current = link;
        for (let i = 0; i < 4; i++) {
          current = current.parentElement;
          if (!current) break;
          
          // Look for elements that seem like containers
          if (current.className && (
            current.className.includes('result') ||
            current.className.includes('entity') ||
            current.className.includes('card') ||
            current.className.includes('lockup') ||
            current.getAttribute('data-view-name') ||
            current.getAttribute('data-test-id')
          )) {
            cardCandidates.add(current);
          }
        }
      });

      // 3. Analyze the most promising card containers
      const cards = Array.from(cardCandidates).slice(0, 3);
      cards.forEach((card, index) => {
        const cardInfo = {
          tagName: card.tagName,
          className: card.className,
          id: card.id,
          dataAttributes: {},
          childElements: {},
          sampleContent: card.textContent.substring(0, 200) + '...'
        };

        // Get data attributes
        Array.from(card.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            cardInfo.dataAttributes[attr.name] = attr.value;
          }
        });

        // Look for name, title, location within this card
        const nameLink = card.querySelector('a[href*="/in/"]');
        const nameSpan = nameLink?.querySelector('span[aria-hidden="true"]');
        
        cardInfo.childElements.nameSelector = nameSpan ? 
          `${card.tagName.toLowerCase()}${card.className ? '.' + card.className.split(' ').join('.') : ''} a[href*="/in/"] span[aria-hidden="true"]` : 
          'NOT_FOUND';

        // Look for subtitle elements (job title, company)
        const subtitles = card.querySelectorAll('[class*="subtitle"], [class*="subline"], [class*="headline"]');
        if (subtitles.length > 0) {
          cardInfo.childElements.titleSelector = subtitles[0].className;
          cardInfo.childElements.titleText = subtitles[0].textContent.trim();
        }

        analysis.potentialProfileCards.push(cardInfo);
      });

      // 4. Test current selectors to see what works
      const selectorsToTest = [
        'div[data-view-name="search-entity-result"]',
        '.entity-result',
        '.reusable-search__result-container',
        '[data-testid="search-result"]',
        '.artdeco-entity-lockup',
        '.search-result',
        'li[data-view-name]'
      ];

      selectorsToTest.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        analysis.currentSelectors[selector] = {
          count: elements.length,
          hasProfileLinks: elements.length > 0 ? 
            elements[0].querySelector('a[href*="/in/"]') !== null : false
        };
      });

      // 5. Generate recommendations
      if (analysis.potentialProfileCards.length > 0) {
        const bestCard = analysis.potentialProfileCards[0];
        const selector = bestCard.className ? 
          `.${bestCard.className.split(' ').join('.')}` : 
          bestCard.tagName.toLowerCase();
        
        analysis.recommendations.push({
          type: 'profile_card',
          selector: selector,
          reason: `Found ${cardCandidates.size} potential cards with this pattern`
        });

        if (bestCard.dataAttributes['data-view-name']) {
          analysis.recommendations.push({
            type: 'profile_card_data',
            selector: `[data-view-name="${bestCard.dataAttributes['data-view-name']}"]`,
            reason: 'Using data-view-name attribute for more stable selection'
          });
        }
      }

      return analysis;
    });

    // Save analysis to file
    await fs.writeFile(
      'linkedin_selector_analysis.json', 
      JSON.stringify(selectorAnalysis, null, 2)
    );

    // Print results
    console.log('📊 PROFILE LINKS FOUND:');
    selectorAnalysis.profileLinks.forEach((link, i) => {
      console.log(`  ${i + 1}. ${link.href}`);
      console.log(`     Text: "${link.text}"`);
      console.log(`     Classes: "${link.className}"`);
      console.log(`     Parent: "${link.parentClasses}"`);
      console.log('');
    });

    console.log('🎯 POTENTIAL PROFILE CARDS:');
    selectorAnalysis.potentialProfileCards.forEach((card, i) => {
      console.log(`  ${i + 1}. <${card.tagName} class="${card.className}">`);
      console.log(`     Data attributes:`, card.dataAttributes);
      console.log(`     Name selector: ${card.childElements.nameSelector}`);
      console.log(`     Sample content: ${card.sampleContent}`);
      console.log('');
    });

    console.log('✅ CURRENT SELECTOR TESTS:');
    Object.entries(selectorAnalysis.currentSelectors).forEach(([selector, result]) => {
      console.log(`  ${selector}: ${result.count} elements (has profile links: ${result.hasProfileLinks})`);
    });

    console.log('\n🎯 RECOMMENDATIONS:');
    selectorAnalysis.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec.type}: ${rec.selector}`);
      console.log(`     Reason: ${rec.reason}`);
    });

    console.log('\n📁 Files created:');
    console.log('  - linkedin_current_structure.png (screenshot)');
    console.log('  - linkedin_selector_analysis.json (detailed analysis)');

    console.log('\n⏱️ Browser will stay open for 30 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('❌ Error during capture:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the capture
captureLinkedInSelectors().catch(console.error);