# AI-Powered Marketing System - Architecture Reference

## System Overview

DryJets now has an autonomous marketing engine that generates, repurposes, and optimizes content across multiple channels. The system uses a **Haiku → Sonnet routing pattern** for cost-effective AI operations.

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                Marketing Dashboard                       │
│          (Phase 2: Next.js Frontend)                    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/JSON
┌────────────────────▼────────────────────────────────────┐
│         NestJS API (apps/api)                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  /marketing/blog                                │   │
│  │  /marketing/campaigns                           │   │
│  │  /marketing/content/repurpose                   │   │
│  │  /marketing/analytics                           │   │
│  │  /marketing/logs                                │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│  ┌──────────────────▼──────────────────────────────┐   │
│  │  MarketingService (CRUD operations)             │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│  ┌──────────────────▼──────────────────────────────┐   │
│  │  OrchestratorService (Haiku router)            │   │
│  │  - Route to Haiku or Sonnet                    │   │
│  │  - Log all operations                          │   │
│  │  - Handle errors                               │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│        ┌────────────┴────────────┐                      │
│        ▼                         ▼                      │
│  ┌──────────────┐         ┌──────────────┐            │
│  │    Haiku     │         │   Sonnet     │            │
│  │  (Lightweight)         │  (Powerful)  │            │
│  │  - Route     │         │  - Generate  │            │
│  │  - Format    │         │  - Repurpose │            │
│  │  - Simple AI │         │  - Analyze   │            │
│  └──────────────┘         └──────────────┘            │
└────────────────────┬────────────────────────────────────┘
                     │ API Calls
        ┌────────────┴────────────┐
        ▼                         ▼
  ┌──────────────┐         ┌──────────────┐
  │ PostgreSQL   │         │ Anthropic    │
  │ (DryJets DB) │         │ (Claude API) │
  │              │         │              │
  │ - Campaigns  │         │ - Haiku      │
  │ - BlogPosts  │         │ - Sonnet     │
  │ - Content    │         │              │
  │ - SEOMetrics │         │              │
  │ - AILogs     │         │              │
  └──────────────┘         └──────────────┘
        ▲                         ▲
        └────────────┬────────────┘
                     │ (Phase 4)
           ┌─────────▼─────────┐
           │   n8n Workflows   │
           │  (Self-hosted)    │
           └───────────────────┘
