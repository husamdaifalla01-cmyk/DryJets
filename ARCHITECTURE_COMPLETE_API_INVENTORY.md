# MARKETING DOMINATION ENGINE - COMPLETE API INVENTORY
## Full-Stack Architecture Documentation

**Generated**: 2025-10-27
**Total Endpoints**: 100+
**Controllers**: 9
**Services**: 23+
**Database Models**: 17+

---

## 📊 API ENDPOINTS BY CONTROLLER

### 1. PROFILE CONTROLLER (`profile.controller.ts`)
**Base Path**: `/marketing/profiles`
**Authentication**: JWT Required
**Total Endpoints**: 31

#### **Profile Management** (9 endpoints)
| Method | Endpoint | Description | Frontend Status |
|--------|----------|-------------|-----------------|
| POST | `/marketing/profiles` | Create new marketing profile | ✅ Connected |
| GET | `/marketing/profiles` | List all profiles for user | ✅ Connected |
| GET | `/marketing/profiles/:id` | Get profile by ID | ✅ Connected |
| PUT | `/marketing/profiles/:id` | Update profile | ✅ Connected |
| DELETE | `/marketing/profiles/:id` | Delete profile | ✅ Connected |
| GET | `/marketing/profiles/:id/stats` | Get profile statistics | 🟡 Partial |
| POST | `/marketing/profiles/:id/activate` | Activate profile | ✅ Connected |
| POST | `/marketing/profiles/:id/pause` | Pause profile | ✅ Connected |
| POST | `/marketing/profiles/:id/archive` | Archive profile | ❌ Not exposed |

#### **Platform Connections** (6 endpoints)
| Method | Endpoint | Description | Frontend Status |
|--------|----------|-------------|-----------------|
| GET | `/marketing/profiles/:id/connections` | Get all platform connections | ✅ Connected |
| POST | `/marketing/profiles/:id/connections/oauth/initiate` | Initiate OAuth flow | ✅ Connected |
| POST | `/marketing/profiles/:id/connections/oauth/complete` | Complete OAuth flow | ✅ Connected |
| POST | `/marketing/profiles/:id/connections/api-key` | Connect with API key | ✅ Connected |
| DELETE | `/marketing/profiles/:id/connections/:platform` | Disconnect platform | ✅ Connected |
| GET | `/marketing/profiles/:id/connections/:platform/health` | Check connection health | ✅ Connected |

#### **Strategy & Analysis** (4 endpoints)
| Method | Endpoint | Description | Frontend Status |
|--------|----------|-------------|-----------------|
| POST | `/marketing/profiles/:id/analyze-landscape` | Analyze market landscape | 🟡 Partial |
| GET | `/marketing/profiles/:id/landscape` | Get cached landscape analysis | 🟡 Partial |
| POST | `/marketing/profiles/:id/generate-strategy` | Generate marketing strategy | 🟡 Partial |
| GET | `/marketing/profiles/:id/strategy` | Get strategy | 🟡 Partial |

#### **Content Repurposing** (2 endpoints)
| Method | Endpoint | Description | Frontend Status |
|--------|----------|-------------|-----------------|
| POST | `/marketing/profiles/:id/repurpose` | Repurpose content (1→50+ posts) | ✅ Connected |
| GET | `/marketing/profiles/:id/repurposing-rules` | Get default repurposing rules | ✅ Connected |

#### **Cost Calculation** (3 endpoints)
| Method | Endpoint | Description | Frontend Status |
|--------|----------|-------------|-----------------|
| POST | `/marketing/profiles/:id/calculate-cost` | Calculate campaign cost | ❌ Not exposed |
| GET | `/marketing/profiles/:id/quick-estimate` | Quick cost estimate | ❌ Not exposed |
| POST | `/marketing/profiles/:id/recommend-budget` | Recommend monthly budget | ❌ Not exposed |

