import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/**
 * Marketing Profile Service
 *
 * Manages autonomous marketing profiles for users.
 * Each profile is completely isolated and can have its own:
 * - Platform connections
 * - Campaigns
 * - Content
 * - Published posts
 *
 * This enables multi-client management or A/B testing different strategies.
 */

// DTOs
export interface CreateProfileDto {
  userId: string;

  // Required fields (Option A)
  name: string;
  industry: string;
  targetAudience: string;
  primaryGoal: string;
  monthlyBudget: number;

  // Optional advanced fields (Option C)
  brandVoice?: string;
  geographicFocus?: string;
  competitorUrls?: string[];
  websiteUrl?: string;
  socialProfiles?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  productDescription?: string;
  valueProposition?: string;
  contentPreferences?: {
    preferVideo?: boolean;
    videoLength?: string;
    preferText?: boolean;
    textLength?: string;
    tonePreference?: string;
  };
  publishingFrequency?: {
    blogs?: number;
    social?: number;
    videos?: number;
    newsletters?: number;
  };
  brandGuidelines?: {
    colors?: string[];
    fonts?: string[];
    tone?: string;
    doNots?: string[];
  };
  complianceRequirements?: string[];
}

export interface UpdateProfileDto {
  name?: string;
  industry?: string;
  targetAudience?: string;
  primaryGoal?: string;
  monthlyBudget?: number;
  brandVoice?: string;
  geographicFocus?: string;
  competitorUrls?: string[];
  websiteUrl?: string;
  socialProfiles?: any;
  productDescription?: string;
  valueProposition?: string;
  contentPreferences?: any;
  publishingFrequency?: any;
  brandGuidelines?: any;
  complianceRequirements?: string[];
  status?: 'draft' | 'active' | 'paused' | 'archived';
  landscapeAnalysis?: any;
  strategyPlan?: any;
  repurposingRules?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number; // 0-100, how complete is the profile
  recommendations: string[];
}

