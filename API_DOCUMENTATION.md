# 🚀 LinkedIn to CRM System - API Documentation

## Overview

The LinkedIn to CRM System is a powerful prospection tool that helps you find LinkedIn profiles, manage prospects, and integrate with Google Sheets CRM. This documentation covers all available API endpoints and features.

## 🔧 System Requirements

- Node.js 16+
- Google Cloud Project with Sheets API enabled
- LinkedIn account with valid cookie
- Google Sheets spreadsheet

## 📊 API Endpoints

### Health & System

#### `GET /api/health`
Check system health and connection status.

**Response:**
```json
{
  "status": "running",
  "googleSheets": "connected",
  "linkedin": "ready",
  "spreadsheetId": "your-spreadsheet-id",
  "dailyLimit": "50",
  "timestamp": "2025-08-15T13:28:13.141Z",
  "version": "2.0.0"
}
```

#### `GET /api/system`
Get detailed system information.

**Response:**
```json
{
  "nodeVersion": "v18.17.0",
  "platform": "darwin",
  "arch": "x64",
  "uptime": 1234.567,
  "memory": {
    "rss": 123456789,
    "heapTotal": 12345678,
    "heapUsed": 1234567,
    "external": 123456
  },
  "pid": 12345,
  "timestamp": "2025-08-15T13:28:13.141Z",
  "version": "2.0.0"
}
```

#### `GET /api/analytics`
Get CRM analytics and statistics.

**Response:**
```json
{
  "totalProspects": 150,
  "byStatus": {
    "New": 50,
    "Contacted": 75,
    "Responded": 25
  },
  "bySource": {
    "CTO startup Paris": 30,
    "Head of Sales SaaS": 45,
    "VP Marketing": 75
  },
  "recentActivity": [
    {
      "name": "John Doe",
      "company": "TechCorp",
      "dateAdded": "2025-08-15",
      "status": "New"
    }
  ]
}
```

### LinkedIn Operations

#### `POST /api/linkedin/search`
Search for LinkedIn profiles.

**Request Body:**
```json
{
  "query": "CTO startup Paris",
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "results": [
    {
      "name": "Sophie Durand",
      "title": "CTO",
      "company": "TechStart",
      "location": "Paris, France",
      "linkedinUrl": "https://linkedin.com/in/sophiedurand",
      "searchScore": 95
    }
  ]
}
```

#### `POST /api/linkedin/profile`
Get detailed profile information.

**Request Body:**
```json
{
  "profileUrl": "https://linkedin.com/in/sophiedurand"
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "name": "Sophie Durand",
    "headline": "CTO at TechStart",
    "location": "Paris, France",
    "about": "Passionate about technology and innovation...",
    "currentCompany": "TechStart",
    "email": "",
    "phone": ""
  }
}
```

#### `POST /api/linkedin/add-to-crm`
Add prospects to Google Sheets CRM.

**Request Body:**
```json
{
  "prospects": [
    {
      "name": "Sophie Durand",
      "title": "CTO",
      "company": "TechStart",
      "location": "Paris, France",
      "linkedinUrl": "https://linkedin.com/in/sophiedurand",
      "score": 95,
      "tags": "CTO startup Paris"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "added": 1,
  "message": "Added 1 prospects to CRM"
}
```

### Google Sheets Operations

#### `GET /api/sheets/data`
Retrieve all CRM data from Google Sheets.

**Response:**
```json
{
  "success": true,
  "data": [
    ["ID", "Date Added", "Name", "Title", "Company", "Location", "LinkedIn URL", "Email", "Phone", "Status", "Last Contact", "Message Sent", "Response", "Notes", "Tags", "Score"],
    ["1642123456789", "2025-08-15", "Sophie Durand", "CTO", "TechStart", "Paris, France", "https://linkedin.com/in/sophiedurand", "", "", "New", "", "", "", "", "CTO startup Paris", "95"]
  ]
}
```

#### `POST /api/sheets/append`
Add new rows to the spreadsheet.

**Request Body:**
```json
{
  "values": [
    ["1642123456789", "2025-08-15", "John Doe", "VP Sales", "SalesForce", "London, UK", "https://linkedin.com/in/johndoe", "", "", "New", "", "", "", "", "VP Sales SaaS", "88"]
  ]
}
```

#### `POST /api/sheets/update`
Update a specific cell.

**Request Body:**
```json
{
  "range": "J2",
  "value": "Contacted"
}
```

#### `POST /api/sheets/clear`
Clear all data (except headers).

**Response:**
```json
{
  "success": true
}
```

#### `POST /api/prospects/bulk-update`
Perform bulk updates on multiple cells.

**Request Body:**
```json
{
  "updates": [
    {
      "row": 2,
      "column": "J",
      "value": "Contacted"
    },
    {
      "row": 3,
      "column": "J", 
      "value": "Responded"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "range": "J2",
      "value": "Contacted"
    },
    {
      "success": true,
      "range": "J3",
      "value": "Responded"
    }
  ]
}
```

### Authentication

