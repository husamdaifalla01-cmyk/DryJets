import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

interface TikTokContent {
  videoUrl: string
  caption: string
  hashtags?: string[]
  mentions?: string[]
  coverUrl?: string
}

interface PublishResult {
  success: boolean
  videoId?: string
  taskId?: string
  url?: string
  error?: string
  timestamp: Date
}

interface TikTokAnalytics {
  views: number
  likes: number
  comments: number
  shares: number
  completionRate: number
  avgWatchTime: number
}

interface AccountMetrics {
  followers: number
  following: number
  videoCount: number
  totalLikes: number
  totalViews: number
  averageViews: number
}

@Injectable()
export class TikTokIntegration {
  private readonly logger = new Logger('TikTokIntegration')
  private readonly baseUrl = 'https://open.tiktok.com/v1'
  private readonly accessToken: string
  private readonly clientKey: string
  private readonly clientSecret: string
  private readonly businessAccountId: string

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.accessToken = this.config.get('TIKTOK_ACCESS_TOKEN', '')
    this.clientKey = this.config.get('TIKTOK_CLIENT_KEY', '')
    this.clientSecret = this.config.get('TIKTOK_CLIENT_SECRET', '')
    this.businessAccountId = this.config.get('TIKTOK_BUSINESS_ACCOUNT_ID', '')
  }

  /**
   * Upload and publish video to TikTok
   */
  async publishVideo(content: TikTokContent): Promise<PublishResult> {
    try {
      if (!this.accessToken || !this.businessAccountId) {
        this.logger.warn('TikTok credentials not configured')
        return {
          success: false,
          error: 'TikTok API not configured',
          timestamp: new Date(),
        }
      }

      // Step 1: Upload video
      const uploadResponse = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/post/publish/video/init`,
          {
            source_info: {
              source: 'FILE_UPLOAD',
              video_size: 1024000, // Mock size
              chunk_total_count: 1,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        )
      )

      const uploadToken = uploadResponse.data.data.upload_token

      // Step 2: Complete upload
      await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/post/publish/video/complete`,
          {
            upload_token: uploadToken,
            post_info: {
              title: content.caption.substring(0, 150),
              description: content.caption,
              privacy_level: 'PUBLIC_TO_ANYONE',
              disable_comment: false,
              disable_duet: false,
              disable_stitch: false,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        )
      )

      // Mock video ID
      const videoId = `video_${Date.now()}`

      this.logger.log(`TikTok video published: ${videoId}`)

      return {
        success: true,
        videoId,
        taskId: uploadToken,
        url: `https://www.tiktok.com/@creator/video/${videoId}`,
        timestamp: new Date(),
      }
    } catch (error: any) {
      this.logger.error(`Failed to publish TikTok video: ${error.message}`)
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Publish TikTok with hashtag and trend integration
   */
  async publishTrend(content: TikTokContent): Promise<PublishResult> {
    try {
      const trending = await this.getTrendingHashtags()
      const relevantTrends = trending.slice(0, 3)

      const enhancedCaption = `${content.caption}\n\n${relevantTrends.join(' ')}`

      return await this.publishVideo({
        ...content,
        caption: enhancedCaption,
      })
    } catch (error: any) {
      this.logger.error(`Failed to publish trend video: ${error.message}`)
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Schedule video publishing
   */
  async scheduleVideo(
    content: TikTokContent,
    publishTime: Date
  ): Promise<PublishResult> {
    try {
      if (!this.accessToken) {
        return {
          success: false,
          error: 'TikTok API not configured',
          timestamp: new Date(),
        }
      }

      // TikTok scheduling through API
      const payload = {
        source_info: {
          source: 'FILE_UPLOAD',
        },
        post_info: {
          title: content.caption.substring(0, 150),
          description: content.caption,
          privacy_level: 'PUBLIC_TO_ANYONE',
          schedule_time: Math.floor(publishTime.getTime() / 1000),
        },
      }

      const response = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/post/publish/video/init`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        )
      )

      const taskId = response.data.data.task_id

      this.logger.log(`Video scheduled for ${publishTime.toISOString()}`)

      return {
        success: true,
        taskId,
        timestamp: new Date(),
      }
    } catch (error: any) {
      this.logger.error(`Failed to schedule video: ${error.message}`)
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Get video analytics
   */
  async getVideoAnalytics(videoId: string): Promise<TikTokAnalytics> {
    try {
      if (!this.accessToken) {
        return {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          completionRate: 0,
          avgWatchTime: 0,
        }
      }

      // Mock analytics
      return {
        views: Math.floor(Math.random() * 100000) + 10000,
        likes: Math.floor(Math.random() * 5000) + 500,
        comments: Math.floor(Math.random() * 1000) + 100,
        shares: Math.floor(Math.random() * 500) + 50,
        completionRate: Math.random() * 100,
        avgWatchTime: Math.floor(Math.random() * 45) + 5,
      }
    } catch (error: any) {
      this.logger.error(`Failed to get analytics: ${error.message}`)
      return {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        completionRate: 0,
        avgWatchTime: 0,
      }
    }
  }

  /**
   * Get trending hashtags and sounds
   */
  async getTrendingHashtags(): Promise<string[]> {
    try {
      // Mock trending hashtags
      const trends = [
        '#ForYouPage',
        '#FYP',
        '#Trending',
        '#Viral',
        '#TikTok',
        '#ViralChallenge',
        '#PromoViral',
        '#NewMusic',
      ]

      return trends
    } catch (error: any) {
      this.logger.error(`Failed to get trends: ${error.message}`)
      return []
    }
  }

  /**
   * Get trending sounds
   */
  async getTrendingSounds(): Promise<
    Array<{ id: string; name: string; uses: number }>
  > {
    try {
      return [
        {
          id: 'sound_1',
          name: 'Original Sound #1',
          uses: Math.floor(Math.random() * 1000000),
        },
        {
          id: 'sound_2',
          name: 'Trending Music Track',
          uses: Math.floor(Math.random() * 1000000),
        },
        {
          id: 'sound_3',
          name: 'Viral Audio Clip',
          uses: Math.floor(Math.random() * 1000000),
        },
      ]
    } catch (error: any) {
      this.logger.error(`Failed to get sounds: ${error.message}`)
      return []
    }
  }

  /**
   * Get account metrics
   */
  async getAccountMetrics(): Promise<AccountMetrics> {
    try {
      if (!this.accessToken) {
        return {
          followers: 0,
          following: 0,
          videoCount: 0,
          totalLikes: 0,
          totalViews: 0,
          averageViews: 0,
        }
      }

      // Mock metrics
      const videoCount = Math.floor(Math.random() * 500) + 50
      const totalViews = Math.floor(Math.random() * 50000000) + 5000000

      return {
        followers: Math.floor(Math.random() * 1000000) + 100000,
        following: Math.floor(Math.random() * 5000) + 500,
        videoCount,
        totalLikes: Math.floor(Math.random() * 5000000) + 500000,
        totalViews,
        averageViews: Math.floor(totalViews / videoCount),
      }
    } catch (error: any) {
      this.logger.error(`Failed to get metrics: ${error.message}`)
      return {
        followers: 0,
        following: 0,
        videoCount: 0,
        totalLikes: 0,
        totalViews: 0,
        averageViews: 0,
      }
    }
  }

  /**
   * Validate TikTok content
   */
  validateContent(content: TikTokContent): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!content.videoUrl) {
      errors.push('Video URL is required')
    }

    if (!content.caption) {
      errors.push('Caption is required')
    }

    if (content.caption && content.caption.length > 2200) {
      errors.push('Caption exceeds 2200 character limit')
    }

    if (content.hashtags && content.hashtags.length > 20) {
      errors.push('Maximum 20 hashtags per video')
    }

    // Video file size validation
    if (content.videoUrl && !content.videoUrl.startsWith('http')) {
      errors.push('Invalid video URL')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Get platform recommendations
   */
  getPlatformRecommendations(): {
    bestPostTimes: string[]
    videoTips: string[]
    hashtags: string[]
    soundTips: string[]
  } {
    return {
      bestPostTimes: [
        '6:00 AM - Early risers',
        '12:00 PM - Lunch break',
        '6:00 PM - School/work end',
        '9:00 PM - Evening browsing',
      ],
      videoTips: [
        'Hook viewers in first 3 seconds',
        'Post videos 15-60 seconds long',
        'Use trending sounds and effects',
        'Create relatable content',
        'Engage with comments and duets',
        'Post consistently (1-3x daily)',
        'Use trending hashtags',
        'Collaborate with other creators',
      ],
      hashtags: [
        '#ForYouPage',
        '#FYP',
        '#Viral',
        '#Trending',
        '#PromoViral',
      ],
      soundTips: [
        'Use trending sounds for higher reach',
        'Keep 5-10 seconds of sound in video',
        'Combine multiple sound clips creatively',
        'Original sounds get algorithm boost',
      ],
    }
  }

  /**
   * Exchange OAuth authorization code for access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    // TODO: Implement real OAuth 2.0 exchange with TikTok API
    this.logger.log(`Exchanging authorization code for access token (mock)`);
    return {
      accessToken: `tiktok_access_${Date.now()}`,
      refreshToken: `tiktok_refresh_${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000), // 24 hours
    };
  }

  /**
   * Refresh an expired access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    // TODO: Implement real token refresh with TikTok API
    this.logger.log(`Refreshing access token (mock)`);
    return {
      accessToken: `tiktok_refreshed_${Date.now()}`,
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 86400000),
    };
  }

  getAuthorizationUrl(redirectUri: string): string {
    const clientId = process.env.TIKTOK_CLIENT_KEY || "client_id";
    const encodedRedirect = encodeURIComponent(redirectUri);
    return `https://www.tiktok.com/auth/authorize/?client_key=${clientId}&response_type=code&scope=user.info.basic,video.list,video.upload&redirect_uri=${encodedRedirect}`;
  }
}
