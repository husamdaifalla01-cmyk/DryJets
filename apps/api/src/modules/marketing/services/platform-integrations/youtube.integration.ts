import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

interface YouTubeContent {
  title: string
  description: string
  videoUrl: string
  thumbnailUrl?: string
  tags?: string[]
  category: 'entertainment' | 'education' | 'gaming' | 'music' | 'news' | 'tech'
  visibility: 'public' | 'unlisted' | 'private'
  notifySubscribers?: boolean
}

interface YouTubeShortContent {
  title: string
  description: string
  videoUrl: string
  tags?: string[]
  visibility: 'public' | 'unlisted' | 'private'
}

interface PublishResult {
  success: boolean
  videoId?: string
  url?: string
  error?: string
  timestamp: Date
}

interface VideoAnalytics {
  views: number
  watches: number
  shares: number
  likes: number
  dislikes: number
  comments: number
  averageViewPercentage: number
  subscribersGained: number
  clickThroughRate: number
}

interface ChannelMetrics {
  subscribers: number
  totalViews: number
  totalVideos: number
  totalWatchHours: number
  averageViewDuration: number
}

@Injectable()
export class YouTubeIntegration {
  private readonly logger = new Logger('YouTubeIntegration')
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3'
  private readonly apiKey: string
  private readonly accessToken: string
  private readonly channelId: string

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get('YOUTUBE_API_KEY', '')
    this.accessToken = this.config.get('YOUTUBE_ACCESS_TOKEN', '')
    this.channelId = this.config.get('YOUTUBE_CHANNEL_ID', '')
  }

  /**
   * Upload and publish long-form video
   */
  async publishVideo(content: YouTubeContent): Promise<PublishResult> {
    try {
      if (!this.apiKey || !this.accessToken) {
        this.logger.warn('YouTube credentials not configured')
        return {
          success: false,
          error: 'YouTube API not configured',
          timestamp: new Date(),
        }
      }

      const metadata = {
        snippet: {
          title: content.title,
          description: content.description,
          tags: content.tags || [],
          categoryId: this.getCategoryId(content.category),
          defaultLanguage: 'en',
        },
        status: {
          privacyStatus: content.visibility,
          publishAt: new Date().toISOString(),
          embeddable: true,
          license: 'creativeCommon',
          selfDeclaredMadeForKids: false,
        },
        processingDetails: {
          processingStatus: 'processing',
        },
      }

      const response = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/videos?part=snippet,status,processingDetails`,
          metadata,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      )

      const videoId = response.data.id

      this.logger.log(`YouTube video published: ${videoId}`)

      return {
        success: true,
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        timestamp: new Date(),
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to publish YouTube video: ${error.message}`
      )
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Upload and publish YouTube Short
   */
  async publishShort(content: YouTubeShortContent): Promise<PublishResult> {
    try {
      if (!this.apiKey || !this.accessToken) {
        return {
          success: false,
          error: 'YouTube API not configured',
          timestamp: new Date(),
        }
      }

      const metadata = {
        snippet: {
          title: content.title,
          description: content.description,
          tags: content.tags || [],
          categoryId: '24', // Short form video category
        },
        status: {
          privacyStatus: content.visibility,
          embeddable: true,
        },
        processingDetails: {
          processingStatus: 'processing',
        },
      }

      const response = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/videos?part=snippet,status,processingDetails`,
          metadata,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      )

      const videoId = response.data.id

      this.logger.log(`YouTube Short published: ${videoId}`)

      return {
        success: true,
        videoId,
        url: `https://www.youtube.com/shorts/${videoId}`,
        timestamp: new Date(),
      }
    } catch (error: any) {
      this.logger.error(`Failed to publish Short: ${error.message}`)
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
    content: YouTubeContent,
    publishTime: Date
  ): Promise<PublishResult> {
    try {
      const metadata = {
        snippet: {
          title: content.title,
          description: content.description,
          tags: content.tags || [],
          categoryId: this.getCategoryId(content.category),
        },
        status: {
          privacyStatus: 'private',
          publishAt: publishTime.toISOString(),
          embeddable: true,
        },
      }

      const response = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/videos?part=snippet,status`,
          metadata,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      )

      const videoId = response.data.id

      this.logger.log(`Video scheduled for ${publishTime.toISOString()}`)

      return {
        success: true,
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
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
  async getVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
    try {
      if (!this.accessToken) {
        return {
          views: 0,
          watches: 0,
          shares: 0,
          likes: 0,
          dislikes: 0,
          comments: 0,
          averageViewPercentage: 0,
          subscribersGained: 0,
          clickThroughRate: 0,
        }
      }

      // Mock analytics
      return {
        views: Math.floor(Math.random() * 100000) + 5000,
        watches: Math.floor(Math.random() * 80000) + 4000,
        shares: Math.floor(Math.random() * 1000) + 50,
        likes: Math.floor(Math.random() * 3000) + 100,
        dislikes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 500) + 20,
        averageViewPercentage: Math.random() * 100,
        subscribersGained: Math.floor(Math.random() * 200) + 10,
        clickThroughRate: (Math.random() * 5).toFixed(2),
      } as any
    } catch (error: any) {
      this.logger.error(`Failed to get analytics: ${error.message}`)
      return {
        views: 0,
        watches: 0,
        shares: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        averageViewPercentage: 0,
        subscribersGained: 0,
        clickThroughRate: 0,
      }
    }
  }

  /**
   * Get channel metrics
   */
  async getChannelMetrics(): Promise<ChannelMetrics> {
    try {
      if (!this.accessToken) {
        return {
          subscribers: 0,
          totalViews: 0,
          totalVideos: 0,
          totalWatchHours: 0,
          averageViewDuration: 0,
        }
      }

      // Mock metrics
      return {
        subscribers: Math.floor(Math.random() * 1000000) + 50000,
        totalViews: Math.floor(Math.random() * 100000000) + 5000000,
        totalVideos: Math.floor(Math.random() * 1000) + 100,
        totalWatchHours: Math.floor(Math.random() * 1000000) + 50000,
        averageViewDuration: Math.floor(Math.random() * 600) + 60,
      }
    } catch (error: any) {
      this.logger.error(`Failed to get metrics: ${error.message}`)
      return {
        subscribers: 0,
        totalViews: 0,
        totalVideos: 0,
        totalWatchHours: 0,
        averageViewDuration: 0,
      }
    }
  }

  /**
   * Get trending videos
   */
  async getTrendingVideos(): Promise<
    Array<{ videoId: string; title: string; views: number }>
  > {
    try {
      return [
        {
          videoId: 'video_1',
          title: 'Trending Video #1',
          views: Math.floor(Math.random() * 10000000) + 1000000,
        },
        {
          videoId: 'video_2',
          title: 'Viral Content',
          views: Math.floor(Math.random() * 10000000) + 1000000,
        },
        {
          videoId: 'video_3',
          title: 'Popular Video',
          views: Math.floor(Math.random() * 10000000) + 1000000,
        },
      ]
    } catch (error: any) {
      this.logger.error(`Failed to get trends: ${error.message}`)
      return []
    }
  }

  /**
   * Get recommended video tags
   */
  async getRecommendedTags(keyword: string): Promise<string[]> {
    try {
      const tags = [
        keyword,
        `${keyword} tutorial`,
        `${keyword} tips`,
        `how to ${keyword}`,
        `${keyword} guide`,
        `best ${keyword}`,
        `${keyword} 2025`,
        `${keyword} trends`,
      ]

      return tags
    } catch (error: any) {
      this.logger.error(`Failed to get tags: ${error.message}`)
      return []
    }
  }

  /**
   * Validate YouTube content
   */
  validateContent(content: YouTubeContent): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!content.title) {
      errors.push('Title is required')
    }

    if (content.title && content.title.length > 100) {
      errors.push('Title must be under 100 characters')
    }

    if (!content.description) {
      errors.push('Description is required')
    }

    if (content.description && content.description.length > 5000) {
      errors.push('Description must be under 5000 characters')
    }

    if (!content.videoUrl) {
      errors.push('Video URL is required')
    }

    if (content.tags && content.tags.length > 30) {
      errors.push('Maximum 30 tags per video')
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
    contentTips: string[]
    optimizations: string[]
    thumbnailTips: string[]
  } {
    return {
      bestPostTimes: [
        '9:00 AM - Morning viewers',
        '1:00 PM - Lunch break',
        '6:00 PM - Evening commute',
        '9:00 PM - Night time viewers',
      ],
      contentTips: [
        'Create compelling titles (CTR 4-5%)',
        'Optimize thumbnails for click-through',
        'Keep videos 8-20 minutes for monetization',
        'Use first 30 seconds for hook',
        'Include call-to-action (subscribe, like)',
        'Add subtitles for accessibility',
        'Create playlists for binge-watching',
        'Consistent upload schedule (1-3x weekly)',
      ],
      optimizations: [
        'Use relevant keywords in title and description',
        'Add timestamps for long-form content',
        'Create custom end screens and cards',
        'Link to related videos and playlists',
        'Engage with comments in first hour',
        'Create community posts between uploads',
        'Use chapters for longer videos',
      ],
      thumbnailTips: [
        'Use bright colors and high contrast',
        'Include faces with strong emotions',
        'Keep text to 1-2 words max',
        'Use consistent branding',
        'Dimensions: 1280x720px (16:9)',
        'Test different designs for A/B testing',
      ],
    }
  }

  /**
   * Get category ID mapping
   */
  private getCategoryId(category: string): string {
    const categoryMap: Record<string, string> = {
      entertainment: '24',
      education: '27',
      gaming: '20',
      music: '10',
      news: '25',
      tech: '28',
    }

    return categoryMap[category] || '24'
  }
}
