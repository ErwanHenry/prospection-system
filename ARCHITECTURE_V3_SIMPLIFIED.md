# 🏗️ Architecture V3.0 - Simplified Agent System
## 4 Essential Agents for 10 Demos in 30 Days

---

## 🎯 Design Philosophy

### From Complexity to Clarity
```
❌ OLD SYSTEM (Never Worked):
- 20+ agents, unclear responsibilities
- Over-engineered workflows
- No intelligent filtering
- Focus on automation > quality

✅ NEW SYSTEM (V3.0):
- 4 essential agents, clear roles
- Simple, robust workflows
- AI-powered filtering (70% rejection)
- Focus on quality > quantity
```

### Core Principle
**Each agent does ONE thing exceptionally well**

---

## 🏛️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROSPECTION SYSTEM V3.0                         │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                        INPUT LAYER                             │    │
│  │                                                                │    │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │    │
│  │  │ Google Sheets│    │  LinkedIn    │    │    Email     │     │    │
│  │  │   (CRM)      │    │   Profiles   │    │   Provider   │     │    │
│  │  └──────────────┘    └──────────────┘    └──────────────┘     │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                   │                                     │
│                                   ▼                                     │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    AGENT LAYER (4 Agents)                      │    │
│  │                                                                │    │
│  │  ┌───────────────────────────────────────────────────────┐     │    │
│  │  │  1. PROSPECTQUALIFIERAGENT (The Filter)              │     │    │
│  │  │                                                       │     │    │
│  │  │  Input:  Raw prospect data                           │     │    │
│  │  │  Process: AI scoring (0-100) + enrichment            │     │    │
│  │  │  Output: Reject 70% | Qualified 24% | Hot 6%         │     │    │
│  │  │                                                       │     │    │
│  │  │  ✅ Eliminates bad prospects BEFORE wasting effort   │     │    │
│  │  └───────────────────────────────────────────────────────┘     │    │
│  │                              │                                 │    │
│  │                              ▼                                 │    │
│  │  ┌───────────────────────────────────────────────────────┐     │    │
│  │  │  2. MESSAGEGENERATORAGENT (The Creative)             │     │    │
│  │  │                                                       │     │    │
│  │  │  Input:  Qualified prospect + context                │     │    │
│  │  │  Process: AI-powered "insolite" message creation     │     │    │
│  │  │  Output: 3 message variants (A/B/C testing)          │     │    │
│  │  │                                                       │     │    │
│  │  │  ✅ Generates surprising messages that spark replies │     │    │
│  │  └───────────────────────────────────────────────────────┘     │    │
│  │                              │                                 │    │
│  │                              ▼                                 │    │
│  │  ┌───────────────────────────────────────────────────────┐     │    │
│  │  │  3. WORKFLOWORCHESTRATORAGENT (The Conductor)        │     │    │
│  │  │                                                       │     │    │
│  │  │  Input:  Qualified prospect + messages               │     │    │
│  │  │  Process: Multi-touch sequence orchestration         │     │    │
│  │  │  Output: Scheduled actions (LinkedIn/Email)          │     │    │
│  │  │                                                       │     │    │
│  │  │  ✅ Executes 5-touch sequences with perfect timing   │     │    │
│  │  └───────────────────────────────────────────────────────┘     │    │
│  │                              │                                 │    │
│  │                              ▼                                 │    │
│  │  ┌───────────────────────────────────────────────────────┐     │    │
│  │  │  4. ENGAGEMENTTRACKERAGENT (The Monitor)             │     │    │
│  │  │                                                       │     │    │
│  │  │  Input:  Prospect interactions (opens/clicks/replies)│     │    │
│  │  │  Process: Engagement scoring + temperature calc      │     │    │
│  │  │  Output: Hot/Warm/Cold + workflow adjustments        │     │    │
│  │  │                                                       │     │    │
│  │  │  ✅ Detects engagement and triggers smart actions    │     │    │
│  │  └───────────────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                   │                                     │
│                                   ▼                                     │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                      OUTPUT LAYER                              │    │
│  │                                                                │    │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │    │
│  │  │  Demos       │    │  Analytics   │    │   Alerts     │     │    │
│  │  │  Booked      │    │  Dashboard   │    │  (Hot Leads) │     │    │
│  │  └──────────────┘    └──────────────┘    └──────────────┘     │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent Detailed Specifications

### 1. ProspectQualifierAgent (The Filter)

