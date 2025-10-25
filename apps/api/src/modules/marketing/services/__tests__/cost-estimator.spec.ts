import { Test, TestingModule } from '@nestjs/testing'
import { CostEstimator } from '../cost-estimator.service'
import { PrismaService } from '../../../../common/prisma/prisma.service'

describe('CostEstimator', () => {
  let service: CostEstimator
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostEstimator,
        {
          provide: PrismaService,
          useValue: {
            publishingAPILog: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
            publishedContent: {
              findMany: jest.fn(),
            },
            multiPlatformWorkflow: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<CostEstimator>(CostEstimator)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('estimateCampaignCosts', () => {
    it('should calculate correct API costs', () => {
      const result = service.estimateCampaignCosts({
        contentPieces: 4,
        platforms: ['twitter', 'linkedin', 'instagram'],
        promotionBudget: 500,
      })

      expect(result.totalCost).toBeGreaterThan(0)
      expect(result.apiCost).toBeGreaterThan(0)
      expect(result.platformCosts).toBeDefined()
    })

    it('should estimate costs for different platform combinations', () => {
      const result1 = service.estimateCampaignCosts({
        contentPieces: 4,
        platforms: ['twitter'],
        promotionBudget: 100,
      })

      const result2 = service.estimateCampaignCosts({
        contentPieces: 4,
        platforms: ['twitter', 'instagram', 'tiktok', 'linkedin'],
        promotionBudget: 400,
      })

      // More platforms should result in higher total cost
      expect(result2.totalCost).toBeGreaterThan(result1.totalCost)
    })
  })

  describe('projectCampaignROI', () => {
    it('should calculate positive ROI for profitable campaign', () => {
      const result = service.projectCampaignROI({
        totalCost: 500,
        estimatedReach: 50000,
        conversionRate: 2,
        averageOrderValue: 50,
      })

      expect(result.projectedConversions).toBeGreaterThan(0)
      expect(result.projectedRevenue).toBeGreaterThan(result.projectedCost)
      expect(result.roi).toBeGreaterThan(100) // Should be profitable
    })

    it('should handle zero conversion rate', () => {
      const result = service.projectCampaignROI({
        totalCost: 500,
        estimatedReach: 50000,
        conversionRate: 0,
        averageOrderValue: 50,
      })

      expect(result.projectedConversions).toBe(0)
      expect(result.projectedRevenue).toBe(0)
      expect(result.roi).toBeLessThan(0)
    })

    it('should calculate payback period correctly', () => {
      const result = service.projectCampaignROI({
        totalCost: 1000,
        estimatedReach: 100000,
        conversionRate: 1,
        averageOrderValue: 100,
      })

      expect(result.paybackPeriod).toBeDefined()
      expect(typeof result.paybackPeriod).toBe('string')
    })
  })

  describe('getPlatformEfficiencyRanking', () => {
    it('should rank platforms by CPM', () => {
      const result = service.getPlatformEfficiencyRanking(['twitter', 'linkedin', 'tiktok', 'reddit'])

      expect(result).toHaveLength(4)
      expect(result[0].cpm).toBeGreaterThanOrEqual(result[result.length - 1].cpm)
    })

    it('should include all requested platforms', () => {
      const platforms = ['twitter', 'instagram', 'facebook']
      const result = service.getPlatformEfficiencyRanking(platforms)

      platforms.forEach((platform) => {
        expect(result.some((p) => p.platform === platform)).toBe(true)
      })
    })
  })

  describe('logAPICost', () => {
    it('should log API cost correctly', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        id: 'test-log-1',
        service: 'anthropic',
        cost: 0.001,
      })

      jest.spyOn(prismaService.publishingAPILog, 'create').mockImplementation(mockCreate)

      await service.logAPICost('workflow-1', 'anthropic', 0.001)

      expect(mockCreate).toHaveBeenCalled()
    })
  })
})
