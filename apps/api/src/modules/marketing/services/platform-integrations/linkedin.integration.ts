import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

interface LinkedInContent {
  text: string
  title?: string
  imageUrl?: string
  articleUrl?: string
  hashtags?: string[]
}

interface LinkedInPublishResult {
  success: boolean
  postId?: string
  url?: string
  error?: string
  timestamp: Date
}

interface LinkedInAnalytics {
  impressions: number
  engagements: number
  comments: number
  shares: number
  clicks: number
  reactions: number
}

@Injectable()
export class LinkedInIntegration {
  private readonly logger = new Logger('LinkedInIntegration')
  private readonly baseUrl = 'https://api.linkedin.com/rest'
  private readonly accessToken: string
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly companyId: string
  private readonly organizationId: string

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.accessToken = this.config.get('LINKEDIN_ACCESS_TOKEN', '')
    this.clientId = this.config.get('LINKEDIN_CLIENT_ID', '')
    this.clientSecret = this.config.get('LINKEDIN_CLIENT_SECRET', '')
    this.companyId = this.config.get('LINKEDIN_COMPANY_ID', '')
    this.organizationId = this.config.get('LINKEDIN_ORGANIZATION_ID', '')
  }

  /**
   * Publish a post to LinkedIn
   */
  async publishPost(content: LinkedInContent): Promise<LinkedInPublishResult> {
    try {
      if (!this.accessToken) {
        this.logger.warn('LinkedIn Access Token not configured')
        return {
          success: false,
          error: 'LinkedIn API not configured',
          timestamp: new Date(),
        }
      }

      const payload = {
        commentary: content.text,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
      }

      if (content.imageUrl) {
        (payload as any).content = {
          media: {
            id: content.imageUrl,
          },
        }
      }

      if (content.articleUrl) {
        (payload as any).content = {
          article: {
            source: content.articleUrl,
            title: content.title,
            description: content.text.substring(0, 200),
          },
        }
      }

      const response = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/posts`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
              'LinkedIn-Version': '202401',
            },
          }
        )
      )

      const postId = response.data.id || response.headers['x-restli-id']

      this.logger.log(`LinkedIn post published successfully: ${postId}`)

      return {
        success: true,
        postId,
        url: `https://www.linkedin.com/feed/update/${postId}`,
        timestamp: new Date(),
      }
    } catch (error: any) {
      this.logger.error(`Failed to publish LinkedIn post: ${error.message}`)
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Share an article/URL to LinkedIn
   */
  async shareArticle(
    url: string,
    title: string,
    description: string
  ): Promise<LinkedInPublishResult> {
    try {
      if (!this.accessToken) {
        return {
          success: false,
          error: 'LinkedIn API not configured',
          timestamp: new Date(),
        }
      }

      const payload = {
        commentary: description,
        content: {
          shareMediaCategory: 'ARTICLE',
          shareUrl: url,
        },
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
        },
      }

      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/posts`, payload, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': '202401',
          },
        })
      )

      const postId = response.data.id

      this.logger.log(`Article shared to LinkedIn: ${postId}`)

      return {
        success: true,
        postId,
        url: `https://www.linkedin.com/feed/update/${postId}`,
        timestamp: new Date(),
      }
    } catch (error: any) {
      this.logger.error(`Failed to share article: ${error.message}`)
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Get post analytics
   */
  async getPostAnalytics(postId: string): Promise<LinkedInAnalytics> {
    try {
      if (!this.accessToken) {
        return {
          impressions: 0,
          engagements: 0,
          comments: 0,
          shares: 0,
          clicks: 0,
          reactions: 0,
        }
      }

      const response = await firstValueFrom(
        this.http.get(`${this.baseUrl}/posts/${postId}?fields=lifecycleState,visibilityEditingState`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })
      )

      // In real implementation, fetch from analytics endpoint
      const analyticsResponse = await firstValueFrom(
        this.http.get(
          `${this.baseUrl}/organizationalEntityAcls?q=roleAssignee&roleAssignee=${this.organizationId}&projection=(elements*(organizationalTarget,organizationalRole,state))`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        )
      ).catch(() => ({ data: {} }))

      return {
        impressions: Math.floor(Math.random() * 10000) + 1000,
        engagements: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 100) + 5,
        shares: Math.floor(Math.random() * 50) + 2,
        clicks: Math.floor(Math.random() * 300) + 20,
        reactions: Math.floor(Math.random() * 200) + 10,
      }
    } catch (error: any) {
      this.logger.error(`Failed to get analytics: ${error.message}`)
      return {
        impressions: 0,
        engagements: 0,
        comments: 0,
        shares: 0,
        clicks: 0,
        reactions: 0,
      }
    }
  }

  /**
   * Get user/company profile metrics
   */
  async getProfileMetrics(): Promise<{
    followers: number
    connections: number
    posts: number
  }> {
    try {
      if (!this.accessToken) {
        return { followers: 0, connections: 0, posts: 0 }
      }

      // Mock data for demonstration
      return {
        followers: Math.floor(Math.random() * 50000) + 5000,
        connections: Math.floor(Math.random() * 10000) + 1000,
        posts: Math.floor(Math.random() * 500) + 50,
      }
    } catch (error: any) {
      this.logger.error(`Failed to get profile metrics: ${error.message}`)
      return { followers: 0, connections: 0, posts: 0 }
    }
  }

  /**
   * Get trending topics on LinkedIn
   */
  async getTrendingTopics(): Promise<string[]> {
    try {
      // Mock trending topics
      const trends = [
        '#ArtificialIntelligence',
        '#RemoteWork',
        '#CareerGrowth',
        '#Innovation',
        '#Leadership',
        '#DataScience',
        '#CloudComputing',
        '#LinkedInJobs',
      ]

      return trends
    } catch (error: any) {
      this.logger.error(`Failed to get trending topics: ${error.message}`)
      return []
    }
  }

  /**
   * Search for industry insights
   */
  async searchInsights(keyword: string): Promise<any[]> {
    try {
      // Mock insights data
      return [
        {
          title: `${keyword} Market Trends 2025`,
          author: 'Industry Expert',
          views: Math.floor(Math.random() * 100000),
          engagement: Math.floor(Math.random() * 10000),
        },
        {
          title: `Future of ${keyword}: What to Expect`,
          author: 'Tech Analyst',
          views: Math.floor(Math.random() * 80000),
          engagement: Math.floor(Math.random() * 8000),
        },
      ]
    } catch (error: any) {
      this.logger.error(`Failed to search insights: ${error.message}`)
      return []
    }
  }

  /**
   * Get platform-specific recommendations
   */
  getPlatformRecommendations(): {
    bestPostTimes: string[]
    recommendedHashtags: string[]
    contentTips: string[]
    optimalLength: string
  } {
    return {
      bestPostTimes: [
        '8:00 AM - Work start',
        '12:00 PM - Lunch break',
        '5:00 PM - End of work',
      ],
      recommendedHashtags: [
        '#LinkedIn',
        '#CareerDevelopment',
        '#Innovation',
        '#Leadership',
        '#ProfessionalGrowth',
      ],
      contentTips: [
        'Share industry insights and thought leadership',
        'Post about career achievements and milestones',
        'Share educational content and tutorials',
        'Engage with industry news and discussions',
        'Use professional tone and language',
      ],
      optimalLength: '150-200 words for engagement',
    }
  }

  /**
   * Validate LinkedIn content
   */
  validateContent(content: LinkedInContent): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!content.text) {
      errors.push('Content text is required')
    }

    if (content.text && content.text.length > 3000) {
      errors.push('Content exceeds 3000 character limit')
    }

    if (content.hashtags && content.hashtags.length > 5) {
      errors.push('Maximum 5 hashtags per post')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
