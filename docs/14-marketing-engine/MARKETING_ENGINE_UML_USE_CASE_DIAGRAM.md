# Marketing Workflow Engine - Complete UML Use Case Diagram

## Overview
This document contains the complete UML Use Case Diagram for the Marketing Workflow Engine, an AI-powered autonomous marketing automation platform that manages multi-brand campaigns, generates content across 10+ platforms, and optimizes results with machine learning feedback loops.

---

## System Architecture at a Glance
- **337+ API Endpoints** across 12 controllers
- **89 Backend Services** across 27 service domains
- **20+ Database Models** for marketing operations
- **10+ Platform Integrations** (Facebook, Instagram, LinkedIn, TikTok, Twitter, Pinterest, Reddit, YouTube, Medium, Quora)
- **AI-Powered Orchestration** via Claude 3.5 Sonnet/Haiku
- **Autonomous Campaign Execution** with 90% automation target

---

## Mermaid UML Use Case Diagram

```mermaid
graph TB
    %% ============================================
    %% ACTORS
    %% ============================================
    User[👤 User<br/>Marketing Manager]
    Admin[👤 System Administrator]
    AI[🤖 AI Engine<br/>Claude Orchestrator]
    SocialPlatforms[🌐 External Social Platforms<br/>Facebook, Instagram, LinkedIn,<br/>TikTok, Twitter, Pinterest,<br/>Reddit, YouTube, Medium, Quora]
    TrendAPIs[📊 Trend Data APIs<br/>Google Trends, Twitter API,<br/>Reddit API, TikTok Trends,<br/>YouTube Trends]
    VideoServices[🎬 Video Generation Services<br/>Runway Gen-3, Pika Labs,<br/>ElevenLabs, Suno AI]
    SEOTools[🔍 SEO Data Providers<br/>Google Search Console,<br/>Ahrefs, SEMrush]

    %% ============================================
    %% SUBSYSTEM 1: AUTHENTICATION & ACCOUNT SYSTEM
    %% ============================================
    subgraph Auth["🔐 Authentication & Account System"]
        UC001[UC001: Login to Platform]
        UC002[UC002: Sign Up / Create Account]
        UC003[UC003: Manage User Session]
        UC004[UC004: Reset Password]
        UC005[UC005: Verify Email]
        UC006[UC006: Logout]
    end

    %% ============================================
    %% SUBSYSTEM 2: BUSINESS PROFILE MANAGER
    %% ============================================
    subgraph ProfileMgr["🏢 Business Profile Manager"]
        UC010[UC010: Create Business Profile]
        UC011[UC011: Extract Brand DNA<br/>Mission, Tone, Niche,<br/>Audience, Vision]
        UC012[UC012: Answer DNA Questions]
        UC013[UC013: Select Marketing Platforms]
        UC014[UC014: Configure Profile Settings]
        UC015[UC015: View Profile Dashboard]
        UC016[UC016: Edit Profile Information]
        UC017[UC017: Archive Profile]
        UC018[UC018: Activate/Pause Profile]
        UC019[UC019: View Profile Analytics]
        UC020[UC020: Manage Multiple Profiles]
        UC021[UC021: Generate Marketing Strategy]
        UC022[UC022: Analyze Market Landscape]
        UC023[UC023: Calculate Profile Completeness]
    end

    %% ============================================
    %% SUBSYSTEM 3: PLATFORM CONNECTOR
    %% ============================================
    subgraph PlatformConn["🔌 Platform Connector API Integration"]
        UC030[UC030: Connect Platform via OAuth]
        UC031[UC031: Connect Platform via API Key]
        UC032[UC032: Test Connection Health]
        UC033[UC033: Disconnect Platform]
        UC034[UC034: Refresh OAuth Token]
        UC035[UC035: View Connected Platforms]
        UC036[UC036: Configure Platform Settings]
        UC037[UC037: Monitor Connection Status]
        UC038[UC038: Handle OAuth Redirect]
        UC039[UC039: Validate API Credentials]
        UC040[UC040: Sync Platform Data]
    end

    %% ============================================
    %% SUBSYSTEM 4: CAMPAIGN CREATOR
    %% ============================================
    subgraph CampaignCreate["🎯 Campaign Creator"]
        UC050[UC050: Choose Campaign Mode<br/>Autonomous vs Custom]
        UC051[UC051: Enter Campaign Name]
        UC052[UC052: Link Business Profile]
        UC053[UC053: Define Campaign Topic/Theme]
        UC054[UC054: Write Campaign Description]
        UC055[UC055: Select Industry/Niche]
        UC056[UC056: Choose Campaign Tone<br/>Multi-select]
        UC057[UC057: Set Campaign Budget]
        UC058[UC058: Preview Budget Impact]
        UC059[UC059: Define Timeline]
        UC060[UC060: Select Target Platforms]
        UC061[UC061: Set Campaign Goal<br/>Traffic, Leads, Conversions]
        UC062[UC062: Analyze Trends<br/>Trigger Trend Collector]
        UC063[UC063: Save Campaign Draft]
    end

    %% ============================================
    %% SUBSYSTEM 5: TREND INTELLIGENCE SUITE
    %% ============================================
    subgraph TrendSuite["📈 Trend Intelligence Suite"]
        UC070[UC070: Determine Trend Strategy<br/>Niche, Communities, Hashtags]
        UC071[UC071: Fetch Live Trends<br/>Multi-platform]
        UC072[UC072: Collect Google Trends Data]
        UC073[UC073: Collect Twitter Trends]
        UC074[UC074: Collect Reddit Weak Signals]
        UC075[UC075: Collect TikTok Trends]
        UC076[UC076: Collect YouTube Trends]
        UC077[UC077: Analyze Trend Relevance]
        UC078[UC078: Score Trend Virality]
        UC079[UC079: Predict Viral Opportunities]
        UC080[UC080: Identify Early Signals]
        UC081[UC081: Analyze Trend Lifecycle]
        UC082[UC082: Detect Trending Communities]
        UC083[UC083: Generate Trend Report]
        UC084[UC084: Track Trend History]
        UC085[UC085: Forecast Trend Growth]
    end

    %% ============================================
    %% SUBSYSTEM 6: SEO REACTOR
    %% ============================================
    subgraph SEOReactor["🔍 SEO Reactor"]
        UC090[UC090: Analyze Keywords]
        UC091[UC091: Discover Keyword Universe]
        UC092[UC092: Identify Quick Win Keywords]
        UC093[UC093: Develop Long-term SEO Strategy]
        UC094[UC094: Platform-specific SEO Optimization]
        UC095[UC095: Track SERP Rankings]
        UC096[UC096: Analyze Competitor SEO]
        UC097[UC097: Identify Featured Snippet Opportunities]
        UC098[UC098: Generate Programmatic Pages]
        UC099[UC099: Optimize Meta Tags]
        UC100[UC100: Generate Schema Markup]
        UC101[UC101: Build Content Clusters]
        UC102[UC102: Analyze Keyword Difficulty]
        UC103[UC103: Calculate Search Intent]
        UC104[UC104: Generate SEO Intelligence Package]
    end

    %% ============================================
    %% SUBSYSTEM 7: CAMPAIGN ORCHESTRATOR
    %% ============================================
    subgraph Orchestrator["🎼 Campaign Orchestrator AI Workflow Builder"]
        UC110[UC110: Plan Content Strategy]
        UC111[UC111: Build Content Calendar]
        UC112[UC112: Generate Text Content AI]
        UC113[UC113: Generate Image Assets AI]
        UC114[UC114: Generate Video Scripts AI]
        UC115[UC115: Generate Social Posts AI]
        UC116[UC116: Repurpose Content Across Platforms]
        UC117[UC117: Determine Optimal Posting Times]
        UC118[UC118: Calculate Posting Cadence]
        UC119[UC119: Present Visual Campaign Summary]
        UC120[UC120: Display Trend Insights]
        UC121[UC121: Display SEO Recommendations]
        UC122[UC122: Display Content Preview]
        UC123[UC123: Allow Human Review]
        UC124[UC124: Modify Campaign Content]
        UC125[UC125: Approve Campaign Plan]
        UC126[UC126: Reject & Regenerate]
    end

    %% ============================================
    %% SUBSYSTEM 8: PUBLISHING ENGINE
    %% ============================================
    subgraph Publishing["📤 Publishing Engine Multi-Platform Distribution"]
        UC140[UC140: Schedule Content]
        UC141[UC141: Publish to Facebook]
        UC142[UC142: Publish to Instagram]
        UC143[UC143: Publish to LinkedIn]
        UC144[UC144: Publish to TikTok]
        UC145[UC145: Publish to Twitter/X]
        UC146[UC146: Publish to Pinterest]
        UC147[UC147: Publish to Reddit]
        UC148[UC148: Publish to YouTube]
        UC149[UC149: Publish to Medium]
        UC150[UC150: Publish to Quora]
        UC151[UC151: Modify Post Times]
        UC152[UC152: Edit Post Captions]
        UC153[UC153: Modify Platform Selection]
        UC154[UC154: Manage Publishing Queue]
        UC155[UC155: Monitor Publishing Status]
        UC156[UC156: Retry Failed Publications]
        UC157[UC157: Bulk Publish Content]
    end

    %% ============================================
    %% SUBSYSTEM 9: CAMPAIGN MANAGER DASHBOARD
    %% ============================================
    subgraph CampaignMgr["📊 Campaign Manager Dashboard"]
        UC170[UC170: View All Campaigns]
        UC171[UC171: Filter Campaigns by Status]
        UC172[UC172: View Campaign Details]
        UC173[UC173: Start Campaign]
        UC174[UC174: Pause Campaign]
        UC175[UC175: Resume Campaign]
        UC176[UC176: End Campaign]
        UC177[UC177: Manage Platform within Campaign]
        UC178[UC178: Monitor Live Post Status]
        UC179[UC179: View Campaign Timeline]
        UC180[UC180: Track Campaign Progress]
        UC181[UC181: View Publishing Schedule]
    end

    %% ============================================
    %% SUBSYSTEM 10: ANALYTICS & ADS MANAGER
    %% ============================================
    subgraph Analytics["📈 Analytics & Ads Manager"]
        UC190[UC190: View Analytics Dashboard]
        UC191[UC191: List All Campaigns with KPIs]
        UC192[UC192: Drill Down into Campaign]
        UC193[UC193: Filter Analytics by Platform]
        UC194[UC194: Track Impressions]
        UC195[UC195: Track Engagement Rate]
        UC196[UC196: Track Click-Through Rate]
        UC197[UC197: Track Conversions]
        UC198[UC198: Track ROI]
        UC199[UC199: View Ad Performance]
        UC200[UC200: Manage Ad Spending]
        UC201[UC201: Start/Stop Ads]
        UC202[UC202: Monitor Budget Utilization]
        UC203[UC203: Export Analytics Report]
        UC204[UC204: View Real-time Metrics]
        UC205[UC205: Compare Campaign Performance]
        UC206[UC206: Analyze Audience Demographics]
    end

    %% ============================================
    %% SUBSYSTEM 11: OPTIMIZER & FEEDBACK LOOP
    %% ============================================
    subgraph Optimizer["⚡ Optimizer & Feedback Loop ML-Powered"]
        UC220[UC220: View Optimizer Dashboard]
        UC221[UC221: Run A/B Tests]
        UC222[UC222: Create Test Variants]
        UC223[UC223: Analyze Test Results]
        UC224[UC224: Track Multi-Touch Attribution]
        UC225[UC225: Analyze Attribution Paths]
        UC226[UC226: Generate ML Recommendations]
        UC227[UC227: Predict Content Performance]
        UC228[UC228: Optimize Current Campaign]
        UC229[UC229: Improve Future Strategy Patterns]
        UC230[UC230: Build Campaign Memory]
        UC231[UC231: Learn from Past Campaigns]
        UC232[UC232: Identify Optimization Opportunities]
        UC233[UC233: Apply Smart Bidding]
        UC234[UC234: Optimize Posting Schedule]
        UC235[UC235: View Optimization History]
    end

    %% ============================================
    %% SUBSYSTEM 12: CONTENT STUDIO
    %% ============================================
    subgraph ContentStudio["✍️ Content Creation Studio"]
        UC250[UC250: Generate Blog Post AI]
        UC251[UC251: Generate Long-form Article]
        UC252[UC252: Repurpose Blog to Social]
        UC253[UC253: Generate Twitter Threads]
        UC254[UC254: Generate LinkedIn Posts]
        UC255[UC255: Generate Instagram Captions]
        UC256[UC256: Generate TikTok Scripts]
        UC257[UC257: Generate YouTube Scripts]
        UC258[UC258: View Content Library]
        UC259[UC259: Edit Generated Content]
        UC260[UC260: Validate Content Quality]
        UC261[UC261: Optimize Content for SEO]
        UC262[UC262: Generate Content Variations]
    end

    %% ============================================
    %% SUBSYSTEM 13: VIDEO STUDIO
    %% ============================================
    subgraph VideoStudio["🎬 Video Studio"]
        UC270[UC270: Generate Video Script]
        UC271[UC271: Create Script Variations]
        UC272[UC272: Optimize Video Metadata]
        UC273[UC273: Generate Video Hashtags]
        UC274[UC274: Format for Platform Specs]
        UC275[UC275: Generate FFmpeg Commands]
        UC276[UC276: Create Video DNA Profile]
        UC277[UC277: Generate Video with Runway]
        UC278[UC278: Generate Video with Pika]
        UC279[UC279: Synthesize Voice with ElevenLabs]
        UC280[UC280: Generate Music with Suno AI]
        UC281[UC281: Validate Video Quality]
        UC282[UC282: View Video Production Stats]
    end

    %% ============================================
    %% SUBSYSTEM 14: LINK BUILDING ENGINE
    %% ============================================
    subgraph LinkBuilding["🔗 Link Building Engine"]
        UC290[UC290: Monitor HARO Queries]
        UC291[UC291: Generate HARO Responses]
        UC292[UC292: Find Broken Links]
        UC293[UC293: Create Outreach Emails]
        UC294[UC294: Discover Partnership Opportunities]
        UC295[UC295: Generate Partnership Proposals]
        UC296[UC296: Identify Resource Pages]
        UC297[UC297: Track Backlink Acquisition]
        UC298[UC298: Monitor Backlink Quality]
        UC299[UC299: Analyze Domain Authority]
    end

    %% ============================================
    %% SUBSYSTEM 15: INTELLIGENCE DASHBOARD
    %% ============================================
    subgraph Intelligence["🧠 Intelligence Dashboard"]
        UC310[UC310: View Neural Narrative Insights]
        UC311[UC311: Generate Story Narratives]
        UC312[UC312: View Growth Forecasts]
        UC313[UC313: Track Organic Growth]
        UC314[UC314: View Algorithm Intelligence]
        UC315[UC315: Decode Platform Algorithms]
        UC316[UC316: View E-E-A-T Audit]
        UC317[UC317: Build Authority Roadmap]
        UC318[UC318: Analyze Competitive Warfare]
        UC319[UC319: View Creative Intelligence]
        UC320[UC320: Generate Creative Variations]
    end

    %% ============================================
    %% SUBSYSTEM 16: ML LAB
    %% ============================================
    subgraph MLLab["🔬 ML Lab"]
        UC330[UC330: View ML Dashboard]
        UC331[UC331: Forecast Trend Growth]
        UC332[UC332: Predict Content Performance]
        UC333[UC333: Run Smart A/B Tests]
        UC334[UC334: Apply Thompson Sampling]
        UC335[UC335: Cluster Keywords Semantically]
        UC336[UC336: Identify Keyword Pillars]
        UC337[UC337: Predict Campaign Success]
        UC338[UC338: Compare Strategy Options]
        UC339[UC339: View Model Status]
        UC340[UC340: Train ML Models]
    end

    %% ============================================
    %% SUBSYSTEM 17: WORKFLOWS
    %% ============================================
    subgraph Workflows["⚙️ Workflows & Automation"]
        UC350[UC350: View Workflow Dashboard]
        UC351[UC351: Run SEO Workflow]
        UC352[UC352: Analyze SEO Opportunities]
        UC353[UC353: Execute SEO Plan]
        UC354[UC354: Run Trend Workflow]
        UC355[UC355: Detect Viral Trends]
        UC356[UC356: Generate Trend Content]
        UC357[UC357: Monitor Workflow Health]
        UC358[UC358: View Workflow Status]
        UC359[UC359: Configure Workflow Settings]
    end

    %% ============================================
    %% SUBSYSTEM 18: SYSTEM MONITORING
    %% ============================================
    subgraph Monitoring["🔧 System Monitoring"]
        UC370[UC370: View System Health Dashboard]
        UC371[UC371: Monitor Performance Metrics]
        UC372[UC372: View Cache Statistics]
        UC373[UC373: Clear Cache]
        UC374[UC374: Analyze Slow Queries]
        UC375[UC375: Detect N+1 Queries]
        UC376[UC376: Optimize Database Performance]
        UC377[UC377: View System Logs]
        UC378[UC378: Configure Alerts]
        UC379[UC379: Monitor API Rate Limits]
    end

    %% ============================================
    %% ACTOR RELATIONSHIPS - PRIMARY FLOWS
    %% ============================================

    %% User connections to subsystems
    User --> UC001
    User --> UC002
    User --> UC010
    User --> UC030
    User --> UC050
    User --> UC123
    User --> UC125
    User --> UC140
    User --> UC170
    User --> UC190
    User --> UC220
    User --> UC250
    User --> UC270

    %% Admin connections
    Admin --> UC370
    Admin --> UC371
    Admin --> UC372
    Admin --> UC376

    %% AI Engine connections (Autonomous operations)
    AI --> UC070
    AI --> UC090
    AI --> UC110
    AI --> UC112
    AI --> UC113
    AI --> UC114
    AI --> UC115
    AI --> UC116
    AI --> UC226
    AI --> UC227
    AI --> UC250
    AI --> UC270
    AI --> UC291
    AI --> UC311
    AI --> UC331
    AI --> UC332

    %% External Platform connections
    SocialPlatforms --> UC141
    SocialPlatforms --> UC142
    SocialPlatforms --> UC143
    SocialPlatforms --> UC144
    SocialPlatforms --> UC145
    SocialPlatforms --> UC146
    SocialPlatforms --> UC147
    SocialPlatforms --> UC148
    SocialPlatforms --> UC149
    SocialPlatforms --> UC150
    SocialPlatforms --> UC194
    SocialPlatforms --> UC195
    SocialPlatforms --> UC196
    SocialPlatforms --> UC197

    %% Trend API connections
    TrendAPIs --> UC072
    TrendAPIs --> UC073
    TrendAPIs --> UC074
    TrendAPIs --> UC075
    TrendAPIs --> UC076

    %% Video Service connections
    VideoServices --> UC277
    VideoServices --> UC278
    VideoServices --> UC279
    VideoServices --> UC280

    %% SEO Tool connections
    SEOTools --> UC095
    SEOTools --> UC096
    SEOTools --> UC297
    SEOTools --> UC298

    %% ============================================
    %% INCLUDE RELATIONSHIPS
    %% ============================================
    UC030 -.->|includes| UC038
    UC031 -.->|includes| UC039
    UC050 -.->|includes| UC062
    UC062 -.->|includes| UC070
    UC070 -.->|includes| UC071
    UC071 -.->|includes| UC072
    UC071 -.->|includes| UC073
    UC071 -.->|includes| UC074
    UC125 -.->|includes| UC110
    UC140 -.->|includes| UC030
    UC141 -.->|includes| UC030
    UC142 -.->|includes| UC030
    UC143 -.->|includes| UC030
    UC250 -.->|includes| UC261
    UC270 -.->|includes| UC272

    %% ============================================
    %% EXTEND RELATIONSHIPS
    %% ============================================
    UC057 -.->|extends| UC058
    UC110 -.->|extends| UC117
    UC221 -.->|extends| UC223
    UC224 -.->|extends| UC225
    UC250 -.->|extends| UC252

    %% ============================================
    %% STYLING
    %% ============================================
    classDef userActor fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    classDef aiActor fill:#9B59B6,stroke:#6C3483,stroke-width:3px,color:#fff
    classDef externalActor fill:#E67E22,stroke:#BA6415,stroke-width:3px,color:#fff
    classDef subsystem fill:#ECF0F1,stroke:#7F8C8D,stroke-width:2px
    classDef usecase fill:#3498DB,stroke:#2874A6,stroke-width:1px,color:#fff

    class User,Admin userActor
    class AI aiActor
    class SocialPlatforms,TrendAPIs,VideoServices,SEOTools externalActor
```

