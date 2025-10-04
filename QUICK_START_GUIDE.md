# 🚀 Quick Start Guide - LinkedIn Prospection System

## 5-Minute Setup

Get your AI-powered prospection system running in 5 minutes!

### Step 1: Prerequisites Check ✅

Before starting, make sure you have:
- [x] **Node.js 18+** installed (`node --version`)
- [x] **Gmail account** (for notifications)
- [x] **Google account** (for Sheets integration)
- [x] **Apollo.io account** (free tier available)

### Step 2: Installation ⚡

```bash
# 1. Clone and navigate
git clone <repository-url>
cd prospection-system

# 2. Install dependencies
npm install

# 3. Quick verification
node --version  # Should show v18.x.x or higher
```

### Step 3: Quick Configuration 🔧

Create your `.env` file with these essential settings:

```bash
# Copy example configuration
cp .env.example .env

# Edit with your details
nano .env
```

**Minimal required configuration:**
```env
# Basic Settings
PORT=3000

# Google Sheets (create new sheet first)
GOOGLE_SPREADSHEET_ID=your_google_sheet_id_here

# Apollo.io (sign up at apollo.io for free)
APOLLO_API_KEY=your_apollo_api_key_here

# Gmail for notifications
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### Step 4: Google Services Setup 📊

#### 4.1 Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create new blank spreadsheet
3. Copy the ID from URL: `https://docs.google.com/spreadsheets/d/{THIS_IS_THE_ID}/edit`
4. Paste into `GOOGLE_SPREADSHEET_ID` in `.env`

#### 4.2 Google Cloud Setup
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing one
3. Enable **Google Sheets API** and **Google Drive API**
4. Create **OAuth 2.0 Client** credentials
5. Download as `credentials.json` and place in project root

