import { Test, TestingModule } from '@nestjs/testing'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { YouTubeIntegration } from '../platform-integrations/youtube.integration'

describe('YouTubeIntegration', () => {
  let service: YouTubeIntegration
  let httpService: HttpService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YouTubeIntegration,
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
                YOUTUBE_API_KEY: 'test-api-key',
                YOUTUBE_ACCESS_TOKEN: 'test-token',
                YOUTUBE_CHANNEL_ID: 'test-channel-id',
              }
              return config[key] || defaultValue
            }),
          },
        },
      ],
    }).compile()

    service = module.get<YouTubeIntegration>(YouTubeIntegration)
    httpService = module.get<HttpService>(HttpService)
    configService = module.get<ConfigService>(ConfigService)
  })

  describe('publishVideo', () => {
    it('should publish a long-form video successfully', async () => {
      const content = {
        title: 'Amazing Tutorial',
        description: 'Learn how to...',
        videoUrl: 'https://example.com/video.mp4',
        tags: ['tutorial', 'education'],
        category: 'education' as const,
        visibility: 'public' as const,
      }

      jest.spyOn(httpService, 'post').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: { id: 'youtube_123' },
        }),
      } as any)

      const result = await service.publishVideo(content)

      expect(result.success).toBe(true)
      expect(result.videoId).toBe('youtube_123')
      expect(result.url).toContain('youtube.com')
    })

    it('should validate title length', () => {
      const content = {
        title: 'a'.repeat(101),
        description: 'Description',
        videoUrl: 'https://example.com/video.mp4',
        tags: [],
        category: 'education' as const,
        visibility: 'public' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Title must be under 100 characters')
    })

    it('should validate description length', () => {
      const content = {
        title: 'Great Video',
        description: 'a'.repeat(5001),
        videoUrl: 'https://example.com/video.mp4',
        tags: [],
        category: 'education' as const,
        visibility: 'public' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Description must be under 5000 characters')
    })

    it('should validate tag count', () => {
      const content = {
        title: 'Great Video',
        description: 'Description',
        videoUrl: 'https://example.com/video.mp4',
        tags: Array(31).fill('tag'),
        category: 'education' as const,
        visibility: 'public' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Maximum 30 tags per video')
    })
  })

  describe('publishShort', () => {
    it('should publish a YouTube Short successfully', async () => {
      const content = {
        title: 'Quick Tip',
        description: 'A quick tip...',
        videoUrl: 'https://example.com/short.mp4',
        tags: ['short', 'quick'],
        visibility: 'public' as const,
      }

      jest.spyOn(httpService, 'post').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: { id: 'short_123' },
        }),
      } as any)

      const result = await service.publishShort(content)

      expect(result.success).toBe(true)
      expect(result.videoId).toBe('short_123')
      expect(result.url).toContain('youtube.com/shorts')
    })
  })

  describe('scheduleVideo', () => {
    it('should schedule a video for future publishing', async () => {
      const content = {
        title: 'Scheduled Video',
        description: 'Coming soon...',
        videoUrl: 'https://example.com/video.mp4',
        tags: [],
        category: 'education' as const,
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
    })
  })

  describe('getVideoAnalytics', () => {
    it('should retrieve video analytics', async () => {
      const analytics = await service.getVideoAnalytics('video_123')

      expect(analytics.views).toBeGreaterThan(0)
      expect(analytics.watches).toBeGreaterThan(0)
      expect(analytics.likes).toBeGreaterThan(0)
      expect(analytics.comments).toBeGreaterThan(0)
      expect(analytics.averageViewPercentage).toBeGreaterThan(0)
    })

    it('should have realistic engagement rates', async () => {
      const analytics = await service.getVideoAnalytics('video_123')

      expect(analytics.averageViewPercentage).toBeLessThanOrEqual(100)
      expect(analytics.clickThroughRate).toBeLessThanOrEqual(100)
    })
  })

  describe('getChannelMetrics', () => {
    it('should retrieve channel metrics', async () => {
      const metrics = await service.getChannelMetrics()

      expect(metrics.subscribers).toBeGreaterThan(0)
      expect(metrics.totalViews).toBeGreaterThan(0)
      expect(metrics.totalVideos).toBeGreaterThan(0)
      expect(metrics.totalWatchHours).toBeGreaterThan(0)
      expect(metrics.averageViewDuration).toBeGreaterThan(0)
    })

    it('should have consistent metrics', async () => {
      const metrics = await service.getChannelMetrics()

      expect(metrics.totalWatchHours).toBeGreaterThan(0)
      expect(metrics.averageViewDuration).toBeGreaterThan(0)
    })
  })

  describe('getTrendingVideos', () => {
    it('should return trending videos', async () => {
      const videos = await service.getTrendingVideos()

      expect(Array.isArray(videos)).toBe(true)
      expect(videos.length).toBeGreaterThan(0)
      expect(videos[0]).toHaveProperty('videoId')
      expect(videos[0]).toHaveProperty('title')
      expect(videos[0]).toHaveProperty('views')
    })
  })

  describe('getRecommendedTags', () => {
    it('should return recommended tags for a keyword', async () => {
      const tags = await service.getRecommendedTags('tutorial')

      expect(Array.isArray(tags)).toBe(true)
      expect(tags.length).toBeGreaterThan(0)
      expect(tags[0]).toContain('tutorial')
    })

    it('should suggest year-specific tags', async () => {
      const tags = await service.getRecommendedTags('trending')

      const yearTag = tags.find((tag) => tag.includes('2025'))
      expect(yearTag).toBeDefined()
    })
  })

  describe('getPlatformRecommendations', () => {
    it('should return platform-specific recommendations', () => {
      const recommendations = service.getPlatformRecommendations()

      expect(recommendations.bestPostTimes).toBeDefined()
      expect(recommendations.contentTips).toBeDefined()
      expect(recommendations.optimizations).toBeDefined()
      expect(recommendations.thumbnailTips).toBeDefined()
    })

    it('should recommend monetization-friendly length', () => {
      const recommendations = service.getPlatformRecommendations()

      const lengthTip = recommendations.contentTips.find((tip) =>
        tip.toLowerCase().includes('8-20'),
      )

      expect(lengthTip).toBeDefined()
    })

    it('should provide thumbnail optimization tips', () => {
      const recommendations = service.getPlatformRecommendations()

      expect(recommendations.thumbnailTips.length).toBeGreaterThan(0)
      expect(recommendations.thumbnailTips[0]).toBeTruthy()
    })
  })

  describe('validateContent', () => {
    it('should validate complete content', () => {
      const content = {
        title: 'Great Video',
        description: 'This is a great video description',
        videoUrl: 'https://example.com/video.mp4',
        tags: ['tag1', 'tag2'],
        category: 'education' as const,
        visibility: 'public' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(true)
      expect(validation.errors.length).toBe(0)
    })

    it('should require video URL', () => {
      const content = {
        title: 'Great Video',
        description: 'This is a great video description',
        videoUrl: '',
        tags: [],
        category: 'education' as const,
        visibility: 'public' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Video URL is required')
    })
  })
})
