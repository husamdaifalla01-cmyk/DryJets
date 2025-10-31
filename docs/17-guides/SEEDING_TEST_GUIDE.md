# Data Seeding & Validation Guide

## Overview

This guide explains how to run the comprehensive data seeding and validation system for the Marketing Domination Engine.

## What Gets Seeded

The seeding system generates **72,000+ records** of realistic marketing data:

| Dataset | Records | Description |
|---------|---------|-------------|
| **Campaigns** | 5,000 | Campaign performance with 3-year history, success/failure patterns |
| **Campaign Metrics** | 5,000+ | Daily/weekly metrics for each campaign |
| **Campaign Memory** | 5,000 | Encoded learnings (what worked/didn't work) |
| **Keywords** | 50,000 | SEO keyword universe with rankings, volume, difficulty |
| **Blog Posts** | 5,000 | Published content with SEO metrics |
| **SEO Metrics** | 50,000+ | Monthly SEO data (3 years per post) |
| **Content Assets** | 5,000 | Social posts, videos, images with performance scores |
| **Trends** | 2,000 | Trend lifecycle data (EMERGING → DEAD) |
| **Customer Journeys** | 3,000 | Multi-touch attribution journeys |
| **Touch Points** | 15,000+ | Individual interactions in customer journeys |
| **Backlinks** | 2,000 | Link building portfolio |
| **HARO Queries** | 100 | Journalist requests and responses |
| **Outreach Campaigns** | 20 | Link building campaigns |
| **Partnerships** | 30 | Partnership proposals |
| **Resource Pages** | 50 | Resource page targets |
| **Broken Link Opps** | 75 | Broken link opportunities |

**Total: 72,000+ records giving the AI "3-4 years of learned experience"**

---

## Prerequisites

1. **Database**: PostgreSQL running and accessible
2. **Environment**: `DATABASE_URL` configured in `.env`
3. **API Running**: `npm run dev` (API must be running)
4. **Anthropic API Key**: `ANTHROPIC_API_KEY` in `.env` (optional, for AI insights)

---

## Running the Seeding

### Option 1: Via API (Recommended)

#### Step 1: Start the API

```bash
cd apps/api
npm run dev
```

#### Step 2: Run Complete Seeding

Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/marketing/seeding/run
```

This will:
1. ✅ Seed all 6 datasets (Keywords, Campaigns, Content, Trends, Attribution, Backlinks)
2. ✅ Run 7-dimensional validation
3. ✅ Generate comprehensive quality report
4. ✅ Provide pass/fail score and recommendations

**Expected Duration**: 5-15 minutes depending on your hardware

---

### Option 2: Via Script

Create a test script:

```typescript
// test-seeding.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedingOrchestratorService } from './modules/marketing/services/seeding/orchestrator.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const orchestrator = app.get(SeedingOrchestratorService);

  console.log('🚀 Starting seeding pipeline...\n');
  const report = await orchestrator.runCompleteSeeding();

  console.log(`\n✅ Complete! Overall Score: ${report.validation.overallScore}/100`);

  await app.close();
}