#### **Publishing** (4 endpoints)
| Method | Endpoint | Description | Frontend Status |
|--------|----------|-------------|-----------------|
| POST | `/marketing/profiles/:id/publish` | Publish to multiple platforms | 🟡 Partial |
| GET | `/marketing/profiles/:id/publishing-stats` | Get publishing statistics | 🟡 Partial |
| GET | `/marketing/profiles/:id/inventory` | Get content inventory | ❌ Not exposed |
| GET | `/marketing/profiles/:id/domains` | Get tracked domains | ❌ Not exposed |
| GET | `/marketing/profiles/:id/performance` | Get cross-platform performance | ❌ Not exposed |

#### **Autonomous Campaigns** (4 endpoints)
| Method | Endpoint | Description | Frontend Status |
|--------|----------|-------------|-----------------|
| POST | `/marketing/profiles/:id/launch-campaign` | Launch autonomous campaign | ✅ Connected |
| GET | `/marketing/profiles/:id/campaigns/:campaignId/state` | Get campaign state | ✅ Connected |
| POST | `/marketing/profiles/:id/campaigns/:campaignId/pause` | Pause campaign | ✅ Connected |
| POST | `/marketing/profiles/:id/campaigns/:campaignId/resume` | Resume campaign | ✅ Connected |

---

### 2. INTELLIGENCE CONTROLLER (`intelligence.controller.ts`)
**Base Path**: `/api/v1/marketing/intelligence`
**Authentication**: JWT Required
**Total Endpoints**: 26
**Frontend Status**: ❌ **COMPLETELY MISSING (0 pages)**

#### **Narrative Intelligence** (3 endpoints)
| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| POST | `/intelligence/narrative/generate` | Generate viral narrative structure | Story-driven content creation |
| POST | `/intelligence/narrative/analyze` | Analyze existing narrative | Content improvement |
| POST | `/intelligence/narrative/cliffhanger` | Generate cliffhanger hooks | Engagement optimization |

#### **Growth Hacking** (2 endpoints)
| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| GET | `/intelligence/growth/:platform` | Get platform-specific growth tactics | Platform optimization |
| POST | `/intelligence/growth/calendar` | Generate growth hacking calendar | Strategic planning |

#### **Quantum Forecasting** (3 endpoints)
| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| POST | `/intelligence/forecast/quantum` | Quantum-inspired trend prediction | Advanced forecasting |
| GET | `/intelligence/forecast/communities` | Identify emerging communities | Audience discovery |
| GET | `/intelligence/forecast/cultural` | Predict cultural shifts | Trend anticipation |

#### **Algorithm Analysis** (2 endpoints)
| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| POST | `/intelligence/algorithm/experiment` | Run algorithm experiments | Platform understanding |
| GET | `/intelligence/algorithm/:platform` | Reverse-engineer platform algorithm | Strategy optimization |

#### **E-E-A-T Authority** (2 endpoints)
| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| GET | `/intelligence/eeat/audit` | Audit expertise/authority/trust | SEO optimization |
| GET | `/intelligence/eeat/roadmap` | Get authority-building roadmap | Brand authority |

#### **Attribution Tracking** (2 endpoints)
| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| POST | `/intelligence/attribution/calculate` | Multi-touch attribution | ROI analysis |
| GET | `/intelligence/attribution/roi` | Get ROI by channel | Budget allocation |

#### **A/B Testing** (4 endpoints)
| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| POST | `/intelligence/testing/create` | Create A/B test | Experimentation |
| POST | `/intelligence/testing/:testId/analyze` | Analyze test results | Decision making |
| GET | `/intelligence/testing/recommendations` | Get testing recommendations | Test planning |
| POST | `/intelligence/testing/variations` | Generate test variations | Creative testing |

#### **Creative Intelligence** (2 endpoints)
| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| POST | `/intelligence/creative/evaluate` | Evaluate creative effectiveness | Creative scoring |
| POST | `/intelligence/creative/brainstorm` | AI creative brainstorming | Idea generation |

#### **Memory System** (4 endpoints)
| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| POST | `/intelligence/memory/store` | Store campaign learnings | Knowledge base |
| GET | `/intelligence/memory/patterns/:objective` | Detect success patterns | Strategy optimization |
| GET | `/intelligence/memory/recommendations/:campaignType` | Get AI recommendations | Smart suggestions |
| POST | `/intelligence/memory/analyze/:campaignId` | Analyze campaign for insights | Post-mortem analysis |