---

## Diagram Legend

### Actors
| Icon | Actor | Role | Type |
|------|-------|------|------|
| 👤 | User (Marketing Manager) | Primary operator who creates profiles, campaigns, and monitors performance | Primary Actor |
| 👤 | System Administrator | Manages system health, performance, and configuration | Secondary Actor |
| 🤖 | AI Engine (Claude Orchestrator) | Autonomous AI system that handles trend analysis, content generation, optimization | System Actor |
| 🌐 | External Social Platforms | Facebook, Instagram, LinkedIn, TikTok, Twitter, Pinterest, Reddit, YouTube, Medium, Quora | External System |
| 📊 | Trend Data APIs | Google Trends, Twitter API, Reddit API, TikTok Trends, YouTube Trends | External System |
| 🎬 | Video Generation Services | Runway Gen-3, Pika Labs, ElevenLabs, Suno AI | External System |
| 🔍 | SEO Data Providers | Google Search Console, Ahrefs, SEMrush | External System |

### Subsystems (18 Total)
1. **Authentication & Account System** - User login, signup, session management
2. **Business Profile Manager** - Brand DNA extraction, multi-profile management
3. **Platform Connector** - OAuth/API key integration with 10+ platforms
4. **Campaign Creator** - Autonomous/Custom campaign setup
5. **Trend Intelligence Suite** - Multi-platform trend collection and analysis
6. **SEO Reactor** - Keyword analysis, programmatic pages, SERP tracking
7. **Campaign Orchestrator** - AI-powered content strategy and generation
8. **Publishing Engine** - Multi-platform content distribution
9. **Campaign Manager Dashboard** - Campaign lifecycle management
10. **Analytics & Ads Manager** - Performance tracking and ad management
11. **Optimizer & Feedback Loop** - A/B testing, attribution, ML optimization
12. **Content Creation Studio** - Blog generation, content repurposing
13. **Video Studio** - Script generation, video production, metadata optimization
14. **Link Building Engine** - HARO, broken links, partnerships
15. **Intelligence Dashboard** - Narrative, growth, algorithm intelligence
16. **ML Lab** - Trend forecasting, performance prediction, keyword clustering
17. **Workflows & Automation** - SEO and trend workflow automation
18. **System Monitoring** - Performance, caching, query optimization

