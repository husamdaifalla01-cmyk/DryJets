import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

interface CompetitorProfile {
  id: string
  name: string
  industry: string
  website: string
  platforms: PlatformPresence[]
  founded?: number
  employees?: number
  location?: string
}

interface PlatformPresence {
  platform: string
  handle: string
  url: string
  followers: number
  engagement_rate: number
  posting_frequency: number
  last_post_date?: Date
}

interface CompetitorMetrics {
  competitor: CompetitorProfile
  content_strength: number // 0-100
  audience_engagement: number // 0-100
  market_share_estimate: number // 0-100
  growth_rate: number // percentage
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

interface ContentAnalysis {
  competitor: string
  platform: string
  average_likes: number
  average_comments: number
  average_shares: number
  best_performing_content_type: string
  posting_time_preference: string
  hashtag_strategy: string[]
  content_themes: string[]
}

interface MarketComparisonData {
  your_metrics: Record<string, number>
  competitor_average: Record<string, number>
  market_leader: Record<string, number>
  your_ranking: number
  market_size: number
}

@Injectable()
export class CompetitorAnalysisService {
  private readonly logger = new Logger('CompetitorAnalysisService')
  private competitors: CompetitorProfile[] = []
  private competitorMetrics: Map<string, CompetitorMetrics> = new Map()
  private contentAnalysis: ContentAnalysis[] = []

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.initializeCompetitors()
  }

  /**
   * Initialize with sample competitors
   */
  private initializeCompetitors(): void {
    try {
      this.competitors = [
        {
          id: 'comp_1',
          name: 'TechFlow Marketing',
          industry: 'Marketing SaaS',
          website: 'https://techflow.com',
          platforms: [
            {
              platform: 'twitter',
              handle: '@techflow_co',
              url: 'https://twitter.com/techflow_co',
              followers: 45000,
              engagement_rate: 3.2,
              posting_frequency: 2.5,
            },
            {
              platform: 'linkedin',
              handle: 'techflow-inc',
              url: 'https://linkedin.com/company/techflow-inc',
              followers: 23000,
              engagement_rate: 2.1,
              posting_frequency: 1.2,
            },
          ],
          founded: 2020,
          employees: 50,
          location: 'San Francisco, CA',
        },
        {
          id: 'comp_2',
          name: 'Content Pro Solutions',
          industry: 'Marketing SaaS',
          website: 'https://contentpro.io',
          platforms: [
            {
              platform: 'instagram',
              handle: 'contentpro_io',
              url: 'https://instagram.com/contentpro_io',
              followers: 32000,
              engagement_rate: 4.5,
              posting_frequency: 1.8,
            },
            {
              platform: 'youtube',
              handle: 'ContentProChannel',
              url: 'https://youtube.com/@ContentProChannel',
              followers: 18000,
              engagement_rate: 6.2,
              posting_frequency: 0.4,
            },
          ],
          founded: 2019,
          employees: 35,
          location: 'Austin, TX',
        },
        {
          id: 'comp_3',
          name: 'Social Pulse Analytics',
          industry: 'Social Media Analytics',
          website: 'https://socialpulse.com',
          platforms: [
            {
              platform: 'tiktok',
              handle: '@socialpulseapp',
              url: 'https://tiktok.com/@socialpulseapp',
              followers: 85000,
              engagement_rate: 7.8,
              posting_frequency: 2.1,
            },
            {
              platform: 'linkedin',
              handle: 'social-pulse',
              url: 'https://linkedin.com/company/social-pulse',
              followers: 42000,
              engagement_rate: 3.4,
              posting_frequency: 1.5,
            },
          ],
          founded: 2018,
          employees: 60,
          location: 'New York, NY',
        },
      ]

      this.logger.log(`Initialized ${this.competitors.length} competitors`)
    } catch (error: any) {
      this.logger.error(`Failed to initialize competitors: ${error.message}`)
    }
  }

