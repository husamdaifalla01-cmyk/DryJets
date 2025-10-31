/**
 * PLATFORM CONNECTION TYPES
 *
 * Type definitions for platform connections and OAuth flows.
 */

export type Platform =
  | 'twitter'
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'wordpress'
  | 'medium'
  | 'ghost';

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'pending';
export type HealthStatus = 'healthy' | 'warning' | 'error';

export interface PlatformConnection {
  id: string;
  profileId: string;
  platform: Platform;
  status: ConnectionStatus;
  connectedAt: string;
  lastSyncAt?: string;
  expiresAt?: string;

  // OAuth data
  accessToken?: string;
  refreshToken?: string;

  // API key data
  apiKey?: string;
  apiSecret?: string;

  // Platform-specific metadata
  platformUserId?: string;
  platformUsername?: string;

  // Health
  health?: HealthStatus;
  healthCheckedAt?: string;
  errorMessage?: string;
}

export interface OAuth2AuthUrl {
  authUrl: string;
  state: string;
}

export interface ConnectionHealth {
  platform: Platform;
  status: HealthStatus;
  checkedAt: string;
  message?: string;
  details?: {
    rateLimit?: {
      remaining: number;
      total: number;
      resetAt: string;
    };
    permissions?: string[];
  };
}

export interface ConnectPlatformDto {
  platform: Platform;
  redirectUri: string;
}

export interface CompleteOAuthDto {
  platform: Platform;
  code: string;
  state: string;
}

export interface ConnectApiKeyDto {
  platform: Platform;
  apiKey: string;
  apiSecret?: string;
}

export const PLATFORM_INFO: Record<Platform, {
  name: string;
  icon: string;
  color: string;
  authType: 'oauth' | 'api-key';
  description: string;
}> = {
  twitter: {
    name: 'Twitter / X',
    icon: '𝕏',
    color: '#000000',
    authType: 'oauth',
    description: 'Connect your Twitter/X account for automated posting',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'in',
    color: '#0A66C2',
    authType: 'oauth',
    description: 'Professional network for B2B content',
  },
  facebook: {
    name: 'Facebook',
    icon: 'f',
    color: '#1877F2',
    authType: 'oauth',
    description: 'Connect Facebook pages and groups',
  },
  instagram: {
    name: 'Instagram',
    icon: 'IG',
    color: '#E4405F',
    authType: 'oauth',
    description: 'Share visual content and stories',
  },
  tiktok: {
    name: 'TikTok',
    icon: 'TT',
    color: '#000000',
    authType: 'oauth',
    description: 'Short-form video content platform',
  },
  youtube: {
    name: 'YouTube',
    icon: 'YT',
    color: '#FF0000',
    authType: 'oauth',
    description: 'Video content and YouTube Shorts',
  },
  wordpress: {
    name: 'WordPress',
    icon: 'WP',
    color: '#21759B',
    authType: 'api-key',
    description: 'Self-hosted or WordPress.com blogs',
  },
  medium: {
    name: 'Medium',
    icon: 'M',
    color: '#000000',
    authType: 'api-key',
    description: 'Long-form content publication',
  },
  ghost: {
    name: 'Ghost',
    icon: 'G',
    color: '#15171A',
    authType: 'api-key',
    description: 'Professional publishing platform',
  },
};