#### **Dashboard** (1 endpoint)
| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| GET | `/intelligence/dashboard` | Unified intelligence dashboard | Overview |

---

### 3. ML CONTROLLER (`ml.controller.ts`)
**Base Path**: `/marketing/ml`
**Authentication**: JWT Required
**Total Endpoints**: 16
**Frontend Status**: ❌ **COMPLETELY MISSING (0 pages)**

#### **Trend Forecasting** (4 endpoints)
| Method | Endpoint | Description | ML Model |
|--------|----------|-------------|----------|
| POST | `/ml/trends/forecast/:trendId` | Forecast trend virality | Trend Predictor |
| GET | `/ml/trends/forecast/batch` | Batch forecast multiple trends | Batch Processor |
| GET | `/ml/trends/opportunities` | Identify trending opportunities | Opportunity Detector |
| POST | `/ml/trends/content-performance/:trendId` | Predict content performance on trend | Performance Predictor |

#### **Content Performance Prediction** (3 endpoints)
| Method | Endpoint | Description | ML Model |
|--------|----------|-------------|----------|
| POST | `/ml/content/predict` | Predict content engagement | Engagement Predictor |
| POST | `/ml/content/batch-predict` | Batch predict multiple pieces | Batch Predictor |
| POST | `/ml/content/optimize` | AI content optimization | Content Optimizer |

#### **Multi-Armed Bandit Testing** (4 endpoints)
| Method | Endpoint | Description | Algorithm |
|--------|----------|-------------|----------|
| POST | `/ml/ab-test/select-variant` | Select best variant dynamically | Thompson Sampling |
| POST | `/ml/ab-test/record-result` | Record test result | Learning Algorithm |
| GET | `/ml/ab-test/recommendations/:testId` | Get variant recommendations | Recommendation Engine |
| POST | `/ml/ab-test/simulate` | Simulate A/B test outcomes | Monte Carlo |

#### **Keyword Intelligence** (3 endpoints)
| Method | Endpoint | Description | ML Model |
|--------|----------|-------------|----------|
| POST | `/ml/keywords/cluster` | Cluster semantically similar keywords | K-Means Clustering |
| POST | `/ml/keywords/similarity` | Calculate keyword similarity | Cosine Similarity |
| POST | `/ml/keywords/content-pillars` | Extract content pillar topics | Topic Modeling |

#### **Campaign Prediction** (2 endpoints)
| Method | Endpoint | Description | ML Model |
|--------|----------|-------------|----------|
| POST | `/ml/campaign/predict` | Predict campaign outcomes | Campaign Predictor |
| POST | `/ml/campaign/compare-strategies` | Compare campaign strategies | Strategy Comparator |

#### **System Endpoints** (2 endpoints)
| Method | Endpoint | Description | Purpose |
|--------|----------|-------------|---------|
| GET | `/ml/dashboard` | ML system dashboard | Monitoring |
| GET | `/ml/models/status` | Get model health status | Health check |

---

### 4. MONITORING CONTROLLER (`monitoring.controller.ts`)
**Base Path**: `/marketing/monitoring`
**Authentication**: JWT Required
**Total Endpoints**: 22
**Frontend Status**: ❌ **COMPLETELY MISSING (0 pages)**

#### **Health Checks** (4 endpoints)
| Method | Endpoint | Description | Purpose |
|--------|----------|-------------|---------|
| GET | `/monitoring/health` | Overall system health | System status |
| GET | `/monitoring/health/:service` | Specific service health | Service monitoring |
| GET | `/monitoring/health/alerts/critical` | Critical alerts | Emergency alerts |
| GET | `/monitoring/health/alerts/degraded` | Degraded services | Warning alerts |

