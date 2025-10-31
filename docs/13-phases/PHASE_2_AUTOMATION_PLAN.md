# Phase 2: Real Automation Workflows - Implementation Plan

**Start Date:** October 26, 2025
**Status:** Planning Complete → Ready to Build
**Foundation:** 71,297 seeded records (83/100 validation score)

---

## Overview

Phase 2 transforms the Marketing Domination Engine from a data repository into a **self-driving marketing machine**. We'll build 4 core automation workflows that work 24/7 to drive growth.

**Key Principle:** Each workflow learns from the seeded data (3-4 years of experience) and executes autonomously.

---

## Architecture: Workflow Engine Design

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                 WORKFLOW ORCHESTRATOR                        │
│  (Manages all workflows, schedules, priorities)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ SEO Empire   │  │ Trend Content│  │ Link Building│
│ Workflow     │  │ Pipeline     │  │ Automation   │
└──────────────┘  └──────────────┘  └──────────────┘
        ↓                  ↓                  ↓
        └──────────────────┼──────────────────┘
                           ↓
                ┌──────────────────────┐
                │ Campaign Orchestrator│
                │  (Ties everything    │
                │   together)          │
                └──────────────────────┘
                           ↓
                    ┌─────────────┐
                    │  Learning   │
                    │  Memory     │
                    │  (AI-driven)│
                    └─────────────┘
```

### Workflow State Machine

Every workflow follows this pattern:

```
IDLE → ANALYZING → PLANNING → EXECUTING → LEARNING → IDLE
  ↑                                                     ↓
  └─────────────────────────────────────────────────────┘
