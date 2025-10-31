/**
 * MARKETING PROFILE TYPES
 *
 * Type definitions for marketing profiles, matching backend schema.
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

export interface CreateProfileDto {
  name: string;
  description?: string;
  brandName: string;
  brandVoice: string;
  brandValues: string[];
  targetAudience: string;
  goals: string[];
  primaryObjective: string;
  industry: string;
  niche: string;
}

export interface UpdateProfileDto {
  name?: string;
  description?: string;
  brandName?: string;
  brandVoice?: string;
  brandValues?: string[];
  targetAudience?: string;
  goals?: string[];
  primaryObjective?: string;
  industry?: string;
  niche?: string;
}