```

---

## 🤖 AI Agent System

### Agent Personas

#### **Mira** (SEO Strategist)
- **Role**: Blog generation and SEO optimization
- **Model**: Sonnet (for content generation)
- **Triggers**:
  - Manual: `POST /marketing/blog/generate`
  - Automatic: Daily at 9 AM (Phase 3)
- **Output**:
  - 2000+ word SEO blog posts
  - Meta tags and keywords
  - Internal linking suggestions
  - Saves as PENDING_REVIEW for approval

#### **Leo** (Creative Director)
- **Role**: Content repurposing across platforms
- **Model**: Sonnet (for creative adaptation)
- **Triggers**:
  - Manual: `POST /marketing/content/repurpose`
  - Automatic: When blog is published (Phase 3)
- **Output**:
  - Platform-specific content (LinkedIn, Instagram, TikTok, Email)
  - Platform-native tone and format
  - Engagement hooks and CTAs
  - Hashtags and posting times

#### **Rin** (Analytics Advisor)
- **Role**: Performance analysis and recommendations
- **Model**: Haiku (for analysis routing)
- **Triggers**:
  - Manual: `GET /marketing/analytics/insights`
  - Automatic: Weekly review (Phase 3)
- **Output**:
  - Top/bottom performing content
  - Emerging trends
  - 5 actionable recommendations
  - KPIs to monitor

---

## 💾 Database Models

### Campaign
```prisma
model Campaign {
  id              String         @id @default(cuid())
  name            String         // Campaign name
  type            CampaignType   // AWARENESS|ENGAGEMENT|CONVERSION|RETENTION
  status          CampaignStatus // DRAFT|ACTIVE|PAUSED|COMPLETED|ARCHIVED
  platforms       Json           // ['meta', 'google', 'linkedin']
  budgetTotal     Decimal?       // Total ad spend
  targetAudience  Json?          // Audience targeting config
  aiGenerated     Boolean        // AI-created?
  aiAgent         String?        // Which agent created it
  createdAt       DateTime
  updatedAt       DateTime
  contentAssets   ContentAsset[] // Linked assets
}
```

### BlogPost
```prisma
model BlogPost {
  id              String
  title           String         // Blog title (SEO)
  slug            String @unique // URL slug
  content         String         // Full HTML/Markdown
  excerpt         String?        // Short summary
  keywords        String[]       // SEO keywords (5-7)
  metaTitle       String?        // <title> tag
  metaDescription String?        // <meta description>
  status          BlogPostStatus // DRAFT|PENDING_REVIEW|APPROVED|PUBLISHED
  publishedAt     DateTime?      // When it went live
  viewCount       Int            // Analytics
  aiGenerated     Boolean        // AI-created?
  aiBrief         Json?          // Original AI prompt/config
  serpRank        Int?           // Google ranking position
  repurposedCount Int            // Times reused (content)
  createdBy       String         // 'mira' / 'leo' / 'rin'
  seoMetrics      SEOMetric[]    // Daily analytics
  contentAssets   ContentAsset[] // Repurposed variations
}
```

### ContentAsset
```prisma
model ContentAsset {
  id               String
  type             ContentAssetType // IMAGE|VIDEO|COPY|CAPTION|SCRIPT
  content          String?          // Asset content/URL
  platform         String?          // 'meta'|'tiktok'|'linkedin'|'email'
  sourceBlogId     String?          // Parent blog post
  campaignId       String?          // Associated campaign
  performanceScore Decimal?         // 0.0-1.0 quality score
  reuseCount       Int              // Times used
  aiGenerated      Boolean          // AI-created?
  metadata         Json?            // Platform-specific data
  createdAt        DateTime
  updatedAt        DateTime
  sourceBlog       BlogPost?        // Relationship
  campaign         Campaign?        // Relationship
}
```

### SEOMetric
```prisma
model SEOMetric {
  id              String
  blogPostId      String
  date            DateTime @db.Date
  impressions     Int             // Google Search Console
  clicks          Int
  ctr             Decimal?        // Click-through rate
  avgPosition     Decimal?        // SERP position (1-100)
  keywordsRanked  Int             // How many keywords ranking
  createdAt       DateTime
  @@unique([blogPostId, date])    // One metric per day
  blogPost        BlogPost
}
```

### AIAgentLog
```prisma
model AIAgentLog {
  id              String
  agentName       String  // 'mira'|'leo'|'rin'
  actionType      String  // 'GENERATE_BLOG'|'REPURPOSE_CONTENT'
  inputData       Json?   // What was requested
  outputData      Json?   // What was generated
  modelUsed       String  // 'haiku'|'sonnet'|'pending'
  tokensUsed      Int?    // API token count
  executionTimeMs Int?    // Duration in ms
  success         Boolean // Did it work?
  errorMessage    String? // Error details
  createdAt       DateTime
  // Indexes for fast queries
  @@index([agentName])
  @@index([actionType])
  @@index([createdAt])
}
```

### WorkflowRun
```prisma
model WorkflowRun {
  id              String
  workflowName    String   // 'blog-publisher'|'content-repurposer'
  triggerType     String   // 'SCHEDULED'|'EVENT'|'MANUAL'
  status          String   // 'RUNNING'|'SUCCESS'|'FAILED'
  stepsCompleted  Int      // Progress tracking
  stepsTotal      Int?     // Total steps
  executionLog    Json?    // Detailed log
  createdAt       DateTime
  completedAt     DateTime?
}
```

---

## 🔄 Request Flow Examples

### Example 1: Generate Blog Post

```
User Request
  ↓