### Use Case Count: 120+ Use Cases
| Subsystem | Use Cases | Implementation Status |
|-----------|-----------|----------------------|
| Authentication | 6 | ✅ Complete (100%) |
| Profile Manager | 14 | ⚠️ Backend Complete (100%), Frontend (0%) |
| Platform Connector | 11 | ⚠️ Partial (40%) |
| Campaign Creator | 14 | ✅ Working (80%) |
| Trend Intelligence | 16 | ⚠️ Backend (75%), APIs Partial (50%) |
| SEO Reactor | 15 | ⚠️ Backend (85%), No GSC Integration |
| Campaign Orchestrator | 17 | ✅ Core Working (70%) |
| Publishing Engine | 18 | ⚠️ Coded (100%), Not Production-Tested |
| Campaign Manager | 12 | ✅ Working (80%) |
| Analytics & Ads | 17 | ✅ Working (75%) |
| Optimizer | 16 | ⚠️ Backend (85%), Frontend (0%) |
| Content Studio | 13 | ✅ Working (90%) |
| Video Studio | 13 | ⚠️ Scripts Only (20%), No Video Gen |
| Link Building | 10 | ⚠️ Backend (80%), Mock Data |
| Intelligence | 11 | ⚠️ Backend (70%), Frontend (0%) |
| ML Lab | 11 | ⚠️ Backend (85%), Frontend (0%) |
| Workflows | 10 | ⚠️ Partial (35%) |
| System Monitoring | 10 | ⚠️ Backend (75%), Frontend Minimal |