#### **Metrics** (7 endpoints)
| Method | Endpoint | Description | Metrics Type |
|--------|----------|-------------|--------------|
| GET | `/monitoring/metrics` | All metrics overview | System-wide |
| GET | `/monitoring/metrics/system` | System resource metrics | CPU, Memory, Disk |
| GET | `/monitoring/metrics/api` | API performance metrics | Response times, errors |
| GET | `/monitoring/metrics/ml` | ML model metrics | Predictions, accuracy |
| GET | `/monitoring/metrics/content` | Content generation metrics | Volume, quality |
| GET | `/monitoring/metrics/linkbuilding` | Link building metrics | Links, authority |
| POST | `/monitoring/metrics/record` | Record custom metric | Custom tracking |

#### **Alert Management** (9 endpoints)
| Method | Endpoint | Description | Purpose |
|--------|----------|-------------|---------|
| GET | `/monitoring/alerts` | Get active alerts | Alert dashboard |
| GET | `/monitoring/alerts/history` | Alert history | Historical view |
| GET | `/monitoring/alerts/statistics` | Alert statistics | Analytics |
| POST | `/monitoring/alerts/send` | Send manual alert | Manual trigger |
| POST | `/monitoring/alerts/:id/resolve` | Resolve alert | Alert resolution |
| GET | `/monitoring/alerts/rules` | Get alert rules | Rule management |
| POST | `/monitoring/alerts/rules/:name` | Create/update alert rule | Rule configuration |
| POST | `/monitoring/alerts/test` | Test alert system | Testing |

#### **Dashboard** (2 endpoints)
| Method | Endpoint | Description | Purpose |
|--------|----------|-------------|---------|
| GET | `/monitoring/dashboard` | Unified monitoring dashboard | Overview |
| POST | `/monitoring/check` | Manual health check trigger | On-demand check |

---

### 5. OPTIMIZATION CONTROLLER (`optimization.controller.ts`)
**Base Path**: `/marketing/optimization`
**Authentication**: JWT Required
**Total Endpoints**: 31
**Frontend Status**: ❌ **COMPLETELY MISSING (0 pages)**

#### **Cache Management** (5 endpoints)
| Method | Endpoint | Description | Cache Layer |
|--------|----------|-------------|-------------|
| GET | `/optimization/cache/stats` | Cache statistics | Redis/Memory |
| POST | `/optimization/cache/clear` | Clear all caches | Full flush |
| POST | `/optimization/cache/invalidate/:tag` | Invalidate by tag | Selective flush |
| GET | `/optimization/cache/keys` | List all cache keys | Key inspection |
| POST | `/optimization/cache/warm` | Warm cache with data | Pre-loading |

#### **Query Performance** (7 endpoints)
| Method | Endpoint | Description | Analysis Type |
|--------|----------|-------------|---------------|
| GET | `/optimization/queries/slow` | Get slow queries | Performance |
| GET | `/optimization/queries/stats` | Query statistics | Analytics |
| GET | `/optimization/queries/report` | Performance report | Reporting |
| GET | `/optimization/queries/n-plus-one` | Detect N+1 queries | Problem detection |
| GET | `/optimization/queries/indexes` | Index recommendations | Optimization |
| POST | `/optimization/queries/optimize/:queryName` | Optimize specific query | Query tuning |
| POST | `/optimization/queries/clear` | Clear query stats | Reset metrics |

#### **API Performance** (6 endpoints)
| Method | Endpoint | Description | Metric Type |
|--------|----------|-------------|-------------|
| GET | `/optimization/performance/dashboard` | Performance dashboard | Overview |
| GET | `/optimization/performance/endpoints` | Endpoint performance | API metrics |
| GET | `/optimization/performance/slowest` | Slowest endpoints | Bottlenecks |
| GET | `/optimization/performance/bottlenecks` | Identify bottlenecks | Problem areas |
| GET | `/optimization/performance/resources` | Resource usage | System resources |
| GET | `/optimization/performance/recommendations` | Optimization recommendations | Suggestions |
| POST | `/optimization/performance/clear` | Clear performance data | Reset |