POST /marketing/blog/generate
{
  "title": "How to Find Dry Cleaning Near You",
  "theme": "local_seo",
  "city": "Ottawa"
}
  ↓
MarketingController.generateBlog()
  ↓
OrchestratorService.routeToAgent('mira', 'GENERATE_BLOG', data)
  ↓
[Assess Complexity = 1.0 → Use Sonnet]
  ↓
SonnetService.miraBlogGeneration()
  ├─ Call Claude Sonnet API
  ├─ Generate 2000+ word article
  ├─ Create SEO metadata
  ├─ Generate schema.org markup
  └─ Save to BlogPost (PENDING_REVIEW status)
  ↓
AIAgentLog entry created:
{
  "agentName": "mira",
  "actionType": "GENERATE_BLOG",
  "modelUsed": "sonnet",
  "tokensUsed": 8234,
  "success": true
}
  ↓
Response to user:
{
  "success": true,
  "agentName": "mira",
  "result": {
    "title": "...",
    "content": "...",
    "keywords": [...],
    "metaDescription": "..."
  },
  "tokensUsed": 8234,
  "executionTime": 15234
}
```

### Example 2: Repurpose Content

```
User Request
  ↓
POST /marketing/content/repurpose
{
  "blogPostId": "cuid123",
  "platforms": ["linkedin", "instagram", "tiktok"]
}
  ↓
MarketingController.repurposeContent()
  ↓
OrchestratorService.routeToAgent('leo', 'REPURPOSE_CONTENT', data)
  ↓
[Assess Complexity = 0.9 → Use Sonnet]
  ↓
SonnetService.leoContentRepurposing()
  ├─ Call Claude Sonnet API
  ├─ For each platform:
  │  ├─ Create native post format
  │  ├─ Adapt tone and style
  │  ├─ Generate platform-specific CTA
  │  └─ Suggest hashtags and posting time
  └─ Return multi-platform content
  ↓
ContentAsset entries created:
[
  { type: 'COPY', platform: 'linkedin', content: '...', performanceScore: null },
  { type: 'COPY', platform: 'instagram', content: '...', performanceScore: null },
  { type: 'SCRIPT', platform: 'tiktok', content: '...', performanceScore: null }
]
  ↓
Response: Multi-platform content ready for review
```

### Example 3: Monitor Performance

```
Scheduled Trigger (Daily 9 AM)
  ↓
OrchestratorService.pollTriggers()
  ├─ Check if blog generation is due
  ├─ Check campaign metrics
  └─ If underperforming: route to Rin
  ↓
OrchestratorService.routeToAgent('rin', 'ANALYZE_PERFORMANCE', campaigns)
  ↓
[Assess Complexity = 0.6 → Use Haiku or Sonnet]
  ↓
If Sonnet:
  SonnetService.rinAnalysis()
  ├─ Analyze campaign data
  ├─ Generate insights
  ├─ Recommend next actions
  └─ Return recommendations
  ↓
