const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Model selection based on task complexity
    this.models = {
      sonnet: 'claude-3-5-sonnet-20241022',
      opus: 'claude-3-opus-20240229',
      haiku: 'claude-3-haiku-20240307'
    };

    this.defaultModel = this.models.sonnet;
  }

  /**
   * Generate email content using Claude Sonnet (default) or Opus (complex cases)
   */
  async generateEmail(profile, context = {}, useOpus = false) {
    try {
      const model = useOpus ? this.models.opus : this.models.sonnet;

      const prompt = this.buildEmailPrompt(profile, context);

      logger.info(`[ClaudeService] Generating email with ${model}`, {
        profileName: profile.name,
        model,
        contextType: context.type || 'default'
      });

      const message = await this.client.messages.create({
        model,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: `You are an expert B2B prospection email writer. Generate personalized, compelling cold outreach emails that:
- Are concise (max 150 words)
- Reference specific details from the prospect's profile
- Focus on value proposition
- Include a clear, low-friction call-to-action
- Avoid being salesy or pushy
- Use French or English based on prospect's location`
      });

      const emailContent = message.content[0].text;

      logger.info(`[ClaudeService] Email generated successfully`, {
        model,
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens
      });

      return {
        subject: this.extractSubject(emailContent),
        body: this.extractBody(emailContent),
        model: model,
        tokensUsed: message.usage
      };

    } catch (error) {
      logger.logError(error, {
        service: 'ClaudeService',
        method: 'generateEmail',
        profile: profile.name
      });
      throw error;
    }
  }

  /**
   * Analyze profile and recommend personalization strategy
   */
  async analyzeProfile(profile) {
    try {
      const prompt = `Analyze this LinkedIn profile and provide a prospection strategy:

Name: ${profile.name}
Title: ${profile.title}
Company: ${profile.company}
Location: ${profile.location}
Bio: ${profile.bio || 'N/A'}
Recent Activity: ${profile.recentActivity || 'N/A'}

Provide:
1. Key pain points to address
2. Recommended value proposition
3. Best approach angle (technical, business, innovation, etc.)
4. Suggested email tone (formal, casual, enthusiastic)
5. Optimal contact timing

Format as JSON.`;

      const message = await this.client.messages.create({
        model: this.models.sonnet,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }]
      });

      const analysis = JSON.parse(message.content[0].text);

      logger.logAgentActivity('ClaudeAnalyzer', 'Profile Analysis', {
        profileName: profile.name,
        strategy: analysis
      });

      return analysis;

    } catch (error) {
      logger.logError(error, {
        service: 'ClaudeService',
        method: 'analyzeProfile'
      });
      throw error;
    }
  }

  /**
   * Generate follow-up email based on previous interaction
   */
  async generateFollowUp(profile, previousEmail, response = null) {
    try {
      const prompt = `Generate a follow-up email for this prospect:

Prospect: ${profile.name} (${profile.title} at ${profile.company})
Previous Email:
${previousEmail.body}

${response ? `Their Response:\n${response}` : 'No response yet (follow-up after 5 days)'}

Generate a natural, non-pushy follow-up that:
- References the previous email without being repetitive
- Adds new value or insight
- Has a different angle or approach
- Maintains professional tone
- Is even shorter than the first email (max 100 words)`;

      const message = await this.client.messages.create({
        model: this.models.sonnet,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }]
      });

      const followUpContent = message.content[0].text;

      return {
        subject: this.extractSubject(followUpContent),
        body: this.extractBody(followUpContent),
        model: this.models.sonnet,
        type: response ? 'reply' : 'no-response-followup'
      };

    } catch (error) {
      logger.logError(error, {
        service: 'ClaudeService',
        method: 'generateFollowUp'
      });
      throw error;
    }
  }

  /**
   * A/B test different email variants
   */
  async generateVariants(profile, context, count = 3) {
    try {
      const variants = [];

      for (let i = 0; i < count; i++) {
        const variant = await this.generateEmail(profile, {
          ...context,
          variantNumber: i + 1,
          instruction: `Generate variant ${i + 1}/${count} with a ${['technical', 'business', 'innovation'][i]} angle`
        });

        variants.push({
          ...variant,
          variant: String.fromCharCode(65 + i), // A, B, C
          angle: ['technical', 'business', 'innovation'][i]
        });
      }

      logger.info(`[ClaudeService] Generated ${count} email variants`, {
        profileName: profile.name
      });

      return variants;

    } catch (error) {
      logger.logError(error, {
        service: 'ClaudeService',
        method: 'generateVariants'
      });
      throw error;
    }
  }

  /**
   * Compare Claude vs GPT-4 response rates (for migration analysis)
   */
  async compareModels(profile, context) {
    try {
      // Generate with Claude Sonnet
      const claudeEmail = await this.generateEmail(profile, context, false);

      // Track for A/B testing
      return {
        claude: {
          model: this.models.sonnet,
          email: claudeEmail,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.logError(error, {
        service: 'ClaudeService',
        method: 'compareModels'
      });
      throw error;
    }
  }

  // Helper methods

  buildEmailPrompt(profile, context) {
    return `Generate a personalized B2B prospection email for:

**Prospect:**
- Name: ${profile.name}
- Title: ${profile.title}
- Company: ${profile.company}
- Location: ${profile.location}
- LinkedIn: ${profile.linkedinUrl}

**Context:**
${context.companyDescription || 'We offer innovative B2B solutions'}

**Objective:**
${context.objective || 'Schedule a discovery call'}

**Additional Info:**
${context.additionalInfo || 'N/A'}

Generate:
1. Subject line (max 60 chars)
2. Email body (max 150 words)

Format:
SUBJECT: [subject here]

BODY:
[email body here]`;
  }

  extractSubject(emailContent) {
    const subjectMatch = emailContent.match(/SUBJECT:\s*(.+)/i);
    return subjectMatch ? subjectMatch[1].trim() : 'Quick question about [Company]';
  }

  extractBody(emailContent) {
    const bodyMatch = emailContent.match(/BODY:\s*([\s\S]+)/i);
    return bodyMatch ? bodyMatch[1].trim() : emailContent;
  }
}

module.exports = new ClaudeService();