#### Purpose
**Eliminate 70% of bad prospects BEFORE wasting outreach effort**

#### Inputs
```javascript
{
  prospect: {
    name: "John Doe",
    company: "TechStart SAS",
    title: "Head of Sales",
    linkedin_url: "https://linkedin.com/in/johndoe",
    email: "john@techstart.com",
    location: "Paris, France",
    company_size: 150,
    industry: "SaaS"
  }
}
```

#### Processing Logic
```javascript
// Step 1: Auto-Reject Rules
if (prospect.company_size < 10 || prospect.company_size > 5000) {
  return { action: 'reject', reason: 'Company size out of range' };
}

if (excludedIndustries.includes(prospect.industry)) {
  return { action: 'reject', reason: 'Industry not target' };
}

// Step 2: AI Scoring (100 points)
const score = {
  companyFit: scoreCompanyFit(prospect),      // 40 points
  roleFit: scoreRoleFit(prospect),            // 30 points
  timingSignals: scoreTimingSignals(prospect) // 30 points
};

const totalScore = score.companyFit + score.roleFit + score.timingSignals;

// Step 3: Enrichment (if qualified)
if (totalScore >= 70) {
  prospect.enrichment = {
    recentNews: fetchCompanyNews(prospect.company),
    painSignals: detectPainSignals(prospect),
    techStack: identifyTechStack(prospect)
  };
}

// Step 4: Classification
if (totalScore < 70) {
  return { action: 'reject', score: totalScore };
} else if (totalScore >= 85) {
  return { action: 'qualify_hot', score: totalScore, workflow: 'priority' };
} else {
  return { action: 'qualify_standard', score: totalScore, workflow: 'standard' };
}
```

#### Outputs
```javascript
{
  prospect_id: "123",
  action: "qualify_hot",         // or "qualify_standard" or "reject"
  score: 91,
  workflow_type: "priority",     // or "standard" or null
  enrichment: {
    recent_news: "Just raised Series A",
    pain_signals: ["Hiring 5 SDRs", "Posted about sales automation"],
    tech_stack: ["HubSpot (basic)", "No AI tools detected"]
  },
  rejection_reason: null          // or "Company size too small"
}
```

#### Key Metrics
- **Prospects scored**: 200
- **Rejection rate**: 70% (140 rejected)
- **Qualified rate**: 30% (60 qualified)
- **Hot prospect rate**: 10% of qualified (6 hot)
- **Processing time**: < 5 seconds per prospect

---

### 2. MessageGeneratorAgent (The Creative)

#### Purpose
**Generate "insolite" (unusual/surprising) messages that spark conversations**

#### Inputs
```javascript
{
  prospect: {
    id: "123",
    name: "John Doe",
    company: "TechStart SAS",
    title: "Head of Sales",
    score: 91,
    enrichment: {
      pain_signals: ["Hiring 5 SDRs"],
      recent_news: "Just raised Series A"
    }
  },
  touch: {
    number: 1,
    channel: "linkedin",
    type: "connection_request"
  }
}
```

#### Processing Logic
```javascript
// Step 1: Select Template
const template = selectTemplate(touch.type, prospect.score);
// Options: data_surprise, meta_confession, reverse_pitch, proof_point, industry_insight

// Step 2: Personalization Variables
const variables = {
  firstName: prospect.name.split(' ')[0],
  company: prospect.company,
  role: prospect.title,
  painPoint: prospect.enrichment.pain_signals[0],
  recentActivity: prospect.enrichment.recent_news,
  score: prospect.score
};

// Step 3: AI Message Generation
const prompt = `
Generate a ${template.type} message for LinkedIn connection request.
Target: ${variables.firstName} at ${variables.company}
Context: ${variables.recentActivity}
Pain point: ${variables.painPoint}
Tone: Intelligent, surprising, helpful (not salesy)
Length: 3 sentences max
Include: Provocative hook + micro-value + soft CTA
`;

const messageA = await openai.generateMessage(prompt);
const messageB = await openai.generateMessage(prompt); // Variant
const messageC = await openai.generateMessage(prompt); // Variant

// Step 4: Quality Check
const qualityScores = [
  checkQuality(messageA),
  checkQuality(messageB),
  checkQuality(messageC)
];

// Step 5: Return Best 3
return [messageA, messageB, messageC]
  .map((msg, i) => ({ message: msg, score: qualityScores[i] }))
  .sort((a, b) => b.score - a.score);
```