---

## Key Workflow Sequences

### 🎯 Autonomous Campaign Workflow (End-to-End)
```
User Creates Campaign (UC050)
    ↓
System Triggers Trend Collection (UC062 → UC070)
    ↓ includes
AI Fetches Multi-Platform Trends (UC071)
    ↓ includes
AI Collects Google/Twitter/Reddit/TikTok/YouTube Trends (UC072-076)
    ↓
AI Analyzes & Scores Trends (UC077-078)
    ↓
AI Generates Trend Report (UC083)
    ↓
System Triggers SEO Reactor (UC090)
    ↓
AI Analyzes Keywords & Identifies Opportunities (UC091-092)
    ↓
AI Develops SEO Strategy (UC093-094)
    ↓
AI Generates SEO Intelligence Package (UC104)
    ↓
System Triggers Campaign Orchestrator (UC110)
    ↓
AI Plans Content Strategy (UC110-111)
    ↓
AI Generates All Content Assets (UC112-115)
    ↓ includes
AI Determines Optimal Posting Times (UC117)
    ↓
System Presents Visual Summary (UC119-122)
    ↓
User Reviews & Approves (UC123-125)
    ↓
System Schedules Content (UC140)
    ↓ includes
System Publishes to All Platforms (UC141-150)
    ↓
System Tracks Analytics (UC190-197)
    ↓
AI Generates Optimization Recommendations (UC226-227)
    ↓
System Applies Optimizations (UC228-229)
    ↓
AI Builds Campaign Memory (UC230-231)
    [Loop for continuous improvement]
```

