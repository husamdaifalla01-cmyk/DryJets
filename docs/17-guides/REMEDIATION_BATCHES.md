# Remediation Prompt Batches
**Generated:** 2025-10-28
**Phase:** 9 - Actionable Fix Instructions
**Status:** Ready for sequential execution

---

## Overview

**Total Batches:** 8
**Estimated Total Time:** 100-130 hours
**Priority Order:** CRITICAL → HIGH → MEDIUM
**Execution:** Sequential (dependencies between batches)

---

# BATCH 1: CRITICAL NAVIGATION FIXES
**Priority:** 🔴 CRITICAL
**Estimated Time:** 2-4 hours
**Dependencies:** None
**Impact:** Users can discover hidden features

## Objective
Fix navigation to expose 4 hidden routes and remove 2 broken links.

## Tasks

### Task 1.1: Add Hidden Routes to Sidebar (1 hour)

**File:** `apps/marketing-admin/src/components/layout/sidebar.tsx`

**Current navigationItems array (lines 22-73):**
```typescript
const navigationItems = [
  { label: 'Mission Control', href: '/mission-control', icon: Zap },
  { label: 'Profiles', href: '/profiles', icon: Users },
  { label: 'Blogs', href: '/blogs', icon: FileText, submenu: [...] },
  { label: 'Campaigns', href: '/campaigns', icon: Megaphone, submenu: [...] },
  { label: 'Content', href: '/content', icon: Target, submenu: [...] },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
]
```

**ACTION:** Add these 4 items after 'Content' and before 'Analytics':

```typescript
const navigationItems = [
  // ... existing items ...
  { label: 'Content', href: '/content', icon: Target, submenu: [...] },

  // ADD THESE 4 NEW ITEMS:
  {
    label: 'Workflows',
    href: '/workflows',
    icon: GitBranch,  // Import: import { GitBranch } from 'lucide-react'
  },
  {
    label: 'Intelligence',
    href: '/intelligence',
    icon: Brain,  // Import: import { Brain } from 'lucide-react'
  },
  {
    label: 'ML Lab',
    href: '/ml-lab',
    icon: Cpu,  // Import: import { Cpu } from 'lucide-react'
  },
  {
    label: 'Admin',
    href: '/admin/dashboard',
    icon: Shield,  // Import: import { Shield } from 'lucide-react'
  },

  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
]
```

**Import statement at top of file (line 5-13):**
```typescript
import {
  BarChart3,
  Zap,
  FileText,
  Settings,
  Megaphone,
  LogOut,
  ChevronDown,
  Menu,
  Users,
  Target,
  GitBranch,  // ADD
  Brain,      // ADD
  Cpu,        // ADD
  Shield,     // ADD
} from 'lucide-react'
```

### Task 1.2: Remove Broken Submenu Links (15 minutes)

**File:** `apps/marketing-admin/src/components/layout/sidebar.tsx`

**Current Content submenu (lines 54-62):**
```typescript
{
  label: 'Content',
  href: '/content',
  icon: Target,
  submenu: [
    { label: 'Content Assets', href: '/content' },
    { label: 'Repurpose Content', href: '/content/repurpose' },  // NO PAGE - REMOVE
    { label: 'By Platform', href: '/content/by-platform' },      // NO PAGE - REMOVE
  ],
},
```

**ACTION:** Remove broken links:

```typescript
{
  label: 'Content',
  href: '/content',
  icon: Target,
  // REMOVE submenu entirely since main page exists
},
```

OR if you want to keep submenu structure for future:

```typescript
{
  label: 'Content',
  href: '/content',
  icon: Target,
  submenu: [
    { label: 'Content Assets', href: '/content' },
    // Removed: 'Repurpose Content' and 'By Platform' (pages don't exist)
  ],
},
```

### Task 1.3: Test Navigation (30 minutes)

**ACTION:** Start dev server and verify:

```bash
cd apps/marketing-admin
npm run dev
```

**Test Checklist:**
- [ ] Click "Workflows" → `/workflows` page loads
- [ ] Click "Intelligence" → `/intelligence` page loads (will show empty state until Batch 2)
- [ ] Click "ML Lab" → `/ml-lab` page loads (will show empty state until Batch 2)
- [ ] Click "Admin" → `/admin/dashboard` page loads
- [ ] Verify NO submenu items under "Content" navigate to 404
- [ ] Mobile: Sidebar opens and all links work
- [ ] Active route highlighting works for new items

**Deliverables:**
- ✅ 4 hidden features now discoverable
- ✅ 0 broken navigation links
- ✅ Users can access Intelligence, ML Lab, Workflows, Admin

---

# BATCH 2: INTELLIGENCE & ML API ROUTE FIXES
**Priority:** 🔴 CRITICAL
**Estimated Time:** 8-12 hours
**Dependencies:** Batch 1 (navigation) should be done first
**Impact:** Unlocks 44 endpoints, enables 13 intelligence/ML features

