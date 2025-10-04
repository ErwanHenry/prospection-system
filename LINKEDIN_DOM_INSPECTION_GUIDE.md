# 🔍 LinkedIn DOM Selector Update Guide

## Step 1: Manual Browser Inspection

1. **Open Brave Browser**
2. **Go to LinkedIn** and login with your account
3. **Search for "software engineer"** (or any query)
4. **Open Developer Tools** (F12 or Right-click → Inspect)
5. **Find profile elements** in the search results

### What to Look For:

#### Profile Cards
Look for elements that contain a person's profile. Usually they have classes like:
- `entity-result`
- `search-result`
- `artdeco-entity-lockup`
- `reusable-search__result-container`

#### Profile Names
Look for person names, usually in:
- `<a>` tags with `href="/in/..."`
- Elements with `aria-label` containing "View profile"
- `<span>` with `aria-hidden="true"` inside name links

#### Job Titles
Look for job titles/headlines:
- Often in elements with classes like `primary-subtitle`
- Usually below the name

#### Company Names
Look for company names:
- Often in elements with classes like `secondary-subtitle`
- Sometimes part of the job title

## Step 2: Copy Current Selectors

Right-click on elements and select "Copy → Copy selector" to get exact CSS selectors.

## Step 3: Test Selectors

In browser console, test selectors:
```javascript
// Test if selector finds elements
document.querySelectorAll('YOUR_SELECTOR_HERE').length

// See what text is found
document.querySelectorAll('YOUR_SELECTOR_HERE')[0]?.textContent
```

## Step 4: Update Code

Update the selectors in `/backend/services/linkedinScraperBrave.js` in these sections:
- Profile card selectors (line ~222)
- Name selectors (line ~278)  
- URL selectors (line ~313)
- Title selectors (line ~338)
- Location selectors (line ~351)

## Common 2024/2025 LinkedIn Selectors:

```javascript
// Profile cards (try these first)
'div[data-view-name="search-entity-result"]'
'.entity-result'
'.reusable-search__result-container'
'[data-testid="search-result"]'

// Names (inside profile cards)
'.entity-result__title-text a span[aria-hidden="true"]'
'h3 a span[aria-hidden="true"]'
'.name-link'

// Profile URLs
'.entity-result__title-text a'
'a[href*="/in/"]'

// Job titles
'.entity-result__primary-subtitle'
'.headline'

// Locations  
'.entity-result__secondary-subtitle'
```