# MARKETING DOMINATION ENGINE - DATABASE SCHEMA & DATA FLOW
## Complete Data Architecture Documentation

**Generated**: 2025-10-27
**Database**: PostgreSQL
**ORM**: Prisma
**Models**: 17+ Marketing-specific
**Total Models**: 50+ (Platform-wide)

---

## 🗄️ MARKETING DATABASE MODELS

### **Core Marketing Models** (5 models)

#### 1. **MarketingProfile**
**Purpose**: Central profile for each marketing campaign/brand
**Primary Key**: `id` (cuid)
**Owner**: `userId` (references User.id)

```prisma
model MarketingProfile {
  id             String   @id @default(cuid())
  userId         String   // Owner

  // Required Configuration
  name           String   // "Healthcare SaaS Campaign"
  industry       String   // "B2B SaaS for healthcare"
  targetAudience String   // "Hospital administrators, 40-60"
  primaryGoal    String   // "Increase demo bookings by 50%"
  monthlyBudget  Decimal

  // Optional Advanced Fields
  brandVoice             String?
  geographicFocus        String?
  competitorUrls         String[]
  websiteUrl             String?
  socialProfiles         Json
  productDescription     String?
  valueProposition       String?
  contentPreferences     Json
  publishingFrequency    Json
  brandGuidelines        Json
  complianceRequirements String[]

  // AI-Generated Strategy
  landscapeAnalysis Json?  // From LandscapeAnalyzerService
  strategyPlan      Json?  // From StrategyPlannerService
  repurposingRules  Json?  // From RepurposingEngineService

  // Status
  status    String   @default("draft") // draft|active|paused|archived
  createdAt DateTime
  updatedAt DateTime

  // Relationships
  platformConnections PlatformConnection[]
  campaigns           CampaignOrder[]
  content             ContentPiece[]
  publishedPosts      PublishedPost[]
}
```

**Relationships**:
- **1:N** with PlatformConnection (Twitter, LinkedIn, WordPress, etc.)
- **1:N** with CampaignOrder (multiple campaigns per profile)
- **1:N** with ContentPiece (all generated content)
- **1:N** with PublishedPost (all published posts)

**UI Pages Using This Model**:
- ✅ `/profiles` - List all profiles
- ✅ `/profiles/new` - Create profile
- ✅ `/profiles/:id` - View/edit profile
- ❌ `/profiles/:id/stats` - **MISSING: Statistics page**

---

#### 2. **PlatformConnection**
**Purpose**: OAuth/API connections to publishing platforms
**Primary Key**: `id` (cuid)
**Foreign Key**: `profileId` → MarketingProfile

```prisma
model PlatformConnection {
  id        String @id @default(cuid())
  profileId String
  platform  String  // "wordpress"|"twitter"|"linkedin"|...

  // Connection Details
  isConnected    Boolean  @default(false)
  connectionType String   // "oauth"|"api_key"|"credentials"

  // OAuth Tokens (encrypted)
  accessToken  String?
  refreshToken String?
  tokenExpiry  DateTime?

  // API Credentials (encrypted)
  apiKey    String?
  apiSecret String?

  // Platform-specific config
  config Json?  // {siteUrl, accountId, etc.}

  // Domain Tracking
  domains String[]  // ["blog.example.com", "medium.com/@user"]

  // Status
  status       String    @default("disconnected")
  lastSynced   DateTime?
  errorMessage String?

  createdAt DateTime
  updatedAt DateTime

  profile MarketingProfile @relation(...)
}
```

**Supported Platforms**:
- WordPress (OAuth/API Key)
- Twitter (OAuth 2.0)
- LinkedIn (OAuth 2.0)
- Facebook (OAuth 2.0)
- Instagram (OAuth 2.0)
- TikTok (OAuth 2.0)
- YouTube (OAuth 2.0)
- Medium (API Key)
- Ghost (API Key)

**UI Pages Using This Model**:
- ✅ `/profiles/:id/connections` - Manage connections

---

#### 3. **CampaignOrder**
**Purpose**: Autonomous campaign configuration and execution
**Primary Key**: `id` (cuid)
**Foreign Key**: `profileId` → MarketingProfile