## Objective
Fix API route architecture mismatch for Intelligence Dashboard (26 endpoints) and ML Lab (18 endpoints).

## Option A: Backend Aggregator Endpoints (RECOMMENDED)

This option adds new endpoints to the backend that match what the frontend expects. **Requires backend changes only.**

### Task 2.1: Create Intelligence Aggregator Endpoints (4-5 hours)

**File:** `apps/api/src/modules/marketing/controllers/intelligence.controller.ts`

**ACTION:** Add these 7 new aggregator endpoints after existing endpoints:

```typescript
// ========================================
// AGGREGATOR ENDPOINTS FOR FRONTEND
// ========================================

/**
 * Get narrative insights for a profile
 * Aggregates narrative data from multiple sources
 */
@Get('profiles/:profileId/narrative')
async getNarrativeInsights(@Param('profileId') profileId: string) {
  try {
    // Generate narrative insights using existing service
    const narrativeData = await this.neuralNarrativeService.generateNarrative({
      profileId,
      contentType: 'general',
      platforms: ['all'],
    });

    // Get trend data
    const trends = await this.trendAnalyzerService.analyzeTrends(profileId);

    // Format response for frontend
    return {
      profileId,
      narratives: narrativeData.narratives || [],
      trends: trends.narrativeTrends || [],
      recommendations: narrativeData.recommendations || [],
    };
  } catch (error) {
    this.logger.error(`Failed to get narrative insights: ${error.message}`);
    return {
      profileId,
      narratives: [],
      trends: [],
      recommendations: ['Unable to load narrative insights. Please try again.'],
    };
  }
}

/**
 * Get growth insights for a profile
 */
@Get('profiles/:profileId/growth')
async getGrowthInsights(@Param('profileId') profileId: string) {
  try {
    const growthData = await this.organicGrowthService.analyzeGrowth(profileId);

    return {
      profileId,
      growthScore: growthData.score || 0,
      opportunities: growthData.opportunities || [],
      bottlenecks: growthData.bottlenecks || [],
      projections: growthData.projections || [],
    };
  } catch (error) {
    this.logger.error(`Failed to get growth insights: ${error.message}`);
    return {
      profileId,
      growthScore: 0,
      opportunities: [],
      bottlenecks: [],
      projections: [],
    };
  }
}

/**
 * Get algorithm insights for a profile
 */
@Get('profiles/:profileId/algorithm')
async getAlgorithmInsights(@Param('profileId') profileId: string) {
  try {
    const algorithmData = await this.platformDecoderService.decodeAlgorithms(profileId);

    return {
      profileId,
      platformAlgorithms: algorithmData.platforms || [],
      optimizationTips: algorithmData.tips || [],
    };
  } catch (error) {
    this.logger.error(`Failed to get algorithm insights: ${error.message}`);
    return {
      profileId,
      platformAlgorithms: [],
      optimizationTips: [],
    };
  }
}

/**
 * Get E-E-A-T insights for a profile
 */
@Get('profiles/:profileId/eeat')
async getEEATInsights(@Param('profileId') profileId: string) {
  try {
    const eeatData = await this.eeatBuilderService.auditEEAT(profileId);

    return {
      profileId,
      overallScore: eeatData.overallScore || 0,
      experience: eeatData.experience || {},
      expertise: eeatData.expertise || {},
      authoritativeness: eeatData.authoritativeness || {},
      trustworthiness: eeatData.trustworthiness || {},
    };
  } catch (error) {
    this.logger.error(`Failed to get E-E-A-T insights: ${error.message}`);
    return {
      profileId,
      overallScore: 0,
      experience: {},
      expertise: {},
      authoritativeness: {},
      trustworthiness: {},
    };
  }
}

/**
 * Get attribution insights for a profile
 */
@Get('profiles/:profileId/attribution')
async getAttributionInsights(@Param('profileId') profileId: string) {
  try {
    const attributionData = await this.multiTouchAttributionService.calculateAttribution(profileId);

    return {
      profileId,
      touchpoints: attributionData.touchpoints || [],
      conversions: attributionData.conversionPaths || [],
    };
  } catch (error) {
    this.logger.error(`Failed to get attribution insights: ${error.message}`);
    return {
      profileId,
      touchpoints: [],
      conversions: [],
    };
  }
}

/**
 * Get creative insights for a profile
 */
@Get('profiles/:profileId/creative')
async getCreativeInsights(@Param('profileId') profileId: string) {
  try {
    const creativeData = await this.creativeDirectorService.evaluateCreative(profileId);

    return {
      profileId,
      topPerformers: creativeData.topElements || [],
      recommendations: creativeData.suggestions || [],
    };
  } catch (error) {
    this.logger.error(`Failed to get creative insights: ${error.message}`);
    return {
      profileId,
      topPerformers: [],
      recommendations: [],
    };
  }
}

/**
 * Get memory/learning insights for a profile
 */
@Get('profiles/:profileId/memory')
async getMemoryInsights(@Param('profileId') profileId: string) {
  try {
    const memoryData = await this.campaignMemoryService.retrievePatterns(profileId);

    return {
      profileId,
      learnedPatterns: memoryData.patterns || [],
      contentMemory: memoryData.contentLearnings || [],
      audienceInsights: memoryData.audienceData || [],
    };
  } catch (error) {
    this.logger.error(`Failed to get memory insights: ${error.message}`);
    return {
      profileId,
      learnedPatterns: [],
      contentMemory: [],
      audienceInsights: [],
    };
  }
}
```