  /**
   * Add a new competitor for tracking
   */
  async addCompetitor(profile: CompetitorProfile): Promise<CompetitorProfile> {
    try {
      const existingIndex = this.competitors.findIndex(
        (c) => c.website === profile.website,
      )

      if (existingIndex >= 0) {
        this.competitors[existingIndex] = profile
        this.logger.log(`Updated competitor: ${profile.name}`)
        return profile
      }

      this.competitors.push(profile)
      this.logger.log(`Added new competitor: ${profile.name}`)

      // Analyze the competitor
      await this.analyzeCompetitor(profile.id)

      return profile
    } catch (error: any) {
      this.logger.error(
        `Failed to add competitor ${profile.name}: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Analyze a competitor's metrics
   */
  async analyzeCompetitor(competitorId: string): Promise<CompetitorMetrics> {
    try {
      const competitor = this.competitors.find((c) => c.id === competitorId)

      if (!competitor) {
        throw new Error(`Competitor ${competitorId} not found`)
      }

      // Calculate metrics
      const avgFollowers =
        competitor.platforms.reduce((sum, p) => sum + p.followers, 0) /
        competitor.platforms.length
      const avgEngagement =
        competitor.platforms.reduce((sum, p) => sum + p.engagement_rate, 0) /
        competitor.platforms.length
      const contentStrength = Math.min(100, avgEngagement * 10)
      const audienceEngagement = avgEngagement * 15
      const growthRate = Math.random() * 25 + 5

      const metrics: CompetitorMetrics = {
        competitor,
        content_strength: contentStrength,
        audience_engagement: audienceEngagement,
        market_share_estimate: Math.random() * 30 + 10,
        growth_rate: growthRate,
        strengths: [
          'Strong social media presence',
          'High engagement rates',
          'Consistent posting schedule',
          'Multi-platform strategy',
        ],
        weaknesses: [
          'Limited video content',
          'Slow website updates',
          'Low email engagement',
        ],
        opportunities: [
          'Expand to emerging platforms',
          'Increase thought leadership content',
          'Develop interactive content',
        ],
        threats: [
          'New market entrants',
          'Platform algorithm changes',
          'Increased competition',
        ],
      }

      this.competitorMetrics.set(competitorId, metrics)
      this.logger.log(`Analyzed competitor: ${competitor.name}`)

      return metrics
    } catch (error: any) {
      this.logger.error(
        `Failed to analyze competitor ${competitorId}: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Get competitor metrics
   */
  getCompetitorMetrics(competitorId: string): CompetitorMetrics | undefined {
    return this.competitorMetrics.get(competitorId)
  }

  /**
   * Analyze competitor content strategy
   */
  async analyzeContentStrategy(
    competitorId: string,
    platform: string,
  ): Promise<ContentAnalysis> {
    try {
      const competitor = this.competitors.find((c) => c.id === competitorId)

      if (!competitor) {
        throw new Error(`Competitor ${competitorId} not found`)
      }

      const platformData = competitor.platforms.find(
        (p) => p.platform === platform,
      )

      if (!platformData) {
        throw new Error(
          `Competitor ${competitor.name} not found on ${platform}`,
        )
      }

      const analysis: ContentAnalysis = {
        competitor: competitor.name,
        platform,
        average_likes: Math.floor(Math.random() * 500) + 100,
        average_comments: Math.floor(Math.random() * 50) + 10,
        average_shares: Math.floor(Math.random() * 30) + 5,
        best_performing_content_type:
          platform === 'tiktok'
            ? 'Trending audio + tutorials'
            : platform === 'youtube'
              ? 'Educational series'
              : platform === 'instagram'
                ? 'Behind the scenes + carousel posts'
                : 'Industry insights + news',
        posting_time_preference:
          platform === 'twitter' ? '9 AM, 12 PM, 6 PM UTC' : '10 AM - 2 PM UTC',
        hashtag_strategy: this.generateHashtagStrategy(platform),
        content_themes: [
          'Industry trends',
          'Product updates',
          'Customer stories',
          'Educational content',
          'Company culture',
        ],
      }

      this.contentAnalysis.push(analysis)
      this.logger.log(
        `Analyzed content strategy for ${competitor.name} on ${platform}`,
      )

      return analysis
    } catch (error: any) {
      this.logger.error(
        `Failed to analyze content strategy: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Generate hashtag strategy based on platform
   */
  private generateHashtagStrategy(platform: string): string[] {
    const strategies: Record<string, string[]> = {
      twitter: [
        '#industry trends',
        '#SaaS',
        '#marketing automation',
        '#Brandnew releases',
      ],
      linkedin: [
        '#BusinessStrategy',
        '#DigitalMarketing',
        '#SaaS',
        '#Leadership',
      ],
      instagram: [
        '#MarketingLife',
        '#DigitalMarketing',
        '#BehindTheScenes',
        '#Teamwork',
      ],
      tiktok: [
        '#FYP',
        '#ForYouPage',
        '#SaaS',
        '#MarketingTrends',
        '#TechTok',
      ],
      youtube: ['#SaaS', '#Marketing', '#Tutorial', '#ProductDemo'],
    }

    return strategies[platform] || ['#marketing', '#business', '#content']
  }

  /**
   * Compare your metrics with competitors
   */
  getMarketComparison(yourMetrics: Record<string, number>): MarketComparisonData {
    try {
      const allMetrics = Array.from(this.competitorMetrics.values())

      if (allMetrics.length === 0) {
        return {
          your_metrics: yourMetrics,
          competitor_average: {},
          market_leader: {},
          your_ranking: 0,
          market_size: 0,
        }
      }

      const competitorAverages: Record<string, number> = {}
      const marketLeader: Record<string, number> = {}

      // Calculate averages and identify leader
      Object.keys(yourMetrics).forEach((key) => {
        const values = allMetrics.map((m) => m[key as keyof CompetitorMetrics] as any).filter(
          (v) => typeof v === 'number',
        )

        if (values.length > 0) {
          competitorAverages[key] = values.reduce((a, b) => a + b, 0) / values.length
          marketLeader[key] = Math.max(...values)
        }
      })

      // Calculate ranking
      let ranking = 1
      allMetrics.forEach((m) => {
        if (m.market_share_estimate > yourMetrics['market_share_estimate'] || 0) {
          ranking++
        }
      })

      return {
        your_metrics: yourMetrics,
        competitor_average: competitorAverages,
        market_leader: marketLeader,
        your_ranking: ranking,
        market_size: allMetrics.length + 1,
      }
    } catch (error: any) {
      this.logger.error(`Failed to get market comparison: ${error.message}`)
      throw error
    }
  }

  /**
   * Get all competitors
   */
  getAllCompetitors(): CompetitorProfile[] {
    return this.competitors
  }

  /**
   * Get competitor by ID
   */
  getCompetitor(competitorId: string): CompetitorProfile | undefined {
    return this.competitors.find((c) => c.id === competitorId)
  }

  /**
   * Remove a competitor from tracking
   */
  removeCompetitor(competitorId: string): boolean {
    try {
      const index = this.competitors.findIndex((c) => c.id === competitorId)

      if (index >= 0) {
        const removed = this.competitors.splice(index, 1)
        this.competitorMetrics.delete(competitorId)
        this.logger.log(`Removed competitor: ${removed[0].name}`)
        return true
      }

      return false
    } catch (error: any) {
      this.logger.error(`Failed to remove competitor: ${error.message}`)
      return false
    }
  }

  /**
   * Get SWOT analysis for a competitor
   */
  getSWOTAnalysis(competitorId: string): {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  } | null {
    const metrics = this.competitorMetrics.get(competitorId)

    if (!metrics) {
      return null
    }

    return {
      strengths: metrics.strengths,
      weaknesses: metrics.weaknesses,
      opportunities: metrics.opportunities,
      threats: metrics.threats,
    }
  }

  /**
   * Track competitor over time
   */
  trackCompetitorProgress(
    competitorId: string,
  ): {
    competitor: CompetitorProfile | undefined
    metrics_history: CompetitorMetrics[]
    growth_trend: string
  } {
    try {
      const competitor = this.getCompetitor(competitorId)
      const metrics = this.competitorMetrics.get(competitorId)

      let growthTrend = 'stable'
      if (metrics && metrics.growth_rate > 15) {
        growthTrend = 'rapid'
      } else if (metrics && metrics.growth_rate < 5) {
        growthTrend = 'slow'
      }

      return {
        competitor,
        metrics_history: metrics ? [metrics] : [],
        growth_trend: growthTrend,
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to track competitor progress: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Identify market opportunities based on competitor analysis
   */
  identifyOpportunities(): Array<{
    opportunity: string
    based_on: string
    potential_roi: number
  }> {
    try {
      const opportunities = []

      const allMetrics = Array.from(this.competitorMetrics.values())

      // Identify underutilized platforms
      const platformUsage: Record<string, number> = {}
      allMetrics.forEach((m) => {
        m.competitor.platforms.forEach((p) => {
          platformUsage[p.platform] = (platformUsage[p.platform] || 0) + 1
        })
      })

      const lessUsedPlatforms = Object.entries(platformUsage)
        .filter(([_, count]) => count <= 1)
        .map(([platform]) => platform)

      if (lessUsedPlatforms.length > 0) {
        opportunities.push({
          opportunity: `Expand to underutilized platforms: ${lessUsedPlatforms.join(', ')}`,
          based_on: 'Competitor platform analysis',
          potential_roi: 45,
        })
      }

      // Identify engagement gaps
      const avgEngagement =
        allMetrics.reduce((sum, m) => sum + m.audience_engagement, 0) /
        allMetrics.length
      const lowEngagementCompetitors = allMetrics.filter(
        (m) => m.audience_engagement < avgEngagement,
      )

      if (lowEngagementCompetitors.length > 0) {
        opportunities.push({
          opportunity: `Improve engagement strategy (competitors avg: ${avgEngagement.toFixed(1)}%)`,
          based_on: 'Engagement rate analysis',
          potential_roi: 60,
        })
      }

      // Identify content gaps
      opportunities.push({
        opportunity: 'Develop interactive content (polls, Q&A, live sessions)',
        based_on: 'Market gap identification',
        potential_roi: 55,
      })

      return opportunities
    } catch (error: any) {
      this.logger.error(`Failed to identify opportunities: ${error.message}`)
      return []
    }
  }
}
