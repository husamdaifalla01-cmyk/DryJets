/**
 * @dryjets/api-client
 *
 * Type-safe API client for DryJets platform
 * Auto-generated from OpenAPI specification
 */

// Export client configuration and utilities
export {
  createApiClient,
  getApiClient,
  setApiClient,
  resetApiClient,
  client,
  type ApiClientConfig,
} from './client';

// Export generated types and services
// Note: These exports will be available after running `npm run generate`
// If you see errors, run: npm run generate
export * from './generated';

// Re-export axios types for convenience
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