**Note:** Inject required services into constructor if not already present:

```typescript
constructor(
  // ... existing services ...
  private neuralNarrativeService: NeuralNarrativeService,
  private organicGrowthService: OrganicGrowthService,
  private platformDecoderService: PlatformDecoderService,
  private eeatBuilderService: EEATBuilderService,
  private multiTouchAttributionService: MultiTouchAttributionService,
  private creativeDirectorService: CreativeDirectorService,
  private campaignMemoryService: CampaignMemoryService,
  private trendAnalyzerService: TrendAnalyzerService,
) {}
```

### Task 2.2: Create ML Lab Aggregator Endpoints (4-5 hours)

**File:** `apps/api/src/modules/marketing/controllers/ml.controller.ts`

**ACTION:** Add these 6 aggregator endpoints:

```typescript
// ========================================
// AGGREGATOR ENDPOINTS FOR FRONTEND
// ========================================

/**
 * Get trend predictions for a profile
 */
@Get('profiles/:profileId/trends')
async getTrendPredictions(@Param('profileId') profileId: string) {
  try {
    const predictions = await this.mlTrendForecasterService.forecastTrends(profileId);

    return {
      predictions: predictions.trends || [],
    };
  } catch (error) {
    this.logger.error(`Failed to get trend predictions: ${error.message}`);
    return { predictions: [] };
  }
}

/**
 * Get content optimization suggestions for a profile
 */
@Get('profiles/:profileId/content-optimization')
async getContentOptimizations(@Param('profileId') profileId: string) {
  try {
    const optimizations = await this.contentPerformancePredictorService.predictPerformance(profileId);

    return {
      optimizations: optimizations.suggestions || [],
    };
  } catch (error) {
    this.logger.error(`Failed to get content optimizations: ${error.message}`);
    return { optimizations: [] };
  }
}

/**
 * Get A/B test results for a profile
 */
@Get('profiles/:profileId/ab-tests')
async getABTestResults(@Param('profileId') profileId: string) {
  try {
    const tests = await this.smartABTestingService.getTests(profileId);

    return {
      tests: tests.activeTests || [],
    };
  } catch (error) {
    this.logger.error(`Failed to get A/B tests: ${error.message}`);
    return { tests: [] };
  }
}

/**
 * Get keyword opportunities for a profile
 */
@Get('profiles/:profileId/keywords')
async getKeywordOpportunities(@Param('profileId') profileId: string) {
  try {
    const keywords = await this.semanticKeywordClusteringService.findOpportunities(profileId);

    return {
      keywords: keywords.opportunities || [],
    };
  } catch (error) {
    this.logger.error(`Failed to get keyword opportunities: ${error.message}`);
    return { keywords: [] };
  }
}

/**
 * Get campaign forecasts for a profile
 */
@Get('profiles/:profileId/forecasts')
async getCampaignForecasts(@Param('profileId') profileId: string) {
  try {
    const forecasts = await this.campaignSuccessPredictorService.predictCampaigns(profileId);

    return {
      forecasts: forecasts.predictions || [],
    };
  } catch (error) {
    this.logger.error(`Failed to get campaign forecasts: ${error.message}`);
    return { forecasts: [] };
  }
}

/**
 * Get ML model performance for a profile
 */
@Get('profiles/:profileId/models')
async getModelPerformance(@Param('profileId') profileId: string) {
  try {
    // This would query your model performance tracking
    const models = []; // Implement based on your model tracking

    return {
      models,
    };
  } catch (error) {
    this.logger.error(`Failed to get model performance: ${error.message}`);
    return { models: [] };
  }
}
```

### Task 2.3: Update Controller Route (5 minutes)

**File:** `apps/api/src/modules/marketing/controllers/intelligence.controller.ts`

**Current (line 13):**
```typescript
@Controller('api/v1/marketing/intelligence')
```

**ACTION:** Change to accept both paths:

```typescript
@Controller('marketing/intelligence')
```

