import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

export interface GrowthStrategy {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'linkedin';
  tactics: GrowthTactic[];
  postingSchedule: PostingSchedule;
  contentMix: ContentMix[];
  expectedGrowth: { followers: number; engagement: number; reach: number };
}

export interface GrowthTactic {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: number; // 0-100
  implementation: string[];
}

export interface PostingSchedule {
  frequency: string;
  peakTimes: string[];
  contentTypes: Record<string, number>; // percentage
}

export interface ContentMix {
  type: string;
  percentage: number;
  purpose: string;
  examples: string[];
}

@Injectable()
export class OrganicGrowthService {
  private readonly logger = new Logger('OrganicGrowth');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get platform-specific growth strategy
   */
  async getGrowthStrategy(platform: 'tiktok' | 'instagram' | 'youtube' | 'linkedin'): Promise<GrowthStrategy> {
    this.logger.log(`Generating growth strategy for ${platform}...`);

    const strategies = {
      tiktok: this.getTikTokStrategy(),
      instagram: this.getInstagramStrategy(),
      youtube: this.getYouTubeStrategy(),
      linkedin: this.getLinkedInStrategy(),
    };

    return strategies[platform];
  }

  /**
   * TikTok Growth Engine
   */
  private getTikTokStrategy(): GrowthStrategy {
    return {
      platform: 'tiktok',
      tactics: [
        {
          name: 'Hook Recycling',
          description: 'Test 3-5 different hooks for same content concept',
          priority: 'high',
          effort: 'low',
          impact: 85,
          implementation: [
            'Create base video script',
            'Generate 5 hook variations',
            'Post same content with different hooks over 5 days',
            'Track which hook performs best',
            'Scale winning hook pattern',
          ],
        },
        {
          name: 'Trend Hijacking',
          description: 'Jump on trending sounds/formats within 24 hours',
          priority: 'high',
          effort: 'medium',
          impact: 90,
          implementation: [
            'Monitor trending page 3x daily',
            'Identify trends relevant to laundry/cleaning',
            'Create DryJets version within 6 hours',
            'Post during peak hours (6-10am, 7-11pm EST)',
          ],
        },
        {
          name: 'Series Content',
          description: 'Multi-part series to boost watch time',
          priority: 'high',
          effort: 'medium',
          impact: 75,
          implementation: [
            'Create 3-5 part series on laundry hacks',
            'End each video with cliffhanger',
            'Post part 2 within 24 hours of part 1',
            'Pin part 1 comments linking to part 2',
          ],
        },
        {
          name: 'Duet Strategy',
          description: 'Duet with viral cleaning/organization content',
          priority: 'medium',
          effort: 'low',
          impact: 70,
          implementation: [
            'Find viral cleaning videos (1M+ views)',
            'Duet with DryJets angle',
            'Add value, don\'t just react',
            'Post 2-3 duets per week',
          ],
        },
        {
          name: 'Niche Down',
          description: 'Become THE laundry/dry cleaning authority',
          priority: 'high',
          effort: 'low',
          impact: 80,
          implementation: [
            'Post only laundry/cleaning/organization content',
            'Build reputation as expert',
            'Answer questions in comments',
            'Create educational content',
          ],
        },
      ],
      postingSchedule: {
        frequency: '3-5 posts per day',
        peakTimes: ['6:00 AM', '9:00 AM', '12:00 PM', '7:00 PM', '10:00 PM'],
        contentTypes: {
          'trending_sounds': 40,
          'educational': 30,
          'behind_scenes': 15,
          'user_generated': 15,
        },
      },
      contentMix: [
        {
          type: 'Educational Tips',
          percentage: 30,
          purpose: 'Build authority and provide value',
          examples: ['Stain removal hacks', 'Laundry myths debunked', 'Fabric care guide'],
        },
        {
          type: 'Trend-jacking',
          percentage: 40,
          purpose: 'Maximize reach and discovery',
          examples: ['Trending sounds with DryJets twist', 'Viral formats adapted'],
        },
        {
          type: 'User Stories',
          percentage: 15,
          purpose: 'Social proof and trust',
          examples: ['Customer testimonials', 'Before/after transformations'],
        },
        {
          type: 'Behind the Scenes',
          percentage: 15,
          purpose: 'Humanize brand and build connection',
          examples: ['Driver stories', 'Cleaning process', 'Team culture'],
        },
      ],
      expectedGrowth: {
        followers: 10000, // per month
        engagement: 15, // percentage
        reach: 500000, // monthly impressions
      },
    };
  }

