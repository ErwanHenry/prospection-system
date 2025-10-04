# 🔑 How to Get LinkedIn Cookie for Real Scraping

## Step 1: Get Your LinkedIn Cookie

1. **Open Chrome/Firefox** and go to **linkedin.com**
2. **Login to your LinkedIn account**
3. **Open Developer Tools** (F12 or Right-click → Inspect)
4. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
5. Click **Cookies** → **https://www.linkedin.com**
6. Find the **`li_at`** cookie
7. **Copy the entire Value** (should be ~380 characters long)

## Step 2: Set the Cookie

### Option A: Environment Variable
```bash
export LINKEDIN_COOKIE="your-li_at-cookie-value-here"
npm start
```

### Option B: .env File
```bash
echo "LINKEDIN_COOKIE=your-li_at-cookie-value-here" >> .env
npm start
```

## Step 3: Test Real Scraping

Once cookie is set, test:
```bash
curl -X POST http://localhost:3000/api/linkedin/test
```

Should return:
```json
{
  "recommendation": "use_real_scraper",
  "realScraper": {"available": true}
}
```

## ⚠️ Important Notes

- **Cookie expires** after ~1 year or when you logout
- **Keep it secure** - never commit to git
- **Personal use only** - respect LinkedIn's terms
- **Rate limiting** - max 50 searches/day

## 🔧 Alternative: Use ChromeDriver (No Cookie Needed)

If you can't get the cookie, I can set up ChromeDriver to login automatically:

1. **Manual login** through automated browser
2. **Human-like behavior** simulation
3. **Anti-detection** measures
4. **Session persistence**

Let me know which approach you prefer!