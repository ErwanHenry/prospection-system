# 🚀 LinkedIn to CRM System

Automated LinkedIn prospection system with Google Sheets CRM integration.

## ✨ Features

- 🔍 **LinkedIn Search**: Search for prospects using advanced queries
- 📊 **Google Sheets CRM**: Automatic data storage and management
- 🌐 **Web Interface**: Modern, user-friendly dashboard
- 🤖 **Automation**: CLI tool for batch processing
- 🔐 **Secure**: OAuth2 for Google, cookie-based auth for LinkedIn
- 📊 **Export**: Download your CRM data as CSV

## 📦 Installation

1. **Clone/Download this project**
   ```bash
   cd ~/prospection-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Edit `.env` file with your settings
   - Add your LinkedIn cookie (see LINKEDIN_COOKIE_GUIDE.md)

4. **Set up Google authentication**
   - Add your `credentials.json` file to the project root
   - Run the server and authenticate via the web interface

## 🚀 Quick Start

### Web Interface

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser:
   ```
   http://localhost:3000
   ```

3. Authenticate with Google if needed

4. Start searching and adding prospects!

### CLI Tool

```bash
# Search and add 20 CTOs in Paris
node linkedin-to-crm.js "CTO startup Paris" 20

# Use default query from .env
node linkedin-to-crm.js
```

## 📝 Configuration

Edit `.env` file:

```env
# Server
PORT=3000

# Google Sheets
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id

# LinkedIn
LINKEDIN_EMAIL=your-email@example.com
LINKEDIN_COOKIE=your-li_at-cookie

# Settings
DAILY_LIMIT=50
DEFAULT_SEARCH_QUERY=CTO startup Paris
```

## 📋 Google Sheets Setup

1. Create a new Google Sheet
2. Copy the spreadsheet ID from the URL
3. Add it to your `.env` file
4. The system will create headers automatically

## 🎯 Usage Examples

### Search Queries
- `CTO startup Paris`
- `Head of Marketing SaaS`
- `Software Engineer remote`
- `VP Sales B2B France`

### Web Interface Features
- Search with custom queries and limits
- Select multiple prospects at once
- Add to CRM with one click
- View and export CRM data
- Real-time status monitoring

## 🛡️ Security Notes

- Never share your LinkedIn cookie
- Keep your Google credentials secure
- Use responsibly and respect rate limits
- Follow LinkedIn's terms of service

## 🔧 Troubleshooting

### Google Sheets not connecting?
1. Check `credentials.json` exists
2. Authenticate via web interface
3. Ensure spreadsheet ID is correct

### LinkedIn search not working?
1. Check your cookie is valid
2. Try logging into LinkedIn again
3. Update the cookie in settings

### Rate limits?
- Add delays between searches
- Use smaller batch sizes
- Respect daily limits

## 📄 File Structure

```
prospection-system/
├── backend/
│   ├── services/
│   │   ├── googleSheets.js
│   │   └── linkedinScraper.js
│   ├── routes/
│   │   └── linkedin.js
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── data/
├── .env
├── package.json
├── linkedin-to-crm.js
└── README.md
```

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📝 License

MIT License - Use responsibly!

---

Made with ❤️ for efficient prospection
