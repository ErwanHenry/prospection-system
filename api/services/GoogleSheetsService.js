/**
 * Google Sheets Service - V3.0
 *
 * Purpose: Integration with Google Sheets CRM
 * - Read raw prospects from Google Sheets
 * - Update qualification status
 * - Track workflow progress
 *
 * Sheet Structure:
 * Column A: ID
 * Column B: First Name
 * Column C: Last Name
 * Column D: Title
 * Column E: Company
 * Column F: Company Size
 * Column G: Industry
 * Column H: Email
 * Column I: LinkedIn URL
 * Column J: Bio
 * Column K: Department
 * Column L: LinkedIn Activity
 * Column M: Pain Signals
 * Column N: Tech Stack
 * Column O: Growth Signals
 * Column P: Qualification Score (auto-filled)
 * Column Q: Qualification Status (auto-filled)
 * Column R: Workflow (auto-filled)
 * Column S: Last Updated (auto-filled)
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleSheetsService {
  constructor(config = {}) {
    this.spreadsheetId = config.spreadsheetId || process.env.GOOGLE_SPREADSHEET_ID;
    this.sheetName = config.sheetName || 'Prospects';
    this.credentialsPath = config.credentialsPath || path.join(__dirname, '../../credentials.json');

    this.auth = null;
    this.sheets = null;
  }

  /**
   * Authenticate with Google Sheets API
   */
  async authenticate() {
    try {
      // Check if credentials file exists
      if (!fs.existsSync(this.credentialsPath)) {
        throw new Error(`Credentials file not found at ${this.credentialsPath}`);
      }

      const credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });

      console.log('✅ Google Sheets authenticated successfully');
      return true;

    } catch (error) {
      console.error('❌ Google Sheets authentication failed:', error.message);
      throw error;
    }
  }

  /**
   * Read all prospects from Google Sheets
   */
  async getProspects(options = {}) {
    try {
      if (!this.sheets) {
        await this.authenticate();
      }

      const { startRow = 2, endRow = 1000 } = options;
      const range = `${this.sheetName}!A${startRow}:O${endRow}`;

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range
      });

      const rows = response.data.values || [];

      // Transform rows to prospect objects
      const prospects = rows
        .filter(row => row.length > 0 && row[0]) // Filter empty rows
        .map((row, index) => ({
          id: row[0] || `prospect-${startRow + index}`,
          firstName: row[1] || '',
          lastName: row[2] || '',
          title: row[3] || '',
          company: row[4] || '',
          companySize: row[5] || '',
          industry: row[6] || '',
          email: row[7] || '',
          linkedinUrl: row[8] || '',
          bio: row[9] || '',
          department: row[10] || '',
          linkedinActivity: row[11] || '',
          painSignals: row[12] || '',
          techStack: row[13] || '',
          growthSignals: row[14] || '',
          rowIndex: startRow + index // For updating later
        }));

      console.log(`✅ Retrieved ${prospects.length} prospects from Google Sheets`);
      return prospects;

    } catch (error) {
      console.error('❌ Error reading prospects from Google Sheets:', error.message);
      throw error;
    }
  }

  /**
   * Update qualification results for prospects
   */
  async updateQualificationResults(results) {
    try {
      if (!this.sheets) {
        await this.authenticate();
      }

      const updates = results.map(result => {
        const rowIndex = result.metadata?.rowIndex || null;
        if (!rowIndex) return null;

        return {
          range: `${this.sheetName}!P${rowIndex}:S${rowIndex}`,
          values: [[
            result.score, // Column P: Score
            result.status, // Column Q: Status
            result.workflow || 'N/A', // Column R: Workflow
            new Date().toISOString() // Column S: Last Updated
          ]]
        };
      }).filter(update => update !== null);

      if (updates.length === 0) {
        console.log('⚠️ No updates to write to Google Sheets');
        return;
      }

      const batchUpdateRequest = {
        spreadsheetId: this.spreadsheetId,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      };

      await this.sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);

      console.log(`✅ Updated ${updates.length} rows in Google Sheets with qualification results`);

    } catch (error) {
      console.error('❌ Error updating Google Sheets:', error.message);
      throw error;
    }
  }

  /**
   * Get qualified prospects (score >= 70)
   */
  async getQualifiedProspects() {
    try {
      if (!this.sheets) {
        await this.authenticate();
      }

      const range = `${this.sheetName}!A2:S1000`;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range
      });

      const rows = response.data.values || [];

      const qualifiedProspects = rows
        .filter(row => {
          const score = parseInt(row[15]); // Column P: Score
          const status = row[16]; // Column Q: Status
          return score >= 70 || status === 'QUALIFIED' || status === 'HOT';
        })
        .map(row => ({
          id: row[0],
          firstName: row[1],
          lastName: row[2],
          title: row[3],
          company: row[4],
          email: row[7],
          score: parseInt(row[15]) || 0,
          status: row[16] || 'UNKNOWN',
          workflow: row[17] || 'N/A'
        }));

      console.log(`✅ Found ${qualifiedProspects.length} qualified prospects (score >= 70)`);
      return qualifiedProspects;

    } catch (error) {
      console.error('❌ Error retrieving qualified prospects:', error.message);
      throw error;
    }
  }

  /**
   * Add new prospect to Google Sheets
   */
  async addProspect(prospect) {
    try {
      if (!this.sheets) {
        await this.authenticate();
      }

      const values = [[
        prospect.id || `prospect-${Date.now()}`,
        prospect.firstName || '',
        prospect.lastName || '',
        prospect.title || '',
        prospect.company || '',
        prospect.companySize || '',
        prospect.industry || '',
        prospect.email || '',
        prospect.linkedinUrl || '',
        prospect.bio || '',
        prospect.department || '',
        prospect.linkedinActivity || '',
        prospect.painSignals || '',
        prospect.techStack || '',
        prospect.growthSignals || '',
        '', // Score (will be filled by qualification)
        '', // Status
        '', // Workflow
        '' // Last Updated
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:S`,
        valueInputOption: 'RAW',
        resource: { values }
      });

      console.log(`✅ Added new prospect: ${prospect.firstName} ${prospect.lastName}`);

    } catch (error) {
      console.error('❌ Error adding prospect to Google Sheets:', error.message);
      throw error;
    }
  }

  /**
   * Get statistics from Google Sheets
   */
  async getStats() {
    try {
      if (!this.sheets) {
        await this.authenticate();
      }

      const range = `${this.sheetName}!P2:Q1000`;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range
      });

      const rows = response.data.values || [];
      const total = rows.filter(row => row[0] && row[1]).length; // Has score and status

      const rejected = rows.filter(row => row[1] === 'REJECTED').length;
      const qualified = rows.filter(row => row[1] === 'QUALIFIED').length;
      const hot = rows.filter(row => row[1] === 'HOT').length;

      const scores = rows
        .filter(row => row[0])
        .map(row => parseInt(row[0]))
        .filter(score => !isNaN(score));

      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;

      return {
        total,
        rejected,
        rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
        qualified,
        hot,
        avgScore,
        qualifiedRate: total > 0 ? Math.round(((qualified + hot) / total) * 100) : 0
      };

    } catch (error) {
      console.error('❌ Error getting stats from Google Sheets:', error.message);
      throw error;
    }
  }

  /**
   * Initialize Google Sheets with headers (if needed)
   */
  async initializeSheet() {
    try {
      if (!this.sheets) {
        await this.authenticate();
      }

      const headers = [[
        'ID',
        'First Name',
        'Last Name',
        'Title',
        'Company',
        'Company Size',
        'Industry',
        'Email',
        'LinkedIn URL',
        'Bio',
        'Department',
        'LinkedIn Activity',
        'Pain Signals',
        'Tech Stack',
        'Growth Signals',
        'Score',
        'Status',
        'Workflow',
        'Last Updated'
      ]];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1:S1`,
        valueInputOption: 'RAW',
        resource: { values: headers }
      });

      console.log('✅ Google Sheets initialized with headers');

    } catch (error) {
      console.error('❌ Error initializing Google Sheets:', error.message);
      throw error;
    }
  }
}

module.exports = GoogleSheetsService;