```prisma
model CampaignOrder {
  id        String @id @default(cuid())
  profileId String

  // Campaign Configuration
  name     String
  strategy String  // "viral-first"|"evergreen-first"|"conversion-first"

  // Content Selection
  contentTypes Json  // {blogs: true, videos: false, socialPosts: true}
  platforms    Json  // {twitter: true, linkedin: true}

  // Repurposing Configuration
  repurposingRules Json  // {blog: {twitter: 10, linkedin: 5}}

  // Cost Management
  estimatedCost   Decimal
  actualCost      Decimal?
  costBreakdown   Json
  budgetAllocated Decimal
  budgetUsed      Decimal @default(0)
  budgetRemaining Decimal

  // Execution
  status    String  @default("draft")  // draft|planning|generating|publishing|active|paused|completed
  mode      String  @default("hybrid")  // full_auto|semi_auto|hybrid
  startDate DateTime?
  endDate   DateTime?

  // Automation Configuration
  autoPublish        Boolean @default(false)
  requiresApproval   Boolean @default(true)
  publishingSchedule Json?    // {timezone, slots: [...]}

  // Generated Content
  generatedBlogs     Int @default(0)
  generatedVideos    Int @default(0)
  generatedSocial    Int @default(0)
  publishedPosts     Int @default(0)

  // Performance (aggregated)
  totalViews       Int     @default(0)
  totalEngagement  Int     @default(0)
  avgEngagementRate Decimal?
  roi              Decimal?

  createdAt DateTime
  updatedAt DateTime

  profile        MarketingProfile @relation(...)
  contentPieces  ContentPiece[]
  publishedPosts PublishedPost[]
}
```

**UI Pages Using This Model**:
- ✅ `/profiles/:id/campaigns/new` - Create campaign (NEW DESIGN)
- ✅ `/campaigns` - List campaigns
- ✅ `/campaigns/:id` - View campaign
- ❌ **MISSING: Campaign analytics page**
- ❌ **MISSING: Budget tracking page**

---

#### 4. **ContentPiece**
**Purpose**: Individual pieces of generated content
**Primary Key**: `id` (cuid)
**Foreign Keys**: `profileId` → MarketingProfile, `campaignId` → CampaignOrder

```prisma
model ContentPiece {
  id         String @id @default(cuid())
  profileId  String
  campaignId String?

  // Content Details
  type    String  // "blog"|"video"|"social_post"|"infographic"
  title   String
  content String  // Generated content (Markdown/HTML/Text)

  // SEO/Metadata
  keywords        String[]
  metaTitle       String?
  metaDescription String?

  // Quality Metrics
  qualityScore     Int @default(0)  // 0-100
  readabilityScore Int @default(0)  // 0-100
  seoScore         Int @default(0)  // 0-100

  // Generation Details
  sourceType  String?  // "trend"|"keyword"|"manual"
  sourceId    String?
  generatedBy String   @default("ai")  // "ai"|"user"|"hybrid"

  // Repurposing Chain
  parentId String?  // If repurposed from another piece
  parent   ContentPiece?
  children ContentPiece[]  // Repurposed variations

  // Approval Workflow
  status         String @default("draft")  // draft|review|approved|rejected
  reviewedBy     String?
  reviewNotes    String?
  approvedAt     DateTime?

  // Scheduling
  scheduledFor DateTime?
  publishedAt  DateTime?

  createdAt DateTime
  updatedAt DateTime

  profile        MarketingProfile @relation(...)
  campaign       CampaignOrder?   @relation(...)
  publishedPosts PublishedPost[]
}
```

**Content Repurposing Flow**:
```
Original Blog Post (parent)
  ├── Twitter Thread (child 1) - 10 tweets
  ├── LinkedIn Article (child 2) - 1 long-form
  ├── Instagram Carousel (child 3) - 5 slides
  ├── TikTok Script (child 4) - 60s video
  └── Email Newsletter (child 5) - formatted email
```

**UI Pages Using This Model**:
- ✅ `/profiles/:id/content` - Content repurposing studio
- ❌ **MISSING: Content library page**
- ❌ **MISSING: Content quality dashboard**

---

#### 5. **PublishedPost**
**Purpose**: Tracking of published content across platforms
**Primary Key**: `id` (cuid)
**Foreign Keys**: `profileId`, `campaignId`, `contentId`

