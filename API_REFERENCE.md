# 🔌 API Reference - LinkedIn Prospection System

## Base Information

**Base URL**: `http://localhost:3000/api`  
**Content-Type**: `application/json`  
**Authentication**: None (local development)  

## 📊 Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "data": object|array,
  "error": string,
  "timestamp": "ISO-8601-timestamp"
}
```

## 🔍 LinkedIn Search API

### Search Profiles

**Endpoint**: `POST /linkedin/search`

Search for LinkedIn profiles using various methods.

**Request**:
```json
{
  "query": "CTO startup Paris",
  "limit": 10,
  "method": "apollo"
}
```

**Parameters**:
- `query` (string, required): Search query in natural language
- `limit` (integer, optional): Number of results to return (default: 10, max: 100)
- `method` (string, optional): Search method ("apollo", "selenium_dom", "hybrid_smart")

**Response**:
```json
{
  "success": true,
  "query": "CTO startup Paris",
  "limit": 10,
  "count": 4,
  "results": [
    {
      "name": "Guillaume Chanal",
      "title": "Directeur des Ressources Humaines",
      "company": "Greater Paris University Hospitals - AP-HP",
      "location": "Paris, France",
      "linkedinUrl": "https://linkedin.com/in/guillaume-chanal-724621113",
      "email": "email_not_unlocked@domain.com",
      "score": 85,
      "tags": ""
    }
  ],
  "timestamp": "2025-08-21T09:45:00Z"
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": "Query is required",
  "timestamp": "2025-08-21T09:45:00Z"
}
```

### Get Profile Details

**Endpoint**: `POST /linkedin/profile`

Extract detailed information from a LinkedIn profile.

**Request**:
```json
{
  "profileUrl": "https://linkedin.com/in/username"
}
```

**Response**:
```json
{
  "success": true,
  "profile": {
    "name": "John Doe",
    "title": "CTO",
    "company": "TechCorp",
    "location": "Paris, France",
    "summary": "Experienced technology leader...",
    "experience": [...],
    "education": [...],
    "skills": [...],
    "connections": "500+"
  }
}
```

## 🤖 Automation API

### Generate AI Email

**Endpoint**: `POST /automation/generate-email`

Generate personalized email using AI based on prospect information.

**Request**:
```json
{
  "prospect": {
    "name": "John Doe",
    "company": "TechCorp",
    "title": "CTO",
    "linkedinUrl": "https://linkedin.com/in/johndoe"
  }
}
```

**Response**:
```json
{
  "success": true,
  "email": {
    "subject": "John Doe, transform recruitment solutions at TechCorp",
    "content": "Hi John Doe,\n\nI noticed your role as CTO at TechCorp. Given your expertise in recruitment solutions, I thought you might be interested in how we are helping similar professionals with streamlining your hiring process.\n\nOur AI-powered recruitment platform has helped companies like yours:\n• Reduce time-to-hire by 40%\n• Improve candidate quality by 60%\n• Streamline HR workflows and reporting\n\nWould you be open to a brief 15-minute conversation next week to explore how this could benefit TechCorp?\n\nBest regards,\n[Your Name]\n\nP.S. I would be happy to share a case study of how we helped a similar CTO at a comparable company achieve remarkable results.",
    "personalization": {
      "name": "John Doe",
      "title": "CTO",
      "company": "TechCorp",
      "context": "recruitment solutions"
    }
  },
  "prospect": "John Doe",
  "profileAnalyzed": false,
  "generatedAt": "2025-08-21T09:45:00Z"
}
```

### Send LinkedIn Connection

**Endpoint**: `POST /automation/linkedin-connection`

Send a LinkedIn connection request with personalized message.

**Request**:
```json
{
  "profileUrl": "https://linkedin.com/in/johndoe",
  "message": "Hi John, I'd love to connect with you given your role as CTO at TechCorp."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Connection request sent successfully",
  "profileUrl": "https://linkedin.com/in/johndoe",
  "sentAt": "2025-08-21T09:45:00Z"
}
```

### Send LinkedIn Message

**Endpoint**: `POST /automation/linkedin-message`

Send a direct message to a LinkedIn connection.

**Request**:
```json
{
  "profileUrl": "https://linkedin.com/in/johndoe",
  "message": "Hi John, I wanted to follow up on my connection request..."
}
```

### Schedule Follow-up

**Endpoint**: `POST /automation/schedule-followup`

Schedule an automated follow-up message.

**Request**:
```json
{
  "prospectId": "1692617234567",
  "prospectName": "John Doe",
  "prospectEmail": "john@techcorp.com",
  "scheduledDate": "2025-08-28T09:00:00Z",
  "message": "Following up on our previous conversation about digital transformation."
}
```

**Response**:
```json
{
  "success": true,
  "followupId": "followup_1692617234567",
  "scheduledDate": "2025-08-28T09:00:00Z",
  "prospectName": "John Doe"
}
```

### Get Scheduled Follow-ups

**Endpoint**: `GET /automation/followups`

Retrieve all scheduled follow-ups.

**Response**:
```json
{
  "success": true,
  "followUps": [
    {
      "id": "followup_1692617234567",
      "prospectName": "John Doe",
      "scheduledDate": "2025-08-28T09:00:00Z",
      "message": "Following up on our previous conversation...",
      "status": "pending"
    }
  ]
}
```

## 🎯 Workflow API

### Run Full Sequence

**Endpoint**: `POST /workflow/run-full-sequence`

Execute complete prospection workflow with multiple prospects.

**Request**:
```json
{
  "prospects": [
    {
      "name": "John Doe",
      "company": "TechCorp",
      "title": "CTO",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "location": "Paris, France",
      "email": "john@techcorp.com"
    }
  ],
  "config": {
    "actions": {
      "generateEmails": true,
      "sendLinkedInConnections": true,
      "scheduleFollowups": true
    },
    "emailContext": "We help companies with digital transformation using AI-powered solutions",
    "linkedinTemplate": "Hi {name}, I'd love to connect with you given your role as {title} at {company}.",
    "followupTemplate": "Following up on my previous message about digital transformation solutions."
  }
}
```

**Response**:
```json
{
  "success": true,
  "results": {
    "workflowId": "workflow_1692617234567",
    "prospectsProcessed": 1,
    "emailsGenerated": 1,
    "linkedinConnections": 1,
    "followupsScheduled": 1,
    "errors": [],
    "warnings": [],
    "duration": 15000,
    "logs": "[2025-08-21T09:45:00Z] 🚀 Workflow démarré avec 1 prospects\n[2025-08-21T09:45:05Z] ✅ Email généré pour John Doe\n[2025-08-21T09:45:10Z] 🎯 Workflow terminé"
  }
}
```

## 📊 CRM API

### Get All Prospects

**Endpoint**: `GET /prospects`

Retrieve all prospects from the CRM.

**Response**:
```json
{
  "success": true,
  "prospects": [
    {
      "id": "1692617234567",
      "name": "John Doe",
      "company": "TechCorp",
      "title": "CTO",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "location": "Paris, France",
      "dateAdded": "2025-08-21",
      "status": "Nouveau",
      "messageSent": "",
      "followupCount": "0",
      "notes": "Score: 85 | Tags: tech | Email: john@techcorp.com"
    }
  ]
}
```

### Add Prospects to CRM

**Endpoint**: `POST /linkedin/add-to-crm`

Add multiple prospects to the Google Sheets CRM.

**Request**:
```json
{
  "prospects": [
    {
      "name": "John Doe",
      "company": "TechCorp",
      "title": "CTO",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "location": "Paris, France",
      "email": "john@techcorp.com",
      "score": 85,
      "tags": "tech"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "added": 1,
  "message": "Added 1 prospects to CRM"
}
```

### Remove Duplicates

**Endpoint**: `POST /prospects/remove-duplicates`

Remove duplicate entries from the CRM based on LinkedIn URL or Name+Company combination.

**Response**:
```json
{
  "success": true,
  "removed": 5,
  "totalProspects": 150,
  "message": "Removed 5 duplicate(s) from CRM"
}
```

### Bulk Update Prospects

**Endpoint**: `POST /prospects/bulk-update`

Update multiple prospects simultaneously.

**Request**:
```json
{
  "updates": [
    {
      "row": 2,
      "column": "H",
      "value": "Contacted"
    },
    {
      "row": 3,
      "column": "H",
      "value": "Interested"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "range": "H2",
      "value": "Contacted"
    },
    {
      "success": true,
      "range": "H3",
      "value": "Interested"
    }
  ]
}
```

## 📈 Analytics API

### Get System Analytics

**Endpoint**: `GET /analytics`

Retrieve comprehensive system analytics and metrics.

**Response**:
```json
{
  "totalProspects": 157,
  "byStatus": {
    "Nouveau": 120,
    "Contacté": 25,
    "Intéressé": 8,
    "Qualifié": 3,
    "Converti": 1
  },
  "bySource": {
    "apollo": 140,
    "manual": 17
  },
  "recentActivity": [
    {
      "name": "John Doe",
      "company": "TechCorp",
      "dateAdded": "2025-08-21",
      "status": "Nouveau"
    }
  ]
}
```

## 🔧 System API

### Health Check

**Endpoint**: `GET /health`

Get comprehensive system health status.

**Response**:
```json
{
  "status": "running",
  "googleSheets": "connected",
  "linkedin": "ready",
  "spreadsheetId": "15fmtSOPTOWrddhMhfLyz4ZiiFih61Op-i9wAzZx_k4c",
  "dailyLimit": "50",
  "timestamp": "2025-08-21T09:45:00Z",
  "version": "2.0.0"
}
```

### Get System Information

**Endpoint**: `GET /system`

Retrieve detailed system information and configuration.

**Response**:
```json
{
  "platform": "darwin",
  "arch": "arm64",
  "nodeVersion": "v18.17.0",
  "memory": {
    "used": "150.2 MB",
    "total": "16.0 GB"
  },
  "uptime": 3600,
  "timestamp": "2025-08-21T09:45:00Z",
  "version": "2.0.0"
}
```

### Get Logs

**Endpoint**: `GET /logs`

Retrieve recent application logs.

**Query Parameters**:
- `limit` (integer, optional): Number of log entries to return (default: 50)
- `level` (string, optional): Filter by log level ("info", "warn", "error")

**Response**:
```json
{
  "success": true,
  "logs": [
    {
      "level": "info",
      "message": "LinkedIn search completed",
      "timestamp": "2025-08-21T09:45:00Z",
      "component": "LinkedIn",
      "duration": 2069
    }
  ],
  "total": 50,
  "timestamp": "2025-08-21T09:45:00Z"
}
```

### Clear Logs

**Endpoint**: `POST /logs/clear`

Clear all application logs.

**Response**:
```json
{
  "success": true,
  "message": "Logs cleared"
}
```

## 📧 Google Sheets API

### Get Sheet Data

**Endpoint**: `GET /sheets/data`

Get raw data from Google Sheets.

**Response**:
```json
{
  "success": true,
  "data": [
    ["ID", "Nom", "Entreprise", "Poste", "LinkedIn URL", "Localisation", "Date d'ajout", "Statut", "Message envoyé", "Nb relances", "Notes"],
    ["1692617234567", "John Doe", "TechCorp", "CTO", "https://linkedin.com/in/johndoe", "Paris, France", "2025-08-21", "Nouveau", "", "0", "Score: 85 | Tags: tech"]
  ]
}
```

### Append to Sheet

**Endpoint**: `POST /sheets/append`

Add new rows to Google Sheets.

**Request**:
```json
{
  "values": [
    ["1692617234567", "John Doe", "TechCorp", "CTO", "https://linkedin.com/in/johndoe", "Paris, France", "2025-08-21", "Nouveau", "", "0", "Score: 85"]
  ]
}
```

### Update Sheet Cell

**Endpoint**: `POST /sheets/update`

Update a specific cell in Google Sheets.

**Request**:
```json
{
  "range": "H2",
  "value": "Contacted"
}
```

### Clear Sheet

**Endpoint**: `POST /sheets/clear`

Clear all data from Google Sheets (except headers).

**Response**:
```json
{
  "success": true
}
```

## 🔐 Authentication API

### Get Google Auth URL

**Endpoint**: `GET /auth/google`

Get Google OAuth authorization URL.

**Response**:
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### Google OAuth Callback

**Endpoint**: `GET /auth/google/callback`

Handle Google OAuth callback (redirects to main page).

**Query Parameters**:
- `code` (string): Authorization code from Google

**Endpoint**: `POST /auth/google/callback`

Handle Google OAuth callback via JSON.

**Request**:
```json
{
  "code": "authorization_code_from_google"
}
```

**Response**:
```json
{
  "success": true
}
```

## ⚠️ Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

### Error Response Format

```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  },
  "timestamp": "2025-08-21T09:45:00Z"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Authentication required or failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVICE_UNAVAILABLE`: External service unavailable
- `INTERNAL_ERROR`: Internal server error

## 🔒 Rate Limiting

### Default Limits

- **General API**: 100 requests per 15 minutes per IP
- **Search API**: 10 searches per minute
- **Automation API**: 5 workflows per minute
- **LinkedIn API**: 50 actions per day

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1692617534
```

## 📱 SDK Examples

### JavaScript/Node.js

```javascript
class ProspectionAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  async search(query, limit = 10) {
    const response = await fetch(`${this.baseURL}/linkedin/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit })
    });
    return response.json();
  }

  async generateEmail(prospect) {
    const response = await fetch(`${this.baseURL}/automation/generate-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospect })
    });
    return response.json();
  }

  async runWorkflow(prospects, config) {
    const response = await fetch(`${this.baseURL}/workflow/run-full-sequence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospects, config })
    });
    return response.json();
  }
}

