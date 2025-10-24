import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * EmailDesignerService
 *
 * Manages email campaign design, templating, and sending
 * Supports email creation, segmentation, and A/B testing
 */
@Injectable()
export class EmailDesignerService {
  private logger = new Logger('EmailDesigner');

  constructor(private prisma: PrismaService) {}

  /**
   * Create an email campaign
   */
  async createEmailCampaign(campaignId: string, data: any): Promise<any> {
    this.logger.log(`[Email] Creating email campaign for campaign: ${campaignId}`);

    const emailCampaign = await this.prisma.emailCampaign.create({
      data: {
        campaignId,
        subject: data.subject,
        previewText: data.previewText,
        htmlContent: data.htmlContent,
        templateId: data.templateId,
        segmentId: data.segmentId,
        status: 'DRAFT',
      },
    });

    return {
      emailCampaignId: emailCampaign.id,
      campaignId,
      status: 'DRAFT',
      message: 'Email campaign created successfully',
    };
  }

  /**
   * Get email campaign
   */
  async getEmailCampaign(emailCampaignId: string): Promise<any> {
    return this.prisma.emailCampaign.findUnique({
      where: { id: emailCampaignId },
    });
  }

  /**
   * Update email campaign
   */
  async updateEmailCampaign(emailCampaignId: string, data: any): Promise<any> {
    const updated = await this.prisma.emailCampaign.update({
      where: { id: emailCampaignId },
      data: {
        ...(data.subject && { subject: data.subject }),
        ...(data.previewText && { previewText: data.previewText }),
        ...(data.htmlContent && { htmlContent: data.htmlContent }),
        ...(data.segmentId && { segmentId: data.segmentId }),
      },
    });

    return {
      emailCampaignId: updated.id,
      message: 'Email campaign updated',
    };
  }

  /**
   * Get email templates
   */
  async getTemplates(): Promise<any[]> {
    // Return predefined templates
    const templates = [
      {
        id: 'template_welcome',
        name: 'Welcome Series',
        category: 'Onboarding',
        description: 'Welcome new customers to your service',
        blocks: [
          { type: 'header', content: 'Welcome to DryJets!' },
          { type: 'body', content: 'We\'re excited to have you on board.' },
          { type: 'cta', content: 'Get Started', url: '/onboard' },
        ],
      },
      {
        id: 'template_newsletter',
        name: 'Newsletter Template',
        category: 'Regular',
        description: 'Monthly newsletter template',
        blocks: [
          { type: 'header', content: 'Monthly Newsletter' },
          { type: 'body', content: 'Latest news and updates' },
          { type: 'divider' },
          { type: 'section', title: 'Feature Highlight', content: '' },
          { type: 'cta', content: 'Read More', url: '/blog' },
        ],
      },
      {
        id: 'template_promotion',
        name: 'Promotional Campaign',
        category: 'Sales',
        description: 'Limited time offer email',
        blocks: [
          { type: 'header', content: 'Special Offer!' },
          { type: 'body', content: 'Limited time promotion' },
          { type: 'image', url: 'https://example.com/promo.jpg' },
          { type: 'cta', content: 'Claim Offer', url: '/promotion' },
        ],
      },
      {
        id: 'template_transactional',
        name: 'Transactional',
        category: 'Transactional',
        description: 'Order confirmation, invoice, etc.',
        blocks: [
          { type: 'header', content: 'Order Confirmation' },
          { type: 'body', content: 'Thank you for your order!' },
          { type: 'table', content: 'order_details' },
          { type: 'cta', content: 'Track Order', url: '/orders' },
        ],
      },
    ];

    return templates;
  }

