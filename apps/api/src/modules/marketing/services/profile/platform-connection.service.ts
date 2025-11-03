import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { TwitterIntegration } from '../platform-integrations/twitter.integration';
import { LinkedInIntegration } from '../platform-integrations/linkedin.integration';
import { FacebookInstagramIntegration } from '../platform-integrations/facebook.integration';
import { TikTokIntegration } from '../platform-integrations/tiktok.integration';
import { YouTubeIntegration } from '../platform-integrations/youtube.integration';

/**
 * PLATFORM CONNECTION MANAGER SERVICE
 *
 * Manages OAuth connections and API integrations for all supported platforms.
 * Handles authentication flows, token management, and connection status monitoring.
 *
 * Supported Platforms:
 * - Twitter (OAuth 1.0a / OAuth 2.0)
 * - LinkedIn (OAuth 2.0)
 * - Facebook & Instagram (OAuth 2.0 + Graph API)
 * - TikTok (Creator API)
 * - YouTube (OAuth 2.0 + Data API)
 * - WordPress (REST API + Credentials)
 * - Medium (API Token)
 * - Ghost (Admin API)
 * - Webflow (OAuth 2.0)
 */

export interface PlatformConnection {
  id: string;
  profileId: string;
  platform: string;
  isConnected: boolean;
  connectionType: string;
  status: string;
  domains?: string[];
  lastSynced?: Date;
  errorMessage?: string;
  config?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuth2AuthUrl {
  authUrl: string;
  state?: string; // FIX: Made optional since OAuth methods don't return state anymore
  platform: string;
}

export interface ConnectionStatus {
  platform: string;
  isConnected: boolean;
  status: string;
  lastSynced?: Date;
  health: 'healthy' | 'warning' | 'error';
  errorMessage?: string;
  canPublish: boolean;
  features: string[];
}

@Injectable()
export class PlatformConnectionService {
  private readonly logger = new Logger(PlatformConnectionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly twitterIntegration: TwitterIntegration,
    private readonly linkedInIntegration: LinkedInIntegration,
    private readonly facebookIntegration: FacebookInstagramIntegration,
    private readonly tiktokIntegration: TikTokIntegration,
    private readonly youtubeIntegration: YouTubeIntegration,
  ) {}

  /**
   * Get all platform connections for a profile
   */
  async getConnections(profileId: string, userId: string): Promise<PlatformConnection[]> {
    // Verify profile ownership
    await this.verifyProfileOwnership(profileId, userId);

    const connections = await this.prisma.platformConnection.findMany({
      where: { profileId },
      orderBy: { createdAt: 'asc' },
    });

    return connections.map(c => this.formatConnection(c));
  }

  /**
   * Get a specific platform connection
   */
  async getConnection(
    profileId: string,
    platform: string,
    userId: string,
  ): Promise<PlatformConnection | null> {
    await this.verifyProfileOwnership(profileId, userId);

    const connection = await this.prisma.platformConnection.findUnique({
      where: {
        profileId_platform: {
          profileId,
          platform,
        },
      },
    });

    return connection ? this.formatConnection(connection) : null;
  }

  /**
   * Initialize OAuth 2.0 flow (Step 1)
   * Returns authorization URL for user to visit
   */
  async initiateOAuthFlow(
    profileId: string,
    platform: string,
    userId: string,
    redirectUri: string,
  ): Promise<OAuth2AuthUrl> {
    this.logger.log(`Initiating OAuth flow for ${platform} on profile ${profileId}`);

    await this.verifyProfileOwnership(profileId, userId);

    let authUrl: string;
    // FIX: getAuthorizationUrl() methods only accept redirectUri, not state parameter

    switch (platform.toLowerCase()) {
      case 'twitter':
        authUrl = await this.twitterIntegration.getAuthorizationUrl(redirectUri);
        break;

      case 'linkedin':
        authUrl = await this.linkedInIntegration.getAuthorizationUrl(redirectUri);
        break;

      case 'facebook':
      case 'instagram':
        authUrl = await this.facebookIntegration.getAuthorizationUrl(redirectUri);
        break;

      case 'tiktok':
        authUrl = await this.tiktokIntegration.getAuthorizationUrl(redirectUri);
        break;

      case 'youtube':
        authUrl = await this.youtubeIntegration.getAuthorizationUrl(redirectUri);
        break;

      default:
        throw new BadRequestException(`OAuth not supported for platform: ${platform}`);
    }

    // Create or update connection with pending status
    await this.prisma.platformConnection.upsert({
      where: {
        profileId_platform: {
          profileId,
          platform,
        },
      },
      create: {
        profileId,
        platform,
        connectionType: 'oauth',
        isConnected: false,
        status: 'pending',
      },
      update: {
        status: 'pending',
        errorMessage: null,
      },
    });

    // FIX: Remove state from return object since it's no longer used
    return {
      authUrl,
      platform,
    };
  }

