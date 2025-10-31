/**
 * Generic network adapter interface
 * All affiliate network integrations must implement this interface
 */

export interface NetworkAdapterConfig {
  isSandbox: boolean;
  apiKey?: string;
  username?: string;
  password?: string;
  baseUrl?: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface RawOffer {
  externalId: string;
  title: string;
  category: string[];
  description?: string;
  epc: number; // Earnings per click
  payout: number;
  currency: string;
  conversionRate?: number;
  geoTargets: string[];
  allowedTraffic: string[];
  creativeUrls: string[];
  previewUrl?: string;
  terms?: string;
}

export interface SyncResult {
  success: boolean;
  offersFound: number;
  offers: RawOffer[];
  duration: number; // milliseconds
  errorMessage?: string;
}

/**
 * Base interface that all network adapters must implement
 */
export interface NetworkAdapter {
  /**
   * Network identifier
   */
  networkName: string;

  /**
   * Fetch approved offers from the network
   * @param config - Network-specific configuration
   * @returns Promise with sync results
   */
  fetchOffers(config: NetworkAdapterConfig): Promise<SyncResult>;

  /**
   * Validate if configuration is correct
   * @param config - Network-specific configuration
   * @returns Promise<boolean> indicating if credentials are valid
   */
  validateConfig(config: NetworkAdapterConfig): Promise<boolean>;

  /**
   * Generate tracking link for an offer (if supported by network)
   * @param offerId - External offer ID
   * @param config - Network-specific configuration
   * @returns Promise with tracking link or null if manual activation required
   */
  generateTrackingLink?(
    offerId: string,
    config: NetworkAdapterConfig,
  ): Promise<string | null>;
}