#### Outputs
```javascript
{
  prospect_id: "123",
  touch_number: 1,
  channel: "linkedin",
  variants: [
    {
      variant: "A",
      message: "Bonjour John, mon IA vient de scanner 2,847 profils pour trouver le vôtre. Score: 91%. Raison: vous recrutez 5 SDRs. Je vends des bots qui font exactement ça pour MES clients. Curieux ?",
      quality_score: 92,
      template_used: "meta_confession"
    },
    {
      variant: "B",
      message: "John, TechStart recrute 5 SDRs post-Series A. Quick math: 5 SDRs × 45K€ = 225K€/an. 1 IA Graixl = 24K€/an + 100× plus rapide. 15 min pour voir les chiffres ?",
      quality_score: 88,
      template_used: "data_surprise"
    },
    {
      variant: "C",
      message: "Félicitations pour la Series A John ! Question: pourquoi recruter 5 humains pour qualifier des leads quand 1 IA fait le job en 3 secondes ? Je vous montre comment ?",
      quality_score: 85,
      template_used: "proof_point"
    }
  ]
}
```

#### Key Metrics
- **Messages generated**: 3 variants per touch
- **Generation time**: < 30 seconds
- **Quality pass rate**: 80%+ (score > 75)
- **Personalization**: 6+ variables per message
- **Templates**: 5 "insolite" types

---

### 3. WorkflowOrchestratorAgent (The Conductor)

#### Purpose
**Execute multi-touch sequences with perfect timing and anti-ban logic**

#### Inputs
```javascript
{
  prospect: {
    id: "123",
    workflow_type: "priority"  // or "standard"
  },
  messages: [
    { touch: 1, channel: "linkedin", variants: [...] },
    { touch: 2, channel: "linkedin", variants: [...] },
    { touch: 3, channel: "email", variants: [...] }
  ]
}
```

#### Processing Logic
```javascript
// Step 1: Select Workflow
const workflow = prospect.workflow_type === 'priority'
  ? priorityWorkflow
  : standardWorkflow;

// Priority Workflow (Hot Prospects, Score > 85)
const priorityWorkflow = [
  { touch: 1, day: 0, channel: 'linkedin', type: 'connection' },
  { touch: 2, day: 1, channel: 'linkedin', type: 'message' },
  { touch: 3, day: 3, channel: 'email', type: 'demo_invite' },
  { touch: 4, day: 5, channel: 'linkedin', type: 'case_study' },
  { touch: 5, day: 8, channel: 'email', type: 'final_cta' }
];

// Standard Workflow (Qualified, Score 70-84)
const standardWorkflow = [
  { touch: 1, day: 0, channel: 'linkedin', type: 'connection' },
  { touch: 2, day: 3, channel: 'linkedin', type: 'message' },
  { touch: 3, day: 7, channel: 'email', type: 'value_email' },
  { touch: 4, day: 12, channel: 'linkedin', type: 'content_share' },
  { touch: 5, day: 18, channel: 'email', type: 'case_study' }
];

// Step 2: Schedule Actions
workflow.forEach(step => {
  const scheduledTime = calculateSendTime(step.day, {
    businessHoursOnly: true,      // 9am-6pm
    avoidWeekends: true,
    peakHours: [9, 10, 14, 15],   // Best engagement times
    randomDelay: 30 * 60 * 1000   // 0-30 min random delay
  });

  scheduleAction({
    prospect_id: prospect.id,
    touch: step.touch,
    channel: step.channel,
    message: selectBestVariant(messages[step.touch - 1]),
    scheduled_time: scheduledTime
  });
});

// Step 3: Anti-Ban Logic (LinkedIn)
function sendLinkedInAction(action) {
  // Check rate limits
  if (getLinkedInActionsToday() >= 20) {
    rescheduleForTomorrow(action);
    return;
  }

  // Add random delay (human-like)
  const delay = randomBetween(30000, 300000); // 30sec - 5min
  setTimeout(() => {
    executeLinkedInAction(action);
    logAction(action);
  }, delay);
}
```