bootstrap();
```

Run it:

```bash
npx ts-node apps/api/src/test-seeding.ts
```

---

## Validation Framework

The validation system tests **7 dimensions**:

### 1. Data Integrity (15 tests)
- ✅ Record completeness (all datasets present)
- ✅ Required fields populated
- ✅ No invalid nulls
- ✅ Type constraints
- ✅ Foreign key integrity

**Pass Threshold**: 75/100

---

### 2. Statistical Accuracy (6 tests)
- ✅ Campaign success tier distribution (30% HIGH, 50% MODERATE, 20% LOW)
- ✅ Keyword category distribution (5% primary, 15% secondary, 30% tertiary, 50% ultra-long-tail)
- ✅ Trend lifecycle distribution (25% EMERGING, 30% GROWING, 20% PEAK, 15% DECLINING, 10% DEAD)
- ✅ Journey conversion rate (25% ±5%)
- ✅ Backlink status distribution (75% ACTIVE)
- ✅ Power law distribution (top 10% keywords have 50-70% volume)

**Pass Threshold**: 75/100

---

### 3. Relationship Integrity (5 tests)
- ✅ Campaign → CampaignMetric linkage
- ✅ BlogPost → SEOMetric time-series
- ✅ CustomerJourney → TouchPoint relationships
- ✅ Keyword parent-child hierarchy
- ✅ Backlink → OutreachCampaign linkage

**Pass Threshold**: 75/100

---

### 4. Real-World Scenarios (6 tests)

Tests if the data can answer actual marketing questions:

#### Scenario 4.1: "What were my best performing campaigns last quarter?"
```sql
-- Expected: ≥5 campaigns with ROI > 3x in last 3 months
```

#### Scenario 4.2: "Which keywords should I target for quick wins?"
```sql
-- Expected: ≥10 keywords with difficulty < 40, volume > 500, rank > 10
```

#### Scenario 4.3: "What content performed best in terms of SEO growth?"
```sql
-- Expected: ≥10 blog posts with 100%+ traffic growth
```

#### Scenario 4.4: "Which channels drive the most conversions?"
```sql
-- Expected: ≥3 top conversion channels identified
```

#### Scenario 4.5: "What trends should I capitalize on right now?"
```sql
-- Expected: ≥10 EMERGING/GROWING trends with relevance ≥ 70
```

#### Scenario 4.6: "What's the attribution impact of each channel?"
```sql
-- Expected: 6 attribution models calculated for converted journeys
```

**Pass Threshold**: 75/100

---

### 5. ML Readiness (5 tests)
- ✅ Sufficient training data volume (1K-50K records per dataset)
- ✅ Feature completeness (≥80% fields populated)
- ✅ Label quality (success/failure patterns encoded)
- ✅ Time-series structure (≥12 months of historical data)
- ✅ Class balance (≤3:1 imbalance ratio)

**Pass Threshold**: 75/100

---

### 6. Performance Simulation (5 tests)
- ✅ Aggregate query performance (<1000ms)
- ✅ Join query performance (<500ms)
- ✅ Search query performance (<300ms)
- ✅ Pagination performance (<200ms)
- ✅ Concurrent queries (<500ms for 5 parallel queries)

**Pass Threshold**: 75/100

---

### 7. AI Query Simulation (5 tests)
- ✅ Campaign insights extractable (≥5 campaigns with encoded patterns)
- ✅ Trend opportunities detectable (≥3 trends with opportunity windows)
- ✅ Attribution insights available (multi-touch journeys with 6 models)
- ✅ Content performance analyzable (≥3 posts with time-series data)
- ✅ Keyword insights derivable (≥10 ranked keywords)

**Pass Threshold**: 75/100

---

## Understanding the Report

### Sample Output

```
================================================================================
📊 COMPREHENSIVE VALIDATION REPORT
================================================================================

Timestamp: 2025-01-26T10:30:00.000Z
Overall Score: 87/100
Status: ✅ PASSED

────────────────────────────────────────────────────────────────────────────────
DIMENSION BREAKDOWN
────────────────────────────────────────────────────────────────────────────────

✅ DATA INTEGRITY: 92.3/100
  ✓ Campaign data exists: 100/100
     Found 5,000 campaigns (expected ≥4,000)
  ✓ Campaign-Memory linkage: 98.5/100
     98.5% of campaigns have metrics
  ✓ Keyword data exists: 100/100
     Found 50,000 keywords (expected ≥40,000)
  ...

✅ STATISTICAL ACCURACY: 88.7/100
  ✓ Campaign success tier distribution: 95/100
     HIGH: 29.8%, MODERATE: 50.2%, LOW: 20.0%
  ✓ Keyword category distribution: 90/100
     Primary: 5.1%, Secondary: 14.8%, Tertiary: 30.3%, Ultra: 49.8%
  ...

✅ RELATIONSHIP INTEGRITY: 85.4/100
  ...

✅ REAL-WORLD SCENARIOS: 91.2/100
  ✓ Scenario: Best campaigns query: 100/100
     Found 12 high-ROI campaigns (ROI > 3x) in last 3 months
  ✓ Scenario: Quick win keywords: 95/100
     Found 19 low-difficulty, high-volume keywords
  ...

✅ ML READINESS: 84.5/100
  ...

✅ PERFORMANCE SIMULATION: 76.8/100
  ...

✅ AI QUERY SIMULATION: 90.0/100
  ...

────────────────────────────────────────────────────────────────────────────────
SUMMARY
────────────────────────────────────────────────────────────────────────────────

Validation Results: 87/100

Passed Dimensions: 7/7

✅ dataIntegrity: 92.3/100
✅ statisticalAccuracy: 88.7/100
✅ relationshipIntegrity: 85.4/100
✅ realWorldScenarios: 91.2/100
✅ mlReadiness: 84.5/100
✅ performanceSimulation: 76.8/100
✅ aiQuerySimulation: 90.0/100

────────────────────────────────────────────────────────────────────────────────
RECOMMENDATIONS
────────────────────────────────────────────────────────────────────────────────

✅ All dimensions passed! Data is production-ready.

