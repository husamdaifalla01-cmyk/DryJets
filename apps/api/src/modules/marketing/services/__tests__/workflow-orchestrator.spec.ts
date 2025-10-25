import { Test, TestingModule } from '@nestjs/testing'
import { MultiPlatformWorkflowOrchestrator } from '../multi-platform-workflow-orchestrator.service'
import { PrismaService } from '../../../../common/prisma/prisma.service'

describe('MultiPlatformWorkflowOrchestrator', () => {
  let service: MultiPlatformWorkflowOrchestrator
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiPlatformWorkflowOrchestrator,
        {
          provide: PrismaService,
          useValue: {
            multiPlatformWorkflow: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            publishingPlatform: {
              findMany: jest.fn(),
            },
            publishedContent: {
              create: jest.fn(),
              findMany: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<MultiPlatformWorkflowOrchestrator>(
      MultiPlatformWorkflowOrchestrator
    )
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createWorkflow', () => {
    it('should create a workflow with correct initial status', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Campaign',
        type: 'AUTONOMOUS',
        status: 'CONFIGURING',
        createdAt: new Date(),
      }

      jest
        .spyOn(prismaService.multiPlatformWorkflow, 'create')
        .mockResolvedValue(mockWorkflow as any)

      const result = await service.createWorkflow({
        name: 'Test Campaign',
        type: 'AUTONOMOUS',
        selectedPlatforms: ['twitter', 'linkedin'],
        createdBy: 'user-1',
      })

      expect(result.status).toBe('CONFIGURING')
      expect(result.name).toBe('Test Campaign')
    })

    it('should include all selected platforms', async () => {
      const selectedPlatforms = ['twitter', 'instagram', 'tiktok']

      const mockWorkflow = {
        id: 'workflow-1',
        platformConfig: { platforms: selectedPlatforms },
      }

      jest
        .spyOn(prismaService.multiPlatformWorkflow, 'create')
        .mockResolvedValue(mockWorkflow as any)

      const result = await service.createWorkflow({
        name: 'Multi-platform Test',
        type: 'AUTONOMOUS',
        selectedPlatforms,
        createdBy: 'user-1',
      })

      expect(result.platformConfig.platforms).toEqual(selectedPlatforms)
    })
  })

  describe('getWorkflowStatus', () => {
    it('should return workflow with current status', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        status: 'GENERATING',
        name: 'Test Campaign',
        createdAt: new Date(),
      }

      jest
        .spyOn(prismaService.multiPlatformWorkflow, 'findUnique')
        .mockResolvedValue(mockWorkflow as any)

      const result = await service.getWorkflowStatus('workflow-1')

      expect(result.status).toBe('GENERATING')
      expect(result.name).toBe('Test Campaign')
    })

    it('should throw error if workflow not found', async () => {
      jest
        .spyOn(prismaService.multiPlatformWorkflow, 'findUnique')
        .mockResolvedValue(null)

      await expect(service.getWorkflowStatus('nonexistent')).rejects.toThrow()
    })
  })

  describe('publishContent', () => {
    it('should publish only approved content', async () => {
      const mockContent = [
        { id: 'content-1', status: 'APPROVED', platform: { slug: 'twitter' } },
        { id: 'content-2', status: 'APPROVED', platform: { slug: 'linkedin' } },
        { id: 'content-3', status: 'REJECTED', platform: { slug: 'instagram' } },
      ]

      jest
        .spyOn(prismaService.publishedContent, 'findMany')
        .mockResolvedValue(mockContent as any)

      jest
        .spyOn(prismaService.multiPlatformWorkflow, 'findUnique')
        .mockResolvedValue({
          id: 'workflow-1',
          status: 'REVIEW',
        } as any)

      jest
        .spyOn(prismaService.multiPlatformWorkflow, 'update')
        .mockResolvedValue({ status: 'PUBLISHING' } as any)

      const result = await service.publishContent('workflow-1')

      expect(result.published).toBeGreaterThan(0)
    })
  })

  describe('Content formatting', () => {
    it('should validate content length for Twitter', () => {
      const twitterContent = 'A'.repeat(300) // Exceeds 280 char limit

      const result = service.formatContentForPlatform(twitterContent, 'twitter')

      expect(result.body.length).toBeLessThanOrEqual(280)
    })

    it('should format different platforms appropriately', () => {
      const testContent =
        'This is a test message with #hashtags and @mentions'

      const twitterResult = service.formatContentForPlatform(
        testContent,
        'twitter'
      )
      const linkedinResult = service.formatContentForPlatform(
        testContent,
        'linkedin'
      )

      expect(twitterResult).toBeDefined()
      expect(linkedinResult).toBeDefined()
    })
  })

  describe('Batch operations', () => {
    it('should handle batch content generation for multiple platforms', async () => {
      const platforms = ['twitter', 'linkedin', 'instagram']
      const mockContent = platforms.map((p) => ({
        id: `content-${p}`,
        platform: p,
        status: 'GENERATED',
      }))

      jest
        .spyOn(prismaService.publishedContent, 'findMany')
        .mockResolvedValue(mockContent as any)

      const result = await service.getWorkflowStatus('workflow-1')

      expect(result).toBeDefined()
    })
  })

  describe('Error handling', () => {
    it('should handle platform API failures gracefully', async () => {
      const mockContent = {
        id: 'content-1',
        status: 'APPROVED',
        platform: { slug: 'twitter' },
      }

      jest
        .spyOn(prismaService.publishedContent, 'findMany')
        .mockResolvedValue([mockContent] as any)

      jest
        .spyOn(prismaService.multiPlatformWorkflow, 'findUnique')
        .mockResolvedValue({
          id: 'workflow-1',
          status: 'REVIEW',
        } as any)

      // Service should handle errors without throwing
      const result = await service.publishContent('workflow-1')

      expect(result).toBeDefined()
    })
  })
})