  /**
   * Instagram Growth Engine
   */
  private getInstagramStrategy(): GrowthStrategy {
    return {
      platform: 'instagram',
      tactics: [
        {
          name: 'Save Rate Optimization',
          description: 'Create highly saveable content (carousel tips, guides)',
          priority: 'high',
          effort: 'medium',
          impact: 90,
          implementation: [
            'Create carousel posts with actionable tips',
            'Design for save-worthiness (numbered lists, checklists)',
            'Track save rate (goal: >8%)',
            'Double down on high-save content',
          ],
        },
        {
          name: 'Reels Strategy',
          description: 'Post 1-2 Reels daily optimized for Explore',
          priority: 'high',
          effort: 'medium',
          impact: 85,
          implementation: [
            'Vertical 9:16 format',
            'Hook in first second',
            'Use trending audio',
            'Post at 11am or 7pm EST',
          ],
        },
        {
          name: 'Story Engagement',
          description: 'Daily stories with interactive stickers',
          priority: 'medium',
          effort: 'low',
          impact: 70,
          implementation: [
            'Post 5-7 stories daily',
            'Use polls, questions, quizzes',
            'Reply to every DM within 1 hour',
            'Share UGC to stories',
          ],
        },
        {
          name: 'Hashtag Strategy',
          description: 'Mix of niche and broad hashtags',
          priority: 'medium',
          effort: 'low',
          impact: 65,
          implementation: [
            '10 hashtags in caption, 20 in first comment',
            'Mix: 10 small (<100K), 10 medium (100K-1M), 10 large (>1M)',
            'Rotate hashtag sets weekly',
            'Track which sets drive engagement',
          ],
        },
      ],
      postingSchedule: {
        frequency: '1-2 Reels + 1 carousel + 5-7 stories daily',
        peakTimes: ['11:00 AM', '1:00 PM', '7:00 PM', '9:00 PM'],
        contentTypes: {
          reels: 50,
          carousels: 30,
          stories: 20,
        },
      },
      contentMix: [
        {
          type: 'Educational Carousels',
          percentage: 30,
          purpose: 'Drive saves and position as expert',
          examples: ['10 laundry hacks', 'Stain removal guide', 'Fabric care cheat sheet'],
        },
        {
          type: 'Reels',
          percentage: 50,
          purpose: 'Reach and growth',
          examples: ['Quick tips', 'Transformation videos', 'Trending formats'],
        },
        {
          type: 'Stories',
          percentage: 20,
          purpose: 'Daily engagement and community',
          examples: ['Behind scenes', 'Q&A', 'Polls and quizzes'],
        },
      ],
      expectedGrowth: {
        followers: 5000,
        engagement: 12,
        reach: 300000,
      },
    };
  }

  /**
   * YouTube Growth Engine
   */
  private getYouTubeStrategy(): GrowthStrategy {
    return {
      platform: 'youtube',
      tactics: [
        {
          name: 'Search Optimization',
          description: 'Target high-volume, low-competition keywords',
          priority: 'high',
          effort: 'medium',
          impact: 90,
          implementation: [
            'Use TubeBuddy/VidIQ for keyword research',
            'Target keywords with 1K-10K monthly searches',
            'Front-load keywords in title and description',
            'Create comprehensive content (8-12 minutes)',
          ],
        },
        {
          name: 'Shorts Funnel',
          description: 'Use Shorts to drive channel growth',
          priority: 'high',
          effort: 'low',
          impact: 85,
          implementation: [
            'Post 1-2 Shorts daily',
            'End with "For full tutorial, check my channel"',
            'Repurpose TikTok content',
            'Link to long-form in pinned comment',
          ],
        },
        {
          name: 'Thumbnail CTR',
          description: 'Test thumbnails for 10%+ CTR',
          priority: 'high',
          effort: 'medium',
          impact: 88,
          implementation: [
            'Create 3 thumbnail variations',
            'Use high contrast and readable text',
            'Include faces/emotions when possible',
            'A/B test via TubeBuddy',
          ],
        },
        {
          name: 'Watch Time Optimization',
          description: 'Keep viewers watching longer',
          priority: 'high',
          effort: 'high',
          impact: 92,
          implementation: [
            'Pattern interrupts every 30 seconds',
            'Tease payoff throughout video',
            'Cut dead air aggressively',
            'Add chapters for retention',
          ],
        },
      ],
      postingSchedule: {
        frequency: '2-3 long-form + 7-10 Shorts per week',
        peakTimes: ['2:00 PM', '5:00 PM', '9:00 PM'],
        contentTypes: {
          long_form: 30,
          shorts: 70,
        },
      },
      contentMix: [
        {
          type: 'How-To Tutorials',
          percentage: 40,
          purpose: 'Search traffic and authority',
          examples: ['How to remove tough stains', 'Complete laundry guide', 'Dry cleaning at home'],
        },
        {
          type: 'Shorts',
          percentage: 40,
          purpose: 'Channel growth and discovery',
          examples: ['Quick tips', 'Before/after', '60-second hacks'],
        },
        {
          type: 'Product Reviews',
          percentage: 20,
          purpose: 'Affiliate revenue and trust',
          examples: ['Best laundry detergents', 'Stain removers tested', 'App walkthrough'],
        },
      ],
      expectedGrowth: {
        followers: 2000,
        engagement: 8,
        reach: 100000,
      },
    };
  }

