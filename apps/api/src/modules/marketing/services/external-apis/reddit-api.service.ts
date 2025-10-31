import { Injectable, Logger } from '@nestjs/common';
import { APIClientService } from './api-client.service';

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
  upvote_ratio: number;
}

interface SubredditTrend {
  keyword: string;
  subreddit: string;
  frequency: number;
  avgScore: number;
  trending: boolean;
  topPosts: RedditPost[];
}

interface SubredditInfo {
  name: string;
  subscribers: number;
  active_users: number;
  description: string;
  created_utc: number;
}

/**
 * Reddit API Integration
 * Provides subreddit monitoring and weak signal detection
 */
@Injectable()
export class RedditAPIService {
  private readonly logger = new Logger('RedditAPI');
  private readonly apiConfig = {
    baseURL: 'https://oauth.reddit.com',
    headers: {},
    rateLimit: {
      requestsPerMinute: 60, // Reddit OAuth limit
      requestsPerHour: 1000,
    },
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
    },
    timeout: 10000,
  };

  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private readonly apiClient: APIClientService) {}

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Reddit credentials not configured');
    }

    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const response = await this.apiClient.request<any>(
        {
          method: 'POST',
          url: 'https://www.reddit.com/api/v1/access_token',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: 'grant_type=client_credentials',
        },
        {
          ...this.apiConfig,
          baseURL: '',
          rateLimit: { requestsPerMinute: 10 },
        },
        'RedditAuth',
      );

      this.accessToken = response.access_token;
      this.tokenExpiry = Date.now() + (response.expires_in * 1000) - 60000; // 1 min buffer

      return this.accessToken;
    } catch (error) {
      this.logger.error(`Error getting Reddit access token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get hot posts from a subreddit
   */
  async getHotPosts(params: {
    subreddit: string;
    limit?: number;
    timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  }): Promise<RedditPost[]> {
    this.logger.log(`Fetching hot posts from r/${params.subreddit}`);

    try {
      const token = await this.getAccessToken();

      const response = await this.apiClient.request<any>(
        {
          method: 'GET',
          url: `/r/${params.subreddit}/hot`,
          params: {
            limit: params.limit || 25,
            t: params.timeFilter || 'day',
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'DryJets-Marketing-Engine/1.0',
          },
        },
        this.apiConfig,
        'RedditAPI',
      );

      return this.parsePosts(response.data?.children || []);
    } catch (error) {
      this.logger.error(`Error fetching hot posts: ${error.message}`);
      return [];
    }
  }

  /**
   * Search posts across Reddit
   */
  async searchPosts(params: {
    query: string;
    subreddit?: string;
    limit?: number;
    sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
    timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  }): Promise<RedditPost[]> {
    this.logger.log(`Searching Reddit for: ${params.query}`);

    try {
      const token = await this.getAccessToken();
      const subredditPath = params.subreddit ? `/r/${params.subreddit}` : '';

      const response = await this.apiClient.request<any>(
        {
          method: 'GET',
          url: `${subredditPath}/search`,
          params: {
            q: params.query,
            limit: params.limit || 25,
            sort: params.sort || 'relevance',
            t: params.timeFilter || 'week',
            restrict_sr: params.subreddit ? 'true' : 'false',
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'DryJets-Marketing-Engine/1.0',
          },
        },
        this.apiConfig,
        'RedditAPI',
      );

      return this.parsePosts(response.data?.children || []);
    } catch (error) {
      this.logger.error(`Error searching posts: ${error.message}`);
      return [];
    }
  }

  /**
   * Monitor multiple subreddits for trending keywords
   */
  async monitorSubreddits(params: {
    subreddits: string[];
    keywords: string[];
    timeFilter?: 'hour' | 'day' | 'week';
  }): Promise<SubredditTrend[]> {
    this.logger.log(`Monitoring ${params.subreddits.length} subreddits for ${params.keywords.length} keywords`);

    const trends: SubredditTrend[] = [];

    for (const subreddit of params.subreddits) {
      for (const keyword of params.keywords) {
        try {
          const posts = await this.searchPosts({
            query: keyword,
            subreddit,
            limit: 100,
            timeFilter: params.timeFilter || 'day',
          });

          if (posts.length > 0) {
            const avgScore = posts.reduce((sum, p) => sum + p.score, 0) / posts.length;
            const totalEngagement = posts.reduce((sum, p) => sum + p.num_comments + p.score, 0);

            trends.push({
              keyword,
              subreddit,
              frequency: posts.length,
              avgScore,
              trending: totalEngagement > 500 && avgScore > 10,
              topPosts: posts.slice(0, 5),
            });
          }
        } catch (error) {
          this.logger.error(`Error monitoring r/${subreddit} for "${keyword}": ${error.message}`);
        }
      }
    }

    return trends.sort((a, b) => b.avgScore - a.avgScore);
  }

  /**
   * Get subreddit information
   */
  async getSubredditInfo(subreddit: string): Promise<SubredditInfo | null> {
    this.logger.log(`Fetching info for r/${subreddit}`);

    try {
      const token = await this.getAccessToken();

      const response = await this.apiClient.request<any>(
        {
          method: 'GET',
          url: `/r/${subreddit}/about`,
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'DryJets-Marketing-Engine/1.0',
          },
        },
        this.apiConfig,
        'RedditAPI',
      );

      const data = response.data;
      return {
        name: data.display_name,
        subscribers: data.subscribers,
        active_users: data.active_user_count || 0,
        description: data.public_description,
        created_utc: data.created_utc,
      };
    } catch (error) {
      this.logger.error(`Error fetching subreddit info: ${error.message}`);
      return null;
    }
  }

  /**
   * Detect weak signals (early trends) in niche subreddits
   */
  async detectWeakSignals(params: {
    subreddits: string[];
    minScore?: number;
    minComments?: number;
  }): Promise<Array<{
    keyword: string;
    source: string;
    signal: string;
    strength: number;
    community: string;
    url: string;
  }>> {
    this.logger.log(`Detecting weak signals in ${params.subreddits.length} subreddits`);

    const weakSignals: Array<{
      keyword: string;
      source: string;
      signal: string;
      strength: number;
      community: string;
      url: string;
    }> = [];

    for (const subreddit of params.subreddits) {
      try {
        const posts = await this.getHotPosts({
          subreddit,
          limit: 50,
          timeFilter: 'day',
        });

        // Find posts with unusual engagement for the subreddit
        const avgScore = posts.reduce((sum, p) => sum + p.score, 0) / posts.length;

        for (const post of posts) {
          // A weak signal is a post with above-average engagement that hasn't gone mainstream
          if (
            post.score >= (params.minScore || 20) &&
            post.num_comments >= (params.minComments || 5) &&
            post.score > avgScore * 1.5 // 50% above average
          ) {
            // Extract keywords from title
            const keywords = this.extractKeywords(post.title);

            for (const keyword of keywords) {
              weakSignals.push({
                keyword,
                source: 'reddit',
                signal: post.title,
                strength: Math.min(100, Math.floor((post.score / avgScore) * 30)),
                community: `r/${subreddit}`,
                url: `https://reddit.com${post.url}`,
              });
            }
          }
        }
      } catch (error) {
        this.logger.error(`Error detecting weak signals in r/${subreddit}: ${error.message}`);
      }
    }

    return weakSignals
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 50);
  }

  /**
   * Parse Reddit posts from API response
   */
  private parsePosts(children: any[]): RedditPost[] {
    return children
      .filter(child => child.kind === 't3') // t3 = link/post
      .map(child => {
        const data = child.data;
        return {
          id: data.id,
          title: data.title,
          selftext: data.selftext || '',
          author: data.author,
          subreddit: data.subreddit,
          score: data.score,
          num_comments: data.num_comments,
          created_utc: data.created_utc,
          url: data.permalink,
          upvote_ratio: data.upvote_ratio || 0.5,
        };
      });
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Remove common words and extract meaningful terms
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her',
      'this', 'that', 'these', 'those', 'how', 'what', 'when', 'where', 'why',
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));

    // Get unique words
    return [...new Set(words)].slice(0, 5);
  }

  /**
   * Get API usage statistics
   */
  getUsageStats() {
    return this.apiClient.getUsageStats('RedditAPI');
  }
}