  /**
   * Complete OAuth 2.0 flow (Step 2)
   * Exchange authorization code for access token
   */
  async completeOAuthFlow(
    profileId: string,
    platform: string,
    code: string,
    redirectUri: string,
    userId: string,
  ): Promise<PlatformConnection> {
    this.logger.log(`Completing OAuth flow for ${platform} on profile ${profileId}`);

    await this.verifyProfileOwnership(profileId, userId);

    let tokens: any;

    try {
      switch (platform.toLowerCase()) {
        case 'twitter':
          tokens = await this.twitterIntegration.exchangeCodeForToken(code, redirectUri);
          break;

        case 'linkedin':
          tokens = await this.linkedInIntegration.exchangeCodeForToken(code, redirectUri);
          break;

        case 'facebook':
        case 'instagram':
          tokens = await this.facebookIntegration.exchangeCodeForToken(code, redirectUri);
          break;

        case 'tiktok':
          tokens = await this.tiktokIntegration.exchangeCodeForToken(code, redirectUri);
          break;

        case 'youtube':
          tokens = await this.youtubeIntegration.exchangeCodeForToken(code, redirectUri);
          break;

        default:
          throw new BadRequestException(`OAuth not supported for platform: ${platform}`);
      }

      // Store tokens (encrypted in production)
      const connection = await this.prisma.platformConnection.upsert({
        where: {
          profileId_platform: {
            profileId,
            platform,
          },
        },
        create: {
          profileId,
          platform,
          connectionType: 'oauth',
          isConnected: true,
          status: 'connected',
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: tokens.expires_at ? new Date(tokens.expires_at * 1000) : null,
          config: tokens.config || {},
          lastSynced: new Date(),
        },
        update: {
          isConnected: true,
          status: 'connected',
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: tokens.expires_at ? new Date(tokens.expires_at * 1000) : null,
          config: tokens.config || {},
          errorMessage: null,
          lastSynced: new Date(),
        },
      });

      this.logger.log(` ${platform} connected successfully for profile ${profileId}`);

      return this.formatConnection(connection);
    } catch (error) {
      this.logger.error(`Failed to complete OAuth for ${platform}:`, error);

      // Update connection with error status
      await this.prisma.platformConnection.upsert({
        where: {
          profileId_platform: {
            profileId,
            platform,
          },
        },
        create: {
          profileId,
          platform,
          connectionType: 'oauth',
          isConnected: false,
          status: 'error',
          errorMessage: error.message,
        },
        update: {
          isConnected: false,
          status: 'error',
          errorMessage: error.message,
        },
      });

      throw new BadRequestException(`Failed to connect ${platform}: ${error.message}`);
    }
  }