@Injectable()
export class MarketingProfileService {
  private readonly logger = new Logger(MarketingProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new marketing profile
   */
  async createProfile(data: CreateProfileDto) {
    this.logger.log(`Creating marketing profile: "${data.name}" for user: ${data.userId}`);

    // Validate required fields
    const validation = this.validateProfileData(data);
    if (!validation.isValid) {
      throw new BadRequestException(`Invalid profile data: ${validation.errors.join(', ')}`);
    }

    // Create profile
    const profile = await this.prisma.marketingProfile.create({
      data: {
        userId: data.userId,
        name: data.name,
        industry: data.industry,
        targetAudience: data.targetAudience,
        primaryGoal: data.primaryGoal,
        monthlyBudget: data.monthlyBudget,

        // Optional fields
        brandVoice: data.brandVoice,
        geographicFocus: data.geographicFocus,
        competitorUrls: data.competitorUrls || [],
        websiteUrl: data.websiteUrl,
        socialProfiles: data.socialProfiles as any,
        productDescription: data.productDescription,
        valueProposition: data.valueProposition,
        contentPreferences: data.contentPreferences as any,
        publishingFrequency: data.publishingFrequency as any,
        brandGuidelines: data.brandGuidelines as any,
        complianceRequirements: data.complianceRequirements || [],

        status: 'draft', // Start as draft until analyzed
      },
    });

    this.logger.log(`✅ Profile created: ${profile.id}`);
    this.logger.log(`   Completeness: ${validation.completeness}%`);

    if (validation.warnings.length > 0) {
      this.logger.warn(`   Warnings: ${validation.warnings.join(', ')}`);
    }

    return {
      profile,
      validation,
    };
  }

  /**
   * Get a single profile by ID
   */
  async getProfile(id: string, userId: string) {
    const profile = await this.prisma.marketingProfile.findFirst({
      where: {
        id,
        userId, // Ensure user owns this profile
      },
      include: {
        platformConnections: true,
        campaigns: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Latest 5 campaigns
        },
        _count: {
          select: {
            campaigns: true,
            content: true,
            publishedPosts: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found: ${id}`);
    }

    return profile;
  }

  /**
   * List all profiles for a user
   */
  async listProfiles(userId: string) {
    const profiles = await this.prisma.marketingProfile.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            platformConnections: true,
            campaigns: true,
            content: true,
            publishedPosts: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    return profiles;
  }

  /**
   * Update a profile
   */
  async updateProfile(id: string, userId: string, data: UpdateProfileDto) {
    this.logger.log(`Updating profile: ${id}`);

    // Verify ownership
    const existing = await this.getProfile(id, userId);

    // Update
    const updated = await this.prisma.marketingProfile.update({
      where: { id },
      data: {
        ...data,
        socialProfiles: data.socialProfiles as any,
        contentPreferences: data.contentPreferences as any,
        publishingFrequency: data.publishingFrequency as any,
        brandGuidelines: data.brandGuidelines as any,
        landscapeAnalysis: data.landscapeAnalysis as any,
        strategyPlan: data.strategyPlan as any,
        repurposingRules: data.repurposingRules as any,
      },
      include: {
        platformConnections: true,
        _count: {
          select: {
            campaigns: true,
            content: true,
            publishedPosts: true,
          },
        },
      },
    });

    this.logger.log(`✅ Profile updated: ${id}`);

    return updated;
  }

  /**
   * Delete a profile
   * This will cascade delete all related data
   */
  async deleteProfile(id: string, userId: string) {
    this.logger.log(`Deleting profile: ${id}`);

    // Verify ownership
    await this.getProfile(id, userId);

    // Check if profile has active campaigns
    const activeCampaigns = await this.prisma.campaignOrder.count({
      where: {
        profileId: id,
        status: { in: ['generating', 'publishing', 'active'] },
      },
    });

    if (activeCampaigns > 0) {
      throw new BadRequestException(
        `Cannot delete profile with ${activeCampaigns} active campaigns. Pause or complete them first.`
      );
    }

    // Delete (cascades to all related data)
    await this.prisma.marketingProfile.delete({
      where: { id },
    });

    this.logger.log(`✅ Profile deleted: ${id}`);

    return { success: true, message: 'Profile deleted successfully' };
  }

  /**
   * Switch to a different profile (update user's current profile context)
   * This would typically be stored in session or user preferences
   */
  async switchProfile(userId: string, profileId: string) {
    // Verify user owns this profile
    const profile = await this.getProfile(profileId, userId);

    this.logger.log(`User ${userId} switched to profile: ${profile.name}`);

    return {
      success: true,
      profile,
    };
  }

  /**
   * Validate profile data
   */
  validateProfileData(data: Partial<CreateProfileDto>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let completeness = 0;

    // Required fields validation (Option A) - 5 fields = 50% baseline
    if (!data.name) errors.push('Profile name is required');
    else completeness += 10;

    if (!data.industry) errors.push('Industry/niche is required');
    else completeness += 10;

    if (!data.targetAudience) errors.push('Target audience is required');
    else completeness += 10;

    if (!data.primaryGoal) errors.push('Primary goal is required');
    else completeness += 10;

    if (!data.monthlyBudget || data.monthlyBudget <= 0) {
      errors.push('Monthly budget is required and must be positive');
    } else {
      completeness += 10;
    }

    // Optional advanced fields (Option C) - each adds to completeness
    if (data.brandVoice) {
      completeness += 5;
    } else {
      recommendations.push('Add brand voice for more consistent content');
    }

    if (data.geographicFocus) {
      completeness += 5;
    }

    if (data.competitorUrls && data.competitorUrls.length > 0) {
      completeness += 5;
    } else {
      recommendations.push('Add competitor URLs for better competitive analysis');
    }

    if (data.websiteUrl) {
      completeness += 5;
    } else {
      warnings.push('No website URL - publishing to blog will require platform connection');
    }

    if (data.socialProfiles && Object.keys(data.socialProfiles).length > 0) {
      completeness += 5;
    }

    if (data.productDescription) {
      completeness += 5;
    } else {
      recommendations.push('Add product description for more targeted content');
    }

    if (data.valueProposition) {
      completeness += 5;
    }

    if (data.contentPreferences) {
      completeness += 5;
    }

    if (data.publishingFrequency) {
      completeness += 5;
    } else {
      recommendations.push('Specify publishing frequency for better planning');
    }

    if (data.brandGuidelines) {
      completeness += 5;
    } else {
      recommendations.push('Add brand guidelines for consistent visual identity');
    }

    if (data.complianceRequirements && data.complianceRequirements.length > 0) {
      completeness += 5;
    }

    // Budget warnings
    if (data.monthlyBudget && data.monthlyBudget < 500) {
      warnings.push('Budget under $500/month may limit content production volume');
    }

    completeness = Math.min(100, completeness);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness,
      recommendations,
    };
  }

  /**
   * Get profile statistics
   */
  async getProfileStats(profileId: string, userId: string) {
    // Verify ownership
    await this.getProfile(profileId, userId);

    // Get counts
    const stats = await this.prisma.marketingProfile.findUnique({
      where: { id: profileId },
      include: {
        _count: {
          select: {
            platformConnections: true,
            campaigns: true,
            content: true,
            publishedPosts: true,
          },
        },
      },
    });

    // Get campaign stats
    const campaigns = await this.prisma.campaignOrder.findMany({
      where: { profileId },
      select: {
        status: true,
        budgetUsed: true,
        metrics: true,
      },
    });

    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
    const completedCampaigns = campaigns.filter((c) => c.status === 'completed').length;
    const totalBudgetUsed = campaigns.reduce((sum, c) => sum + Number(c.budgetUsed), 0);

    // Get platform connections
    const connectedPlatforms = await this.prisma.platformConnection.count({
      where: {
        profileId,
        isConnected: true,
      },
    });

    // Get performance metrics (from published posts)
    const posts = await this.prisma.publishedPost.findMany({
      where: { profileId },
      select: {
        views: true,
        likes: true,
        comments: true,
        shares: true,
        conversions: true,
      },
    });

    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
    const totalEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0);
    const totalConversions = posts.reduce((sum, p) => sum + p.conversions, 0);

    return {
      profile: stats,
      counts: stats?._count,
      campaigns: {
        total: campaigns.length,
        active: activeCampaigns,
        completed: completedCampaigns,
        totalBudgetUsed,
      },
      platforms: {
        connected: connectedPlatforms,
        total: stats?._count.platformConnections || 0,
      },
      performance: {
        totalViews,
        totalEngagement,
        totalConversions,
        avgEngagementRate: posts.length > 0 ? totalEngagement / totalViews : 0,
        avgConversionRate: posts.length > 0 ? totalConversions / totalViews : 0,
      },
    };
  }

  /**
   * Archive a profile (soft delete)
   */
  async archiveProfile(id: string, userId: string) {
    return this.updateProfile(id, userId, { status: 'archived' });
  }

  /**
   * Activate a profile
   */
  async activateProfile(id: string, userId: string) {
    return this.updateProfile(id, userId, { status: 'active' });
  }

  /**
   * Pause a profile (pause all active campaigns)
   */
  async pauseProfile(id: string, userId: string) {
    this.logger.log(`Pausing profile: ${id}`);

    // Verify ownership
    await this.getProfile(id, userId);

    // Pause all active campaigns
    await this.prisma.campaignOrder.updateMany({
      where: {
        profileId: id,
        status: 'active',
      },
      data: {
        status: 'paused',
      },
    });

    // Update profile status
    return this.updateProfile(id, userId, { status: 'paused' });
  }
}