#### Outputs
```javascript
{
  prospect_id: "123",
  workflow_status: "active",
  scheduled_actions: [
    {
      touch: 1,
      channel: "linkedin",
      action: "connection_request",
      scheduled_time: "2024-10-10T09:23:00Z",
      status: "pending"
    },
    {
      touch: 2,
      channel: "linkedin",
      action: "send_message",
      scheduled_time: "2024-10-11T10:15:00Z",
      status: "pending"
    },
    {
      touch: 3,
      channel: "email",
      action: "send_email",
      scheduled_time: "2024-10-13T14:30:00Z",
      status: "pending"
    }
  ],
  rate_limit_status: {
    linkedin_today: 12,
    linkedin_limit: 20,
    next_available_slot: "2024-10-10T09:45:00Z"
  }
}
```

#### Key Metrics
- **Sequences active**: 60 concurrent
- **Actions scheduled**: 300 total (5 per prospect × 60)
- **Timing accuracy**: ±1 hour
- **Rate limit compliance**: 100% (no violations)
- **Weekend actions**: 0 (all paused)

---

### 4. EngagementTrackerAgent (The Monitor)

#### Purpose
**Detect engagement in real-time and trigger workflow adjustments**

#### Inputs
```javascript
{
  signals: [
    {
      prospect_id: "123",
      type: "email_opened",
      timestamp: "2024-10-10T10:30:00Z",
      metadata: { opens_count: 3 }
    },
    {
      prospect_id: "123",
      type: "linkedin_connection_accepted",
      timestamp: "2024-10-10T11:00:00Z",
      metadata: { with_note: false }
    },
    {
      prospect_id: "124",
      type: "email_reply",
      timestamp: "2024-10-10T14:00:00Z",
      metadata: { reply_text: "Interested, let's chat!" }
    }
  ]
}
```

#### Processing Logic
```javascript
// Step 1: Score Each Signal
const signalScores = {
  // High engagement (20-30 points)
  email_reply: 30,
  linkedin_message_reply: 30,
  connection_accepted_with_note: 25,
  demo_link_clicked: 25,

  // Medium engagement (10-15 points)
  email_opened_3x: 15,
  linkedin_profile_view: 15,
  connection_accepted: 10,
  email_link_clicked: 10,

  // Low engagement (5 points)
  email_opened_1x: 5,
  linkedin_message_read: 5
};

// Step 2: Calculate Engagement Score
function calculateEngagementScore(prospect_id, new_signals) {
  const existingScore = getProspectEngagementScore(prospect_id);
  const newPoints = new_signals.reduce((sum, signal) => {
    return sum + (signalScores[signal.type] || 0);
  }, 0);

  return Math.min(existingScore + newPoints, 100); // Cap at 100
}

// Step 3: Determine Temperature
function getTemperature(score) {
  if (score >= 80) return 'hot';
  if (score >= 50) return 'warm';
  return 'cold';
}

// Step 4: Trigger Actions
function handleEngagement(prospect_id, score, temperature) {
  if (temperature === 'hot') {
    // Alert human immediately
    sendAlert({
      type: 'hot_lead',
      prospect_id,
      score,
      action: 'Book demo now!'
    });

    // Pause workflow
    pauseWorkflow(prospect_id);

  } else if (temperature === 'warm') {
    // Accelerate sequence
    accelerateWorkflow(prospect_id, {
      reduceDelays: true,
      nextTouchIn: '1 day'
    });

  } else {
    // Continue standard sequence
    // No action needed
  }
}

// Step 5: Reply Detection (Auto-Pause)
signals
  .filter(s => s.type.includes('reply'))
  .forEach(signal => {
    pauseWorkflow(signal.prospect_id);
    sendAlert({
      type: 'reply_received',
      prospect_id: signal.prospect_id,
      reply_text: signal.metadata.reply_text
    });
  });
```

#### Outputs
```javascript
{
  prospect_id: "123",
  engagement_score: 65,
  temperature: "warm",
  signals_received: [
    { type: "email_opened", points: 5, timestamp: "2024-10-10T10:30:00Z" },
    { type: "email_opened", points: 15, timestamp: "2024-10-10T11:00:00Z" },
    { type: "connection_accepted", points: 10, timestamp: "2024-10-10T11:00:00Z" },
    { type: "linkedin_profile_view", points: 15, timestamp: "2024-10-10T12:00:00Z" },
    { type: "email_link_clicked", points: 10, timestamp: "2024-10-10T14:00:00Z" }
  ],
  workflow_adjustments: [
    {
      action: "accelerate_sequence",
      reason: "Prospect is warm (score 65)",
      changes: "Next touch in 1 day instead of 3 days"
    }
  ],
  alerts_sent: [
    {
      type: "engagement_update",
      message: "Prospect John Doe is now WARM (score 65)",
      timestamp: "2024-10-10T14:05:00Z"
    }
  ]
}
```

