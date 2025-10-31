import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosError } from 'axios';

interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
}

interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  exponentialBackoff: boolean;
}

interface APIClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  rateLimit: RateLimitConfig;
  retry: RetryConfig;
  timeout?: number;
}

interface RequestLog {
  timestamp: number;
  endpoint: string;
  success: boolean;
}

@Injectable()
export class APIClientService {
  private readonly logger = new Logger('APIClient');
  private requestLogs: Map<string, RequestLog[]> = new Map();

  constructor(private readonly http: HttpService) {}

  /**
   * Make a rate-limited API request with retry logic
   */
  async request<T>(
    config: AxiosRequestConfig,
    apiConfig: APIClientConfig,
    apiName: string,
  ): Promise<T> {
    // Check rate limits
    await this.checkRateLimit(apiName, apiConfig.rateLimit);

    let lastError: Error | null = null;
    const maxRetries = apiConfig.retry.maxRetries;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout
        const requestConfig = {
          ...config,
          timeout: apiConfig.timeout || 30000,
          headers: {
            ...config.headers,
            ...apiConfig.headers,
          },
        };

        if (apiConfig.baseURL && !config.url?.startsWith('http')) {
          requestConfig.url = `${apiConfig.baseURL}${config.url}`;
        }

        this.logger.debug(
          `[${apiName}] Attempt ${attempt + 1}/${maxRetries + 1}: ${config.method || 'GET'} ${requestConfig.url}`,
        );

        const response = await firstValueFrom(this.http.request<T>(requestConfig));

        // Log successful request
        this.logRequest(apiName, config.url || '', true);

        return response.data;
      } catch (error) {
        lastError = error as Error;
        const axiosError = error as AxiosError;

        // Log failed request
        this.logRequest(apiName, config.url || '', false);

        // Don't retry on 4xx errors (client errors)
        if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
          this.logger.warn(`[${apiName}] Client error (${axiosError.response.status}), not retrying: ${axiosError.message}`);
          throw error;
        }

        // Rate limit error - wait longer
        if (axiosError.response?.status === 429) {
          const retryAfter = parseInt(axiosError.response.headers['retry-after'] || '60', 10);
          this.logger.warn(`[${apiName}] Rate limited, waiting ${retryAfter}s before retry`);
          await this.sleep(retryAfter * 1000);
          continue;
        }

        // If we've exhausted retries, throw error
        if (attempt === maxRetries) {
          this.logger.error(`[${apiName}] All ${maxRetries + 1} attempts failed: ${lastError.message}`);
          throw lastError;
        }

        // Calculate retry delay with optional exponential backoff
        const baseDelay = apiConfig.retry.retryDelay;
        const delay = apiConfig.retry.exponentialBackoff
          ? baseDelay * Math.pow(2, attempt)
          : baseDelay;

        this.logger.warn(
          `[${apiName}] Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${lastError.message}`,
        );

        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Request failed');
  }

  /**
   * Check if we're within rate limits
   */
  private async checkRateLimit(apiName: string, limits: RateLimitConfig): Promise<void> {
    const now = Date.now();
    const logs = this.requestLogs.get(apiName) || [];

    // Clean up old logs (older than 24 hours)
    const recentLogs = logs.filter((log) => now - log.timestamp < 24 * 60 * 60 * 1000);
    this.requestLogs.set(apiName, recentLogs);

    // Check per-minute limit
    const lastMinute = recentLogs.filter((log) => now - log.timestamp < 60 * 1000);
    if (lastMinute.length >= limits.requestsPerMinute) {
      const waitTime = 60 * 1000 - (now - lastMinute[0].timestamp);
      this.logger.warn(`[${apiName}] Rate limit reached (${limits.requestsPerMinute}/min), waiting ${waitTime}ms`);
      await this.sleep(waitTime);
      return this.checkRateLimit(apiName, limits);
    }

    // Check per-hour limit
    if (limits.requestsPerHour) {
      const lastHour = recentLogs.filter((log) => now - log.timestamp < 60 * 60 * 1000);
      if (lastHour.length >= limits.requestsPerHour) {
        const waitTime = 60 * 60 * 1000 - (now - lastHour[0].timestamp);
        this.logger.warn(`[${apiName}] Rate limit reached (${limits.requestsPerHour}/hour), waiting ${waitTime}ms`);
        await this.sleep(waitTime);
        return this.checkRateLimit(apiName, limits);
      }
    }

    // Check per-day limit
    if (limits.requestsPerDay) {
      const lastDay = recentLogs.filter((log) => now - log.timestamp < 24 * 60 * 60 * 1000);
      if (lastDay.length >= limits.requestsPerDay) {
        const waitTime = 24 * 60 * 60 * 1000 - (now - lastDay[0].timestamp);
        this.logger.warn(`[${apiName}] Rate limit reached (${limits.requestsPerDay}/day), waiting ${waitTime}ms`);
        await this.sleep(waitTime);
        return this.checkRateLimit(apiName, limits);
      }
    }
  }

  /**
   * Log an API request
   */
  private logRequest(apiName: string, endpoint: string, success: boolean): void {
    const logs = this.requestLogs.get(apiName) || [];
    logs.push({
      timestamp: Date.now(),
      endpoint,
      success,
    });
    this.requestLogs.set(apiName, logs);
  }

  /**
   * Sleep for a specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get API usage statistics
   */
  getUsageStats(apiName: string): {
    last24Hours: number;
    lastHour: number;
    lastMinute: number;
    successRate: number;
  } {
    const logs = this.requestLogs.get(apiName) || [];
    const now = Date.now();

    const last24Hours = logs.filter((log) => now - log.timestamp < 24 * 60 * 60 * 1000);
    const lastHour = logs.filter((log) => now - log.timestamp < 60 * 60 * 1000);
    const lastMinute = logs.filter((log) => now - log.timestamp < 60 * 1000);

    const successfulRequests = last24Hours.filter((log) => log.success).length;
    const successRate = last24Hours.length > 0 ? successfulRequests / last24Hours.length : 1;

    return {
      last24Hours: last24Hours.length,
      lastHour: lastHour.length,
      lastMinute: lastMinute.length,
      successRate,
    };
  }

  /**
   * Clear request logs for an API (useful for testing)
   */
  clearLogs(apiName: string): void {
    this.requestLogs.delete(apiName);
  }
}