#### **ML Cache Optimization** (7 endpoints)
| Method | Endpoint | Description | Purpose |
|--------|----------|-------------|---------|
| GET | `/optimization/ml/stats` | ML cache statistics | Cache analytics |
| GET | `/optimization/ml/stats/:modelName` | Model-specific stats | Model metrics |
| GET | `/optimization/ml/report` | ML optimization report | Reporting |
| POST | `/optimization/ml/invalidate/:modelName` | Invalidate model cache | Cache refresh |
| POST | `/optimization/ml/invalidate-all` | Clear all ML caches | Full reset |
| POST | `/optimization/ml/warm/:modelName` | Warm model cache | Pre-loading |
| POST | `/optimization/ml/optimize/:modelName` | Optimize model performance | Tuning |
| POST | `/optimization/ml/clear-stats` | Clear ML statistics | Reset metrics |

#### **System Overview** (2 endpoints)
| Method | Endpoint | Description | Purpose |
|--------|----------|-------------|---------|
| GET | `/optimization/dashboard` | Unified optimization dashboard | Overview |
| GET | `/optimization/recommendations` | System-wide recommendations | Suggestions |

---

### 6. TRENDS CONTROLLER (`trends.controller.ts`)
**Base Path**: `/api/v1/marketing/trends`
**Authentication**: JWT Required
**Total Endpoints**: 8+
**Frontend Status**: ❌ **COMPLETELY MISSING (0 pages)**

**Note**: Endpoints extracted from controller file analysis

---

### 7. VIDEO CONTROLLER (`video.controller.ts`)
**Base Path**: `/api/v1/marketing/video`
**Authentication**: JWT Required
**Total Endpoints**: 12+
**Frontend Status**: ❌ **COMPLETELY MISSING (0 pages)**

**Note**: Endpoints extracted from controller file analysis

---

### 8. WORKFLOWS CONTROLLER (`workflows.controller.ts`)
**Base Path**: `/api/v1/marketing/workflows`
**Authentication**: JWT Required
**Total Endpoints**: 15+
**Frontend Status**: 🟡 **PARTIAL (2 stub pages exist)**

---

### 9. SEEDING CONTROLLER (`seeding.controller.ts`)
**Base Path**: `/marketing/seeding`
**Authentication**: JWT Required
**Total Endpoints**: 5+
**Frontend Status**: ❌ **COMPLETELY MISSING (0 pages)**

---

## 📈 COVERAGE SUMMARY

| Controller | Total Endpoints | Frontend Pages | Coverage % | Status |
|------------|----------------|----------------|------------|--------|
| Profile | 31 | 8 pages | ~70% | 🟢 Good |
| Intelligence | 26 | 0 pages | 0% | 🔴 Critical |
| ML | 16 | 0 pages | 0% | 🔴 Critical |
| Monitoring | 22 | 0 pages | 0% | 🔴 Critical |
| Optimization | 31 | 0 pages | 0% | 🔴 Critical |
| Trends | 8+ | 0 pages | 0% | 🔴 Critical |
| Video | 12+ | 0 pages | 0% | 🔴 Critical |
| Workflows | 15+ | 2 stubs | ~10% | 🟡 Partial |
| Seeding | 5+ | 0 pages | 0% | 🔴 Critical |
| **TOTAL** | **~166** | **23 pages** | **~28%** | 🔴 **Critical Gap** |

---

## 🎯 PRIORITY MATRIX

### **CRITICAL (Build Immediately)**
1. Intelligence Dashboard (26 endpoints) - Core value prop
2. ML Prediction Center (16 endpoints) - AI features
3. Monitoring Dashboard (22 endpoints) - System health
4. Optimization Center (31 endpoints) - Performance

### **HIGH (Build Next)**
5. Trend Analysis (8+ endpoints) - Content discovery
6. Video Studio (12+ endpoints) - Content creation
7. Workflows (15+ endpoints) - Automation

### **MEDIUM (Enhance Existing)**
8. Profile enhancements (cost calculator, inventory, performance)
9. Strategy page improvements (visualization)
10. Publishing page enhancements (calendar, bulk actions)

---

**Total Missing Endpoints**: ~95+
**Estimated Build Time**: 25-35 hours
**Batches Required**: 12 batches

**Next Document**: Database Schema & Data Flow Diagrams