  /**
   * Connect platform with API key (non-OAuth platforms)
   */
  async connectWithApiKey(
    profileId: string,
    platform: string,
    credentials: {
      apiKey?: string;
      apiSecret?: string;
      websiteUrl?: string;
      username?: string;
      password?: string;
      config?: any;
    },
    userId: string,
  ): Promise<PlatformConnection> {
    this.logger.log(`Connecting ${platform} with API key for profile ${profileId}`);

    await this.verifyProfileOwnership(profileId, userId);

    try {
      // Validate credentials by making a test API call
      await this.testConnection(platform, credentials);

      // Store credentials (encrypt in production)
      const connection = await this.prisma.platformConnection.upsert({
        where: {
          profileId_platform: {
            profileId,
            platform,
          },
        },
        create: {
          profileId,
          platform,
          connectionType: 'api_key',
          isConnected: true,
          status: 'connected',
          apiKey: credentials.apiKey,
          apiSecret: credentials.apiSecret,
          config: {
            websiteUrl: credentials.websiteUrl,
            username: credentials.username,
            ...credentials.config,
          },
          lastSynced: new Date(),
        },
        update: {
          isConnected: true,
          status: 'connected',
          apiKey: credentials.apiKey,
          apiSecret: credentials.apiSecret,
          config: {
            websiteUrl: credentials.websiteUrl,
            username: credentials.username,
            ...credentials.config,
          },
          errorMessage: null,
          lastSynced: new Date(),
        },
      });

      this.logger.log(` ${platform} connected successfully with API key`);

      return this.formatConnection(connection);
    } catch (error) {
      this.logger.error(`Failed to connect ${platform} with API key:`, error);

      await this.prisma.platformConnection.upsert({
        where: {
          profileId_platform: {
            profileId,
            platform,
          },
        },
        create: {
          profileId,
          platform,
          connectionType: 'api_key',
          isConnected: false,
          status: 'error',
          errorMessage: error.message,
        },
        update: {
          isConnected: false,
          status: 'error',
          errorMessage: error.message,
        },
      });

      throw new BadRequestException(`Failed to connect ${platform}: ${error.message}`);
    }
  }

  /**
   * Disconnect a platform
   */
  async disconnectPlatform(
    profileId: string,
    platform: string,
    userId: string,
  ): Promise<void> {
    this.logger.log(`Disconnecting ${platform} from profile ${profileId}`);

    await this.verifyProfileOwnership(profileId, userId);

    await this.prisma.platformConnection.update({
      where: {
        profileId_platform: {
          profileId,
          platform,
        },
      },
      data: {
        isConnected: false,
        status: 'disconnected',
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        apiKey: null,
        apiSecret: null,
      },
    });

    this.logger.log(` ${platform} disconnected from profile ${profileId}`);
  }