#### Key Metrics
- **Signals tracked**: 10 types
- **Processing delay**: < 5 minutes
- **Temperature accuracy**: 90%+ vs manual assessment
- **Auto-pauses on reply**: 100%
- **Hot lead alerts**: Real-time (< 1 min)

---

## 🔄 Agent Interaction Flow

### Scenario: New Prospect Added

```
1. INTAKE
   └─> Prospect "John Doe" added to Google Sheets

2. PROSPECTQUALIFIERAGENT
   ├─> Scores John: 91 points (Hot!)
   ├─> Enriches: "Just raised Series A, hiring 5 SDRs"
   └─> Outputs: qualify_hot, priority workflow

3. MESSAGEGENERATORAGENT
   ├─> Generates Touch 1 (LinkedIn connection)
   │   └─> Variant A: "Mon IA a trouvé votre profil... score 91%"
   │   └─> Variant B: "5 SDRs × 45K€ = 225K€. 1 IA = 24K€..."
   │   └─> Variant C: "Félicitations Series A! Pourquoi 5 humains..."
   ├─> Generates Touch 2 (LinkedIn message)
   └─> Generates Touch 3 (Email)

4. WORKFLOWORCHESTRATORAGENT
   ├─> Schedules Touch 1 for today 10am (random delay)
   ├─> Schedules Touch 2 for tomorrow 10am
   ├─> Schedules Touch 3 for Day 3, 2pm
   └─> Respects rate limits (12/20 LinkedIn today)

5. EXECUTION
   └─> Touch 1 sent at 10:23am (23 min random delay)

6. ENGAGEMENTTRACKERAGENT
   ├─> Detects: Connection accepted (10 points)
   ├─> Detects: Profile viewed (15 points)
   ├─> Detects: Email opened 3x (15 points)
   ├─> Total score: 40 points
   ├─> Temperature: WARM
   └─> Action: Accelerate next touch to 1 day

7. DAY 3
   └─> ENGAGEMENTTRACKERAGENT
       ├─> Detects: Email reply received (+30 points)
       ├─> Total score: 70 points
       ├─> Temperature: HOT
       ├─> Action: Pause workflow
       └─> Alert: "🔥 HOT LEAD! John Doe replied. Book demo now!"

8. HUMAN TAKEOVER
   └─> Sales rep books demo with John
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   INTAKE    │
│  (Prospect) │
└─────┬───────┘
      │
      ▼
┌─────────────────────┐
│ ProspectQualifier   │  ← Scoring, Enrichment
│                     │
│ Input:  Raw data    │
│ Output: Score, Type │
└─────────┬───────────┘
          │
          ├─── (Score < 70) ──> ❌ REJECT
          │
          ├─── (Score 70-84) ──┐
          │                    │
          └─── (Score 85+) ────┤
                               ▼
                    ┌─────────────────────┐
                    │ MessageGenerator    │  ← AI Creation
                    │                     │
                    │ Input:  Prospect    │
                    │ Output: 3 Variants  │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ WorkflowOrchestrator│  ← Scheduling
                    │                     │
                    │ Input:  Messages    │
                    │ Output: Scheduled   │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │    EXECUTION        │  ← LinkedIn/Email
                    │  (Touch Sent)       │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ EngagementTracker   │  ← Monitoring
                    │                     │
                    │ Input:  Signals     │
                    │ Output: Temperature │
                    └─────────┬───────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │ PAUSE   │         │ACCELERATE│        │CONTINUE │
    │ (Hot)   │         │ (Warm)  │         │ (Cold)  │
    └─────────┘         └─────────┘         └─────────┘
```

---

## 🎯 Simplified vs Complex Comparison

### Old System (Never Worked)
```
❌ 20+ agents with unclear boundaries
❌ Complex dependencies (agents waiting on agents)
❌ No filtering (wasted effort on bad prospects)
❌ Generic messaging (ignored by recipients)
❌ No engagement tracking (blind outreach)
❌ Over-engineered workflows (fragile, breaks often)
```

### New System V3.0 (Designed to Work)
```
✅ 4 essential agents with clear roles
   - ProspectQualifier: Filter
   - MessageGenerator: Create
   - WorkflowOrchestrator: Execute
   - EngagementTracker: Monitor

✅ Simple linear flow
   Intake → Score → Create → Execute → Monitor → Adjust

✅ 70% filtering (eliminate garbage early)

✅ "Insolite" messaging (cut through noise)

✅ Real-time engagement (adapt based on signals)

✅ Robust workflows (anti-ban, human-like, simple)
```

