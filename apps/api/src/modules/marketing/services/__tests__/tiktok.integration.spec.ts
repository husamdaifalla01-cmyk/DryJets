import { Test, TestingModule } from '@nestjs/testing'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { TikTokIntegration } from '../platform-integrations/tiktok.integration'

describe('TikTokIntegration', () => {
  let service: TikTokIntegration
  let httpService: HttpService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TikTokIntegration,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => {
              const config: Record<string, string> = {
                TIKTOK_API_KEY: 'test-api-key',
                TIKTOK_ACCESS_TOKEN: 'test-token',
              }
              return config[key] || defaultValue
            }),
          },
        },
      ],
    }).compile()

    service = module.get<TikTokIntegration>(TikTokIntegration)
    httpService = module.get<HttpService>(HttpService)
    configService = module.get<ConfigService>(ConfigService)
  })

  describe('publishVideo', () => {
    it('should publish a TikTok video successfully', async () => {
      const content = {
        caption: 'Amazing content!',
        videoUrl: 'https://example.com/video.mp4',
        hashtags: ['#viral', '#trending'],
        visibility: 'public' as const,
      }

      jest.spyOn(httpService, 'post').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: { id: 'tiktok_123' },
        }),
      } as any)

      const result = await service.publishVideo(content)

      expect(result.success).toBe(true)
      expect(result.videoId).toBe('tiktok_123')
      expect(result.url).toContain('tiktok.com')
    })

    it('should validate caption length', () => {
      const longCaption = 'a'.repeat(3000)
      const content = {
        caption: longCaption,
        videoUrl: 'https://example.com/video.mp4',
        hashtags: [],
        visibility: 'public' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Caption must be under 2200 characters')
    })

    it('should validate hashtag count', () => {
      const content = {
        caption: 'Great video!',
        videoUrl: 'https://example.com/video.mp4',
        hashtags: Array(21).fill('#hashtag'),
        visibility: 'public' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Maximum 20 hashtags per video')
    })

    it('should handle missing video URL', () => {
      const content = {
        caption: 'Great video!',
        videoUrl: '',
        hashtags: [],
        visibility: 'public' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Video URL is required')
    })
  })

  describe('publishTrend', () => {
    it('should auto-inject trending hashtags', async () => {
      const content = {
        caption: 'Check this out!',
        videoUrl: 'https://example.com/video.mp4',
        visibility: 'public' as const,
      }

      jest.spyOn(httpService, 'post').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: { id: 'trend_123' },
        }),
      } as any)

      const result = await service.publishTrend(content)

      expect(result.success).toBe(true)
    })
  })

  describe('scheduleVideo', () => {
    it('should schedule a video for future publishing', async () => {
      const content = {
        caption: 'Scheduled video!',
        videoUrl: 'https://example.com/video.mp4',
        hashtags: [],
        visibility: 'public' as const,
      }
      const publishTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

      jest.spyOn(httpService, 'post').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: { id: 'scheduled_123' },
        }),
      } as any)

      const result = await service.scheduleVideo(content, publishTime)

      expect(result.success).toBe(true)
      expect(result.videoId).toBe('scheduled_123')
    })

    it('should not schedule video in the past', async () => {
      const content = {
        caption: 'Scheduled video!',
        videoUrl: 'https://example.com/video.mp4',
        hashtags: [],
        visibility: 'public' as const,
      }
      const pastTime = new Date(Date.now() - 1000) // 1 second ago

      const result = await service.scheduleVideo(content, pastTime)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getVideoAnalytics', () => {
    it('should retrieve video analytics', async () => {
      const analytics = await service.getVideoAnalytics('video_123')

      expect(analytics.views).toBeGreaterThan(0)
      expect(analytics.likes).toBeGreaterThan(0)
      expect(analytics.comments).toBeGreaterThan(0)
      expect(analytics.shares).toBeGreaterThan(0)
      expect(analytics.completionRate).toBeLessThanOrEqual(100)
    })

    it('should have realistic completion rates', async () => {
      const analytics = await service.getVideoAnalytics('video_123')

      expect(analytics.completionRate).toBeGreaterThan(0)
      expect(analytics.completionRate).toBeLessThanOrEqual(100)
    })
  })

  describe('getTrendingHashtags', () => {
    it('should return trending hashtags', async () => {
      const hashtags = await service.getTrendingHashtags()

      expect(Array.isArray(hashtags)).toBe(true)
      expect(hashtags.length).toBeGreaterThan(0)
      expect(hashtags[0]).toMatch(/^#/)
    })

    it('should include FYP and ForYouPage', async () => {
      const hashtags = await service.getTrendingHashtags()

      expect(hashtags).toContain('#FYP')
      expect(hashtags).toContain('#ForYouPage')
    })
  })

  describe('getTrendingSounds', () => {
    it('should return trending sounds', async () => {
      const sounds = await service.getTrendingSounds()

      expect(Array.isArray(sounds)).toBe(true)
      expect(sounds.length).toBeGreaterThan(0)
      expect(sounds[0]).toHaveProperty('name')
      expect(sounds[0]).toHaveProperty('usageCount')
    })
  })

  describe('getAccountMetrics', () => {
    it('should retrieve account metrics', async () => {
      const metrics = await service.getAccountMetrics()

      expect(metrics.followers).toBeGreaterThan(0)
      expect(metrics.following).toBeGreaterThan(0)
      expect(metrics.totalVideos).toBeGreaterThan(0)
      expect(metrics.totalLikes).toBeGreaterThan(0)
      expect(metrics.totalViews).toBeGreaterThan(0)
    })

    it('should have consistent metrics', async () => {
      const metrics = await service.getAccountMetrics()

      expect(metrics.totalViews).toBeGreaterThanOrEqual(metrics.totalLikes)
      expect(metrics.totalLikes).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getPlatformRecommendations', () => {
    it('should return platform-specific recommendations', () => {
      const recommendations = service.getPlatformRecommendations()

      expect(recommendations.bestPostTimes).toBeDefined()
      expect(recommendations.videoTips).toBeDefined()
      expect(recommendations.bestPostTimes.length).toBeGreaterThan(0)
    })

    it('should recommend short video format', () => {
      const recommendations = service.getPlatformRecommendations()

      const shortFormRecommendation = recommendations.videoTips.find((tip) =>
        tip.toLowerCase().includes('second'),
      )

      expect(shortFormRecommendation).toBeDefined()
    })
  })
})