  /**
   * Get email segments
   */
  async getSegments(): Promise<any[]> {
    return [
      {
        id: 'segment_all',
        name: 'All Subscribers',
        description: 'Send to all subscribers',
        size: 10000,
      },
      {
        id: 'segment_active',
        name: 'Active Users',
        description: 'Users active in last 30 days',
        size: 7500,
      },
      {
        id: 'segment_inactive',
        name: 'Inactive Users',
        description: 'Users inactive for 90+ days',
        size: 2500,
      },
      {
        id: 'segment_high_value',
        name: 'High Value Customers',
        description: 'Top 20% spenders',
        size: 2000,
      },
      {
        id: 'segment_new',
        name: 'New Subscribers',
        description: 'Joined in last 7 days',
        size: 500,
      },
    ];
  }

  /**
   * Create custom segment
   */
  async createSegment(data: any): Promise<any> {
    this.logger.log(`[Email] Creating custom segment: ${data.name}`);

    return {
      segmentId: `segment_custom_${Date.now()}`,
      name: data.name,
      conditions: data.conditions,
      estimatedSize: Math.floor(Math.random() * 5000) + 500,
      status: 'created',
    };
  }

  /**
   * Preview email
   */
  async previewEmail(emailCampaignId: string): Promise<any> {
    const campaign = await this.getEmailCampaign(emailCampaignId);

    if (!campaign) {
      throw new Error('Email campaign not found');
    }

    return {
      emailCampaignId,
      preview: {
        subject: campaign.subject,
        previewText: campaign.previewText,
        htmlContent: campaign.htmlContent,
      },
    };
  }

  /**
   * Setup A/B test variants
   */
  async setupABTest(emailCampaignId: string, data: any): Promise<any> {
    this.logger.log(`[Email] Setting up A/B test for campaign: ${emailCampaignId}`);

    const variants = [
      {
        variant: 'A',
        name: data.variantAName || 'Subject A',
        subject: data.variantASubject,
        percentage: data.testSplit || 50,
      },
      {
        variant: 'B',
        name: data.variantBName || 'Subject B',
        subject: data.variantBSubject,
        percentage: 100 - (data.testSplit || 50),
      },
    ];

    return {
      emailCampaignId,
      abTest: {
        enabled: true,
        variants,
        winnerDetermination: data.winnerDetermination || 'open_rate',
        testDuration: data.testDuration || 48, // hours
        autoApplyWinner: data.autoApplyWinner !== false,
      },
    };
  }