### 🏢 Profile Onboarding Workflow
```
User Signs Up (UC002)
    ↓
User Creates Business Profile (UC010)
    ↓ includes
System Extracts Brand DNA (UC011)
    ↓ includes
User Answers DNA Questions (UC012)
    ↓
User Selects Marketing Platforms (UC013)
    ↓
User Connects Platforms via OAuth or API Key (UC030-031)
    ↓ includes
System Tests Connection Health (UC032)
    ↓
AI Analyzes Market Landscape (UC022)
    ↓
AI Generates Marketing Strategy (UC021)
    ↓
User Reviews Profile Dashboard (UC015)
    ↓
User Launches First Campaign (UC050)
```

### ✍️ Content Creation & Distribution Workflow
```
User Generates Blog Post (UC250)
    ↓ extends
AI Optimizes for SEO (UC261)
    ↓ extends
AI Repurposes to Social (UC252)
    ↓
AI Generates Platform-Specific Posts (UC253-257)
    ↓
User Reviews & Edits (UC259)
    ↓
User Schedules Content (UC140)
    ↓ includes
System Authenticates with Platforms (UC030)
    ↓
System Publishes to Multiple Platforms (UC141-150)
    ↓
Platforms Return Analytics Data (UC194-197)
    ↓
System Displays Real-time Metrics (UC204)
```

### 🎬 Video Production Workflow (Planned)
```
User Generates Video Script (UC270)
    ↓
AI Creates Script Variations (UC271)
    ↓ includes
AI Optimizes Video Metadata (UC272)
    ↓
User Creates Video DNA Profile (UC276)
    ↓
AI Generates Video with Runway Gen-3 (UC277)
    [OR]
AI Generates Video with Pika Labs (UC278)
    ↓
AI Synthesizes Voice with ElevenLabs (UC279)
    ↓
AI Generates Music with Suno AI (UC280)
    ↓
System Validates Video Quality (UC281)
    ↓
AI Formats for Platform Specs (UC274)
    ↓
User Publishes to YouTube/TikTok (UC148/UC144)
```

### ⚡ Optimization & Learning Loop
```
Campaign Runs (UC173)
    ↓
System Tracks Performance (UC190-197)
    ↓
AI Analyzes Attribution Data (UC224-225)
    ↓
AI Runs A/B Tests (UC221-223)
    ↓
AI Predicts Content Performance (UC227)
    ↓
AI Generates ML Recommendations (UC226)
    ↓
System Applies Optimizations (UC228)
    ↓
AI Builds Campaign Memory (UC230)
    ↓
AI Improves Future Strategies (UC229)
    [Continuous feedback loop]
```

---

## Relationship Types

### Include Relationships (<<include>>)
Used when a use case **always** requires another use case to complete:
- **UC030 (Connect via OAuth)** includes **UC038 (Handle OAuth Redirect)**
- **UC062 (Analyze Trends)** includes **UC070 (Determine Trend Strategy)**
- **UC071 (Fetch Live Trends)** includes **UC072-076 (Platform-specific collection)**
- **UC125 (Approve Campaign)** includes **UC110 (Plan Content Strategy)**
- **UC140 (Schedule Content)** includes **UC030 (Platform Authentication)**
- **UC250 (Generate Blog)** includes **UC261 (Optimize for SEO)**

### Extend Relationships (<<extend>>)
Used when a use case **optionally** adds behavior to another:
- **UC057 (Set Budget)** extends **UC058 (Preview Budget Impact)**
- **UC110 (Plan Strategy)** extends **UC117 (Determine Posting Times)**
- **UC221 (Run A/B Tests)** extends **UC223 (Analyze Results)**
- **UC250 (Generate Blog)** extends **UC252 (Repurpose Content)**

### Generalization Relationships
Used when specific use cases are variants of a general one:
- **UC141-150 (Publish to [Specific Platform])** generalize **"Publish Content"**
- **UC072-076 (Collect [Platform] Trends)** generalize **"Fetch Live Trends"**
- **UC253-257 (Generate [Platform] Posts)** generalize **"Generate Social Content"**

---

## Implementation Status Summary

### ✅ Fully Implemented (20-25%)
- Authentication & Account System (UC001-006)
- Campaign Creator Core (UC050-063)
- Content Creation Studio (UC250-262)
- Campaign Manager (UC170-181)
- Analytics Dashboard (UC190-206)
- Basic Profile Management (UC010-020)

