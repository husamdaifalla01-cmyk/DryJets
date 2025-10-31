import { Injectable, Logger } from '@nestjs/common';
import { APIClientService } from './api-client.service';

interface TwitterTrend {
  name: string;
  url: string;
  tweet_volume: number;
  location: string;
}

interface Tweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

interface SearchResult {
  tweets: Tweet[];
  meta: {
    result_count: number;
    newest_id: string;
    oldest_id: string;
    next_token?: string;
  };
}

/**
 * Twitter/X API v2 Integration
 * Provides trend detection and social listening capabilities
 */
@Injectable()
export class TwitterAPIService {
  private readonly logger = new Logger('TwitterAPI');
  private readonly apiConfig = {
    baseURL: 'https://api.twitter.com/2',
    headers: {},
    rateLimit: {
      requestsPerMinute: 15, // Twitter free tier limit
      requestsPerHour: 500,
      requestsPerDay: 10000,
    },
    retry: {
      maxRetries: 2,
      retryDelay: 2000,
      exponentialBackoff: true,
    },
    timeout: 10000,
  };

  constructor(private readonly apiClient: APIClientService) {}

  /**
   * Get trending topics for a location
   */
  async getTrendingTopics(params: {
    woeid?: number; // Where On Earth ID (1 = global, 23424977 = US)
  }): Promise<TwitterTrend[]> {
    this.logger.log(`Fetching Twitter trends for WOEID: ${params.woeid || 1}`);

    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
      this.logger.warn('TWITTER_BEARER_TOKEN not configured, using mock data');
      return this.getMockTrends();
    }