```prisma
model PublishedPost {
  id         String @id @default(cuid())
  profileId  String
  campaignId String?
  contentId  String

  // Publishing Details
  platform       String   // "wordpress"|"twitter"|"linkedin"
  domain         String   // "blog.example.com"
  postUrl        String?  // Full URL to published content
  platformPostId String?  // ID from platform (for updates)

  // Timing
  publishedAt  DateTime
  scheduledFor DateTime?

  // Performance Metrics
  views       Int @default(0)
  likes       Int @default(0)
  comments    Int @default(0)
  shares      Int @default(0)
  clicks      Int @default(0)
  conversions Int @default(0)

  engagementRate Decimal?
  conversionRate Decimal?

  // Performance vs Baseline
  performanceScore Int?  // 0-100 (vs average)
  viralityScore    Int?  // 0-100

  // Metadata
  lastSyncedAt    DateTime?
  metricsUpdatedAt DateTime?

  createdAt DateTime
  updatedAt DateTime

  profile  MarketingProfile @relation(...)
  campaign CampaignOrder?   @relation(...)
  content  ContentPiece     @relation(...)
}
```

**UI Pages Using This Model**:
- ✅ `/profiles/:id/publishing` - Publishing queue
- ✅ `/profiles/:id/analytics` - Performance analytics
- ❌ **MISSING: Real-time dashboard**
- ❌ **MISSING: Cross-platform comparison view**

---

## 🔄 DATA FLOW DIAGRAMS

### **1. Profile Creation & Strategy Generation Flow**

```
USER INPUT
  ↓
[Frontend: /profiles/new]
  ↓ POST /marketing/profiles
[ProfileController.createProfile()]
  ↓
[MarketingProfileService]
  ↓ Save to DB
[MarketingProfile] ← Created
  ↓
[LandscapeAnalyzerService.analyzeLandscape()] ← Auto-triggered
  ↓ Analyze market, competitors, TAM/SAM
[MarketingProfile.landscapeAnalysis] ← Updated with JSON
  ↓
[StrategyPlannerService.generateStrategy()] ← Auto-triggered
  ↓ Generate positioning, content pillars, campaigns
[MarketingProfile.strategyPlan] ← Updated with JSON
  ↓
RESPONSE → Frontend
  ↓
[Redirect to /profiles/:id]
```

**Services Involved**:
- `MarketingProfileService` - CRUD operations
- `LandscapeAnalyzerService` - Market analysis
- `StrategyPlannerService` - Strategy generation

**Database Operations**:
1. INSERT INTO MarketingProfile
2. UPDATE MarketingProfile SET landscapeAnalysis = ...
3. UPDATE MarketingProfile SET strategyPlan = ...

**Frontend Pages**:
- `/profiles/new` ✅ (Create form)
- `/profiles/:id` ✅ (View profile)
- `/profiles/:id/strategy` ✅ (View strategy - NEEDS ENHANCEMENT)

---

### **2. Platform Connection Flow (OAuth)**

```
USER ACTION: "Connect Twitter"
  ↓
[Frontend: /profiles/:id/connections]
  ↓ POST /marketing/profiles/:id/connections/oauth/initiate
[ProfileController.initiateOAuth()]
  ↓
[PlatformConnectionService.initiateOAuthFlow()]
  ↓ Generate state, build OAuth URL
[Returns: OAuth2AuthUrl with authUrl]
  ↓
RESPONSE → Frontend
  ↓
[Redirect user to Twitter OAuth page]
  ↓
USER AUTHORIZES
  ↓
[Twitter redirects to redirectUri with code]
  ↓
[Frontend: Receives code in URL]
  ↓ POST /marketing/profiles/:id/connections/oauth/complete
[ProfileController.completeOAuth()]
  ↓
[PlatformConnectionService.completeOAuthFlow()]
  ↓ Exchange code for tokens
[External API: Twitter OAuth Token Endpoint]
  ↓ Returns accessToken, refreshToken
[PlatformConnectionService]
  ↓ Encrypt tokens, save to DB
[PlatformConnection] ← Created/Updated
  {
    platform: "twitter",
    isConnected: true,
    accessToken: "encrypted...",
    refreshToken: "encrypted...",
    status: "connected"
  }
  ↓
RESPONSE → Frontend
  ↓
[Update UI: Show "Connected" badge]
```

**Services Involved**:
- `PlatformConnectionService` - OAuth management
- `EncryptionService` - Token encryption (implied)

**Database Operations**:
1. INSERT INTO PlatformConnection (during initiate - optional)
2. UPDATE PlatformConnection (on complete)

**Frontend Pages**:
- `/profiles/:id/connections` ✅ (Fully implemented)

---

### **3. Content Repurposing Flow (1 → 50+ posts)**