#### `GET /api/auth/google`
Get Google OAuth authentication URL.

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### `POST /api/auth/google/callback`
Process Google OAuth callback.

**Request Body:**
```json
{
  "code": "oauth-authorization-code"
}
```

**Response:**
```json
{
  "success": true
}
```

## 🔒 Rate Limiting

- **LinkedIn Search**: 50 searches per day (configurable via `DAILY_LIMIT`)
- **Rate Limit**: 3 seconds between searches
- **LinkedIn Cookie**: Must be updated regularly for continued access

## 📝 Data Schema

### CRM Spreadsheet Columns

| Column | Field | Description |
|--------|--------|-------------|
| A | ID | Unique identifier (timestamp) |
| B | Date Added | Date prospect was added |
| C | Name | Full name |
| D | Title | Job title |
| E | Company | Company name |
| F | Location | Geographic location |
| G | LinkedIn URL | LinkedIn profile URL |
| H | Email | Email address (if available) |
| I | Phone | Phone number (if available) |
| J | Status | Current status (New, Contacted, Responded) |
| K | Last Contact | Date of last contact |
| L | Message Sent | Message content sent |
| M | Response | Response received |
| N | Notes | Additional notes |
| O | Tags | Search tags/categories |
| P | Score | Prospect score (0-100) |

## 🌟 Features

### ✅ Completed Features

- **LinkedIn Search**: Advanced profile search with multiple selectors
- **Google Sheets Integration**: Full CRUD operations
- **Modern UI**: Responsive, accessible interface
- **Rate Limiting**: Protect against LinkedIn blocks
- **Error Handling**: Comprehensive error management
- **Analytics**: Prospect statistics and insights
- **Bulk Operations**: Update multiple prospects at once
- **CSV Export**: Download prospect data
- **System Health**: Monitor all system components
- **Authentication**: Secure Google OAuth flow

### 🚀 Advanced Features

- **Smart Selectors**: Multiple fallback selectors for LinkedIn scraping
- **Rate Limiting**: Intelligent delay between searches
- **Daily Limits**: Configurable search quotas
- **Real-time Status**: Live system health monitoring
- **Responsive Design**: Works on all devices
- **Keyboard Shortcuts**: Quick access (Ctrl+K for search)
- **Error Recovery**: Automatic reconnection and retry logic

## 🛠️ Environment Variables

### Required
```env
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_PROJECT_ID=your-google-project-id
```

### Optional
```env
LINKEDIN_COOKIE=your-linkedin-cookie
DAILY_LIMIT=50
DEFAULT_SEARCH_QUERY=CTO startup Paris
PORT=3000
```

## 🔧 Setup Instructions

1. **Clone and Install**
   ```bash
   cd prospection-system
   npm install
   ```

2. **Configure Environment**
   - Create `.env` file with required variables
   - Set up Google Cloud project and credentials
   - Add LinkedIn cookie for scraping

3. **Start System**
   ```bash
   npm start
   ```

4. **Access Interface**
   - Open http://localhost:3000
   - Complete Google authentication if needed
   - Start searching and adding prospects!

## 📊 Usage Examples

### Basic Workflow

1. **Check System Health**: Ensure all services are connected
2. **Search LinkedIn**: Use specific queries like "CTO startup Paris"
3. **Select Prospects**: Choose relevant profiles from results
4. **Add to CRM**: Save selected prospects to Google Sheets
5. **Manage Prospects**: Update status, add notes, export data

### Advanced Usage

- **Bulk Updates**: Update multiple prospect statuses at once
- **Analytics**: Monitor your prospection performance
- **Export Data**: Download CSV for external analysis
- **Rate Limiting**: Automatic protection against LinkedIn limits

## 🐛 Troubleshooting

### Common Issues

1. **LinkedIn Cookie Expired**
   - Update `LINKEDIN_COOKIE` in environment
   - Restart server

2. **Google Sheets Access Denied**
   - Re-authenticate via web interface
   - Check spreadsheet permissions

3. **Rate Limited**
   - Wait for daily limit reset (24 hours)
   - Reduce search frequency

### Error Codes

- `400`: Bad Request (missing parameters)
- `401`: Unauthorized (authentication required)
- `429`: Rate Limited (too many requests)
- `500`: Server Error (system issue)

## 📈 Performance

### System Limits

- **Concurrent Searches**: 1 (sequential processing)
- **Daily Search Limit**: 50 (configurable)
- **Spreadsheet Size**: 10,000 rows recommended
- **Rate Limit**: 3 seconds between searches

### Optimization Tips

- Use specific search queries for better results
- Regularly clean up old prospects
- Monitor daily search usage
- Keep LinkedIn cookie updated

## 🔐 Security

### Best Practices

- Keep LinkedIn cookies secure and private
- Use Google OAuth for authentication
- Regularly rotate access tokens
- Monitor system logs for suspicious activity

### Data Protection

- All data stored in your Google Sheets
- No sensitive data stored on server
- Secure OAuth flow for authentication
- Environment variables for configuration

---

**Version**: 2.0.0  
**Last Updated**: August 15, 2025  
**Support**: Check GitHub issues for help