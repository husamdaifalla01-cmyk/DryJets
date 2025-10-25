import { Test, TestingModule } from '@nestjs/testing'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { LinkedInIntegration } from '../platform-integrations/linkedin.integration'

describe('LinkedInIntegration', () => {
  let service: LinkedInIntegration
  let httpService: HttpService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkedInIntegration,
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
                LINKEDIN_API_KEY: 'test-api-key',
                LINKEDIN_ACCESS_TOKEN: 'test-token',
              }
              return config[key] || defaultValue
            }),
          },
        },
      ],
    }).compile()

    service = module.get<LinkedInIntegration>(LinkedInIntegration)
    httpService = module.get<HttpService>(HttpService)
    configService = module.get<ConfigService>(ConfigService)
  })

  describe('publishPost', () => {
    it('should publish a post to LinkedIn successfully', async () => {
      const content = {
        title: 'Industry Update',
        text: 'Excited to share this update with the professional community.',
        imageUrl: 'https://example.com/image.jpg',
        visibility: 'PUBLIC' as const,
      }

      jest.spyOn(httpService, 'post').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: { id: 'linkedin_post_123' },
        }),
      } as any)

      const result = await service.publishPost(content)

      expect(result.success).toBe(true)
      expect(result.postId).toBe('linkedin_post_123')
      expect(result.url).toContain('linkedin.com')
    })

    it('should validate character limit for professional platform', () => {
      const longText = 'a'.repeat(3001)
      const content = {
        title: 'Update',
        text: longText,
        visibility: 'PUBLIC' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Text must be under 3000 characters')
    })

    it('should validate hashtag limit', () => {
      const content = {
        title: 'Update',
        text: 'Some text',
        hashtags: Array(6).fill('#hashtag'),
        visibility: 'PUBLIC' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Maximum 5 hashtags per post')
    })
  })

  describe('shareArticle', () => {
    it('should share an article to LinkedIn', async () => {
      const content = {
        articleUrl: 'https://example.com/article',
        commentary: 'Great insights on industry trends!',
        visibility: 'PUBLIC' as const,
      }

      jest.spyOn(httpService, 'post').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: { id: 'linkedin_article_123' },
        }),
      } as any)

      const result = await service.shareArticle(content)

      expect(result.success).toBe(true)
      expect(result.postId).toBe('linkedin_article_123')
    })

    it('should require valid article URL', () => {
      const content = {
        articleUrl: 'not-a-url',
        commentary: 'Great insights!',
        visibility: 'PUBLIC' as const,
      }

      const validation = service.validateArticleContent(content as any)

      expect(validation.valid).toBe(false)
    })
  })

  describe('getPostAnalytics', () => {
    it('should retrieve post analytics', async () => {
      jest.spyOn(httpService, 'get').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: {
            impressions: 1000,
            clicks: 100,
            comments: 50,
            shares: 25,
            likes: 150,
          },
        }),
      } as any)

      const analytics = await service.getPostAnalytics('post_123')

      expect(analytics.impressions).toBeGreaterThan(0)
      expect(analytics.clicks).toBeLessThanOrEqual(analytics.impressions)
      expect(analytics.comments).toBeGreaterThan(0)
    })

    it('should calculate engagement rate correctly', async () => {
      const analytics = await service.getPostAnalytics('post_123')

      const engagementRate =
        ((analytics.comments + analytics.shares + analytics.likes) /
          analytics.impressions) *
        100

      expect(engagementRate).toBeGreaterThan(0)
    })
  })

  describe('getProfileMetrics', () => {
    it('should retrieve profile metrics', async () => {
      jest.spyOn(httpService, 'get').mockReturnValueOnce({
        toPromise: jest.fn().mockResolvedValue({
          data: {
            followers: 5000,
            connections: 10000,
            posts: 150,
          },
        }),
      } as any)

      const metrics = await service.getProfileMetrics()

      expect(metrics.followers).toBeGreaterThan(0)
      expect(metrics.connections).toBeGreaterThan(0)
      expect(metrics.totalPosts).toBeGreaterThan(0)
    })

    it('should have realistic connection vs follower ratio', async () => {
      const metrics = await service.getProfileMetrics()

      expect(metrics.connections).toBeGreaterThanOrEqual(metrics.followers)
    })
  })

  describe('getTrendingTopics', () => {
    it('should return trending industry topics', async () => {
      const topics = await service.getTrendingTopics()

      expect(Array.isArray(topics)).toBe(true)
      expect(topics.length).toBeGreaterThan(0)
      expect(topics[0]).toHaveProperty('topic')
      expect(topics[0]).toHaveProperty('mentions')
    })

    it('should include professional topics', async () => {
      const topics = await service.getTrendingTopics()

      const topicsText = topics.map((t) => t.topic).join(' ').toLowerCase()

      expect(
        topicsText.includes('business') ||
          topicsText.includes('professional') ||
          topicsText.includes('career'),
      ).toBe(true)
    })
  })

  describe('searchInsights', () => {
    it('should search for industry insights', async () => {
      const results = await service.searchInsights('AI in business')

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('getPlatformRecommendations', () => {
    it('should return platform-specific recommendations', () => {
      const recommendations = service.getPlatformRecommendations()

      expect(recommendations.bestPostTimes).toBeDefined()
      expect(recommendations.contentTips).toBeDefined()
      expect(recommendations.hashtags).toBeDefined()
      expect(recommendations.bestPostTimes.length).toBeGreaterThan(0)
    })

    it('should recommend business hours for B2B platform', () => {
      const recommendations = service.getPlatformRecommendations()

      const workHoursTip = recommendations.bestPostTimes.find((time) =>
        time.toLowerCase().includes('am') ||
        time.toLowerCase().includes('pm'),
      )

      expect(workHoursTip).toBeDefined()
    })

    it('should recommend professional content', () => {
      const recommendations = service.getPlatformRecommendations()

      const professionalTip = recommendations.contentTips.find((tip) =>
        tip.toLowerCase().includes('professional') ||
        tip.toLowerCase().includes('business'),
      )

      expect(professionalTip).toBeDefined()
    })

    it('should recommend professional hashtags', () => {
      const recommendations = service.getPlatformRecommendations()

      expect(recommendations.hashtags.length).toBeGreaterThan(0)
      expect(recommendations.hashtags[0]).toMatch(/^#/)
    })
  })

  describe('validateContent', () => {
    it('should validate complete content', () => {
      const content = {
        title: 'Professional Update',
        text: 'Sharing insights with my network.',
        hashtags: ['#business', '#innovation'],
        visibility: 'PUBLIC' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(true)
      expect(validation.errors.length).toBe(0)
    })

    it('should require text content', () => {
      const content = {
        title: 'Update',
        text: '',
        visibility: 'PUBLIC' as const,
      }

      const validation = service.validateContent(content as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Text is required')
    })
  })
})