    try {
      // Note: Twitter API v2 doesn't have direct trends endpoint in free tier
      // Using search/recent to identify trending topics
      const keywords = ['AI', 'automation', 'technology', 'business', 'marketing'];
      const trends: TwitterTrend[] = [];

      for (const keyword of keywords) {
        const volume = await this.getKeywordVolume(keyword, bearerToken);
        if (volume > 100) {
          trends.push({
            name: keyword,
            url: `https://twitter.com/search?q=${encodeURIComponent(keyword)}`,
            tweet_volume: volume,
            location: params.woeid === 23424977 ? 'United States' : 'Worldwide',
          });
        }
      }

      return trends.sort((a, b) => b.tweet_volume - a.tweet_volume).slice(0, 20);
    } catch (error) {
      this.logger.error(`Error fetching Twitter trends: ${error.message}`);
      return this.getMockTrends();
    }
  }

  /**
   * Search recent tweets for a keyword
   */
  async searchTweets(params: {
    query: string;
    max_results?: number;
    start_time?: string;
    end_time?: string;
  }): Promise<SearchResult> {
    this.logger.log(`Searching tweets for: ${params.query}`);

    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
      this.logger.warn('TWITTER_BEARER_TOKEN not configured, returning empty results');
      return { tweets: [], meta: { result_count: 0, newest_id: '', oldest_id: '' } };
    }

    try {
      const response = await this.apiClient.request<any>(
        {
          method: 'GET',
          url: '/tweets/search/recent',
          params: {
            query: params.query,
            max_results: params.max_results || 10,
            'tweet.fields': 'created_at,public_metrics,author_id',
            expansions: 'author_id',
            'user.fields': 'username,verified',
            start_time: params.start_time,
            end_time: params.end_time,
          },
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
        this.apiConfig,
        'TwitterSearch',
      );

      return {
        tweets: response.data || [],
        meta: response.meta || { result_count: 0, newest_id: '', oldest_id: '' },
      };
    } catch (error) {
      this.logger.error(`Error searching tweets: ${error.message}`);
      return { tweets: [], meta: { result_count: 0, newest_id: '', oldest_id: '' } };
    }
  }

  /**
   * Get keyword volume (engagement count)
   */
  async getKeywordVolume(keyword: string, bearerToken: string): Promise<number> {
    try {
      // Get recent tweets for the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = await this.searchTweets({
        query: keyword,
        max_results: 100,
        start_time: yesterday.toISOString(),
      });

      // Calculate total engagement
      const totalEngagement = result.tweets.reduce((sum, tweet) => {
        const metrics = tweet.public_metrics;
        return sum + metrics.retweet_count + metrics.reply_count + metrics.like_count;
      }, 0);

      return totalEngagement;
    } catch (error) {
      this.logger.error(`Error getting keyword volume: ${error.message}`);
      return 0;
    }
  }

  /**
   * Analyze sentiment of tweets about a keyword
   */
  async analyzeSentiment(params: {
    keyword: string;
    sampleSize?: number;
  }): Promise<{
    keyword: string;
    sentiment: number; // -1 to 1
    positive: number;
    neutral: number;
    negative: number;
    totalTweets: number;
  }> {
    this.logger.log(`Analyzing sentiment for: ${params.keyword}`);

    const result = await this.searchTweets({
      query: params.keyword,
      max_results: params.sampleSize || 100,
    });

    if (result.tweets.length === 0) {
      return {
        keyword: params.keyword,
        sentiment: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        totalTweets: 0,
      };
    }

    // Simple sentiment analysis based on engagement
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    for (const tweet of result.tweets) {
      const text = tweet.text.toLowerCase();
      const metrics = tweet.public_metrics;
      const totalEngagement = metrics.like_count + metrics.retweet_count;

      // Simple keyword-based sentiment
      if (this.hasPositiveKeywords(text)) {
        positive++;
      } else if (this.hasNegativeKeywords(text)) {
        negative++;
      } else {
        neutral++;
      }

      // High engagement tends to be positive
      if (totalEngagement > 100) {
        positive += 0.5;
      }
    }

    const total = result.tweets.length;
    const sentiment = ((positive - negative) / total);

    return {
      keyword: params.keyword,
      sentiment,
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100),
      totalTweets: total,
    };
  }

  /**
   * Get influencers talking about a keyword
   */
  async getInfluencers(params: {
    keyword: string;
    minFollowers?: number;
  }): Promise<Array<{
    username: string;
    verified: boolean;
    tweet: string;
    engagement: number;
    url: string;
  }>> {
    this.logger.log(`Finding influencers for: ${params.keyword}`);

    const result = await this.searchTweets({
      query: params.keyword,
      max_results: 100,
    });

    const influencers: Array<{
      username: string;
      verified: boolean;
      tweet: string;
      engagement: number;
      url: string;
    }> = [];

    for (const tweet of result.tweets) {
      const metrics = tweet.public_metrics;
      const engagement = metrics.like_count + metrics.retweet_count + metrics.reply_count;

      // Filter by engagement (proxy for follower count)
      if (engagement >= (params.minFollowers || 100) / 10) {
        influencers.push({
          username: `user_${tweet.author_id}`,
          verified: false, // Would need user lookup
          tweet: tweet.text,
          engagement,
          url: `https://twitter.com/i/web/status/${tweet.id}`,
        });
      }
    }

    return influencers
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 20);
  }

  /**
   * Check for positive keywords
   */
  private hasPositiveKeywords(text: string): boolean {
    const positiveWords = [
      'love', 'great', 'awesome', 'amazing', 'excellent', 'best',
      'fantastic', 'wonderful', 'perfect', 'brilliant', 'outstanding',
      'impressive', 'incredible', 'phenomenal', 'excited', 'happy',
    ];
    return positiveWords.some(word => text.includes(word));
  }

  /**
   * Check for negative keywords
   */
  private hasNegativeKeywords(text: string): boolean {
    const negativeWords = [
      'hate', 'terrible', 'awful', 'bad', 'worst', 'horrible',
      'poor', 'disappointing', 'useless', 'pathetic', 'failed',
      'broken', 'trash', 'scam', 'avoid', 'waste',
    ];
    return negativeWords.some(word => text.includes(word));
  }

  /**
   * Mock trends (fallback)
   */
  private getMockTrends(): TwitterTrend[] {
    return [
      {
        name: '#AIRevolution',
        url: 'https://twitter.com/search?q=%23AIRevolution',
        tweet_volume: 125000,
        location: 'Worldwide',
      },
      {
        name: 'Automation Tools',
        url: 'https://twitter.com/search?q=Automation%20Tools',
        tweet_volume: 89000,
        location: 'Worldwide',
      },
      {
        name: 'Digital Marketing',
        url: 'https://twitter.com/search?q=Digital%20Marketing',
        tweet_volume: 67000,
        location: 'Worldwide',
      },
      {
        name: 'Remote Work',
        url: 'https://twitter.com/search?q=Remote%20Work',
        tweet_volume: 54000,
        location: 'Worldwide',
      },
      {
        name: 'Sustainable Business',
        url: 'https://twitter.com/search?q=Sustainable%20Business',
        tweet_volume: 43000,
        location: 'Worldwide',
      },
    ];
  }

  /**
   * Get API usage statistics
   */
  getUsageStats() {
    return this.apiClient.getUsageStats('TwitterSearch');
  }
}