### ⚠️ Partially Implemented (40-50%)
- Profile Intelligence (backend complete, frontend 0%)
- Platform Connector (OAuth flows coded, not production-tested)
- Trend Intelligence (Google/Twitter/Reddit working, TikTok/YouTube missing)
- SEO Reactor (backend 85%, no Google Search Console)
- Publishing Engine (all integrations coded, not tested at scale)
- Link Building (backend complete, using mock data)
- Intelligence Dashboard (backend 70%, frontend 0%)
- ML Lab (backend 85%, frontend 0%)
- Optimizer (backend 85%, frontend 0%)

### ❌ Not Implemented (25-30%)
- Video Generation Services (UC277-280) - Critical Gap
- Video Studio UI - No frontend
- ElevenLabs Integration - No voice synthesis
- Suno AI Integration - No music generation
- Content Velocity Orchestrator - Entire phase missing
- Advanced Workflow Automation - Partial backend only
- Real-time SEO tracking via Google Search Console
- Production-grade backlink tracking (Ahrefs/SEMrush)

---

## System Boundaries

### Included in System
- User authentication and authorization
- Multi-profile management with brand DNA extraction
- Platform integration via OAuth and API keys
- Campaign creation (autonomous and custom modes)
- AI-powered trend intelligence and analysis
- SEO automation and keyword universe management
- Content generation (blog posts, social media, video scripts)
- Multi-platform publishing and scheduling
- Real-time analytics and performance tracking
- ML-powered optimization and A/B testing
- Campaign memory and learning system
- Link building automation
- System monitoring and performance optimization

### External Systems (Not Included)
- Social media platforms (Facebook, Instagram, LinkedIn, TikTok, Twitter, Pinterest, Reddit, YouTube, Medium, Quora)
- Trend data providers (Google Trends, Twitter API, Reddit API, TikTok API, YouTube API)
- Video generation services (Runway Gen-3, Pika Labs, ElevenLabs, Suno AI)
- SEO tools (Google Search Console, Ahrefs, SEMrush)
- Email service providers (SendGrid, AWS SES)
- Payment processing (Stripe)
- Cloud infrastructure (AWS, Vercel, Railway)

---

## Technology Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Queue**: Bull (Redis-based)
- **Search**: Elasticsearch (planned)
- **Time-series**: TimescaleDB (planned)
- **Vector DB**: Pinecone (planned)
- **Authentication**: JWT with Passport.js

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React hooks + Context
- **API Client**: Fetch API with custom client

### AI/ML
- **Primary AI**: Claude 3.5 Sonnet (complex tasks)
- **Fast AI**: Claude 3.5 Haiku (simple tasks)
- **Vision**: GPT-4 Vision (image analysis)
- **Video**: Runway Gen-3, Pika Labs (planned)
- **Voice**: ElevenLabs (planned)
- **Music**: Suno AI (planned)
- **Orchestration**: Custom routing system

### External APIs
- **Social**: Facebook Graph API, Instagram API, LinkedIn API, TikTok API, Twitter API v2, YouTube Data API, Pinterest API, Reddit API
- **Trends**: Google Trends via SerpAPI, Twitter Trends, Reddit Hot/New
- **SEO**: Google Search Console (planned), Ahrefs API (planned), SEMrush API (planned)
- **Email**: SendGrid (planned), AWS SES (planned)

---

## Database Schema Overview

### Core Models (20+ Marketing Models)
- **User** - Authentication and user management
- **UserSession** - Session tracking
- **MarketingProfile** - Business profile with brand DNA
- **CampaignOrder** - Campaign configuration
- **Campaign** - Campaign execution details
- **CampaignContent** - Generated content assets
- **CampaignMetric** - Performance metrics
- **CampaignWorkflow** - Workflow state tracking
- **CampaignMemory** - Learning from past campaigns
- **BlogPost** - Long-form content
- **ContentAsset** - Multi-platform content
- **SEOMetric** - SEO performance tracking
- **Keyword** - Keyword universe
- **ProgrammaticPage** - Automated SEO pages
- **SerpResult** - SERP ranking data
- **ContentCluster** - Hub & spoke SEO architecture
- **Backlink** - Link building tracking
- **OutreachCampaign** - Outreach automation
- **TrendData** - Trend intelligence
- **VideoDNA** - Video brand identity
- **VideoAsset** - Video production tracking

---

## Use Case Details (Selected Examples)

### UC010: Create Business Profile
**Actor**: User (Marketing Manager)
**Precondition**: User is authenticated
**Main Flow**:
1. User navigates to "Create Profile" page
2. System displays profile creation wizard
3. User enters business name, industry, and description
4. System triggers DNA extraction questions
5. User answers standardized questions (mission, tone, niche, audience, vision)
6. System calculates profile completeness score
7. User selects target marketing platforms
8. System saves profile and displays dashboard
**Postcondition**: New marketing profile created with 60-80% completeness
**Extensions**:
- 3a. User can upload logo and brand assets
- 5a. System uses AI to suggest tone and audience based on description

### UC050: Choose Campaign Mode (Autonomous vs Custom)
**Actor**: User (Marketing Manager)
**Precondition**: User has at least one marketing profile
**Main Flow**:
1. User clicks "Create New Campaign"
2. System displays campaign mode selection
3. User chooses "Autonomous Campaign" or "Custom Campaign"
4. If Autonomous: System explains AI will handle trend analysis, SEO, content generation, and optimization
5. If Custom: System displays manual configuration forms
6. User proceeds to campaign configuration
**Postcondition**: Campaign mode selected, ready for configuration
**Extensions**:
- 4a. User can switch modes during setup
- 4b. System shows example campaigns for each mode

### UC062: Analyze Trends (Trigger Trend Collector)
**Actor**: User (Marketing Manager), AI Engine
**Precondition**: Campaign details entered
**Main Flow**:
1. User clicks "Analyze Trends" button
2. System validates campaign context (topic, platforms, audience)
3. System triggers AI Engine (UC070: Determine Trend Strategy)
4. AI Engine determines optimal search strategy (niche communities, hashtags, topics)
5. System triggers multi-platform trend collection (UC071-076)
6. AI Engine analyzes and scores trends (UC077-078)
7. System displays ranked trend report (UC083)
8. User reviews trends and proceeds to SEO analysis
**Postcondition**: Trend intelligence generated, ready for SEO Reactor
**Includes**: UC070, UC071, UC072, UC073, UC074, UC075, UC076, UC077, UC078, UC083
**Extensions**:
- 6a. User can filter trends by platform
- 6b. User can manually add/remove trends