  /**
   * Refresh OAuth token
   */
  async refreshToken(
    profileId: string,
    platform: string,
    userId: string,
  ): Promise<PlatformConnection> {
    this.logger.log(`Refreshing token for ${platform} on profile ${profileId}`);

    await this.verifyProfileOwnership(profileId, userId);

    const connection = await this.prisma.platformConnection.findUnique({
      where: {
        profileId_platform: {
          profileId,
          platform,
        },
      },
    });

    if (!connection || !connection.refreshToken) {
      throw new NotFoundException(`No refresh token found for ${platform}`);
    }

    try {
      let tokens: any;

      switch (platform.toLowerCase()) {
        case 'twitter':
          tokens = await this.twitterIntegration.refreshAccessToken(connection.refreshToken);
          break;

        case 'linkedin':
          tokens = await this.linkedInIntegration.refreshAccessToken(connection.refreshToken);
          break;

        case 'facebook':
        case 'instagram':
          tokens = await this.facebookIntegration.refreshAccessToken(connection.refreshToken);
          break;

        case 'youtube':
          tokens = await this.youtubeIntegration.refreshAccessToken(connection.refreshToken);
          break;

        default:
          throw new BadRequestException(`Token refresh not supported for ${platform}`);
      }

      const updated = await this.prisma.platformConnection.update({
        where: {
          profileId_platform: {
            profileId,
            platform,
          },
        },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || connection.refreshToken,
          tokenExpiry: tokens.expires_at ? new Date(tokens.expires_at * 1000) : null,
          lastSynced: new Date(),
        },
      });

      this.logger.log(` Token refreshed for ${platform}`);

      return this.formatConnection(updated);
    } catch (error) {
      this.logger.error(`Failed to refresh token for ${platform}:`, error);
      throw new BadRequestException(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Check connection health and status
   */
  async checkConnectionHealth(
    profileId: string,
    platform: string,
    userId: string,
  ): Promise<ConnectionStatus> {
    await this.verifyProfileOwnership(profileId, userId);

    const connection = await this.prisma.platformConnection.findUnique({
      where: {
        profileId_platform: {
          profileId,
          platform,
        },
      },
    });

    if (!connection) {
      return {
        platform,
        isConnected: false,
        status: 'not_configured',
        health: 'error',
        canPublish: false,
        features: [],
      };
    }

    let health: 'healthy' | 'warning' | 'error' = 'healthy';
    let canPublish = connection.isConnected;

    // Check token expiry
    if (connection.tokenExpiry && connection.tokenExpiry < new Date()) {
      health = 'warning';
      canPublish = false;
    }

    // Check last sync time
    if (connection.lastSynced) {
      const daysSinceSync = (Date.now() - connection.lastSynced.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceSync > 7) {
        health = 'warning';
      }
    }

    // Check for errors
    if (connection.status === 'error' || connection.errorMessage) {
      health = 'error';
      canPublish = false;
    }

    const features = this.getPlatformFeatures(platform);

    return {
      platform,
      isConnected: connection.isConnected,
      status: connection.status,
      lastSynced: connection.lastSynced,
      health,
      errorMessage: connection.errorMessage,
      canPublish,
      features,
    };
  }

  /**
   * Get all connection statuses for a profile
   */
  async getAllConnectionStatuses(profileId: string, userId: string): Promise<ConnectionStatus[]> {
    await this.verifyProfileOwnership(profileId, userId);

    const connections = await this.prisma.platformConnection.findMany({
      where: { profileId },
    });

    const statuses = await Promise.all(
      connections.map(c => this.checkConnectionHealth(profileId, c.platform, userId)),
    );

    return statuses;
  }

  /**
   * Test connection credentials
   */
  private async testConnection(platform: string, credentials: any): Promise<void> {
    switch (platform.toLowerCase()) {
      case 'wordpress':
        // Test WordPress REST API
        // TODO: Implement WordPress API test
        break;

      case 'medium':
        // Test Medium API
        // TODO: Implement Medium API test
        break;

      case 'ghost':
        // Test Ghost Admin API
        // TODO: Implement Ghost API test
        break;

      case 'webflow':
        // Test Webflow API
        // TODO: Implement Webflow API test
        break;

      default:
        throw new BadRequestException(`Platform not supported: ${platform}`);
    }
  }

  /**
   * Get platform features
   */
  private getPlatformFeatures(platform: string): string[] {
    const featureMap = {
      twitter: ['text_posts', 'images', 'videos', 'threads', 'scheduling', 'analytics'],
      linkedin: ['text_posts', 'images', 'videos', 'articles', 'scheduling', 'analytics'],
      facebook: ['text_posts', 'images', 'videos', 'stories', 'scheduling', 'analytics'],
      instagram: ['images', 'videos', 'reels', 'stories', 'carousel', 'scheduling'],
      tiktok: ['videos', 'scheduling', 'analytics'],
      youtube: ['videos', 'shorts', 'community_posts', 'scheduling', 'analytics'],
      wordpress: ['blog_posts', 'pages', 'media', 'seo', 'scheduling'],
      medium: ['articles', 'publications', 'tags'],
      ghost: ['blog_posts', 'pages', 'newsletters', 'memberships'],
      webflow: ['cms_items', 'blog_posts', 'dynamic_content'],
    };

    return featureMap[platform.toLowerCase()] || [];
  }

  /**
   * Verify profile ownership
   */
  private async verifyProfileOwnership(profileId: string, userId: string): Promise<void> {
    const profile = await this.prisma.marketingProfile.findFirst({
      where: {
        id: profileId,
        userId,
      },
    });

    if (!profile) {
      throw new NotFoundException('Marketing profile not found or access denied');
    }
  }

  /**
   * Format connection for API response
   */
  private formatConnection(connection: any): PlatformConnection {
    return {
      id: connection.id,
      profileId: connection.profileId,
      platform: connection.platform,
      isConnected: connection.isConnected,
      connectionType: connection.connectionType,
      status: connection.status,
      domains: connection.domains,
      lastSynced: connection.lastSynced,
      errorMessage: connection.errorMessage,
      config: connection.config,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }
}
