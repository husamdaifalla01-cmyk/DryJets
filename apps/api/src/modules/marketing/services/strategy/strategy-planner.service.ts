import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { SonnetService } from '../../ai/sonnet.service';

/**
 * STRATEGY PLANNER SERVICE
 *
 * Generates comprehensive marketing strategies based on landscape analysis.
 * Creates actionable plans with timeline, budget allocation, and success metrics.
 */

export interface StrategyPlan {
  profileId: string;

  // Core Strategy
  positioning: {
    uniqueValueProposition: string;
    differentiators: string[];
    targetNiche: string;
    brandPersonality: string;
  };

  // Content Strategy
  contentStrategy: {
    pillarTopics: string[];
    contentMix: { type: string; percentage: number }[];
    postingCadence: { platform: string; frequency: string }[];
    toneAndVoice: string;
  };

  // Channel Strategy
  channelStrategy: {
    platform: string;
    priority: 'primary' | 'secondary' | 'tertiary';
    objective: string;
    tactics: string[];
    kpis: string[];
  }[];

  // Campaign Roadmap
  campaigns: {
    name: string;
    type: 'awareness' | 'engagement' | 'conversion';
    timeline: string;
    budget: number;
    expectedROI: string;
    description: string;
  }[];

  // Budget Allocation
  budgetAllocation: {
    category: string;
    percentage: number;
    amount: number;
    rationale: string;
  }[];

  // Success Metrics
  successMetrics: {
    metric: string;
    target: string;
    timeline: string;
  }[];

  // Implementation Timeline
  timeline: {
    phase: string;
    duration: string;
    milestones: string[];
    deliverables: string[];
  }[];

  generatedAt: Date;
}

@Injectable()
export class StrategyPlannerService {
  private readonly logger = new Logger(StrategyPlannerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sonnetService: SonnetService,
  ) {}

  async generateStrategy(profileId: string): Promise<StrategyPlan> {
    this.logger.log(`= Generating strategy plan for profile: ${profileId}`);

    const profile = await this.prisma.marketingProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    const landscapeAnalysis = profile.landscapeAnalysis as any;

    const prompt = `
Create a comprehensive marketing strategy plan based on this profile and analysis.

Generate a detailed strategy including:
1. Positioning (UVP, differentiators, niche, brand personality)
2. Content strategy (pillar topics, content mix, posting cadence)
3. Channel strategy (platforms, priorities, tactics, KPIs)
4. Campaign roadmap (6 campaigns over 12 months)
5. Budget allocation
6. Success metrics
7. Implementation timeline (4 phases)

Format as JSON following the StrategyPlan interface structure.
`;

    const strategy = await this.sonnetService.generateStructuredContent(prompt);

    await this.prisma.marketingProfile.update({
      where: { id: profileId },
      data: { strategyPlan: strategy as any },
    });

    this.logger.log(` Strategy plan generated for profile: ${profileId}`);

    return { ...strategy, profileId, generatedAt: new Date() };
  }

  async getStrategy(profileId: string): Promise<StrategyPlan | null> {
    const profile = await this.prisma.marketingProfile.findUnique({
      where: { id: profileId },
      select: { strategyPlan: true },
    });

    return profile?.strategyPlan as unknown as StrategyPlan || null;
  }
}
