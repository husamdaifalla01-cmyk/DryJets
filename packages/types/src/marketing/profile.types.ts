/**
 * MARKETING PROFILE TYPES
 *
 * @description Type definitions for marketing profiles
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#profile-management
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#profile-apis
 */

export type ProfileStatus = 'active' | 'paused' | 'archived';

export interface MarketingProfile {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: ProfileStatus;

  // Brand identity
  brandName: string;
  brandVoice: string;
  brandValues: string[];
  targetAudience: string;

  // Marketing goals
  goals: string[];
  primaryObjective: string;

  // Industry & niche
  industry: string;
  niche: string;

  // Connected platforms
  connectedPlatforms: string[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalContent: number;
  totalPublished: number;
  totalReach: number;
  avgEngagementRate: number;
  connectedPlatformsCount: number;
  completenessScore: number; // 0-100
}

// Intelligence stats
export interface ProfileIntelligence {
  profileId: string;
  landscapeAnalysisCount: number;
  strategiesGenerated: number;
  lastAnalysisAt?: string;
  lastStrategyAt?: string;
  mlModelsActive: number;
  activeExperiments: number;
}