```
USER INPUT: Paste blog content
  ↓
[Frontend: /profiles/:id/content]
  ↓ POST /marketing/profiles/:id/repurpose
  Body: {
    source: {
      type: "blog",
      content: "...",
      title: "..."
    },
    rules: { /* platform counts */ }
  }
  ↓
[ProfileController.repurposeContent()]
  ↓
[RepurposingEngineService.repurposeContent()]
  ↓ Parse source content
  ↓ Extract key points, quotes, stats
  ↓ Generate platform-specific variations

  FOR EACH PLATFORM:
    ↓
    [AI Generation: Platform-specific adaptation]
      - Twitter: 10 tweets (threads, standalone)
      - LinkedIn: 3 posts (long-form, carousel, poll)
      - Instagram: 5 posts (carousel, story, reel script)
      - TikTok: 3 video scripts
      - etc.
    ↓
    [ContentPiece] ← Created for each variation
      {
        parentId: originalBlogId,
        type: "social_post",
        platform: "twitter",
        content: "...",
        qualityScore: 85
      }

  ↓
[Returns: Array of RepurposedContent objects]
  {
    platform: "twitter",
    contentType: "tweet",
    outputs: [
      {id: "...", content: "...", engagement: 78},
      ...
    ]
  }
  ↓
RESPONSE → Frontend
  ↓
[Display all 50+ variations in cards]
  ↓
USER ACTION: "Publish" or "Copy"
```

**Services Involved**:
- `RepurposingEngineService` - Content adaptation
- AI/LLM Service (OpenAI/Anthropic) - Content generation

**Database Operations**:
1. INSERT INTO ContentPiece (parent - original blog)
2. INSERT INTO ContentPiece × 50 (children - repurposed posts)
3. Set parentId relationships

**Frontend Pages**:
- `/profiles/:id/content` ✅ (Fully implemented)

---

### **4. Autonomous Campaign Execution Flow**

```
USER INPUT: Launch Campaign
  ↓
[Frontend: /profiles/:id/campaigns/new]
  ↓ POST /marketing/profiles/:id/launch-campaign
  Body: {
    campaignName: "Q4 Launch",
    mode: "full_auto",
    budget: 5000,
    duration: 30,
    platforms: ["twitter", "linkedin"]
  }
  ↓
[ProfileController.launchCampaign()]
  ↓
[AutonomousOrchestratorService.launchCampaign()]
  ↓ Create campaign order
[CampaignOrder] ← Created (status: "planning")
  ↓
  ↓ STEP 1: Content Planning
[ContentPlannerService.planCampaign()]
  ↓ Determine content mix (10 blogs, 50 social posts)
  ↓ Calculate cost estimate
[CampaignOrder.estimatedCost] ← Updated
  ↓
  ↓ STEP 2: Content Generation
[ContentGeneratorService.generateCampaignContent()]
  ↓ Generate all content pieces
[ContentPiece] ← Created × 60 (blogs + social)
  ↓ Update campaign status
[CampaignOrder.status] ← "generating"
  ↓
  ↓ STEP 3: Content Review (if mode = semi_auto/hybrid)
[CampaignOrder.status] ← "review"
  ↓ Wait for user approval
  OR
  ↓ STEP 3: Auto-Approve (if mode = full_auto)
  ↓
  ↓ STEP 4: Publishing
[MultiPlatformPublisherService.publishToMultiplePlatforms()]
  ↓ Publish to Twitter, LinkedIn, etc.
  ↓ Create publishing queue
[PublishedPost] ← Created × 60 (scheduled)
  ↓ Update campaign status
[CampaignOrder.status] ← "active"
  ↓
  ↓ STEP 5: Monitoring (background job)
[PerformanceMonitorService.trackCampaign()]
  ↓ Sync metrics from platforms
[PublishedPost.views, likes, etc.] ← Updated
  ↓ Aggregate to campaign
[CampaignOrder.totalViews, etc.] ← Updated
  ↓
RESPONSE → Frontend
  {
    campaignId: "...",
    status: "active",
    contentGenerated: 60,
    postsScheduled: 60
  }
  ↓
[Redirect to /campaigns/:id]
```

**Services Involved**:
- `AutonomousOrchestratorService` - Main coordinator
- `ContentPlannerService` - Content mix planning
- `ContentGeneratorService` - AI content generation
- `MultiPlatformPublisherService` - Cross-platform publishing
- `PerformanceMonitorService` - Metrics tracking

**Database Operations**:
1. INSERT INTO CampaignOrder
2. INSERT INTO ContentPiece × 60
3. INSERT INTO PublishedPost × 60
4. UPDATE PublishedPost (metrics sync every 30 min)
5. UPDATE CampaignOrder (aggregated metrics)