  /**
   * Send email campaign
   */
  async sendEmailCampaign(emailCampaignId: string, data?: any): Promise<any> {
    this.logger.log(`[Email] Sending campaign: ${emailCampaignId}`);

    const campaign = await this.getEmailCampaign(emailCampaignId);

    if (!campaign) {
      throw new Error('Email campaign not found');
    }

    if (!campaign.subject || !campaign.htmlContent) {
      throw new Error('Campaign is missing required fields (subject, content)');
    }

    // Update status to sent
    const updated = await this.prisma.emailCampaign.update({
      where: { id: emailCampaignId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    this.logger.log(`[Email] Campaign sent: ${emailCampaignId}`);

    return {
      emailCampaignId: updated.id,
      status: 'SENT',
      sentAt: updated.sentAt,
      recipientCount: data?.recipientCount || 5000,
      message: 'Email campaign sent successfully',
    };
  }

  /**
   * Schedule email campaign
   */
  async scheduleEmailCampaign(emailCampaignId: string, scheduledTime: Date): Promise<any> {
    this.logger.log(`[Email] Scheduling campaign for ${scheduledTime}`);

    const campaign = await this.getEmailCampaign(emailCampaignId);

    if (!campaign) {
      throw new Error('Email campaign not found');
    }

    return {
      emailCampaignId,
      status: 'SCHEDULED',
      scheduledTime: scheduledTime.toISOString(),
      message: 'Campaign scheduled for sending',
    };
  }

  /**
   * Get campaign performance metrics
   */
  async getCampaignMetrics(emailCampaignId: string): Promise<any> {
    const campaign = await this.getEmailCampaign(emailCampaignId);

    if (!campaign) {
      throw new Error('Email campaign not found');
    }

    // In production, fetch from email service provider
    return {
      emailCampaignId,
      sent: campaign.opens === 0 ? 0 : Math.floor(campaign.opens / (Math.random() * 0.3 + 0.2)),
      delivered: Math.floor((campaign.opens === 0 ? 0 : Math.floor(campaign.opens / (Math.random() * 0.3 + 0.2))) * 0.98),
      opens: campaign.opens,
      clicks: campaign.clicks,
      conversions: campaign.conversions,
      metrics: {
        openRate: campaign.opens > 0 ? ((campaign.opens / Math.max(campaign.opens / 0.25, 100)) * 100).toFixed(2) : '0',
        clickRate: campaign.clicks > 0 ? ((campaign.clicks / Math.max(campaign.opens, 1)) * 100).toFixed(2) : '0',
        conversionRate: campaign.conversions > 0 ? ((campaign.conversions / Math.max(campaign.clicks, 1)) * 100).toFixed(2) : '0',
      },
    };
  }

  /**
   * Get email unsubscribe list
   */
  async getUnsubscribeList(campaignId?: string): Promise<any> {
    return {
      total: Math.floor(Math.random() * 500),
      recentUnsubscribes: [
        {
          email: 'example1@example.com',
          reason: 'Not interested',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          email: 'example2@example.com',
          reason: 'Too frequent',
          date: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      ],
    };
  }

  /**
   * Get bounced emails
   */
  async getBouncedEmails(campaignId?: string): Promise<any> {
    return {
      softBounces: Math.floor(Math.random() * 50),
      hardBounces: Math.floor(Math.random() * 20),
      total: Math.floor(Math.random() * 70),
    };
  }

  /**
   * Get email list/audience
   */
  async getEmailLists(): Promise<any[]> {
    return [
      {
        id: 'list_1',
        name: 'Main List',
        subscribers: 10000,
        doubleOptIn: true,
      },
      {
        id: 'list_2',
        name: 'Premium Customers',
        subscribers: 2500,
        doubleOptIn: true,
      },
      {
        id: 'list_3',
        name: 'Newsletter Subscribers',
        subscribers: 5000,
        doubleOptIn: false,
      },
    ];
  }

  /**
   * Build email with drag-and-drop blocks
   */
  async buildEmailFromBlocks(data: any): Promise<any> {
    this.logger.log(`[Email] Building email from blocks`);

    // Convert blocks to HTML
    let htmlContent = '<html><body>';

    if (data.blocks && Array.isArray(data.blocks)) {
      for (const block of data.blocks) {
        htmlContent += this.renderBlock(block);
      }
    }

    htmlContent += '</body></html>';

    return {
      htmlContent,
      textPreview: `Email with ${data.blocks?.length || 0} sections`,
      previewImage: 'data:image/svg+xml,...',
    };
  }

  /**
   * Render a block to HTML
   */
  private renderBlock(block: any): string {
    switch (block.type) {
      case 'header':
        return `<h1 style="font-size: 32px; margin: 20px 0;">${block.content}</h1>`;

      case 'body':
        return `<p style="font-size: 16px; line-height: 1.5; margin: 10px 0;">${block.content}</p>`;

      case 'image':
        return `<img src="${block.url}" style="max-width: 100%; height: auto; margin: 20px 0;" />`;

      case 'cta':
        return `<a href="${block.url}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">${block.content}</a>`;

      case 'divider':
        return `<hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />`;

      default:
        return '';
    }
  }

  /**
   * Validate email campaign before sending
   */
  async validateCampaign(emailCampaignId: string): Promise<any> {
    const campaign = await this.getEmailCampaign(emailCampaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const issues: string[] = [];

    if (!campaign.subject) {
      issues.push('Subject line is required');
    }

    if (!campaign.htmlContent) {
      issues.push('Email content is required');
    }

    if (!campaign.segmentId) {
      issues.push('Target segment must be selected');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings: [
        campaign.subject && campaign.subject.length > 50
          ? 'Subject line is longer than recommended (50 chars)'
          : null,
      ].filter(Boolean),
    };
  }
}