---

## 🛠️ Technology Stack

### Agent Implementation
```javascript
// Each agent is a simple class with clear interface

class ProspectQualifierAgent {
  async score(prospect) { /* ... */ }
  async enrich(prospect) { /* ... */ }
  async classify(score) { /* ... */ }
}

class MessageGeneratorAgent {
  async generate(prospect, touch) { /* ... */ }
  async createVariants(message) { /* ... */ }
  async checkQuality(message) { /* ... */ }
}

class WorkflowOrchestratorAgent {
  async schedule(prospect, messages) { /* ... */ }
  async execute(action) { /* ... */ }
  async respectRateLimits() { /* ... */ }
}

class EngagementTrackerAgent {
  async trackSignal(signal) { /* ... */ }
  async calculateScore(prospect_id) { /* ... */ }
  async adjustWorkflow(prospect_id, temperature) { /* ... */ }
}
```

### Integration Points
```javascript
// Google Sheets (CRM)
const sheets = require('./integrations/googleSheets');

// LinkedIn (Puppeteer + Stealth)
const linkedin = require('./integrations/linkedinStealth');

// Email (Nodemailer + Tracking)
const email = require('./integrations/emailWithTracking');

// AI (OpenAI GPT-4)
const openai = require('./integrations/openaiGPT4');
```

---

## 📈 Success Metrics Per Agent

### ProspectQualifierAgent
- **Rejection rate**: 70% (validates filtering works)
- **Qualification accuracy**: 90%+ (manual review confirms)
- **Enrichment coverage**: 100% of qualified prospects
- **Processing speed**: < 5 seconds per prospect

### MessageGeneratorAgent
- **Quality pass rate**: 80%+ (human approval)
- **Personalization**: 6+ variables per message
- **Generation speed**: < 30 seconds for 3 variants
- **Reply rate**: 8%+ (validates "insolite" works)

### WorkflowOrchestratorAgent
- **Timing accuracy**: ±1 hour (scheduled vs actual)
- **Rate limit compliance**: 100% (no bans)
- **Execution success**: 95%+ (actions complete)
- **Weekend pause**: 100% (no actions Sat/Sun)

### EngagementTrackerAgent
- **Signal capture speed**: < 5 minutes
- **Temperature accuracy**: 90%+ vs manual
- **Auto-pause on reply**: 100%
- **Hot lead alert time**: < 1 minute

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              VERCEL SERVERLESS                  │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  /api/qualify                           │   │
│  │  → ProspectQualifierAgent.score()       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  /api/generate-message                  │   │
│  │  → MessageGeneratorAgent.generate()     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  /api/orchestrate                       │   │
│  │  → WorkflowOrchestratorAgent.schedule() │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  /api/track-engagement                  │   │
│  │  → EngagementTrackerAgent.track()       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              NODE.JS SERVER                     │
│           (Long-running processes)              │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Cron Job: Daily Prospect Scoring       │   │
│  │  → Run ProspectQualifier on new intake  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Cron Job: Workflow Execution           │   │
│  │  → Check scheduled actions, execute      │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  WebSocket: Real-time Engagement        │   │
│  │  → Push engagement signals to tracker    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ✅ Validation Checklist

Before deploying each agent, validate:

### ProspectQualifierAgent
- [ ] Scores 100 test prospects in < 10 minutes
- [ ] Rejects exactly 70% (acceptable: 65-75%)
- [ ] Enriches all qualified prospects
- [ ] No false negatives (manual spot-check)

### MessageGeneratorAgent
- [ ] Generates 3 variants in < 30 seconds
- [ ] 80%+ quality pass rate
- [ ] All personalization variables inject correctly
- [ ] Tone matches Graixl brand voice

### WorkflowOrchestratorAgent
- [ ] Schedules 50 prospects without errors
- [ ] Respects LinkedIn rate limits (20/day)
- [ ] No actions on weekends
- [ ] Timing accurate within ±1 hour

### EngagementTrackerAgent
- [ ] Captures 10 different signal types
- [ ] Temperature matches manual assessment (90%+)
- [ ] Auto-pauses on reply (100%)
- [ ] Hot lead alerts < 1 minute

---

**Simple. Intelligent. Effective. This is the way.** 🚀