================================================================================
```

---

## Score Interpretation

| Score | Status | Meaning |
|-------|--------|---------|
| **90-100** | 🟢 Excellent | Production-ready, high quality |
| **75-89** | 🟡 Good | Passed, minor improvements possible |
| **60-74** | 🟠 Fair | Issues present, needs attention |
| **<60** | 🔴 Poor | Failed, significant issues |

---

## API Endpoints

### 1. Run Complete Seeding

```bash
POST /marketing/seeding/run
```

**Response:**
```json
{
  "success": true,
  "message": "Seeding and validation completed successfully",
  "data": {
    "duration": 450000,
    "recordsCreated": 72545,
    "validationScore": 87,
    "phases": [
      {
        "phase": "Keywords",
        "success": true,
        "records": 50000,
        "duration": 120000
      },
      ...
    ],
    "validation": {
      "passed": true,
      "score": 87,
      "dimensions": [...]
    }
  }
}
```

---

### 2. Quick Validation (No Seeding)

```bash
GET /marketing/seeding/validate
```

Runs quick record count validation without full seeding.

---

### 3. Get Seeding Status

```bash
GET /marketing/seeding/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 72545,
    "breakdown": {
      "campaigns": 5000,
      "keywords": 50000,
      ...
    },
    "isSeeded": true,
    "estimatedCompleteness": "100.8%"
  }
}
```

---

### 4. Clear All Data

```bash
DELETE /marketing/seeding/clear
```

**⚠️ WARNING**: Deletes all seeded data. Use with caution.

---

## Troubleshooting

### Issue: Seeding takes too long (>30 minutes)

**Solution**:
- Check database performance
- Ensure indexes are created
- Run on dedicated database instance

---

### Issue: Validation fails on statistical accuracy

**Solution**:
- Re-run seeding (randomness may cause slight variations)
- Check seed distribution logic
- Acceptable range: 70-100 for most tests

---

### Issue: Out of memory errors

**Solution**:
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run dev`
- Reduce batch sizes in seeding services
- Run seeding phases separately

---

### Issue: Foreign key violations

**Solution**:
- Ensure database schema is up to date: `npx prisma db push`
- Clear existing data first: `DELETE /marketing/seeding/clear`
- Check Prisma schema matches seeding service models

---

## Next Steps After Successful Seeding

Once validation passes with **75+/100**:

1. ✅ **ML Model Training**: Your data is ready for training the 5 ML models
2. ✅ **Automation Workflows**: Build SEO, trends, and link building automation
3. ✅ **Campaign Orchestration**: Launch real campaigns using learned patterns
4. ✅ **Production Deployment**: System has 3-4 years of "experience"

---

## Real-Life Test Scenarios

### Test 1: Campaign Intelligence

```bash
# Query: "Show me campaigns that drove high ROI in Q4"
curl -X GET "http://localhost:3000/marketing/campaigns?quarter=Q4&minROI=5"
```

**Expected**: System should return campaigns with encoded success patterns.

---

### Test 2: Keyword Strategy

```bash
# Query: "Find low-difficulty keywords in the 'dry cleaning' niche"
curl -X GET "http://localhost:3000/marketing/keywords?niche=dry-cleaning&maxDifficulty=30"
```

**Expected**: 20+ keywords with realistic volume/difficulty distribution.

---

### Test 3: Trend Opportunities

```bash
# Query: "What emerging trends should I create content about?"
curl -X GET "http://localhost:3000/marketing/trends?lifecycle=EMERGING&minRelevance=70"
```

**Expected**: 5-10 trends with opportunity windows and viral coefficients.

---

### Test 4: Attribution Analysis

```bash
# Query: "Which channels are most valuable in the customer journey?"
curl -X POST "http://localhost:3000/marketing/attribution/analyze"
```

**Expected**: 6 attribution models showing channel contributions.

---

## Performance Benchmarks

| Operation | Target | Acceptable |
|-----------|--------|------------|
| Keyword seeding (50K) | 2-3 min | <5 min |
| Campaign seeding (5K) | 1-2 min | <3 min |
| Content seeding (10K) | 2-4 min | <6 min |
| Validation (full) | 1-2 min | <3 min |
| **Total Pipeline** | **8-12 min** | **<20 min** |

---

## Success Criteria

Your seeding is successful if:

1. ✅ All 72,000+ records created
2. ✅ Validation score ≥ 75/100
3. ✅ All 7 dimensions pass
4. ✅ Real-world scenarios return expected results
5. ✅ Query performance meets targets
6. ✅ AI can extract insights from the data

---

## Support

If you encounter issues:

1. Check logs: `tail -f logs/seeding.log`
2. Run quick validation: `GET /marketing/seeding/status`
3. Review validation report for specific failures
4. Clear and re-seed if necessary

---

## Conclusion

This seeding system provides your Marketing Domination Engine with **3-4 years of realistic, statistically accurate marketing data** from day 1. The multi-dimensional validation ensures the data is:

- ✅ Complete and accurate
- ✅ Statistically realistic
- ✅ Relationship-consistent
- ✅ Query-performant
- ✅ ML-ready
- ✅ Production-grade

You're now ready to build the automation workflows on top of this intelligent foundation! 🚀
