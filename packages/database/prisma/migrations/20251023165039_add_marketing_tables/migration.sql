-- CreateEnum for CampaignType
CREATE TYPE "CampaignType" AS ENUM ('AWARENESS', 'ENGAGEMENT', 'CONVERSION', 'RETENTION');

-- CreateEnum for CampaignStatus
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum for BlogPostStatus
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum for ContentAssetType
CREATE TYPE "ContentAssetType" AS ENUM ('IMAGE', 'VIDEO', 'COPY', 'CAPTION', 'SCRIPT');

-- CreateTable Campaign
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "platforms" JSONB,
    "budgetTotal" NUMERIC(10,2),
    "targetAudience" JSONB,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "aiAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on Campaign
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");
CREATE INDEX "Campaign_type_idx" ON "Campaign"("type");
CREATE INDEX "Campaign_createdAt_idx" ON "Campaign"("createdAt");

-- CreateTable BlogPost
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "keywords" TEXT[],
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "aiBrief" JSONB,
    "serpRank" INTEGER,
    "repurposedCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL DEFAULT 'mira',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on BlogPost
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");
CREATE INDEX "BlogPost_createdAt_idx" ON "BlogPost"("createdAt");

-- CreateTable ContentAsset
CREATE TABLE "ContentAsset" (
    "id" TEXT NOT NULL,
    "type" "ContentAssetType" NOT NULL,
    "content" TEXT,
    "platform" TEXT,
    "sourceBlogId" TEXT,
    "campaignId" TEXT,
    "performanceScore" NUMERIC(3,2),
    "reuseCount" INTEGER NOT NULL DEFAULT 0,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on ContentAsset
CREATE INDEX "ContentAsset_type_idx" ON "ContentAsset"("type");
CREATE INDEX "ContentAsset_platform_idx" ON "ContentAsset"("platform");
CREATE INDEX "ContentAsset_performanceScore_idx" ON "ContentAsset"("performanceScore");
CREATE INDEX "ContentAsset_createdAt_idx" ON "ContentAsset"("createdAt");

-- CreateTable SEOMetric
CREATE TABLE "SEOMetric" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" NUMERIC(5,2),
    "avgPosition" NUMERIC(4,1),
    "keywordsRanked" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SEOMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on SEOMetric
CREATE UNIQUE INDEX "SEOMetric_blogPostId_date_key" ON "SEOMetric"("blogPostId", "date");
CREATE INDEX "SEOMetric_date_idx" ON "SEOMetric"("date");
CREATE INDEX "SEOMetric_createdAt_idx" ON "SEOMetric"("createdAt");

-- CreateTable AIAgentLog
CREATE TABLE "AIAgentLog" (
    "id" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "inputData" JSONB,
    "outputData" JSONB,
    "modelUsed" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "executionTimeMs" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAgentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on AIAgentLog
CREATE INDEX "AIAgentLog_agentName_idx" ON "AIAgentLog"("agentName");
CREATE INDEX "AIAgentLog_actionType_idx" ON "AIAgentLog"("actionType");
CREATE INDEX "AIAgentLog_createdAt_idx" ON "AIAgentLog"("createdAt");

-- CreateTable WorkflowRun
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "workflowName" TEXT NOT NULL,
    "triggerType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "stepsCompleted" INTEGER NOT NULL DEFAULT 0,
    "stepsTotal" INTEGER,
    "executionLog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on WorkflowRun
CREATE INDEX "WorkflowRun_workflowName_idx" ON "WorkflowRun"("workflowName");
CREATE INDEX "WorkflowRun_status_idx" ON "WorkflowRun"("status");
CREATE INDEX "WorkflowRun_createdAt_idx" ON "WorkflowRun"("createdAt");

-- AddForeignKey for ContentAsset
ALTER TABLE "ContentAsset" ADD CONSTRAINT "ContentAsset_sourceBlogId_fkey" FOREIGN KEY ("sourceBlogId") REFERENCES "BlogPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentAsset" ADD CONSTRAINT "ContentAsset_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for SEOMetric
ALTER TABLE "SEOMetric" ADD CONSTRAINT "SEOMetric_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