// Usage
const api = new ProspectionAPI();

// Search for prospects
const results = await api.search('CTO startup Paris', 5);

// Generate email
const email = await api.generateEmail(results.results[0]);

// Run full workflow
const workflow = await api.runWorkflow([results.results[0]], {
  actions: { generateEmails: true, sendLinkedInConnections: true }
});
```

### Python

```python
import requests

class ProspectionAPI:
    def __init__(self, base_url="http://localhost:3000/api"):
        self.base_url = base_url
    
    def search(self, query, limit=10):
        response = requests.post(f"{self.base_url}/linkedin/search", 
                               json={"query": query, "limit": limit})
        return response.json()
    
    def generate_email(self, prospect):
        response = requests.post(f"{self.base_url}/automation/generate-email",
                               json={"prospect": prospect})
        return response.json()
    
    def run_workflow(self, prospects, config):
        response = requests.post(f"{self.base_url}/workflow/run-full-sequence",
                               json={"prospects": prospects, "config": config})
        return response.json()

# Usage
api = ProspectionAPI()

# Search for prospects
results = api.search("CTO startup Paris", 5)

# Generate email
email = api.generate_email(results["results"][0])

# Run workflow
workflow = api.run_workflow([results["results"][0]], {
    "actions": {"generateEmails": True, "sendLinkedInConnections": True}
})
```

This API reference provides comprehensive documentation for all available endpoints in the LinkedIn Prospection System.