```

1. **ANALYZING:** AI examines current state (keywords, trends, campaigns)
2. **PLANNING:** AI generates action plan based on learned patterns
3. **EXECUTING:** Workflow executes the plan (content, outreach, optimization)
4. **LEARNING:** Results are recorded back into memory
5. **IDLE:** Wait for next trigger (time-based or event-based)

---

## Workflow 1: SEO Empire 🔍

**Goal:** Automatically optimize and rank for 46,151 keywords

### Components to Build

#### 1.1 SEO Analyzer Service
**File:** `apps/api/src/modules/marketing/services/workflows/seo-analyzer.service.ts`

**Responsibilities:**
- Analyze keyword universe (46,151 keywords)
- Identify quick wins (low difficulty, high opportunity)
- Detect rank changes and opportunities
- Calculate SEO health score

**Key Methods:**
```typescript
async analyzeKeywordOpportunities(limit?: number)
async findQuickWins(difficultyThreshold: number, volumeThreshold: number)
async detectRankChanges(days: number)
async calculateSEOHealth()
```

#### 1.2 SEO Planner Service
**File:** `apps/api/src/modules/marketing/services/workflows/seo-planner.service.ts`

**Responsibilities:**
- Generate optimization plans for target keywords
- Prioritize keywords by impact potential
- Create content requirements (titles, meta, word count)
- Suggest internal linking strategies

**Key Methods:**
```typescript
async createOptimizationPlan(keywordId: string)
async prioritizeKeywords(strategy: 'quick-wins' | 'long-term' | 'competitive')
async generateContentRequirements(keywordId: string)
async suggestInternalLinks(keywordId: string)
```

#### 1.3 SEO Executor Service
**File:** `apps/api/src/modules/marketing/services/workflows/seo-executor.service.ts`

**Responsibilities:**
- Execute optimization plans
- Update keyword targets
- Track progress and results
- Record learnings

**Key Methods:**
```typescript
async executeOptimizationPlan(planId: string)
async updateKeywordTarget(keywordId: string, target: number)
async trackOptimizationResult(keywordId: string, result: any)
async recordLearning(keywordId: string, whatWorked: string, whatDidnt: string)
```

#### 1.4 SEO Workflow Orchestrator
**File:** `apps/api/src/modules/marketing/services/workflows/seo-workflow.service.ts`

**Responsibilities:**
- Coordinates Analyzer → Planner → Executor flow
- Manages workflow state
- Schedules recurring SEO audits
- Reports progress

**Key Methods:**
```typescript
async runSEOWorkflow(strategy: 'quick-wins' | 'comprehensive')
async getWorkflowStatus()
async scheduleRecurringSEOAudit(cronExpression: string)
```

---

## Workflow 2: Trend Content Pipeline 📈

**Goal:** Automatically create content from 2,000 trends

### Components to Build

#### 2.1 Trend Detector Service
**File:** `apps/api/src/modules/marketing/services/workflows/trend-detector.service.ts`

**Responsibilities:**
- Monitor trend lifecycle (EMERGING → PEAK → DECLINING)
- Identify viral opportunities (high viral coefficient)
- Detect trend relevance to business
- Alert on time-sensitive trends

**Key Methods:**
```typescript
async detectEmergingTrends(relevanceThreshold: number)
async findViralOpportunities(viralCoefficient: number)
async checkTrendLifecycle(trendId: string)
async alertTimeSensitiveTrends()
```

#### 2.2 Content Strategist Service
**File:** `apps/api/src/modules/marketing/services/workflows/content-strategist.service.ts`

**Responsibilities:**
- Generate content ideas from trends
- Match trends to keyword opportunities
- Create content briefs (angle, structure, CTA)
- Prioritize content by impact potential

**Key Methods:**
```typescript
async generateContentIdeas(trendId: string)
async matchTrendToKeywords(trendId: string)
async createContentBrief(trendId: string, angle: string)
async prioritizeContent(criteria: 'viral' | 'evergreen' | 'conversion')
```

#### 2.3 Content Producer Service
**File:** `apps/api/src/modules/marketing/services/workflows/content-producer.service.ts`

**Responsibilities:**
- Generate content outlines
- Create content assets (blog posts, social posts, videos)
- Optimize for SEO and virality
- Schedule content publication

**Key Methods:**
```typescript
async generateOutline(briefId: string)
async createBlogPost(outlineId: string)
async createSocialPosts(briefId: string, platforms: string[])
async schedulePublication(contentId: string, publishAt: Date)
```

#### 2.4 Trend Content Workflow Orchestrator
**File:** `apps/api/src/modules/marketing/services/workflows/trend-content-workflow.service.ts`

**Responsibilities:**
- Coordinates Detector → Strategist → Producer flow
- Manages content calendar
- Tracks content performance
- Records learnings (what content worked)

**Key Methods:**
```typescript
async runTrendContentWorkflow(trendIds?: string[])
async getContentCalendar(startDate: Date, endDate: Date)
async trackContentPerformance(contentId: string)
```

---

## Workflow 3: Link Building Automation 🔗

**Goal:** Automatically build backlinks using 2,000 opportunities

### Components to Build

#### 3.1 Backlink Analyzer Service
**File:** `apps/api/src/modules/marketing/services/workflows/backlink-analyzer.service.ts`

**Responsibilities:**
- Analyze existing backlink profile (2,000 backlinks)
- Identify link gaps and opportunities
- Assess link quality and authority
- Monitor competitor backlinks

**Key Methods:**
```typescript
async analyzeBacklinkProfile()
async findLinkGaps(competitorDomain: string)
async assessLinkQuality(backlinkId: string)
async discoverNewOpportunities()
```

#### 3.2 Outreach Strategist Service
**File:** `apps/api/src/modules/marketing/services/workflows/outreach-strategist.service.ts`

**Responsibilities:**
- Identify outreach targets (120 HARO queries + opportunities)
- Create personalized outreach templates
- Prioritize targets by success probability
- Schedule outreach campaigns

**Key Methods:**
```typescript
async identifyOutreachTargets(strategy: 'haro' | 'guest-post' | 'broken-link')
async createOutreachTemplate(targetId: string, context: any)
async prioritizeTargets(criteria: 'authority' | 'relevance' | 'responsiveness')
async scheduleOutreachCampaign(campaignId: string)
```

#### 3.3 Outreach Executor Service
**File:** `apps/api/src/modules/marketing/services/workflows/outreach-executor.service.ts`

**Responsibilities:**
- Execute outreach campaigns
- Track responses and follow-ups
- Monitor link acquisition success
- Record learnings (what pitch worked)

**Key Methods:**
```typescript
async executeOutreachCampaign(campaignId: string)
async trackResponse(outreachId: string, response: any)
async scheduleFollowUp(outreachId: string, days: number)
async recordLinkAcquisition(outreachId: string, backlinkUrl: string)
```

#### 3.4 Link Building Workflow Orchestrator
**File:** `apps/api/src/modules/marketing/services/workflows/link-building-workflow.service.ts`

**Responsibilities:**
- Coordinates Analyzer → Strategist → Executor flow
- Manages outreach queue
- Tracks link building progress
- Reports ROI (links acquired vs. effort)

**Key Methods:**
```typescript
async runLinkBuildingWorkflow(strategy: 'haro' | 'guest-post' | 'comprehensive')
async getOutreachQueue()
async trackLinkBuildingProgress()
```

---

## Workflow 4: Campaign Orchestration Engine 🎯

**Goal:** Automatically manage campaigns using 5,000 campaign memories

### Components to Build

#### 4.1 Campaign Intelligence Service
**File:** `apps/api/src/modules/marketing/services/workflows/campaign-intelligence.service.ts`

**Responsibilities:**
- Learn from 5,000 campaign memories
- Identify success patterns (what worked)
- Detect failure patterns (what didn't work)
- Recommend campaign strategies

**Key Methods:**
```typescript
async learnFromCampaigns(successTier?: 'HIGH' | 'MODERATE' | 'LOW')
async identifySuccessPatterns()
async detectFailurePatterns()
async recommendCampaignStrategy(objective: string)
```

#### 4.2 Campaign Planner Service
**File:** `apps/api/src/modules/marketing/services/workflows/campaign-planner.service.ts`

**Responsibilities:**
- Design campaigns based on learned patterns
- Set budget and KPI targets
- Choose channels and tactics
- Create campaign execution plan

**Key Methods:**
```typescript
async designCampaign(objective: string, budget: number)
async setKPITargets(campaignId: string)
async chooseChannels(objective: string, budget: number)
async createExecutionPlan(campaignId: string)
```

#### 4.3 Campaign Executor Service
**File:** `apps/api/src/modules/marketing/services/workflows/campaign-executor.service.ts`

**Responsibilities:**
- Execute campaign plans
- Monitor campaign performance
- Optimize in real-time (budget, targeting)
- Record results into memory

**Key Methods:**
```typescript
async executeCampaign(campaignId: string)
async monitorPerformance(campaignId: string)
async optimizeCampaign(campaignId: string, metric: 'roi' | 'conversions' | 'reach')
async recordCampaignMemory(campaignId: string)
```

#### 4.4 Campaign Orchestrator
**File:** `apps/api/src/modules/marketing/services/workflows/campaign-orchestrator.service.ts`

**Responsibilities:**
- Coordinates Intelligence → Planner → Executor flow
- Manages campaign portfolio (multiple concurrent campaigns)
- Allocates budgets across campaigns
- Reports consolidated ROI

**Key Methods:**
```typescript
async runCampaignOrchestration(objective: string, totalBudget: number)
async getCampaignPortfolio()
async allocateBudgets(campaigns: Campaign[], totalBudget: number)
async getConsolidatedROI()
```

---

## Master Workflow Controller

**File:** `apps/api/src/modules/marketing/services/workflows/master-workflow-controller.service.ts`

**Responsibilities:**
- Coordinate all 4 workflows
- Prevent conflicts (e.g., SEO and Content workflows fighting over resources)
- Prioritize workflows based on business goals
- Provide unified dashboard

**Key Methods:**
```typescript
async startAllWorkflows()
async stopAllWorkflows()
async getWorkflowStatuses()
async prioritizeWorkflows(priority: WorkflowPriority[])
async resolveCo nflicts()
```

---

## API Endpoints (Controller)

**File:** `apps/api/src/modules/marketing/controllers/workflows.controller.ts`

### Endpoints to Build

```typescript
// SEO Workflow
GET    /api/v1/marketing/workflows/seo/status
POST   /api/v1/marketing/workflows/seo/run
GET    /api/v1/marketing/workflows/seo/opportunities
GET    /api/v1/marketing/workflows/seo/quick-wins

