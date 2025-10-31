/**
 * TEST DATA FACTORIES
 *
 * Factory functions to generate mock data for testing.
 * Uses realistic data that matches production types.
 */

import type {
  MarketingProfile,
  ProfileStatus,
  ProfileStats,
  Campaign,
  CampaignStatus,
  CampaignType,
  CampaignPriority,
  CampaignMetrics,
  Content,
  ContentType,
  ContentStatus,
  ContentTone,
} from '@dryjets/types';

// Utility function to generate IDs
let idCounter = 1;
export const generateId = (prefix = 'test') => `${prefix}_${idCounter++}`;

// Reset counter for tests
export const resetIdCounter = () => {
  idCounter = 1;
};

/**
 * PROFILE FACTORIES
 */

export const createMockProfile = (
  overrides: Partial<MarketingProfile> = {}
): MarketingProfile => {
  const now = new Date().toISOString();
  return {
    id: generateId('profile'),
    userId: generateId('user'),
    name: 'Test Marketing Profile',
    description: 'A test marketing profile for unit testing',
    status: 'active' as ProfileStatus,
    brandName: 'Test Brand',
    brandVoice: 'Professional and friendly',
    brandValues: ['Innovation', 'Quality', 'Customer-First'],
    targetAudience: 'Small business owners aged 25-45',
    goals: ['Increase brand awareness', 'Generate leads', 'Build community'],
    primaryObjective: 'Increase brand awareness',
    industry: 'Technology',
    niche: 'SaaS',
    connectedPlatforms: ['twitter', 'linkedin', 'facebook'],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

export const createMockProfileStats = (
  overrides: Partial<ProfileStats> = {}
): ProfileStats => ({
  totalCampaigns: 10,
  activeCampaigns: 3,
  totalContent: 45,
  totalPublished: 38,
  totalReach: 125000,
  avgEngagementRate: 4.2,
  connectedPlatformsCount: 3,
  completenessScore: 85,
  ...overrides,
});

/**
 * CAMPAIGN FACTORIES
 */

export const createMockCampaign = (
  overrides: Partial<Campaign> = {}
): Campaign => {
  const now = new Date().toISOString();
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: generateId('campaign'),
    profileId: generateId('profile'),
    name: 'Test Campaign',
    description: 'A test marketing campaign',
    type: 'awareness' as CampaignType,
    status: 'draft' as CampaignStatus,
    priority: 'medium' as CampaignPriority,
    startDate: now,
    endDate: futureDate,
    timezone: 'America/New_York',
    budget: 5000,
    spent: 1250,
    currency: 'USD',
    targetAudience: 'Small business owners',
    targetPlatforms: ['twitter', 'linkedin'],
    targetGeographies: ['US', 'CA'],
    contentCount: 12,
    publishedCount: 8,
    impressions: 50000,
    clicks: 2500,
    conversions: 125,
    revenue: 12500,
    createdAt: now,
    updatedAt: now,
    createdBy: generateId('user'),
    ...overrides,
  };
};

export const createMockCampaignMetrics = (
  overrides: Partial<CampaignMetrics> = {}
): CampaignMetrics => ({
  campaignId: generateId('campaign'),
  reach: 100000,
  impressions: 150000,
  clicks: 7500,
  ctr: 5.0,
  conversions: 375,
  conversionRate: 5.0,
  cpa: 13.33,
  roas: 2.5,
  engagement: {
    likes: 3000,
    comments: 500,
    shares: 750,
    saves: 250,
  },
  platformBreakdown: [
    {
      platform: 'twitter',
      reach: 60000,
      impressions: 90000,
      clicks: 4500,
      conversions: 225,
      spent: 3000,
    },
    {
      platform: 'linkedin',
      reach: 40000,
      impressions: 60000,
      clicks: 3000,
      conversions: 150,
      spent: 2000,
    },
  ],
  contentPerformance: [
    {
      contentId: generateId('content'),
      title: 'Top Performing Content',
      platform: 'twitter',
      publishedAt: new Date().toISOString(),
      impressions: 25000,
      clicks: 1250,
      engagement: 5.0,
      conversionRate: 6.0,
      score: 85,
    },
  ],
  ...overrides,
});

/**
 * CONTENT FACTORIES
 */

export const createMockContent = (
  overrides: Partial<Content> = {}
): Content => {
  const now = new Date().toISOString();

  return {
    id: generateId('content'),
    profileId: generateId('profile'),
    campaignId: generateId('campaign'),
    title: 'Test Content Title',
    type: 'blog-post' as ContentType,
    status: 'draft' as ContentStatus,
    tone: 'professional' as ContentTone,
    body: 'This is test content body. It contains multiple paragraphs of text.',
    summary: 'Test content summary',
    excerpt: 'Test excerpt for preview',
    targetPlatforms: ['twitter', 'linkedin'],
    targetAudience: 'Small business owners',
    keywords: ['marketing', 'saas', 'automation'],
    metaTitle: 'Test Content - Meta Title',
    metaDescription: 'Test meta description for SEO',
    slug: 'test-content-title',
    images: [
      {
        id: generateId('image'),
        url: 'https://example.com/test-image.jpg',
        alt: 'Test image',
        width: 1200,
        height: 630,
        format: 'jpg',
        size: 150000,
      },
    ],
    videos: [],
    scheduledAt: undefined,
    publishedAt: undefined,
    views: 0,
    clicks: 0,
    shares: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    aiGenerated: false,
    aiModel: undefined,
    promptUsed: undefined,
    generationTime: undefined,
    createdAt: now,
    updatedAt: now,
    createdBy: generateId('user'),
    ...overrides,
  };
};

export const createMockBlogPost = (overrides: Partial<Content> = {}): Content =>
  createMockContent({
    type: 'blog-post',
    body: `# Test Blog Post

This is a comprehensive blog post with multiple sections.

## Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Main Content

Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Conclusion

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
    ...overrides,
  });

export const createMockSocialPost = (
  overrides: Partial<Content> = {}
): Content =>
  createMockContent({
    type: 'social-post',
    body: '🚀 Exciting news! Check out our latest feature that will revolutionize your workflow. #innovation #productivity',
    summary: undefined,
    excerpt: undefined,
    ...overrides,
  });

/**
 * BATCH FACTORIES
 */

export const createMockProfiles = (count: number): MarketingProfile[] =>
  Array.from({ length: count }, (_, i) =>
    createMockProfile({
      name: `Test Profile ${i + 1}`,
    })
  );

export const createMockCampaigns = (count: number): Campaign[] =>
  Array.from({ length: count }, (_, i) =>
    createMockCampaign({
      name: `Test Campaign ${i + 1}`,
    })
  );

export const createMockContentList = (count: number): Content[] =>
  Array.from({ length: count }, (_, i) =>
    createMockContent({
      title: `Test Content ${i + 1}`,
    })
  );

/**
 * PAGINATION FACTORY
 */

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const createMockPaginatedResponse = <T>(
  data: T[],
  page = 1,
  limit = 10
): PaginatedResponse<T> => ({
  data: data.slice((page - 1) * limit, page * limit),
  total: data.length,
  page,
  limit,
  totalPages: Math.ceil(data.length / limit),
});