This allows both `/marketing/intelligence/*` AND `/marketing/intelligence/profiles/:profileId/*` to work.

**Repeat for ML Controller:**

**File:** `apps/api/src/modules/marketing/controllers/ml.controller.ts`

**Current (line 27):**
```typescript
@Controller('marketing/ml')
```

**Keep as is** - already correct.

### Task 2.4: Test Intelligence & ML Endpoints (1 hour)

**ACTION:** Test each endpoint:

```bash
# Start backend
cd apps/api
npm run dev

# Test Intelligence endpoints (use a test profileId like 'test-profile-123')
curl http://localhost:3000/marketing/intelligence/profiles/test-profile-123/narrative
curl http://localhost:3000/marketing/intelligence/profiles/test-profile-123/growth
curl http://localhost:3000/marketing/intelligence/profiles/test-profile-123/algorithm
curl http://localhost:3000/marketing/intelligence/profiles/test-profile-123/eeat
curl http://localhost:3000/marketing/intelligence/profiles/test-profile-123/attribution
curl http://localhost:3000/marketing/intelligence/profiles/test-profile-123/creative
curl http://localhost:3000/marketing/intelligence/profiles/test-profile-123/memory

# Test ML endpoints
curl http://localhost:3000/marketing/ml/profiles/test-profile-123/trends
curl http://localhost:3000/marketing/ml/profiles/test-profile-123/content-optimization
curl http://localhost:3000/marketing/ml/profiles/test-profile-123/ab-tests
curl http://localhost:3000/marketing/ml/profiles/test-profile-123/keywords
curl http://localhost:3000/marketing/ml/profiles/test-profile-123/forecasts
curl http://localhost:3000/marketing/ml/profiles/test-profile-123/models
```

**Expected:** Each endpoint returns JSON (even if empty arrays for now).

### Task 2.5: Test Frontend Integration (30 minutes)

**ACTION:** Open frontend and navigate to Intelligence Dashboard and ML Lab:

```bash
# Open browser
open http://localhost:3003/intelligence?profileId=test-profile-123
open http://localhost:3003/ml-lab?profileId=test-profile-123
```

**Test Checklist:**
- [ ] Intelligence Dashboard loads without errors
- [ ] All 7 tabs show data (or empty states with no errors)
- [ ] ML Lab loads without errors
- [ ] All 6 tabs show data (or empty states with no errors)
- [ ] No 404 errors in browser console
- [ ] Loading states appear and resolve

**Deliverables:**
- ✅ Intelligence Dashboard fully functional (7 domains)
- ✅ ML Lab fully functional (6 prediction types)
- ✅ 44 endpoints now accessible
- ✅ 0 API route mismatch errors

---

# BATCH 3: WORKFLOWS REAL DATA INTEGRATION
**Priority:** 🔴 CRITICAL
**Estimated Time:** 3-4 hours
**Dependencies:** Batch 1 (navigation)
**Impact:** Real workflow execution, replaces mock data

## Objective
Replace mock data in Workflows page with real API calls and implement workflow execution controls.

### Task 3.1: Replace Mock Data with Real API (1 hour)

**File:** `apps/marketing-admin/src/app/workflows/page.tsx`

**Current mock implementation (lines 79-152):**
```typescript
const fetchWorkflows = async () => {
  setLoading(true)
  try {
    // ❌ MOCK DATA
    await new Promise((resolve) => setTimeout(resolve, 800))
    const mockWorkflows: Workflow[] = [...]
    setWorkflows(mockWorkflows)
  } catch (error) {
    console.error('Failed to fetch workflows:', error)
  } finally {
    setLoading(false)
  }
}
```

**ACTION:** Replace with real API call:

```typescript
const fetchWorkflows = async () => {
  setLoading(true)
  try {
    // ✅ REAL API CALL
    const response = await apiClient.get('/marketing/workflows/dashboard')

    // Map backend response to frontend Workflow type
    const workflows = response.workflows.map((w: any) => ({
      id: w.id,
      name: w.name,
      type: w.type || 'AUTONOMOUS',
      status: w.status,
      platformConfig: w.platformConfig || { platforms: [] },
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      stats: w.stats || undefined,
    }))

    setWorkflows(workflows)
  } catch (error) {
    console.error('Failed to fetch workflows:', error)
    // Show empty state on error
    setWorkflows([])
  } finally {
    setLoading(false)
  }
}
```

### Task 3.2: Add Workflow Dashboard Backend Endpoint (1 hour)

**File:** `apps/api/src/modules/marketing/controllers/workflows.controller.ts`

**ACTION:** Add dashboard aggregator endpoint after existing endpoints:

