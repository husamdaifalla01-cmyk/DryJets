import { Injectable, Logger } from '@nestjs/common'

interface Influencer {
  id: string
  name: string
  handle: string
  platform: string
  niche: string
  followers: number
  engagement_rate: number
  average_reach: number
  growth_rate: number
  audience_demographics: AudienceDemographics
  content_price_per_post: number
  collaboration_history: Collaboration[]
  verified: boolean
  last_post_date?: Date
}

interface AudienceDemographics {
  age_groups: Record<string, number>
  gender_split: { male: number; female: number; other: number }
  top_locations: string[]
  interests: string[]
}

interface InfluencerCampaign {
  id: string
  name: string
  description: string
  influencers: string[] // Influencer IDs
  budget: number
  start_date: Date
  end_date: Date
  deliverables: string[]
  status: 'planned' | 'active' | 'completed' | 'paused'
  expected_reach: number
  expected_engagement: number
  kpis: KPI[]
  content_requirements: ContentRequirement[]
  created_at: Date
}

interface KPI {
  metric: string
  target: number
  current: number
  unit: string
}

interface ContentRequirement {
  platform: string
  type: string
  quantity: number
  specifications: Record<string, any>
}

interface Collaboration {
  id: string
  influencer_id: string
  campaign_id: string
  start_date: Date
  end_date: Date
  deliverables_completed: number
  deliverables_total: number
  engagement_metrics: Record<string, number>
  performance_rating: number
  notes: string
}

@Injectable()
export class InfluencerCollaborationService {
  private readonly logger = new Logger('InfluencerCollaborationService')
  private influencers: Map<string, Influencer> = new Map()
  private campaigns: Map<string, InfluencerCampaign> = new Map()
  private collaborations: Map<string, Collaboration> = new Map()

  constructor() {
    this.initializeInfluencers()
  }

  /**
   * Initialize with sample influencers
   */
  private initializeInfluencers(): void {
    try {
      const influencers: Influencer[] = [
        {
          id: 'inf_1',
          name: 'Sarah Chen',
          handle: '@sarahchen_co',
          platform: 'instagram',
          niche: 'Business & Tech',
          followers: 250000,
          engagement_rate: 4.8,
          average_reach: 95000,
          growth_rate: 12,
          audience_demographics: {
            age_groups: { '18-24': 20, '25-34': 45, '35-44': 25, '45+': 10 },
            gender_split: { male: 40, female: 58, other: 2 },
            top_locations: ['US', 'UK', 'Canada'],
            interests: ['SaaS', 'Startups', 'Marketing', 'Technology'],
          },
          content_price_per_post: 5000,
          collaboration_history: [],
          verified: true,
        },
        {
          id: 'inf_2',
          name: 'Marcus Williams',
          handle: '@marcusgrowth',
          platform: 'youtube',
          niche: 'Marketing & Growth',
          followers: 450000,
          engagement_rate: 6.2,
          average_reach: 180000,
          growth_rate: 8,
          audience_demographics: {
            age_groups: { '18-24': 25, '25-34': 40, '35-44': 25, '45+': 10 },
            gender_split: { male: 65, female: 33, other: 2 },
            top_locations: ['US', 'Australia', 'Canada'],
            interests: ['Growth Marketing', 'Entrepreneurship', 'SaaS'],
          },
          content_price_per_post: 8000,
          collaboration_history: [],
          verified: true,
        },
        {
          id: 'inf_3',
          name: 'Emma Rodriguez',
          handle: '@emmacontentstudio',
          platform: 'tiktok',
          niche: 'Content Creation',
          followers: 1200000,
          engagement_rate: 7.5,
          average_reach: 350000,
          growth_rate: 15,
          audience_demographics: {
            age_groups: { '18-24': 60, '25-34': 30, '35-44': 8, '45+': 2 },
            gender_split: { male: 30, female: 68, other: 2 },
            top_locations: ['US', 'Mexico', 'Spain'],
            interests: ['Content Creation', 'Social Media', 'Lifestyle'],
          },
          content_price_per_post: 12000,
          collaboration_history: [],
          verified: true,
        },
        {
          id: 'inf_4',
          name: 'James Mitchell',
          handle: 'jamesmitchell',
          platform: 'linkedin',
          niche: 'B2B & Leadership',
          followers: 180000,
          engagement_rate: 3.2,
          average_reach: 45000,
          growth_rate: 6,
          audience_demographics: {
            age_groups: { '18-24': 5, '25-34': 30, '35-44': 45, '45+': 20 },
            gender_split: { male: 72, female: 26, other: 2 },
            top_locations: ['US', 'UK', 'India'],
            interests: ['Leadership', 'B2B SaaS', 'Business Strategy'],
          },
          content_price_per_post: 3000,
          collaboration_history: [],
          verified: true,
        },
      ]

      influencers.forEach((influencer) => {
        this.influencers.set(influencer.id, influencer)
      })

      this.logger.log(`Initialized ${influencers.length} influencers`)
    } catch (error: any) {
      this.logger.error(
        `Failed to initialize influencers: ${error.message}`,
      )
    }
  }