// Trend Content Workflow
GET    /api/v1/marketing/workflows/content/status
POST   /api/v1/marketing/workflows/content/run
GET    /api/v1/marketing/workflows/content/calendar
GET    /api/v1/marketing/workflows/content/trending

// Link Building Workflow
GET    /api/v1/marketing/workflows/links/status
POST   /api/v1/marketing/workflows/links/run
GET    /api/v1/marketing/workflows/links/opportunities
GET    /api/v1/marketing/workflows/links/outreach-queue

// Campaign Orchestration
GET    /api/v1/marketing/workflows/campaigns/status
POST   /api/v1/marketing/workflows/campaigns/run
GET    /api/v1/marketing/workflows/campaigns/portfolio
GET    /api/v1/marketing/workflows/campaigns/roi

// Master Controller
GET    /api/v1/marketing/workflows/dashboard
POST   /api/v1/marketing/workflows/start-all
POST   /api/v1/marketing/workflows/stop-all
GET    /api/v1/marketing/workflows/health
```

---

## Database Additions

### New Tables Needed

#### WorkflowExecution
Tracks workflow runs and state
```prisma
model WorkflowExecution {
  id              String   @id @default(cuid())
  workflowType    WorkflowType
  status          WorkflowStatus
  startedAt       DateTime
  completedAt     DateTime?
  state           Json     // Current state (ANALYZING, PLANNING, etc.)
  results         Json?    // Results/metrics
  error           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum WorkflowType {
  SEO_EMPIRE
  TREND_CONTENT
  LINK_BUILDING
  CAMPAIGN_ORCHESTRATION
}

enum WorkflowStatus {
  IDLE
  ANALYZING
  PLANNING
  EXECUTING
  LEARNING
  COMPLETED
  FAILED
}
```

#### WorkflowPlan
Stores generated plans before execution
```prisma
model WorkflowPlan {
  id              String   @id @default(cuid())
  workflowType    WorkflowType
  planType        String   // 'seo-optimization', 'content-brief', 'outreach-campaign', etc.
  targetId        String?  // Related entity (keywordId, trendId, etc.)
  plan            Json     // The actual plan
  priority        Int      @default(0)
  status          String   // 'pending', 'in-progress', 'completed', 'failed'
  executedAt      DateTime?
  results         Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### WorkflowLearning
Records what worked/didn't work for future improvement
```prisma
model WorkflowLearning {
  id              String   @id @default(cuid())
  workflowType    WorkflowType
  entityId        String   // keywordId, trendId, campaignId, etc.
  entityType      String   // 'keyword', 'trend', 'campaign', etc.
  whatWorked      String
  whatDidnt       String
  confidence      Float    @default(0.5)
  aiInsights      String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## Implementation Order

### Sprint 1: SEO Empire (Days 1-3)
1. Database schema updates (WorkflowExecution, WorkflowPlan, WorkflowLearning)
2. SEO Analyzer Service
3. SEO Planner Service
4. SEO Executor Service
5. SEO Workflow Orchestrator
6. API endpoints
7. Testing

**Deliverable:** Working SEO workflow that finds quick wins and creates optimization plans

### Sprint 2: Trend Content Pipeline (Days 4-6)
1. Trend Detector Service
2. Content Strategist Service
3. Content Producer Service
4. Trend Content Workflow Orchestrator
5. API endpoints
6. Testing

**Deliverable:** Working content pipeline that creates content from emerging trends

### Sprint 3: Link Building Automation (Days 7-9)
1. Backlink Analyzer Service
2. Outreach Strategist Service
3. Outreach Executor Service
4. Link Building Workflow Orchestrator
5. API endpoints
6. Testing

**Deliverable:** Working link building automation that executes outreach campaigns

### Sprint 4: Campaign Orchestration (Days 10-12)
1. Campaign Intelligence Service
2. Campaign Planner Service
3. Campaign Executor Service
4. Campaign Orchestrator
5. API endpoints
6. Testing

**Deliverable:** Working campaign orchestrator that runs campaigns based on learned patterns

### Sprint 5: Integration & Master Controller (Days 13-14)
1. Master Workflow Controller
2. Workflow conflict resolution
3. Unified dashboard
4. End-to-end testing
5. Documentation

**Deliverable:** Fully integrated Marketing Domination Engine running all 4 workflows

---

## Success Metrics

After Phase 2 completion, the system should be able to:

✅ **SEO Empire:**
- Identify 50+ quick win keywords automatically
- Generate optimization plans for top 100 keywords
- Track rank improvements

✅ **Trend Content:**
- Detect 10+ emerging trends per week
- Generate 20+ content ideas per week
- Create 5+ content briefs per week

✅ **Link Building:**
- Identify 30+ link opportunities per week
- Execute 10+ outreach campaigns per week
- Acquire 5+ backlinks per month

✅ **Campaign Orchestration:**
- Design 3+ campaigns per month based on learned patterns
- Monitor campaign performance in real-time
- Achieve average ROI > 3x (learned from top 30% of campaign memories)

---

## Technology Stack

- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL + Prisma
- **Queue System:** BullMQ (for async workflow execution)
- **Scheduling:** node-cron (for recurring workflows)
- **AI/ML:** Use ML services built in Phase 1
- **Monitoring:** Custom workflow dashboard

---

## Next Steps

**Immediate Action:**
1. ✅ Create this plan document
2. ⏭️ Update Prisma schema with 3 new models
3. ⏭️ Build SEO Empire workflow (Sprint 1)
4. ⏭️ Test SEO workflow with seeded data
5. ⏭️ Proceed to Sprint 2-5

**Let's start with Sprint 1: SEO Empire! 🚀**