### UC125: Approve Campaign Plan
**Actor**: User (Marketing Manager)
**Precondition**: Campaign Orchestrator has generated full campaign plan
**Main Flow**:
1. System displays visual campaign summary (UC119-122)
2. User reviews trend insights, SEO recommendations, content preview, posting schedule
3. User can modify content, captions, posting times
4. User clicks "Approve & Publish"
5. System moves campaign to "Scheduled" status
6. System triggers Publishing Engine (UC140)
**Postcondition**: Campaign approved and scheduled for publishing
**Includes**: UC110, UC119, UC120, UC121, UC122
**Extensions**:
- 3a. User clicks "Reject & Regenerate" (UC126) to restart orchestration
- 3b. User can approve partial content and reject specific pieces

### UC141-150: Publish to [Specific Platform]
**Actor**: AI Engine, External Social Platforms
**Precondition**: Content scheduled and platform connected
**Main Flow**:
1. System retrieves scheduled content for platform
2. System validates content against platform rules (character limits, media specs)
3. System retrieves OAuth token or API key
4. System makes API call to platform
5. Platform accepts content and returns post ID
6. System updates publishing status to "Published"
7. System stores post ID for analytics tracking
**Postcondition**: Content successfully published to platform
**Includes**: UC030 (Authenticate with Platform)
**Extensions**:
- 4a. OAuth token expired → System refreshes token (UC034)
- 4b. API call fails → System retries with exponential backoff (UC156)
- 4c. Content violates platform rules → System notifies user and marks "Failed"

### UC226: Generate ML Recommendations
**Actor**: AI Engine
**Precondition**: Campaign has sufficient performance data
**Main Flow**:
1. System analyzes campaign metrics (impressions, engagement, CTR, conversions)
2. AI Engine predicts content performance using ML models (UC227)
3. AI Engine runs attribution analysis (UC224-225)
4. AI Engine compares current performance to similar past campaigns (UC231)
5. AI Engine identifies optimization opportunities (UC232)
6. AI Engine generates prioritized recommendation list:
   - Content: "Switch from long-form to short-form posts (predicted +45% engagement)"
   - Timing: "Move posts from 9am to 3pm (predicted +30% CTR)"
   - Platform: "Reduce LinkedIn budget, increase TikTok (predicted +2.3x ROI)"
7. System displays recommendations in Optimizer Dashboard (UC220)
**Postcondition**: ML recommendations generated and displayed
**Extensions**:
- 6a. User can accept/reject individual recommendations
- 6b. System can auto-apply recommendations if "Auto-optimize" enabled

---

## Autonomous vs Manual Operations

### 🤖 Autonomous Operations (AI Engine)
These use cases are executed automatically by Claude AI agents:
- UC070-085: Trend Intelligence Suite (full automation)
- UC090-104: SEO Reactor (full automation)
- UC110-122: Campaign Orchestrator content generation (with human approval gate)
- UC226-235: Optimizer & ML recommendations (full automation)
- UC250-262: Content Creation Studio (AI generation with human editing)
- UC270-282: Video Studio script generation (automation where implemented)
- UC291-299: Link Building automation (HARO, outreach)
- UC311-320: Intelligence Dashboard insights (full automation)
- UC331-340: ML Lab predictions and forecasting (full automation)

### 👤 Manual Operations (User-Controlled)
These use cases require explicit user action:
- UC001-006: Authentication & Account management
- UC010-023: Profile creation and configuration
- UC030-040: Platform connections (OAuth or API key)
- UC050-063: Campaign setup and configuration
- UC123-126: Campaign approval/rejection (human-in-the-loop)
- UC140-157: Publishing (user-initiated, system-executed)
- UC170-181: Campaign management (start/pause/end)
- UC190-206: Analytics viewing and reporting
- UC220-223: A/B test creation (optional AI assistance)

### ⚙️ Hybrid Operations (User + AI Collaboration)
These use cases involve both user input and AI assistance:
- UC011-012: Brand DNA extraction (AI asks questions, user answers)
- UC021-022: Strategy and landscape analysis (AI analyzes, user reviews)
- UC116: Content repurposing (AI generates, user edits)
- UC124: Modify campaign content (user edits AI-generated content)
- UC228-229: Apply optimizations (AI recommends, user approves)
- UC259-260: Edit and validate content (AI generates, user refines)

---

## Critical Paths

### Minimum Viable Campaign (Fastest Path)
```
UC002 (Sign Up) →
UC010 (Create Profile) →
UC030 (Connect Platform) →
UC050 (Create Campaign) →
UC125 (Approve Plan) →
UC140 (Schedule Content) →
UC173 (Start Campaign) →
UC190 (View Analytics)
```

### Full Autonomous Campaign (Complete Workflow)
```
UC002 → UC010 → UC011 → UC013 → UC030 → UC021 →
UC050 → UC062 → UC070 → UC071 → UC083 →
UC090 → UC104 → UC110 → UC119 → UC123 → UC125 →
UC140 → UC141-150 → UC173 → UC190 → UC220 →
UC226 → UC228 → UC230
```

### Content-First Workflow
```
UC010 → UC250 (Generate Blog) → UC252 (Repurpose) →
UC253-257 (Platform Posts) → UC140 (Schedule) →
UC141-150 (Publish) → UC190 (Track)
```

---

## API Endpoint Mapping

Each use case maps to one or more backend API endpoints:

