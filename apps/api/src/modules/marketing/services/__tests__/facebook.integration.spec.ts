import { Test, TestingModule } from '@nestjs/testing'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { FacebookIntegration } from '../platform-integrations/facebook.integration'

describe('FacebookIntegration', () => {
  let service: FacebookIntegration
  let httpService: HttpService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacebookIntegration,
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
                FACEBOOK_API_KEY: 'test-api-key',
                FACEBOOK_ACCESS_TOKEN: 'test-token',
                INSTAGRAM_ACCESS_TOKEN: 'test-ig-token',
              }
              return config[key] || defaultValue
            }),
          },
        },
      ],
    }).compile()

    service = module.get<FacebookIntegration>(FacebookIntegration)
    httpService = module.get<HttpService>(HttpService)
    configService = module.get<ConfigService>(ConfigService)
  })

  describe('publishToFacebook', () => {
    it('should publish a post to Facebook successfully', async () => {
      const content = {
        text: 'Hello Facebook!',
        imageUrl: 'https://example.com/image.jpg',
        visibility: 'public' as const,
      }

      jest.spyOn(httpService, 'post').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: { id: 'post_123' },
        }),
      } as any)

      const result = await service.publishToFacebook(content)

      expect(result.success).toBe(true)
      expect(result.postId).toBe('post_123')
      expect(result.url).toContain('facebook.com')
    })

    it('should fail gracefully when API credentials are missing', async () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce(undefined)

      const content = {
        text: 'Hello Facebook!',
        imageUrl: 'https://example.com/image.jpg',
        visibility: 'public' as const,
      }

      // Reinitialize service with missing config
      const result = await service.publishToFacebook(content)

      expect(result.success).toBe(false)
    })

    it('should validate caption length', () => {
      const longCaption = 'a'.repeat(3000)
      const content = {
        text: longCaption,
        imageUrl: 'https://example.com/image.jpg',
        visibility: 'public' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Caption must be under 2200 characters')
    })

    it('should validate hashtag count', () => {
      const content = {
        text: 'Post content',
        hashtags: Array(31).fill('#hashtag'),
        imageUrl: 'https://example.com/image.jpg',
        visibility: 'public' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Maximum 30 hashtags per post')
    })
  })

  describe('publishToInstagram', () => {
    it('should publish an Instagram post successfully', async () => {
      const content = {
        caption: 'Check out this content!',
        imageUrl: 'https://example.com/image.jpg',
        visibility: 'public' as const,
      }

      jest.spyOn(httpService, 'post').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: { id: 'ig_post_123' },
        }),
      } as any)

      const result = await service.publishToInstagram(content)

      expect(result.success).toBe(true)
      expect(result.postId).toBe('ig_post_123')
    })
  })

  describe('publishReel', () => {
    it('should publish an Instagram Reel successfully', async () => {
      const content = {
        caption: 'Awesome reel!',
        videoUrl: 'https://example.com/video.mp4',
        visibility: 'public' as const,
      }

      jest.spyOn(httpService, 'post').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: { id: 'reel_123' },
        }),
      } as any)

      const result = await service.publishReel(content)

      expect(result.success).toBe(true)
      expect(result.postId).toBe('reel_123')
    })

    it('should validate video URL presence', () => {
      const content = {
        caption: 'Awesome reel!',
        videoUrl: '',
        visibility: 'public' as const,
      }

      const validation = service.validateReelContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Video URL is required')
    })
  })

  describe('getPostInsights', () => {
    it('should retrieve post analytics', async () => {
      jest.spyOn(httpService, 'get').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: {
            reach: 5000,
            impressions: 10000,
            engagements: 500,
            likes: 400,
            comments: 50,
          },
        }),
      } as any)

      const insights = await service.getPostInsights('post_123')

      expect(insights.reach).toBeGreaterThan(0)
      expect(insights.impressions).toBeGreaterThanOrEqual(insights.reach)
      expect(insights.engagements).toBeGreaterThan(0)
    })
  })

  describe('getPlatformRecommendations', () => {
    it('should return platform-specific recommendations', () => {
      const recommendations = service.getPlatformRecommendations()

      expect(recommendations.bestPostTimes).toBeDefined()
      expect(recommendations.contentTips).toBeDefined()
      expect(recommendations.optimizations).toBeDefined()
      expect(recommendations.bestPostTimes.length).toBeGreaterThan(0)
      expect(recommendations.contentTips.length).toBeGreaterThan(0)
    })

    it('should include engagement rate recommendations', () => {
      const recommendations = service.getPlatformRecommendations()

      const engagementTip = recommendations.contentTips.find((tip) =>
        tip.toLowerCase().includes('engagement'),
      )

      expect(engagementTip).toBeDefined()
    })
  })
})
