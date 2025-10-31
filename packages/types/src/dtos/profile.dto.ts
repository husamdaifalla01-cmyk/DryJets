/**
 * PROFILE DTOs
 *
 * @description Data Transfer Objects for marketing profile operations
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#profile-management
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#profile-apis
 * @useCase UC010-UC020 (Profile Management)
 */

import type { ProfileStatus } from '../marketing/profile.types';

/**
 * Create Marketing Profile DTO
 * @useCase UC010 - Create Marketing Profile
 */
export class CreateProfileDto {
  /** Profile name */
  name: string;

  /** Profile description */
  description?: string;

  /** Brand name */
  brandName: string;

  /** Brand voice (e.g., professional, casual, friendly) */
  brandVoice: string;

  /** Brand values */
  brandValues: string[];

  /** Target audience description */
  targetAudience: string;

  /** Marketing goals */
  goals: string[];

  /** Primary marketing objective */
  primaryObjective: string;

  /** Industry */
  industry: string;

  /** Niche or sub-industry */
  niche: string;

  /** Monthly budget */
  monthlyBudget?: number;

  /** Geographic focus */
  geographicFocus?: string;

  /** Competitor URLs for analysis */
  competitorUrls?: string[];

  /** Website URL */
  websiteUrl?: string;

  /** Social media profiles */
  socialProfiles?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };

  /** Product/service description */
  productDescription?: string;

  /** Value proposition */
  valueProposition?: string;

  /** Content preferences */
  contentPreferences?: {
    tones?: string[];
    topics?: string[];
    formats?: string[];
    excludedTopics?: string[];
  };

  /** Publishing frequency per platform */
  publishingFrequency?: Record<string, number>;

  /** Brand guidelines */
  brandGuidelines?: {
    colors?: string[];
    fonts?: string[];
    logoUrl?: string;
    styleguideUrl?: string;
  };

  /** Compliance requirements */
  complianceRequirements?: string[];
}

/**
 * Update Marketing Profile DTO
 * @useCase UC011 - Update Marketing Profile
 */
export class UpdateProfileDto {
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
  monthlyBudget?: number;
  geographicFocus?: string;
  competitorUrls?: string[];
  websiteUrl?: string;
  socialProfiles?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  productDescription?: string;
  valueProposition?: string;
  contentPreferences?: {
    tones?: string[];
    topics?: string[];
    formats?: string[];
    excludedTopics?: string[];
  };
  publishingFrequency?: Record<string, number>;
  brandGuidelines?: {
    colors?: string[];
    fonts?: string[];
    logoUrl?: string;
    styleguideUrl?: string;
  };
  complianceRequirements?: string[];
  status?: ProfileStatus;
}

/**
 * Profile Query Parameters
 */
export class ProfileQueryDto {
  status?: ProfileStatus;
  industry?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
