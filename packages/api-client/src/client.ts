import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  onResponse?: (response: any) => any;
  onError?: (error: AxiosError) => Promise<any>;
}

/**
 * Create a configured Axios instance for API calls
 */
export function createApiClient(config: ApiClientConfig = {}): AxiosInstance {
  const {
    baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    timeout = 30000,
    headers = {},
    onRequest,
    onResponse,
    onError,
  } = config;

  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    async (requestConfig) => {
      // Add auth token if available
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
        : null;

      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }

      // Call custom request handler if provided
      if (onRequest) {
        return await onRequest(requestConfig);
      }

      return requestConfig;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      // Call custom response handler if provided
      if (onResponse) {
        return onResponse(response);
      }
      return response;
    },
    async (error: AxiosError) => {
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        // Clear auth tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');
        }

        // Redirect to login (only in browser)
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = '/login';
        }
      }

      // Call custom error handler if provided
      if (onError) {
        return await onError(error);
      }

      // Format error for better debugging
      const formattedError = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      };

      console.error('API Error:', formattedError);
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Default API client instance
 * Can be replaced by calling setApiClient() with custom configuration
 */
let defaultClient: AxiosInstance = createApiClient();

/**
 * Get the current default API client
 */
export function getApiClient(): AxiosInstance {
  return defaultClient;
}

/**
 * Set a custom API client configuration
 * Useful for testing or custom auth flows
 */
export function setApiClient(config: ApiClientConfig): void {
  defaultClient = createApiClient(config);
}

/**
 * Reset to default API client
 */
export function resetApiClient(): void {
  defaultClient = createApiClient();
}

// Export the default client
export const client = defaultClient;
