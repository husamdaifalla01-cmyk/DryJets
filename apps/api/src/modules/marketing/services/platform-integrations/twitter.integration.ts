import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

interface TwitterAuthToken {
  token: string
  expiresAt: number
}

interface TweetContent {
  text: string
  media?: string[]
  replySettings?: 'everyone' | 'following' | 'mentioned_users'
}

interface PublishResult {
  success: boolean
  tweetId?: string
  url?: string
  error?: string
  timestamp: Date
}

interface AnalyticsData {
  impressions: number
  engagements: number
  replies: number
  retweets: number
  likes: number
  clicks: number
}

@Injectable()
export class TwitterIntegration {
  private readonly logger = new Logger('TwitterIntegration')
  private readonly baseUrl = 'https://api.twitter.com/2'
  private authToken: TwitterAuthToken | null = null
  private readonly apiKey: string
  private readonly apiSecret: string
  private readonly accessToken: string
  private readonly accessTokenSecret: string
  private readonly bearerToken: string

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get('TWITTER_API_KEY', '')
    this.apiSecret = this.config.get('TWITTER_API_SECRET', '')
    this.accessToken = this.config.get('TWITTER_ACCESS_TOKEN', '')
    this.accessTokenSecret = this.config.get(
      'TWITTER_ACCESS_TOKEN_SECRET',
      ''
    )
    this.bearerToken = this.config.get('TWITTER_BEARER_TOKEN', '')
  }

  /**
   * Publish a tweet
   */
  async publishTweet(content: TweetContent): Promise<PublishResult> {
    try {
      if (!this.bearerToken) {
        this.logger.warn('Twitter Bearer Token not configured')
        return {
          success: false,
          error: 'Twitter API not configured',
          timestamp: new Date(),
        }
      }

      const payload = {
        text: content.text,
      }

      if (content.replySettings) {
        (payload as any).reply_settings = content.replySettings
      }

      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/tweets`, payload, {
          headers: {
            Authorization: `Bearer ${this.bearerToken}`,
            'Content-Type': 'application/json',
          },
        })
      )

      const tweetId = response.data.data.id
      const username = this.config.get('TWITTER_USERNAME', 'twitter')

      this.logger.log(`Tweet published successfully: ${tweetId}`)

      return {
        success: true,
        tweetId,
        url: `https://twitter.com/${username}/status/${tweetId}`,
        timestamp: new Date(),
      }
    } catch (error: any) {
      this.logger.error(`Failed to publish tweet: ${error.message}`)

      // Handle rate limiting
      if (error.response?.status === 429) {
        const resetTime = parseInt(
          error.response?.headers?.['x-rate-limit-reset'] || '0'
        )
        return {
          success: false,
          error: `Rate limited. Reset at ${new Date(resetTime * 1000).toISOString()}`,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Create a thread (multiple connected tweets)
   */
  async publishThread(tweets: TweetContent[]): Promise<PublishResult> {
    try {
      if (!this.bearerToken) {
        return {
          success: false,
          error: 'Twitter API not configured',
          timestamp: new Date(),
        }
      }

      let previousTweetId: string | null = null
      const tweetIds: string[] = []

      for (const tweet of tweets) {
        const payload: any = {
          text: tweet.text,
        }

        if (previousTweetId) {
          payload.reply = {
            in_reply_to_tweet_id: previousTweetId,
          }
        }

        if (tweet.replySettings) {
          payload.reply_settings = tweet.replySettings
        }

        try {
          const response = await firstValueFrom(
            this.http.post(`${this.baseUrl}/tweets`, payload, {
              headers: {
                Authorization: `Bearer ${this.bearerToken}`,
                'Content-Type': 'application/json',
              },
            })
          )

          const tweetId = response.data.data.id
          tweetIds.push(tweetId)
          previousTweetId = tweetId

          // Add delay between tweets to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error: any) {
          this.logger.error(`Failed to publish thread tweet: ${error.message}`)
          return {
            success: false,
            error: `Failed at tweet ${tweetIds.length + 1}: ${error.message}`,
            timestamp: new Date(),
          }
        }
      }

      const username = this.config.get('TWITTER_USERNAME', 'twitter')

      return {
        success: true,
        tweetId: tweetIds[0],
        url: `https://twitter.com/${username}/status/${tweetIds[0]}`,
        timestamp: new Date(),
      }
    } catch (error: any) {
      this.logger.error(`Failed to publish thread: ${error.message}`)
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Get tweet analytics
   */
  async getTweetAnalytics(tweetId: string): Promise<AnalyticsData> {
    try {
      if (!this.bearerToken) {
        return {
          impressions: 0,
          engagements: 0,
          replies: 0,
          retweets: 0,
          likes: 0,
          clicks: 0,
        }
      }

      const response = await firstValueFrom(
        this.http.get(
          `${this.baseUrl}/tweets/${tweetId}?tweet.fields=public_metrics,created_at`,
          {
            headers: {
              Authorization: `Bearer ${this.bearerToken}`,
            },
          }
        )
      )

      const metrics = response.data.data.public_metrics

      return {
        impressions: metrics.impression_count || 0,
        engagements: metrics.like_count + metrics.retweet_count + metrics.reply_count,
        replies: metrics.reply_count || 0,
        retweets: metrics.retweet_count || 0,
        likes: metrics.like_count || 0,
        clicks: 0, // Twitter API doesn't directly provide click data
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to get tweet analytics: ${error.message}`
      )
      return {
        impressions: 0,
        engagements: 0,
        replies: 0,
        retweets: 0,
        likes: 0,
        clicks: 0,
      }
    }
  }

  /**
   * Search for trending topics
   */
  async getTrendingTopics(): Promise<string[]> {
    try {
      // For demo purposes, return predefined trending topics
      // In production, you would use Twitter's trends API
      const trends = [
        '#AI',
        '#WebDevelopment',
        '#Marketing',
        '#Technology',
        '#StartupLife',
        '#SoftwareEngineering',
        '#CloudComputing',
        '#DataScience',
      ]

      return trends
    } catch (error: any) {
      this.logger.error(`Failed to get trending topics: ${error.message}`)
      return []
    }
  }

  /**
   * Get user followers count
   */
  async getUserMetrics(): Promise<{
    followers: number
    following: number
    tweets: number
  }> {
    try {
      if (!this.bearerToken) {
        return { followers: 0, following: 0, tweets: 0 }
      }

      const response = await firstValueFrom(
        this.http.get(
          `${this.baseUrl}/users/me?user.fields=public_metrics`,
          {
            headers: {
              Authorization: `Bearer ${this.bearerToken}`,
            },
          }
        )
      )

      const metrics = response.data.data.public_metrics

      return {
        followers: metrics.followers_count || 0,
        following: metrics.following_count || 0,
        tweets: metrics.tweet_count || 0,
      }
    } catch (error: any) {
      this.logger.error(`Failed to get user metrics: ${error.message}`)
      return { followers: 0, following: 0, tweets: 0 }
    }
  }

  /**
   * Schedule a tweet (using third-party service since Twitter API doesn't natively support this)
   */
  async scheduleTweet(
    content: TweetContent,
    scheduledTime: Date
  ): Promise<PublishResult> {
    try {
      const now = new Date()
      const delay = scheduledTime.getTime() - now.getTime()

      if (delay < 0) {
        return {
          success: false,
          error: 'Scheduled time must be in the future',
          timestamp: new Date(),
        }
      }

      // Schedule the tweet to be published after the delay
      setTimeout(async () => {
        await this.publishTweet(content)
      }, delay)

      this.logger.log(
        `Tweet scheduled for ${scheduledTime.toISOString()}`
      )

      return {
        success: true,
        timestamp: new Date(),
      }
    } catch (error: any) {
      this.logger.error(`Failed to schedule tweet: ${error.message}`)
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      }
    }
  }

  /**
   * Validate tweet content
   */
  validateTweet(content: TweetContent): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!content.text) {
      errors.push('Tweet text is required')
    }

    if (content.text.length > 280) {
      errors.push(
        `Tweet exceeds 280 character limit (${content.text.length} chars)`
      )
    }

    if (content.media && content.media.length > 4) {
      errors.push('Maximum 4 media files per tweet')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Get platform-specific recommendations
   */
  getPlatformRecommendations(): {
    bestPostTimes: string[]
    recommendedHashtags: string[]
    contentTips: string[]
  } {
    return {
      bestPostTimes: [
        '8:00 AM - Work commute',
        '12:00 PM - Lunch break',
        '5:00 PM - Evening commute',
        '9:00 PM - Evening browsing',
      ],
      recommendedHashtags: [
        '#tech',
        '#webdev',
        '#marketing',
        '#innovation',
        '#startup',
      ],
      contentTips: [
        'Use threads for detailed explanations',
        'Include media (images/videos) for higher engagement',
        'Ask questions to boost replies',
        'Share timely, trending content',
        'Engage with community replies',
      ],
    }
  }
}