#### 4.3 Gmail App Password
1. Go to [Google Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Create [App Password](https://myaccount.google.com/apppasswords)
4. Copy 16-character password to `GMAIL_APP_PASSWORD`

### Step 5: Apollo.io Setup 🔍

1. Sign up at [Apollo.io](https://app.apollo.io) (free tier: 10k requests/month)
2. Go to Settings → API
3. Copy your API key to `APOLLO_API_KEY`

### Step 6: Start System 🎉

```bash
# Start the server
cd backend
node server.js

# You should see:
# 🚀 Starting Prospection System v2.0.0...
# ✅ All required environment variables are set
# ✅ Email notification service initialized
# ✅ Google Sheets connected
# 🎆 Server running at http://localhost:3000
```

### Step 7: First Authentication 🔐

1. Open http://localhost:3000
2. Click **"🔑 Authenticate Google"**
3. Complete OAuth flow
4. Grant Sheets and Drive permissions
5. Look for **"✅ Google Sheets: connected"**

---

## 🎯 Your First Search (30 seconds)

### Basic Search Test

1. **Navigate to the interface**: http://localhost:3000
2. **Enter search query**: `CTO startup Paris`
3. **Set limit**: `5` (start small)
4. **Click**: **"🔍 Search LinkedIn"**
5. **Wait for results**: Should see real LinkedIn profiles in ~3 seconds

**Expected result:**
```
✅ 4 VRAIS profils LinkedIn extraits via Apollo.io
- Guillaume Chanal @ Greater Paris University Hospitals
- Helene Msika @ Ramsay Santé
- Fabrice Dion @ Greater Paris University Hospitals
- Julien Pontier @ Ville de Paris
```

### Add to CRM Test

1. **Select prospects**: Check boxes next to interesting profiles
2. **Click**: **"+ Add to CRM"**
3. **Check Google Sheets**: Your prospects should appear automatically
4. **Verify columns**: ID, Nom, Entreprise, Poste, LinkedIn URL, etc.

---

## 🤖 Your First AI Email (1 minute)

### Generate Personalized Email

1. **From search results**, select one prospect
2. **Click**: **"Generate Email"** or use the API:

```bash
curl -X POST http://localhost:3000/api/automation/generate-email \
  -H "Content-Type: application/json" \
  -d '{
    "prospect": {
      "name": "Guillaume Chanal",
      "company": "Greater Paris University Hospitals",
      "title": "Directeur des Ressources Humaines"
    }
  }'
```

**Expected AI-generated email:**
```
Subject: Guillaume Chanal, transform recruitment solutions at Greater Paris University Hospitals

Hi Guillaume Chanal,

I noticed your role as Directeur des Ressources Humaines at Greater Paris University Hospitals. Given your expertise in recruitment solutions, I thought you might be interested in how we are helping similar professionals with streamlining their hiring process.

Our AI-powered recruitment platform has helped companies like yours:
• Reduce time-to-hire by 40%
• Improve candidate quality by 60%
• Streamline HR workflows and reporting

Would you be open to a brief 15-minute conversation next week to explore how this could benefit Greater Paris University Hospitals?

Best regards,
[Your Name]
```

---

## ⚡ Your First Full Workflow (2 minutes)

### Complete Automation Sequence

**What it does:**
1. 🔍 Search LinkedIn for prospects
2. 🤖 Generate AI-personalized emails
3. 📧 Send email notifications to you
4. 📊 Save everything to CRM
5. 📅 Schedule follow-ups (optional)

**How to run:**

1. **Search for prospects**: `Head of Marketing SaaS` (limit: 3)
2. **Select all results**: Check all boxes
3. **Configure workflow**:
   - ✅ Generate AI Emails
   - ✅ Send LinkedIn Connections (optional)
   - ✅ Schedule Follow-ups (optional)
4. **Set context**: `We help SaaS companies improve customer acquisition`
5. **Click**: **"⚡ Run Full Sequence"**

**What happens next:**
- You'll see real-time progress in the interface
- You'll receive 2 beautiful HTML emails:
  - 🚀 **Workflow Started** (with prospect details)
  - 🎯 **Workflow Completed** (with results and statistics)
- All prospects and generated content saved to your Google Sheet

---

## 📊 Monitor Your Success

### Check Your Results

**1. Google Sheets CRM**
- Open your Google Sheet
- See all prospects with generated emails
- Track statuses and follow-ups

**2. Email Notifications**
- Check your Gmail inbox
- Beautiful HTML reports with:
  - Prospects processed: X
  - Emails generated: X
  - Actions completed: X

**3. System Analytics**
Visit: http://localhost:3000 → **CRM section**
- Total prospects: X
- By status breakdown
- Recent activity

---

## 🎪 Advanced Features (Optional)

### LinkedIn Automation Setup

For LinkedIn connection requests and messaging:

1. **Get LinkedIn Cookie**:
   - Login to LinkedIn
   - Press F12 → Application → Cookies → linkedin.com
   - Copy `li_at` cookie value
   - Add to `LINKEDIN_COOKIE` in `.env`

2. **Test LinkedIn Actions**:
   ```bash
   curl -X POST http://localhost:3000/api/automation/linkedin-connection \
     -H "Content-Type: application/json" \
     -d '{
       "profileUrl": "https://linkedin.com/in/username",
       "message": "Hi, I'd love to connect!"
     }'
   ```

### Duplicate Management

Keep your CRM clean:
1. Visit http://localhost:3000
2. Click **"🔄 Remove Duplicates"** in System Health
3. System finds duplicates by LinkedIn URL or Name+Company
4. Shows: "✅ Removed X duplicate(s) from CRM"

---

## 🔧 Quick Troubleshooting

### ❌ "Gmail authentication failed"
```bash
# Check credentials
grep GMAIL .env
# Should show your email and 16-char password

# Test connection
node -e "
const nodemailer = require('nodemailer');
require('dotenv').config();
const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
});
transport.verify(console.log);
"
```

### ❌ "Google Sheets not connected"
1. Click **"🔑 Authenticate Google"**
2. Complete OAuth flow
3. Check `credentials.json` exists in project root

### ❌ "Apollo API error"
1. Verify API key at [Apollo.io Settings](https://app.apollo.io/settings/api)
2. Check free tier limits (10k/month)
3. Test: `curl -H "X-API-KEY: your_key" "https://app.apollo.io/api/v1/mixed_people/search?q=CEO"`

### ❌ "No search results"
- Try different queries: `"CEO Paris"`, `"CTO startup"`, `"Head of Sales"`
- Check API limits haven't been exceeded
- Verify Apollo.io account is active

---

## 🎉 Success Checklist

After following this guide, you should have:

- [x] **System running** at http://localhost:3000
- [x] **Google Sheets connected** (green status)
- [x] **Apollo.io working** (real LinkedIn profiles found)
- [x] **AI email generation** (personalized content)
- [x] **Gmail notifications** (workflow emails received)
- [x] **CRM populated** (prospects in Google Sheet)
- [x] **Full workflow tested** (end-to-end automation)

---

## 🚀 Next Steps

**Now that your system is running:**

1. **🎯 Define Your Ideal Customer Profile**
   - Industry: SaaS, Tech, Healthcare
   - Roles: CTO, VP Marketing, Head of Sales
   - Location: Paris, Remote, France

2. **📝 Create Search Queries**
   - `CTO fintech Paris`
   - `Head of Marketing B2B SaaS`
   - `VP Sales remote France`

3. **⚙️ Customize Email Context**
   - What problem do you solve?
   - What's your value proposition?
   - What industry do you serve?

4. **📊 Set Up Regular Workflows**
   - Daily prospection (20-50 prospects)
   - Weekly CRM cleanup
   - Monthly performance review

5. **🔄 Optimize Performance**
   - Track email open rates
   - Monitor LinkedIn connection acceptance
   - Measure conversion to meetings

---

## 📞 Get Help

**If you're stuck:**

1. **Check logs**: `tail -f logs/app-*.log`
2. **System health**: http://localhost:3000 → System Health
3. **Test individual components**: Use API endpoints directly
4. **Review documentation**: `MASTER_DOCUMENTATION.md`
5. **Create issue**: Include error logs and system info

**Your system should be generating high-quality prospects with personalized outreach in under 10 minutes from now!**

---

🎊 **Congratulations! You now have a fully functional AI-powered prospection system!** 🎊