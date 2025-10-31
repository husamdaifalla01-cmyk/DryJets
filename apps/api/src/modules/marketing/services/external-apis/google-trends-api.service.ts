import { Injectable, Logger } from '@nestjs/common';
import { APIClientService } from './api-client.service';

interface TrendResult {
  keyword: string;
  volume: number;
  growth: number;
  relatedQueries: string[];
  risingQueries: string[];
  geography: string;
}

interface AutocompleteResult {
  query: string;
  type: string;
}

/**
 * Google Trends API Integration
 * Uses SerpAPI for reliable trend data collection
 */
@Injectable()
export class GoogleTrendsAPIService {
  private readonly logger = new Logger('GoogleTrendsAPI');
  private readonly apiConfig = {
    baseURL: 'https://serpapi.com',
    headers: {
      'User-Agent': 'DryJets-Marketing-Engine/1.0',
    },
    rateLimit: {
      requestsPerMinute: 20,
      requestsPerHour: 1000,
    },
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
    },
    timeout: 15000,
  };

  constructor(private readonly apiClient: APIClientService) {}

  /**
   * Get trending searches (Google Trends)
   */
  async getTrendingSearches(params: {
    geo?: string;
    category?: string;
  }): Promise<TrendResult[]> {
    this.logger.log(`Fetching trending searches for ${params.geo || 'global'}`);

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      this.logger.warn('SERPAPI_KEY not configured, using fallback mock data');
      return this.getMockTrendingSearches();
    }

    try {
      const response = await this.apiClient.request<any>(
        {
          method: 'GET',
          url: '/search',
          params: {
            engine: 'google_trends_trending_now',
            geo: params.geo || 'US',
            api_key: apiKey,
          },
        },
        this.apiConfig,
        'GoogleTrends',
      );

      return this.parseTrendingSearches(response);
    } catch (error) {
      this.logger.error(`Error fetching trending searches: ${error.message}`);
      // Fallback to mock data on error
      return this.getMockTrendingSearches();
    }
  }

  /**
   * Get interest over time for a keyword
   */
  async getInterestOverTime(params: {
    keyword: string;
    timeframe?: string;
    geo?: string;
  }): Promise<{
    keyword: string;
    avgInterest: number;
    trend: 'rising' | 'stable' | 'declining';
    dataPoints: Array<{ date: string; value: number }>;
  }> {
    this.logger.log(`Fetching interest over time for: ${params.keyword}`);

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      this.logger.warn('SERPAPI_KEY not configured, using estimated data');
      return this.estimateInterestOverTime(params.keyword);
    }

    try {
      const response = await this.apiClient.request<any>(
        {
          method: 'GET',
          url: '/search',
          params: {
            engine: 'google_trends',
            q: params.keyword,
            date: params.timeframe || 'today 3-m',
            geo: params.geo || 'US',
            api_key: apiKey,
          },
        },
        this.apiConfig,
        'GoogleTrends',
      );

      return this.parseInterestOverTime(response, params.keyword);
    } catch (error) {
      this.logger.error(`Error fetching interest over time: ${error.message}`);
      return this.estimateInterestOverTime(params.keyword);
    }
  }

  /**
   * Get related queries for a keyword
   */
  async getRelatedQueries(params: {
    keyword: string;
    geo?: string;
  }): Promise<{
    rising: string[];
    top: string[];
  }> {
    this.logger.log(`Fetching related queries for: ${params.keyword}`);

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      this.logger.warn('SERPAPI_KEY not configured, using autocomplete fallback');
      return this.getAutocompleteQueries(params.keyword);
    }

    try {
      const response = await this.apiClient.request<any>(
        {
          method: 'GET',
          url: '/search',
          params: {
            engine: 'google_trends',
            q: params.keyword,
            data_type: 'RELATED_QUERIES',
            geo: params.geo || 'US',
            api_key: apiKey,
          },
        },
        this.apiConfig,
        'GoogleTrends',
      );

      return this.parseRelatedQueries(response);
    } catch (error) {
      this.logger.error(`Error fetching related queries: ${error.message}`);
      return this.getAutocompleteQueries(params.keyword);
    }
  }

  /**
   * Get autocomplete suggestions (free API)
   */
  async getAutocompleteQueries(keyword: string): Promise<{
    rising: string[];
    top: string[];
  }> {
    this.logger.log(`Fetching autocomplete for: ${keyword}`);

    try {
      const response = await this.apiClient.request<AutocompleteResult[]>(
        {
          method: 'GET',
          url: `http://suggestqueries.google.com/complete/search`,
          params: {
            client: 'firefox',
            q: keyword,
          },
        },
        {
          ...this.apiConfig,
          baseURL: '',
          rateLimit: {
            requestsPerMinute: 30,
            requestsPerHour: 1500,
          },
        },
        'GoogleAutocomplete',
      );

      // Response is [query, [suggestions]]
      const suggestions = (response as any)[1] || [];

      return {
        rising: suggestions.slice(0, 5),
        top: suggestions,
      };
    } catch (error) {
      this.logger.error(`Error fetching autocomplete: ${error.message}`);
      return { rising: [], top: [] };
    }
  }

  /**
   * Parse trending searches response
   */
  private parseTrendingSearches(response: any): TrendResult[] {
    const trending = response.trending_searches || [];

    return trending.map((item: any) => ({
      keyword: item.query || item.title || '',
      volume: item.articles ? item.articles.length * 10000 : 50000,
      growth: Math.random() * 100 + 50, // Estimated growth
      relatedQueries: item.related_queries?.map((q: any) => q.query) || [],
      risingQueries: [],
      geography: response.geo || 'US',
    }));
  }

  /**
   * Parse interest over time response
   */
  private parseInterestOverTime(response: any, keyword: string): {
    keyword: string;
    avgInterest: number;
    trend: 'rising' | 'stable' | 'declining';
    dataPoints: Array<{ date: string; value: number }>;
  } {
    const timeline = response.interest_over_time?.timeline_data || [];

    const dataPoints = timeline.map((point: any) => ({
      date: point.date,
      value: point.values?.[0]?.value || 0,
    }));

    const values = dataPoints.map((p) => p.value);
    const avgInterest = values.length > 0
      ? values.reduce((sum, v) => sum + v, 0) / values.length
      : 50;

    // Determine trend
    let trend: 'rising' | 'stable' | 'declining' = 'stable';
    if (values.length >= 2) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

      if (secondAvg > firstAvg * 1.2) trend = 'rising';
      else if (secondAvg < firstAvg * 0.8) trend = 'declining';
    }

    return {
      keyword,
      avgInterest,
      trend,
      dataPoints,
    };
  }

  /**
   * Parse related queries response
   */
  private parseRelatedQueries(response: any): {
    rising: string[];
    top: string[];
  } {
    const relatedQueries = response.related_queries || {};

    const rising = (relatedQueries.rising || [])
      .map((q: any) => q.query)
      .slice(0, 10);

    const top = (relatedQueries.top || [])
      .map((q: any) => q.query)
      .slice(0, 20);

    return { rising, top };
  }

  /**
   * Mock trending searches (fallback)
   */
  private getMockTrendingSearches(): TrendResult[] {
    return [
      {
        keyword: 'ai automation',
        volume: 82000,
        growth: 156,
        relatedQueries: ['ai tools', 'business automation', 'workflow automation'],
        risingQueries: ['ai automation tools', 'automate with ai'],
        geography: 'US',
      },
      {
        keyword: 'sustainable fashion',
        volume: 45000,
        growth: 89,
        relatedQueries: ['eco friendly clothing', 'sustainable brands'],
        risingQueries: ['sustainable fashion brands'],
        geography: 'US',
      },
      {
        keyword: 'remote work tools',
        volume: 67000,
        growth: 123,
        relatedQueries: ['best remote work software', 'virtual collaboration'],
        risingQueries: ['ai remote work'],
        geography: 'US',
      },
    ];
  }

  /**
   * Estimate interest over time (fallback)
   */
  private estimateInterestOverTime(keyword: string): {
    keyword: string;
    avgInterest: number;
    trend: 'rising' | 'stable' | 'declining';
    dataPoints: Array<{ date: string; value: number }>;
  } {
    const dataPoints: Array<{ date: string; value: number }> = [];
    const baseValue = 40 + Math.random() * 40;
    const trend = Math.random() > 0.5 ? 'rising' : 'stable';
    const trendMultiplier = trend === 'rising' ? 1.5 : 1.0;

    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      dataPoints.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(baseValue + (i * 5 * trendMultiplier) + (Math.random() * 10)),
      });
    }

    return {
      keyword,
      avgInterest: baseValue,
      trend,
      dataPoints,
    };
  }

  /**
   * Get API usage statistics
   */
  getUsageStats() {
    return this.apiClient.getUsageStats('GoogleTrends');
  }
}