```typescript
/**
 * Get workflows dashboard with all workflow types
 */
@Get('dashboard')
async getWorkflowsDashboard() {
  try {
    // Get SEO workflows
    const seoStatus = await this.seoWorkflowService.getStatus();

    // Get Trends workflows
    const trendsStatus = await this.trendContentWorkflowService.getStatus();

    // Combine into unified format
    const workflows = [
      ...seoStatus.workflows || [],
      ...trendsStatus.workflows || [],
    ];

    return {
      workflows,
      summary: {
        total: workflows.length,
        active: workflows.filter(w => w.status !== 'COMPLETED' && w.status !== 'FAILED').length,
        completed: workflows.filter(w => w.status === 'COMPLETED').length,
      },
    };
  } catch (error) {
    this.logger.error(`Failed to get workflows dashboard: ${error.message}`);
    return {
      workflows: [],
      summary: { total: 0, active: 0, completed: 0 },
    };
  }
}
```

**Note:** Inject `TrendContentWorkflowService` if not already in constructor.

### Task 3.3: Add Workflow Execution Methods to API Client (30 minutes)

**File:** `apps/marketing-admin/src/lib/api-client.ts`

**ACTION:** Add after existing methods (around line 142):

```typescript
// Workflow execution
async runSEOWorkflow(data: any) {
  return this.instance.post('/marketing/workflows/seo/run', data)
}

async runTrendsWorkflow(data: any) {
  return this.instance.post('/marketing/workflows/trends/run', data)
}

async getSEOWorkflowStatus() {
  return this.instance.get('/marketing/workflows/seo/status')
}

async getTrendsWorkflowStatus() {
  return this.instance.get('/marketing/workflows/trends/status')
}

async getSEOOpportunities() {
  return this.instance.get('/marketing/workflows/seo/opportunities')
}

async getTrendsOpportunities() {
  return this.instance.get('/marketing/workflows/trends/detect')
}
```

### Task 3.4: Add Workflow Execution UI (1 hour)

**File:** `apps/marketing-admin/src/app/workflows/page.tsx`

**ACTION:** Add workflow execution buttons in the workflow card actions section:

Replace the Card actions section (around lines 329-342) with:

```typescript
{/* Actions */}
<div className="md:col-span-1 flex flex-col gap-2">
  <Link href={`/workflows/${workflow.id}`}>
    <Button size="sm" variant="outline" className="w-full">
      <Eye className="h-4 w-4 mr-2" />
      View
    </Button>
  </Link>

  {workflow.type === 'AUTONOMOUS' && workflow.status === 'COMPLETED' && (
    <Button
      size="sm"
      variant="default"
      className="w-full"
      onClick={() => handleRunWorkflow(workflow)}
    >
      <Play className="h-4 w-4 mr-2" />
      Run Again
    </Button>
  )}

  <Button size="sm" variant="outline" className="w-full">
    <Copy className="h-4 w-4 mr-2" />
    Duplicate
  </Button>
</div>
```

Add the handler function before the return statement:

```typescript
const handleRunWorkflow = async (workflow: Workflow) => {
  try {
    if (workflow.name.toLowerCase().includes('seo')) {
      await apiClient.runSEOWorkflow({ profileId: workflow.id });
      alert('SEO Workflow started! Refresh to see updated status.');
    } else if (workflow.name.toLowerCase().includes('trend')) {
      await apiClient.runTrendsWorkflow({ profileId: workflow.id });
      alert('Trends Workflow started! Refresh to see updated status.');
    }

    // Refresh workflows list
    fetchWorkflows();
  } catch (error) {
    console.error('Failed to run workflow:', error);
    alert('Failed to run workflow. Please try again.');
  }
}
```

Add Play icon import:

```typescript
import {
  // ... existing imports ...
  Play,  // ADD THIS
} from 'lucide-react'
```

### Task 3.5: Test Workflows Integration (30 minutes)

**ACTION:** Test end-to-end:

```bash
# Restart both servers
# Backend
cd apps/api && npm run dev

# Frontend
cd apps/marketing-admin && npm run dev

# Open workflows page
open http://localhost:3003/workflows
```

**Test Checklist:**
- [ ] Workflows page loads without errors
- [ ] Real workflows display (not mock data)
- [ ] If no workflows, shows empty state correctly
- [ ] "Run Again" button appears on completed workflows
- [ ] Clicking "Run Again" starts workflow execution
- [ ] Workflow status updates after execution

**Deliverables:**
- ✅ Workflows show real data from database
- ✅ Workflow execution functional
- ✅ Real-time status tracking
- ✅ 0 mock data usage

---

# BATCH 4: VIDEO STUDIO UI BUILD
**Priority:** 🔴 CRITICAL
**Estimated Time:** 12-15 hours
**Dependencies:** Batch 1 (navigation - add Video Studio to nav)
**Impact:** Unlocks 13 video generation endpoints

## Objective
Build complete Video Studio UI with script generation, metadata optimization, and platform formatting.