  /**
   * Add a new influencer
   */
  async addInfluencer(influencer: Omit<Influencer, 'id' | 'collaboration_history'>): Promise<Influencer> {
    try {
      const id = `inf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const newInfluencer: Influencer = {
        ...influencer,
        id,
        collaboration_history: [],
      }

      this.influencers.set(id, newInfluencer)

      this.logger.log(`Added influencer: ${influencer.name}`)

      return newInfluencer
    } catch (error: any) {
      this.logger.error(
        `Failed to add influencer: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Find influencers by criteria
   */
  findInfluencers(filters: {
    niche?: string
    platform?: string
    min_followers?: number
    max_followers?: number
    min_engagement_rate?: number
    max_budget?: number
  }): Influencer[] {
    try {
      let results = Array.from(this.influencers.values())

      if (filters.niche) {
        results = results.filter((i) =>
          i.niche.toLowerCase().includes(filters.niche!.toLowerCase()),
        )
      }

      if (filters.platform) {
        results = results.filter((i) => i.platform === filters.platform)
      }

      if (filters.min_followers) {
        results = results.filter((i) => i.followers >= filters.min_followers!)
      }

      if (filters.max_followers) {
        results = results.filter((i) => i.followers <= filters.max_followers!)
      }

      if (filters.min_engagement_rate) {
        results = results.filter(
          (i) => i.engagement_rate >= filters.min_engagement_rate!,
        )
      }

      if (filters.max_budget) {
        results = results.filter(
          (i) => i.content_price_per_post <= filters.max_budget!,
        )
      }

      return results.sort((a, b) => b.engagement_rate - a.engagement_rate)
    } catch (error: any) {
      this.logger.error(
        `Failed to find influencers: ${error.message}`,
      )
      return []
    }
  }

  /**
   * Create a campaign
   */
  async createCampaign(
    campaign: Omit<InfluencerCampaign, 'id' | 'created_at'>,
  ): Promise<InfluencerCampaign> {
    try {
      const id = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const newCampaign: InfluencerCampaign = {
        ...campaign,
        id,
        created_at: new Date(),
      }

      this.campaigns.set(id, newCampaign)

      this.logger.log(`Created campaign: ${campaign.name}`)

      return newCampaign
    } catch (error: any) {
      this.logger.error(
        `Failed to create campaign: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Get campaign details
   */
  getCampaign(campaignId: string): InfluencerCampaign | undefined {
    return this.campaigns.get(campaignId)
  }

  /**
   * Update campaign status
   */
  updateCampaignStatus(
    campaignId: string,
    status: 'planned' | 'active' | 'completed' | 'paused',
  ): boolean {
    try {
      const campaign = this.campaigns.get(campaignId)

      if (!campaign) {
        return false
      }

      campaign.status = status
      this.logger.log(`Updated campaign status to: ${status}`)

      return true
    } catch (error: any) {
      this.logger.error(
        `Failed to update campaign status: ${error.message}`,
      )
      return false
    }
  }

  /**
   * Create a collaboration
   */
  async startCollaboration(
    influencerId: string,
    campaignId: string,
  ): Promise<Collaboration> {
    try {
      const influencer = this.influencers.get(influencerId)
      const campaign = this.campaigns.get(campaignId)

      if (!influencer || !campaign) {
        throw new Error('Influencer or campaign not found')
      }

      const id = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const collaboration: Collaboration = {
        id,
        influencer_id: influencerId,
        campaign_id: campaignId,
        start_date: new Date(),
        end_date: campaign.end_date,
        deliverables_completed: 0,
        deliverables_total: campaign.deliverables.length,
        engagement_metrics: {},
        performance_rating: 0,
        notes: '',
      }

      this.collaborations.set(id, collaboration)

      // Add to influencer's collaboration history
      influencer.collaboration_history.push(collaboration)

      this.logger.log(
        `Started collaboration between ${influencer.name} and ${campaign.name}`,
      )

      return collaboration
    } catch (error: any) {
      this.logger.error(
        `Failed to start collaboration: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Update collaboration progress
   */
  updateCollaborationProgress(
    collaborationId: string,
    completed: number,
    metrics?: Record<string, number>,
  ): boolean {
    try {
      const collaboration = this.collaborations.get(collaborationId)

      if (!collaboration) {
        return false
      }

      collaboration.deliverables_completed = completed

      if (metrics) {
        collaboration.engagement_metrics = metrics
      }

      this.logger.log(
        `Updated collaboration progress: ${completed}/${collaboration.deliverables_total}`,
      )

      return true
    } catch (error: any) {
      this.logger.error(
        `Failed to update collaboration: ${error.message}`,
      )
      return false
    }
  }

  /**
   * Calculate campaign ROI
   */
  calculateCampaignROI(campaignId: string): {
    total_spent: number
    expected_reach: number
    expected_engagement: number
    roi_percentage: number
    cost_per_impression: number
    cost_per_engagement: number
  } {
    try {
      const campaign = this.campaigns.get(campaignId)

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      const campaignInfluencers = campaign.influencers
        .map((id) => this.influencers.get(id))
        .filter((inf) => inf !== undefined) as Influencer[]

      const totalSpent = campaignInfluencers.reduce(
        (sum, inf) => sum + inf.content_price_per_post * campaign.deliverables.length,
        0,
      )

      const expectedReach = campaignInfluencers.reduce(
        (sum, inf) => sum + inf.average_reach,
        0,
      )

      const expectedEngagement = expectedReach *
        (campaignInfluencers.reduce((sum, inf) => sum + inf.engagement_rate, 0) /
          campaignInfluencers.length /
          100)

      const revenue = expectedEngagement * 10 // Assume $10 per engagement

      const roi = ((revenue - totalSpent) / totalSpent) * 100

      return {
        total_spent: totalSpent,
        expected_reach: expectedReach,
        expected_engagement: expectedEngagement,
        roi_percentage: Math.round(roi * 100) / 100,
        cost_per_impression: totalSpent / expectedReach,
        cost_per_engagement: totalSpent / expectedEngagement,
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to calculate ROI: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Get influencer recommendations
   */
  getInfluencerRecommendations(
    budget: number,
    targetNiche: string,
    requiredPlatforms: string[] = [],
  ): {
    recommended_influencers: Influencer[]
    total_cost: number
    total_expected_reach: number
    fit_score: number
  } {
    try {
      let candidates = this.findInfluencers({
        niche: targetNiche,
        max_budget: budget,
      })

      if (requiredPlatforms.length > 0) {
        candidates = candidates.filter((inf) =>
          requiredPlatforms.includes(inf.platform),
        )
      }

      candidates = candidates.slice(0, 5)

      const totalCost = candidates.reduce(
        (sum, inf) => sum + inf.content_price_per_post,
        0,
      )

      const totalReach = candidates.reduce(
        (sum, inf) => sum + inf.average_reach,
        0,
      )

      const avgEngagement =
        candidates.reduce((sum, inf) => sum + inf.engagement_rate, 0) /
        candidates.length

      const fitScore = Math.round((avgEngagement / 10) * 100)

      return {
        recommended_influencers: candidates,
        total_cost: totalCost,
        total_expected_reach: totalReach,
        fit_score: Math.min(100, fitScore),
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to get recommendations: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Get campaign performance metrics
   */
  getCampaignMetrics(campaignId: string): {
    campaign_name: string
    status: string
    influencer_count: number
    total_followers_reached: number
    expected_roi: number
    completion_rate: number
    average_engagement_rate: number
  } {
    try {
      const campaign = this.campaigns.get(campaignId)

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      const campaignInfluencers = campaign.influencers
        .map((id) => this.influencers.get(id))
        .filter((inf) => inf !== undefined) as Influencer[]

      const roi = this.calculateCampaignROI(campaignId)
      const avgEngagement =
        campaignInfluencers.reduce((sum, inf) => sum + inf.engagement_rate, 0) /
        campaignInfluencers.length

      const collaborations = Array.from(this.collaborations.values()).filter(
        (c) => c.campaign_id === campaignId,
      )

      const completionRate =
        collaborations.length > 0
          ? collaborations.reduce((sum, c) => sum + (c.deliverables_completed / c.deliverables_total), 0) /
            collaborations.length
          : 0

      return {
        campaign_name: campaign.name,
        status: campaign.status,
        influencer_count: campaignInfluencers.length,
        total_followers_reached: campaignInfluencers.reduce(
          (sum, inf) => sum + inf.followers,
          0,
        ),
        expected_roi: roi.roi_percentage,
        completion_rate: Math.round(completionRate * 100),
        average_engagement_rate: Math.round(avgEngagement * 100) / 100,
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to get campaign metrics: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns(): InfluencerCampaign[] {
    return Array.from(this.campaigns.values())
  }

  /**
   * Get influencer by ID
   */
  getInfluencer(influencerId: string): Influencer | undefined {
    return this.influencers.get(influencerId)
  }

  /**
   * Get all influencers
   */
  getAllInfluencers(): Influencer[] {
    return Array.from(this.influencers.values())
  }
}