  /**
   * LinkedIn Growth Engine
   */
  private getLinkedInStrategy(): GrowthStrategy {
    return {
      platform: 'linkedin',
      tactics: [
        {
          name: 'Thought Leadership',
          description: 'Position as industry expert and innovator',
          priority: 'high',
          effort: 'high',
          impact: 85,
          implementation: [
            'Share original insights about on-demand economy',
            'Post data-driven content',
            'Comment on industry news',
            'Write LinkedIn articles monthly',
          ],
        },
        {
          name: 'Engagement Pod',
          description: 'Build network of mutual supporters',
          priority: 'medium',
          effort: 'medium',
          impact: 70,
          implementation: [
            'Create/join engagement group (10-20 people)',
            'Like/comment within first hour of posting',
            'Reciprocate engagement',
            'Build genuine relationships',
          ],
        },
        {
          name: 'Native Video',
          description: 'Post video directly to LinkedIn (not YouTube links)',
          priority: 'high',
          effort: 'medium',
          impact: 80,
          implementation: [
            'Upload video directly (not links)',
            'Add subtitles',
            'Square or vertical format',
            'Keep under 3 minutes',
          ],
        },
      ],
      postingSchedule: {
        frequency: '3-5 posts per week',
        peakTimes: ['8:00 AM', '12:00 PM', '5:00 PM'],
        contentTypes: {
          text_posts: 40,
          native_video: 30,
          articles: 20,
          carousel: 10,
        },
      },
      contentMix: [
        {
          type: 'Industry Insights',
          percentage: 40,
          purpose: 'Authority and thought leadership',
          examples: ['On-demand economy trends', 'Sustainability in dry cleaning', 'Future of services'],
        },
        {
          type: 'Company Updates',
          percentage: 30,
          purpose: 'Brand building and social proof',
          examples: ['Milestones', 'New features', 'Team growth'],
        },
        {
          type: 'Educational Content',
          percentage: 30,
          purpose: 'Value and engagement',
          examples: ['Business tips', 'Industry data', 'How-to guides'],
        },
      ],
      expectedGrowth: {
        followers: 1000,
        engagement: 10,
        reach: 50000,
      },
    };
  }

  /**
   * Generate cross-platform content calendar
   */
  async generateContentCalendar(days: number = 30): Promise<any[]> {
    this.logger.log(`Generating ${days}-day content calendar...`);

    const strategies = {
      tiktok: this.getTikTokStrategy(),
      instagram: this.getInstagramStrategy(),
      youtube: this.getYouTubeStrategy(),
      linkedin: this.getLinkedInStrategy(),
    };

    const calendar: any[] = [];
    const startDate = new Date();

    for (let day = 0; day < days; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);

      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      // TikTok: 3-5 posts daily
      const tiktokPosts = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < tiktokPosts; i++) {
        calendar.push({
          date: dateStr,
          platform: 'tiktok',
          time: strategies.tiktok.postingSchedule.peakTimes[i % 5],
          contentType: this.selectContentType(strategies.tiktok.contentMix),
          status: 'scheduled',
        });
      }

      // Instagram: 1-2 Reels + 1 carousel
      calendar.push(
        {
          date: dateStr,
          platform: 'instagram',
          time: '11:00 AM',
          contentType: 'reel',
          status: 'scheduled',
        },
        {
          date: dateStr,
          platform: 'instagram',
          time: '7:00 PM',
          contentType: 'carousel',
          status: 'scheduled',
        }
      );

      // YouTube: 2-3 long-form per week, Shorts daily
      if (dayOfWeek === 1 || dayOfWeek === 4) {
        calendar.push({
          date: dateStr,
          platform: 'youtube',
          time: '2:00 PM',
          contentType: 'long_form',
          status: 'scheduled',
        });
      }
      calendar.push({
        date: dateStr,
        platform: 'youtube',
        time: '5:00 PM',
        contentType: 'short',
        status: 'scheduled',
      });

      // LinkedIn: 3-5 posts per week (weekdays)
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && Math.random() > 0.3) {
        calendar.push({
          date: dateStr,
          platform: 'linkedin',
          time: '8:00 AM',
          contentType: this.selectContentType(strategies.linkedin.contentMix),
          status: 'scheduled',
        });
      }
    }

    return calendar;
  }

  /**
   * Select content type based on mix percentages
   */
  private selectContentType(contentMix: ContentMix[]): string {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const mix of contentMix) {
      cumulative += mix.percentage;
      if (random <= cumulative) {
        return mix.type;
      }
    }

    return contentMix[0].type;
  }
}