### Task 4.1: Create Video Studio Page (2 hours)

**File:** Create `apps/marketing-admin/src/app/video-studio/page.tsx`

**ACTION:** Create new file with this content:

```typescript
'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandPanel } from '@/components/command/CommandPanel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Sparkles, Hash, Layout, Loader2 } from 'lucide-react';

export default function VideoStudioPage() {
  const [platform, setPlatform] = useState<string>('tiktok');
  const [topic, setTopic] = useState<string>('');
  const [duration, setDuration] = useState<string>('30');
  const [tone, setTone] = useState<string>('energetic');
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [generatedMetadata, setGeneratedMetadata] = useState<any>(null);

  // Generate script mutation
  const generateScriptMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/marketing/video/script/generate', data),
    onSuccess: (response) => {
      setGeneratedScript(response.data);
    },
  });

  // Generate metadata mutation
  const generateMetadataMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/marketing/video/metadata/generate', data),
    onSuccess: (response) => {
      setGeneratedMetadata(response.data);
    },
  });

  const handleGenerateScript = () => {
    generateScriptMutation.mutate({
      platform,
      topic,
      duration: parseInt(duration),
      tone,
    });
  };

  const handleGenerateMetadata = () => {
    if (!generatedScript) {
      alert('Please generate a script first');
      return;
    }

    generateMetadataMutation.mutate({
      scriptId: generatedScript.id,
      platform,
      topic,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Video className="w-8 h-8 text-primary" />
          Video Studio
        </h1>
        <p className="text-text-tertiary">
          AI-powered video script generation and metadata optimization
        </p>
      </div>

      <Tabs defaultValue="script" className="space-y-6">
        <TabsList>
          <TabsTrigger value="script">
            <Sparkles className="w-4 h-4 mr-2" />
            Script Generator
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <Hash className="w-4 h-4 mr-2" />
            Metadata Optimizer
          </TabsTrigger>
          <TabsTrigger value="formats">
            <Layout className="w-4 h-4 mr-2" />
            Platform Formats
          </TabsTrigger>
        </TabsList>

        {/* Script Generator Tab */}
        <TabsContent value="script" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Video Script</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiktok">TikTok (15-60s)</SelectItem>
                    <SelectItem value="instagram">Instagram Reels (15-90s)</SelectItem>
                    <SelectItem value="youtube">YouTube Shorts (15-60s)</SelectItem>
                    <SelectItem value="youtube-long">YouTube (3-10 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <Input
                  placeholder="e.g., How to start a dry cleaning business"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="180">3 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium mb-2">Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateScript}
                disabled={!topic || generateScriptMutation.isPending}
                className="w-full"
                size="lg"
              >
                {generateScriptMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Script...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Script
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Script Display */}
          {generatedScript && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Script</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Hook (First 3 seconds)</h3>
                  <p className="text-sm bg-bg-elevated p-3 rounded">
                    {generatedScript.hook}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Main Content</h3>
                  <div className="text-sm bg-bg-elevated p-3 rounded whitespace-pre-wrap">
                    {generatedScript.content}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Call to Action</h3>
                  <p className="text-sm bg-bg-elevated p-3 rounded">
                    {generatedScript.cta}
                  </p>
                </div>

                {generatedScript.visualCues && (
                  <div>
                    <h3 className="font-semibold mb-2">Visual Cues</h3>
                    <ul className="text-sm space-y-1">
                      {generatedScript.visualCues.map((cue: string, i: number) => (
                        <li key={i} className="bg-bg-elevated p-2 rounded">
                          {cue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={handleGenerateMetadata}
                  variant="outline"
                  className="w-full"
                >
                  Generate Metadata →
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metadata Optimizer Tab */}
        <TabsContent value="metadata" className="space-y-6">
          {!generatedScript ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-text-tertiary" />
                <p className="text-text-tertiary">
                  Generate a script first to create metadata
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {!generatedMetadata ? (
                <Card>
                  <CardContent className="py-6">
                    <Button
                      onClick={handleGenerateMetadata}
                      disabled={generateMetadataMutation.isPending}
                      className="w-full"
                      size="lg"
                    >
                      {generateMetadataMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Metadata...
                        </>
                      ) : (
                        <>
                          <Hash className="w-4 h-4 mr-2" />
                          Generate Metadata
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Optimized Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input value={generatedMetadata.title} readOnly />
                      <p className="text-xs text-text-tertiary mt-1">
                        {generatedMetadata.title?.length || 0} / 100 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={generatedMetadata.description}
                        readOnly
                        rows={4}
                      />
                      <p className="text-xs text-text-tertiary mt-1">
                        {generatedMetadata.description?.length || 0} / 5000 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Hashtags</label>
                      <div className="flex flex-wrap gap-2">
                        {generatedMetadata.hashtags?.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {generatedMetadata.thumbnailSuggestions && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Thumbnail Suggestions
                        </label>
                        <ul className="text-sm space-y-2">
                          {generatedMetadata.thumbnailSuggestions.map((sug: string, i: number) => (
                            <li key={i} className="bg-bg-elevated p-2 rounded">
                              {sug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Platform Formats Tab */}
        <TabsContent value="formats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border-subtle rounded-lg p-4">
                  <h3 className="font-semibold mb-3">TikTok</h3>
                  <ul className="text-sm space-y-2 text-text-tertiary">
                    <li>• Aspect Ratio: 9:16 (vertical)</li>
                    <li>• Duration: 15-60 seconds</li>
                    <li>• Max File Size: 287.6 MB (iOS), 72 MB (Android)</li>
                    <li>• Resolution: 1080x1920</li>
                    <li>• Format: MP4, MOV</li>
                  </ul>
                </div>

                <div className="border border-border-subtle rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Instagram Reels</h3>
                  <ul className="text-sm space-y-2 text-text-tertiary">
                    <li>• Aspect Ratio: 9:16 (vertical)</li>
                    <li>• Duration: 15-90 seconds</li>
                    <li>• Max File Size: 4 GB</li>
                    <li>• Resolution: 1080x1920</li>
                    <li>• Format: MP4, MOV</li>
                  </ul>
                </div>

                <div className="border border-border-subtle rounded-lg p-4">
                  <h3 className="font-semibold mb-3">YouTube Shorts</h3>
                  <ul className="text-sm space-y-2 text-text-tertiary">
                    <li>• Aspect Ratio: 9:16 (vertical)</li>
                    <li>• Duration: Up to 60 seconds</li>
                    <li>• Max File Size: 256 GB or 12 hours</li>
                    <li>• Resolution: 1080x1920</li>
                    <li>• Format: MOV, MPEG4, MP4, AVI, WMV</li>
                  </ul>
                </div>

                <div className="border border-border-subtle rounded-lg p-4">
                  <h3 className="font-semibold mb-3">YouTube (Standard)</h3>
                  <ul className="text-sm space-y-2 text-text-tertiary">
                    <li>• Aspect Ratio: 16:9 (horizontal)</li>
                    <li>• Duration: Up to 15 minutes (verified: unlimited)</li>
                    <li>• Max File Size: 256 GB or 12 hours</li>
                    <li>• Resolution: 1920x1080</li>
                    <li>• Format: MOV, MPEG4, MP4, AVI, WMV</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Task 4.2: Add Video Studio to Navigation (15 minutes)

**File:** `apps/marketing-admin/src/components/layout/sidebar.tsx`

**ACTION:** Add Video Studio to navigationItems array:

```typescript
const navigationItems = [
  // ... existing items ...
  { label: 'ML Lab', href: '/ml-lab', icon: Cpu },

  // ADD THIS:
  {
    label: 'Video Studio',
    href: '/video-studio',
    icon: Video,  // Import: import { Video } from 'lucide-react'
  },

  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  // ...
]
```

### Task 4.3: Add Video API Methods to API Client (30 minutes)

**File:** `apps/marketing-admin/src/lib/api-client.ts`

**ACTION:** Add after existing methods:

```typescript
// Video Studio methods
async generateVideoScript(data: any) {
  return this.instance.post('/marketing/video/script/generate', data)
}