**Frontend Pages**:
- `/profiles/:id/campaigns/new` ✅ (NEW DESIGN - Template-based)
- `/campaigns/:id` ✅ (View campaign)
- ❌ **MISSING: Campaign monitoring dashboard**
- ❌ **MISSING: Real-time performance charts**

---

### **5. Analytics & Performance Tracking Flow**

```
BACKGROUND JOB: Every 30 minutes
  ↓
[PerformanceMonitorService.syncAllCampaigns()]
  ↓
FOR EACH PublishedPost WHERE lastSyncedAt < 30 min ago:
  ↓
  [Platform API: Get post metrics]
    - Twitter API: GET /tweets/:id
    - LinkedIn API: GET /shares/:id
    - WordPress API: GET /posts/:id/stats
  ↓
  [Extract metrics: views, likes, comments, shares]
  ↓
  UPDATE PublishedPost
    SET views = ..., likes = ..., metricsUpdatedAt = NOW()
  ↓
  [Calculate engagement rate]
    engagementRate = (likes + comments + shares) / views × 100
  ↓
  UPDATE PublishedPost SET engagementRate = ...

↓ After all posts synced
[Aggregate metrics by campaign]
  UPDATE CampaignOrder SET
    totalViews = SUM(PublishedPost.views),
    totalEngagement = SUM(PublishedPost.likes + comments + shares),
    avgEngagementRate = AVG(PublishedPost.engagementRate)

↓ After all campaigns synced
[Aggregate metrics by profile]
  UPDATE MarketingProfile SET
    totalPublished = COUNT(PublishedPost),
    avgPerformance = AVG(PublishedPost.performanceScore)
```

**Services Involved**:
- `PerformanceMonitorService` - Metrics sync coordinator
- `PlatformAPIService` (per platform) - API calls to platforms

**Database Operations**:
- UPDATE PublishedPost × hundreds (every 30 min)
- UPDATE CampaignOrder × dozens (aggregation)
- UPDATE MarketingProfile × few (aggregation)

**Frontend Pages**:
- `/profiles/:id/analytics` ✅ (Basic implementation)
- ❌ **MISSING: Real-time dashboard**
- ❌ **MISSING: Performance comparison charts**
- ❌ **MISSING: ROI calculator**

---

## 🔗 SERVICE DEPENDENCY MAP

```
ProfileController
  ├── MarketingProfileService (CRUD)
  ├── PlatformConnectionService (OAuth, API keys)
  ├── LandscapeAnalyzerService (Market analysis)
  ├── StrategyPlannerService (Strategy generation)
  ├── RepurposingEngineService (Content repurposing)
  ├── CostCalculatorService (Cost estimation)
  ├── MultiPlatformPublisherService (Publishing)
  ├── DomainTrackerService (Performance tracking)
  └── AutonomousOrchestratorService (Campaign automation)

AutonomousOrchestratorService
  ├── ContentPlannerService (Content mix planning)
  ├── ContentGeneratorService (AI content generation)
  ├── QualityAssuranceService (Content review)
  ├── PublishingSchedulerService (Queue management)
  └── PerformanceMonitorService (Metrics tracking)

PlatformConnectionService
  ├── TwitterOAuthService
  ├── LinkedInOAuthService
  ├── WordPressAPIService
  ├── MediumAPIService
  ├── GhostAPIService
  └── EncryptionService (Token security)
```

---

## 📈 MISSING INTEGRATIONS (Frontend → Backend)

### **Critical Missing**
1. **Cost Calculator** (3 endpoints, 0 UI)
   - `/marketing/profiles/:id/calculate-cost`
   - `/marketing/profiles/:id/quick-estimate`
   - `/marketing/profiles/:id/recommend-budget`

2. **Inventory & Domain Tracking** (2 endpoints, 0 UI)
   - `/marketing/profiles/:id/inventory`
   - `/marketing/profiles/:id/domains`

3. **Cross-Platform Performance** (1 endpoint, 0 UI)
   - `/marketing/profiles/:id/performance`

### **Enhancement Needed**
1. **Strategy Page** - Visualize landscapeAnalysis JSON
2. **Analytics Page** - Real-time charts, export functionality
3. **Publishing Page** - Calendar view, bulk actions

---

## 🎯 SUMMARY

**Database Models**: 17+ marketing-specific
**Total Relationships**: 25+ foreign keys
**Data Flow Paths**: 5 major flows documented
**Frontend Coverage**: ~30% of backend capabilities exposed
**Missing UI Pages**: ~15 pages needed

**Next Steps**: Proceed to BATCH 2 - Priority Assessment

**Total Documentation Created**: 2 comprehensive architecture files