AIAgentLog + recommendations sent to admin via notification
```

---

## 🔐 Security & Authentication

All marketing endpoints require:
- JWT token in `Authorization` header
- `ADMIN` role for write operations
- Read operations available to authenticated users

```typescript
@Controller('marketing')
@UseGuards(JwtAuthGuard)
export class MarketingController {
  @Post('campaigns')
  @Roles('ADMIN')  // Only admins can create campaigns
  async createCampaign(@Body() dto: CreateCampaignDto) { ... }
}
```

---

## 💰 Cost Model

### API Costs (Per 1M Tokens)
- **Haiku Input**: $0.80 (lightweight routing)
- **Haiku Output**: $0.25 (simple analysis)
- **Sonnet Input**: $3.00 (blog generation)
- **Sonnet Output**: $15.00 (complex content)

### Example: Generate One Blog Post
- Input tokens: ~2,000 (Haiku assessment + Sonnet prompt)
- Output tokens: ~4,000 (Haiku response + Sonnet content)
- Cost: `(2000 * 0.0025) + (4000 * 0.015) = $65 per million tokens`
- **Per blog**: ~$0.26 (with current model)

### Monthly Estimate
- 10 blogs/month: ~$2.60
- 50 blog repurposing sessions: ~$6.50
- 20 analytics analyses: ~$1.50
- **Total: ~$11/month** (far cheaper than agencies)

---

## 🔌 Integration Points

### Phase 2: Frontend Dashboard
- Next.js app consuming `/marketing/*` endpoints
- Real-time updates via Server-Sent Events
- Admin approval workflows

### Phase 3: n8n Workflows
- Blog Publisher workflow (daily schedule)
- Content Repurposer workflow (on blog publish)
- SEO Monitor workflow (weekly SERP tracking)
- Social Media Scheduler workflow (coordinated posting)

### Phase 4: External Services
- Google Search Console API (SERP tracking)
- Meta Graph API (organic posting)
- Leonardo AI API (image generation)
- Google Analytics 4 (performance metrics)

---

## 📊 Key Metrics

| Metric | Current | Target (3mo) |
|--------|---------|--------------|
| Blogs/month | 0 | 60 |
| Keywords ranked | 0 | 500+ |
| Organic traffic | 0 | 5,000+ visits |
| Content assets created | 0 | 500+ |
| AI operations cost | $0 | ~$50/mo |
| Automation rate | 0% | 80%+ |

---

## 🚀 Getting Started

### 1. Setup Environment
```bash
# Add to .env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...
```

### 2. Run Database Migration
```bash
cd packages/database
npx prisma migrate deploy
```

### 3. Install Dependencies
```bash
npm install  # Installs @anthropic-ai/sdk
```

### 4. Test API
```bash
# Generate a blog post
curl -X POST http://localhost:3000/marketing/blog/generate \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Blog",
    "theme": "local_seo",
    "city": "Ottawa"
  }'
```

---

## 📚 API Reference

### Campaigns
- `POST /marketing/campaigns` - Create
- `GET /marketing/campaigns` - List
- `GET /marketing/campaigns/:id` - Get one
- `PATCH /marketing/campaigns/:id/status` - Update status

### Blogs
- `POST /marketing/blog/generate` - AI generate
- `POST /marketing/blog` - Create manually
- `GET /marketing/blog` - List
- `GET /marketing/blog/:idOrSlug` - Get one
- `PATCH /marketing/blog/:id/content` - Update content
- `PATCH /marketing/blog/:id/status` - Publish/archive

### Content
- `POST /marketing/content/repurpose` - Repurpose blog

### Analytics
- `GET /marketing/analytics/seo/:blogPostId` - SEO metrics
- `PATCH /marketing/analytics/seo/:blogPostId` - Update metrics
- `GET /marketing/analytics/insights` - AI insights

### System
- `GET /marketing/logs` - AI operation logs
- `GET /marketing/workflows` - Workflow runs
- `POST /marketing/workflows/:name/trigger` - Trigger workflow

---

## 🎯 Phase Roadmap

| Phase | Focus | Timeline | Status |
|-------|-------|----------|--------|
| Phase 1 | Core infrastructure (backend) | Week 1-4 | ✅ Week 1 Complete |
| Phase 2 | Frontend dashboard | Week 5-8 | ⏳ Starting Week 2 |
| Phase 3 | Workflow automation (n8n) | Week 9-12 | ⏳ Starting Week 9 |
| Phase 4 | Advanced analytics & learning | Week 13+ | ⏳ Post-week-12 |

---

## 📝 Notes

- All AI operations are logged to `AIAgentLog` for audit trail
- Blog posts require human approval before publishing
- Each platform in content repurposing gets unique formatting
- SEO metrics updated daily by polling Google Search Console
- Costs scale with usage (only pay for what you use)

---

**Architecture designed for autonomous marketing at scale.**
