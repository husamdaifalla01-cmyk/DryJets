/**
 * PLATFORM CONNECTION DTOs
 *
 * @description Data Transfer Objects for platform connection operations
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#platform-integration-system
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#connection-apis
 * @useCase UC030-UC039 (Platform Connections)
 */

import type { Platform } from '../marketing/platform.types';

/**
 * Connect Platform DTO (OAuth)
 * @useCase UC030 - Connect Platform via OAuth
 */
export class ConnectPlatformDto {
  /** Platform to connect */
  platform: Platform;

  /** Redirect URI after OAuth */
  redirectUri: string;
}

/**
 * Complete OAuth Flow DTO
 * @useCase UC031 - Complete OAuth Flow
 */
export class CompleteOAuthDto {
  /** Platform name */
  platform: Platform;

  /** Authorization code from OAuth provider */
  code: string;

  /** State parameter for CSRF protection */
  state: string;

  /** Redirect URI used in initial request */
  redirectUri?: string;
}

/**
 * Connect Platform via API Key DTO
 * @useCase UC032 - Connect Platform via API Key
 */
export class ConnectApiKeyDto {
  /** Platform to connect */
  platform: Platform;

  /** API key */
  apiKey?: string;

  /** API secret */
  apiSecret?: string;

  /** Website URL (for WordPress, Ghost) */
  websiteUrl?: string;

  /** Username (for some platforms) */
  username?: string;

  /** Password (for basic auth platforms) */
  password?: string;

  /** Additional platform-specific configuration */
  config?: Record<string, unknown>;
}

/**
 * Disconnect Platform DTO
 * @useCase UC033 - Disconnect Platform
 */
export class DisconnectPlatformDto {
  /** Connection ID to disconnect */
  connectionId: string;

  /** Whether to delete associated content */
  deleteContent?: boolean;
}

/**
 * Refresh Platform Connection DTO
 * @useCase UC034 - Refresh Platform Tokens
 */
export class RefreshConnectionDto {
  /** Connection ID to refresh */
  connectionId: string;
}

/**
 * Check Platform Health DTO
 * @useCase UC035 - Check Platform Health
 */
export class CheckHealthDto {
  /** Connection ID to check */
  connectionId: string;
}

/**
 * Platform Query Parameters
 */
export class PlatformQueryDto {
  status?: 'connected' | 'disconnected' | 'error' | 'pending';
  platform?: Platform;
  health?: 'healthy' | 'warning' | 'error';
}