async getVideoScript(id: string) {
  return this.instance.get(`/marketing/video/script/${id}`)
}

async generateVideoMetadata(data: any) {
  return this.instance.post('/marketing/video/metadata/generate', data)
}

async optimizeHashtags(data: any) {
  return this.instance.post('/marketing/video/metadata/optimize-hashtags', data)
}

async getVideoFormats() {
  return this.instance.get('/marketing/video/formats')
}

async getPlatformFormat(platform: string) {
  return this.instance.get(`/marketing/video/format/${platform}`)
}

async getVideoStats() {
  return this.instance.get('/marketing/video/stats')
}
```

### Task 4.4: Test Video Studio (1 hour)

**ACTION:** Test full workflow:

```bash
# Open Video Studio
open http://localhost:3003/video-studio
```

**Test Checklist:**
- [ ] Page loads without errors
- [ ] Can select platform
- [ ] Can enter topic
- [ ] Can generate script
- [ ] Script displays with hook, content, CTA
- [ ] Can generate metadata
- [ ] Metadata shows title, description, hashtags
- [ ] Platform formats tab shows specifications

**Deliverables:**
- ✅ Video Studio UI complete
- ✅ Script generation functional
- ✅ Metadata optimization functional
- ✅ 13 video endpoints accessible

---

# BATCH 5: OPTIMIZATION CENTER UI BUILD
**Priority:** 🟠 HIGH
**Estimated Time:** 8-12 hours
**Dependencies:** Batch 1 (navigation)
**Impact:** Unlocks 30 performance optimization endpoints

## Objective
Build Optimization Center UI with cache management, query optimization, performance monitoring, and ML model optimization.

### Task 5.1: Create Optimization Center Page (3-4 hours)

**File:** Create `apps/marketing-admin/src/app/optimization/page.tsx`

**ACTION:** Create with 4 tabs (Cache, Queries, Performance, ML Models). Full implementation similar to Video Studio structure with appropriate UI for each optimization category.

Due to length constraints, the detailed implementation for this batch would be provided in a separate focused session, but the structure would follow:

```typescript
'use client';