| Use Case | API Endpoints | Controller | Status |
|----------|---------------|------------|--------|
| UC001-006 | `/auth/login`, `/auth/register`, `/auth/logout` | Auth | ✅ Complete |
| UC010-023 | `/marketing/profile/*` (33 endpoints) | Profile | ⚠️ Backend 100%, Frontend 0% |
| UC030-040 | `/marketing/profile/connections/*` (6 endpoints) | Profile | ⚠️ Coded, not tested |
| UC050-063 | `/marketing/campaigns/*` (25 endpoints) | Marketing | ✅ Working 80% |
| UC070-085 | `/marketing/trends/*` (20 endpoints) | Trends | ⚠️ Backend 75%, APIs partial |
| UC090-104 | `/marketing/seo/*` (37 endpoints) | Marketing | ⚠️ Backend 85%, no GSC |
| UC110-126 | `/marketing/orchestration/*` (15 endpoints) | Marketing | ✅ Working 70% |
| UC140-157 | `/marketing/publishing/*` (12 endpoints) | Marketing | ⚠️ Coded 100%, not tested |
| UC170-181 | `/marketing/campaigns/*` (overlap with UC050-063) | Marketing | ✅ Working 80% |
| UC190-206 | `/marketing/analytics/*` (18 endpoints) | Marketing | ✅ Working 75% |
| UC220-235 | `/marketing/optimization/*` (30 endpoints) | Optimization | ⚠️ Backend 85%, Frontend 0% |
| UC250-262 | `/marketing/content/*` (15 endpoints) | Marketing | ✅ Working 90% |
| UC270-282 | `/marketing/video/*` (13 endpoints) | Video | ⚠️ Scripts 100%, Video gen 0% |
| UC290-299 | `/marketing/link-building/*` (36 endpoints) | Marketing | ⚠️ Backend 80%, mock data |
| UC310-320 | `/marketing/intelligence/*` (26 endpoints) | Intelligence | ⚠️ Backend 70%, Frontend 0% |
| UC330-340 | `/marketing/ml/*` (18 endpoints) | ML | ⚠️ Backend 85%, Frontend 0% |
| UC350-359 | `/marketing/workflows/*` (22 endpoints) | Workflows | ⚠️ Partial 35% |
| UC370-379 | `/marketing/monitoring/*` (20 endpoints) | Monitoring | ⚠️ Backend 75%, minimal UI |

**Total**: 120 use cases → 337+ API endpoints across 12 controllers

---

## Future Enhancements

### Phase 1: Complete Core Features (Weeks 1-4)
- Connect frontend to all orphaned backend APIs (310 endpoints)
- Build missing UIs (Video Studio, Optimization Center, Intelligence Dashboard, ML Lab)
- Integrate video generation services (Runway Gen-3, Pika Labs, ElevenLabs, Suno AI)
- Replace mock data with real integrations (TikTok Trends, YouTube Trends, Google Search Console)

### Phase 2: Production Hardening (Weeks 5-8)
- Comprehensive testing suite (unit, integration, E2E)
- Load testing and performance optimization
- Security audit and penetration testing
- Monitoring and alerting infrastructure
- Error handling and retry logic
- Rate limiting and quota management

### Phase 3: Advanced Features (Weeks 9-12)
- Content Velocity Orchestrator (Phase 12 from master plan)
- Advanced workflow automation
- Real-time collaboration features
- White-label branding options
- API for third-party integrations
- Mobile app (React Native)

### Phase 4: Enterprise Features (Weeks 13-16)
- Multi-user team management
- Role-based access control (RBAC)
- Audit logs and compliance
- Custom ML model training
- Advanced attribution modeling
- Predictive budget allocation

---

## Glossary

- **Brand DNA**: The extracted essence of a company's identity (mission, tone, niche, audience, vision) used to inform all AI-generated content
- **Autonomous Campaign**: Campaign where AI handles trend analysis, SEO, content generation, and optimization with minimal human input
- **Custom Campaign**: Campaign where user manually controls all aspects of setup and content
- **Trend Collector**: AI service that fetches live trends from multiple platforms and scores them by relevance and virality
- **SEO Reactor**: AI service that analyzes keywords, identifies opportunities, and generates programmatic SEO pages
- **Campaign Orchestrator**: AI workflow builder that plans content strategy, generates assets, and determines posting times
- **Campaign Memory**: Machine learning system that learns from past campaign performance to improve future strategies
- **Multi-Touch Attribution**: Tracking customer journey across multiple touchpoints to assign conversion credit
- **Content Repurposing**: AI transformation of long-form content (blogs) into 50+ platform-optimized posts
- **Video DNA**: Template defining visual identity, characters, scenes, audio signature for consistent video production
- **Programmatic Page**: SEO-optimized page automatically generated at scale targeting specific keywords
- **Content Cluster**: Hub and spoke SEO architecture with pillar pages and related spoke pages
- **HARO**: Help A Reporter Out - platform for journalists seeking expert sources (link building opportunity)
- **E-E-A-T**: Experience, Expertise, Authoritativeness, Trustworthiness - Google's content quality framework
- **SERP**: Search Engine Results Page
- **CTR**: Click-Through Rate
- **ROI**: Return on Investment

---

## Document Metadata
- **Created**: 2025-10-29
- **Version**: 1.0
- **Scope**: Complete system architecture
- **Use Cases**: 120+
- **Actors**: 7
- **Subsystems**: 18
- **API Endpoints**: 337+
- **Implementation Status**: 60-70% complete

---

## Related Documentation
- [MASTER_PLAN_MARKETING_ENGINE.md](./MASTER_PLAN_MARKETING_ENGINE.md) - 15-phase implementation roadmap
- [MARKETING_ENGINE_COMPREHENSIVE_ANALYSIS.md](./MARKETING_ENGINE_COMPREHENSIVE_ANALYSIS.md) - Gap analysis and status
- [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md) - API integration mapping
- [MARKETING_ENGINE_API_DOCUMENTATION.md](./MARKETING_ENGINE_API_DOCUMENTATION.md) - Complete API reference (see next deliverable)
- [BACKEND_API_VALIDATION_REPORT.md](./BACKEND_API_VALIDATION_REPORT.md) - API validation testing

---

## Mermaid Rendering Instructions

To render this diagram:

1. **GitHub**: The Mermaid diagram will auto-render in GitHub markdown viewers
2. **Mermaid Live Editor**: Copy the Mermaid code block to https://mermaid.live for interactive editing
3. **VS Code**: Install "Markdown Preview Mermaid Support" extension
4. **Export**: Use Mermaid Live Editor to export as PNG/SVG/PDF for presentations
5. **Documentation Sites**: Most modern static site generators (Docusaurus, MkDocs, VitePress) support Mermaid

**Note**: Due to diagram complexity (120+ use cases, 7 actors, 18 subsystems), the rendered diagram may be large. Consider zooming or viewing in Mermaid Live Editor for best experience.

---

**End of UML Use Case Diagram Documentation**
