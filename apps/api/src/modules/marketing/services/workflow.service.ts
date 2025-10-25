import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'

interface CreateWorkflowInput {
  name: string
  type: 'AUTONOMOUS' | 'CUSTOM_CAMPAIGN'
  customInput: Record<string, any>
  selectedPlatforms: string[]
  presetId?: string
  generatedContent?: any[]
  budget: number
  createdBy: string
}

interface GenerateContentInput {
  topic: string
  description: string
  industry: string
  tone: string
  contentStrategy: string
  platforms: string[]
  contentPiecesPerDay: number
  campaignDuration: number
  goals: string[]
}

interface PlatformMetrics {
  platform: string
  content: string
  estimatedReach: number
  estimatedEngagement: number
  scheduledTime: string
}

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new workflow (autonomous or custom)
   */
  async createWorkflow(input: CreateWorkflowInput) {
    try {
      // Validate inputs
      if (!input.name || !input.name.trim()) {
        throw new BadRequestException('Campaign name is required')
      }

      if (input.selectedPlatforms.length === 0) {
        throw new BadRequestException('At least one platform must be selected')
      }

      // For now, return a mock workflow response
      // Full persistence will be implemented later with MultiPlatformWorkflow model
      return {
        id: `workflow-${Date.now()}`,
        name: input.name,
        type: input.type,
        status: 'SUBMITTED_FOR_REVIEW',
        platforms: input.selectedPlatforms.length,
        contentPieces: input.generatedContent?.length || 0,
        budget: input.budget,
        message: `${input.type === 'AUTONOMOUS' ? 'Autonomous' : 'Custom'} campaign "${input.name}" submitted for admin review!`,
      }
    } catch (error) {
      throw error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Failed to create workflow')
    }
  }

  /**
   * Analyze current trends for autonomous campaigns
   */
  async analyzeTrends(input: { topic: string; industry: string; description: string }) {
    try {
      const { topic, industry, description } = input

      // Get current trends for the industry and topic
      const topTrends = this.getTopTrendsForIndustry(industry, topic)
      const recommendedStrategy = this.getRecommendedStrategy(topTrends, topic)
      const contentOpportunities = this.getContentOpportunities(topTrends)
      const competitorInsights = this.getCompetitorInsights(industry, topic)
      const seasonalFactors = this.getSeasonalFactors(industry)

      return {
        topTrends,
        recommendedStrategy,
        contentOpportunities,
        competitorInsights,
        seasonalFactors,
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to analyze trends')
    }
  }

  /**
   * Generate strategy plan for custom campaigns
   */
  async generateStrategyPlan(input: { strategy: string; platforms: string[]; budget: number }) {
    try {
      const { strategy, platforms, budget } = input

      // Parse the strategy and generate a comprehensive plan
      const title = this.extractStrategyTitle(strategy)
      const description = strategy.substring(0, 500)
      const targetAudience = this.inferTargetAudience(strategy)
      const keyMessages = this.extractKeyMessages(strategy)
      const contentThemes = this.extractContentThemes(strategy, platforms)
      const postingSchedule = this.generatePostingSchedule(platforms)
      const successMetrics = this.defineSuccessMetrics(platforms)
      const estimatedReach = this.estimateStrategyReach(platforms, budget)
      const estimatedEngagement = this.estimateStrategyEngagement(platforms)

      return {
        title,
        description,
        targetAudience,
        keyMessages,
        contentThemes,
        postingSchedule,
        successMetrics,
        estimatedReach,
        estimatedEngagement,
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate strategy plan')
    }
  }

  // ============================================
  // TREND ANALYSIS HELPERS
  // ============================================

  private getTopTrendsForIndustry(industry: string, topic: string): string[] {
    const trends: Record<string, string[]> = {
      Technology: [
        'AI-powered automation',
        'Cloud-native development',
        'DevOps and CI/CD',
        'Cybersecurity awareness',
        'Low-code platforms',
      ],
      'E-commerce': [
        'Social commerce integration',
        'Personalization at scale',
        'Subscription models',
        'Sustainable shopping',
        'Direct-to-consumer strategies',
      ],
      SaaS: [
        'Vertical SaaS solutions',
        'Product-led growth',
        'Customer success automation',
        'API-first architecture',
        'Free trial optimization',
      ],
      Finance: [
        'Fintech disruption',
        'ESG investing',
        'Cryptocurrency trends',
        'Personal wealth management',
        'Financial wellness',
      ],
      Healthcare: [
        'Telemedicine expansion',
        'Patient data privacy',
        'Mental health focus',
        'Preventive care',
        'Health equity initiatives',
      ],
      Education: [
        'Online learning platforms',
        'Skill-based courses',
        'Gamification in learning',
        'Accessibility in education',
        'Microlearning trends',
      ],
    }

    return trends[industry] || [
      `${topic} innovation`,
      `${topic} best practices`,
      `Future of ${topic}`,
      `${topic} tools and resources`,
      `${topic} case studies`,
    ]
  }

  private getRecommendedStrategy(trends: string[], topic: string): string {
    const strategies = [
      `Focus on ${trends[0]} to establish thought leadership in ${topic}`,
      `Create educational content around ${trends[1]} to build authority`,
      `Leverage ${trends[2]} for viral engagement potential`,
      `Highlight ${trends[3]} in success stories and case studies`,
      `Build community around ${trends[4]} to increase brand loyalty`,
    ]

    return strategies[Math.floor(Math.random() * strategies.length)]
  }

  private getContentOpportunities(trends: string[]): string[] {
    return trends.slice(0, 3).map((trend) => `Create content series on "${trend}"`)
  }

  private getCompetitorInsights(industry: string, topic: string): string {
    return `Top competitors in ${industry} are focusing on content marketing and community building around "${topic}". Position yourself as the authoritative voice by providing unique insights and actionable advice.`
  }

  private getSeasonalFactors(industry: string): string {
    const seasonalInsights: Record<string, string> = {
      Technology: 'Peak engagement during tech conferences (January, May, September)',
      'E-commerce': 'Black Friday/Cyber Monday drives 40% of annual engagement',
      SaaS: 'Budget planning season (Q4) sees increased demand',
      Finance: 'Tax season and earnings reports drive engagement spikes',
      Healthcare: 'New Year resolutions boost wellness-related content',
      Education: 'Back-to-school season and academic calendars drive engagement',
    }

    return (
      seasonalInsights[industry] ||
      'Plan campaigns around industry events and holidays for maximum engagement'
    )
  }

  // ============================================
  // STRATEGY PLAN GENERATION HELPERS
  // ============================================

  private extractStrategyTitle(strategy: string): string {
    const words = strategy.split(' ')
    return words.slice(0, 5).join(' ') || 'Custom Strategy Plan'
  }

  private inferTargetAudience(strategy: string): string {
    if (strategy.toLowerCase().includes('business') || strategy.toLowerCase().includes('b2b')) {
      return 'Business decision makers and industry professionals'
    }
    if (strategy.toLowerCase().includes('consumer') || strategy.toLowerCase().includes('b2c')) {
      return 'Individual consumers and end-users'
    }
    return 'Target audience interested in your products and services'
  }

  private extractKeyMessages(strategy: string): string[] {
    return [
      'Clear value proposition',
      'Unique competitive advantage',
      'Customer success stories',
      'Thought leadership positioning',
      'Call-to-action clarity',
    ]
  }

  private extractContentThemes(strategy: string, platforms: string[]): string[] {
    const themes = [
      'Educational content',
      'Behind-the-scenes stories',
      'Industry insights',
      'Product features',
      'Customer success stories',
    ]

    return themes.slice(0, Math.min(3, platforms.length))
  }

  private generatePostingSchedule(platforms: string[]): string {
    const schedules: Record<string, string> = {
      twitter: '3 times daily during peak hours (9am, 12pm, 6pm)',
      linkedin: '2 times daily (8am, 5pm business hours)',
      instagram: '1-2 times daily (11am, 7pm)',
      tiktok: '1-2 times daily (7am, 7pm)',
      facebook: '1-2 times daily (morning and evening)',
      youtube: '1-2 times weekly (Tuesdays and Thursdays)',
    }

    const selectedSchedules = platforms
      .map((p) => `${p}: ${schedules[p.toLowerCase()] || 'Once daily'}`)
      .join(' | ')

    return selectedSchedules || 'Customize posting schedule based on audience behavior'
  }

  private defineSuccessMetrics(platforms: string[]): string[] {
    return [
      'Engagement rate above 3%',
      'Monthly audience growth of 10%+',
      'Click-through rate (CTR) improvements',
      'Conversion rate targets',
      'Share and save metrics',
    ]
  }

  private estimateStrategyReach(platforms: string[], budget: number): number {
    const baseReach: Record<string, number> = {
      twitter: 50000,
      linkedin: 30000,
      instagram: 80000,
      tiktok: 150000,
      facebook: 60000,
      youtube: 40000,
    }

    const avgReachPerPlatform = 75000
    const budgetMultiplier = Math.min(budget / 1000, 2) // Max 2x with high budget
    return Math.round(avgReachPerPlatform * budgetMultiplier)
  }

  private estimateStrategyEngagement(platforms: string[]): number {
    const baseEngagement: Record<string, number> = {
      twitter: 0.045,
      linkedin: 0.032,
      instagram: 0.067,
      tiktok: 0.089,
      facebook: 0.028,
      youtube: 0.042,
    }

    const engagements = platforms
      .map((p) => baseEngagement[p.toLowerCase()] || 0.04)
      .reduce((a, b) => a + b, 0)

    return engagements / Math.max(platforms.length, 1)
  }
}