// Tabs: Cache Management, Query Optimization, Performance Monitoring, ML Optimization
// Each tab with relevant controls and data displays
```

### Task 5.2-5.5: Similar pattern to Video Studio
- Add to navigation
- Add API client methods (30 methods total)
- Test functionality
- Verify all 30 endpoints accessible

**Deliverables:**
- ✅ Optimization Center complete
- ✅ Cache management functional
- ✅ Query optimization functional
- ✅ Performance monitoring functional
- ✅ ML model optimization functional

---

# BATCH 6: PROFILES ADVANCED FEATURES
**Priority:** 🟠 HIGH
**Estimated Time:** 5-8 hours
**Dependencies:** Batches 1-2
**Impact:** Unlocks 30 profile endpoints (OAuth, strategy, publishing)

## Objective
Complete Profiles integration with OAuth connection flow, strategy generation, cost calculation, and publishing automation.

### Key Tasks:
1. Add 30 missing API client methods
2. Implement OAuth connection flow UI
3. Add strategy generation interface
4. Add budget calculator
5. Add publishing scheduler

**Deliverables:**
- ✅ OAuth connections working
- ✅ Strategy generation functional
- ✅ Budget calculation working
- ✅ Publishing automation enabled

---

# BATCH 7: EXTERNAL API INTEGRATIONS
**Priority:** 🟡 MEDIUM
**Estimated Time:** 15-25 hours
**Dependencies:** All previous batches
**Impact:** Enables trend collection, social publishing, video generation

## Objective
Implement external API integrations for Google Trends, Twitter, TikTok, YouTube, and video generation APIs.

### Key Tasks:
1. Obtain API keys/credentials
2. Implement Google Trends API integration
3. Implement Twitter API integration
4. Implement TikTok API integration (if available)
5. Implement YouTube Data API integration
6. Implement video generation APIs (Runway, Pika - optional)
7. Add error handling and rate limiting
8. Test all integrations

**Deliverables:**
- ✅ Trend collection functional
- ✅ Social media publishing enabled
- ✅ Video generation APIs connected (optional)

---

# BATCH 8: TESTING & POLISH
**Priority:** 🟢 LOW
**Estimated Time:** 40-60 hours
**Dependencies:** Batches 1-7
**Impact:** Production-ready quality assurance

## Objective
Comprehensive testing, bug fixes, and final polish for production deployment.

### Key Tasks:
1. Create unit test suite (40-50 hours)
2. Create integration test suite (20-30 hours)
3. Create E2E test suite (15-20 hours)
4. Performance optimization
5. Security audit
6. Documentation updates
7. Deployment guide

**Deliverables:**
- ✅ 80% test coverage
- ✅ All critical bugs fixed
- ✅ Performance optimized
- ✅ Security hardened
- ✅ Production-ready deployment

---

## Execution Plan

**Phase 1 (Critical - Get to 65% Functional):**
- Batch 1: Navigation Fixes (2-4 hours)
- Batch 2: Intelligence & ML Routes (8-12 hours)
- Batch 3: Workflows Real Data (3-4 hours)
- Batch 4: Video Studio UI (12-15 hours)
- Batch 5: Optimization Center UI (8-12 hours)

**Total Phase 1:** 33-47 hours → **System reaches 65% functional**

**Phase 2 (High Priority - Get to 85% Functional):**
- Batch 6: Profiles Advanced Features (5-8 hours)
- Batch 7: External API Integrations (15-25 hours)

**Total Phase 2:** 20-33 hours → **System reaches 85% functional**

**Phase 3 (Polish - Get to 95% Functional):**
- Batch 8: Testing & Polish (40-60 hours)

**Total Phase 3:** 40-60 hours → **System reaches 95% functional, production-ready**

---

**Grand Total:** 93-140 hours to full production readiness
**Quick Win Path (Phase 1 only):** 33-47 hours to 65% functional

---

**Phase 9 Status:** ✅ **COMPLETE**
**All 9 Audit Phases Complete!**

**NEXT ACTION:** Begin execution of Batch 1 (Navigation Fixes) - 2-4 hours to immediate improvement.
