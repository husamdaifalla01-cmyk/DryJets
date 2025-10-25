import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../../common/prisma/prisma.service'
import * as nodemailer from 'nodemailer'

interface EmailNotification {
  to: string
  subject: string
  html: string
  text?: string
}

interface WorkflowEvent {
  type:
    | 'WORKFLOW_CREATED'
    | 'CONTENT_GENERATED'
    | 'REVIEW_READY'
    | 'PUBLISHING_COMPLETE'
    | 'WORKFLOW_FAILED'
    | 'PERFORMANCE_REPORT'
  workflowId: string
  workflowName: string
  userEmail: string
  data?: any
}

@Injectable()
export class WorkflowNotificationsService {
  private readonly logger = new Logger('WorkflowNotificationsService')
  private transporter: nodemailer.Transporter | null = null
  private readonly sendgridApiKey: string
  private readonly emailFrom: string

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.sendgridApiKey = this.config.get('SENDGRID_API_KEY', '')
    this.emailFrom = this.config.get('EMAIL_FROM', 'noreply@dryjets.com')
    this.initializeTransporter()
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter() {
    if (!this.sendgridApiKey) {
      this.logger.warn('SendGrid API key not configured - email notifications disabled')
      return
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: this.sendgridApiKey,
      },
    })

    this.logger.log('Email transporter initialized with SendGrid')
  }

  /**
   * Send workflow event notification
   */
  async sendWorkflowNotification(event: WorkflowEvent): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.warn('Email transporter not configured')
        return false
      }

      const notification = this.buildNotificationEmail(event)
      await this.transporter.sendMail({
        from: this.emailFrom,
        to: notification.to,
        subject: notification.subject,
        html: notification.html,
        text: notification.text,
      })

      this.logger.log(`Notification sent to ${event.userEmail} for ${event.type}`)
      return true
    } catch (error: any) {
      this.logger.error(
        `Failed to send notification: ${error.message}`
      )
      return false
    }
  }

  /**
   * Send batch notifications
   */
  async sendBatchNotifications(events: WorkflowEvent[]): Promise<number> {
    let successCount = 0

    for (const event of events) {
      const success = await this.sendWorkflowNotification(event)
      if (success) {
        successCount++
      }
    }

    return successCount
  }

  /**
   * Build HTML email based on event type
   */
  private buildNotificationEmail(event: WorkflowEvent): EmailNotification {
    const baseUrl = this.config.get('APP_URL', 'https://app.dryjets.com')
    const workflowUrl = `${baseUrl}/workflows/${event.workflowId}`

    switch (event.type) {
      case 'WORKFLOW_CREATED':
        return this.getWorkflowCreatedEmail(event, workflowUrl)

      case 'CONTENT_GENERATED':
        return this.getContentGeneratedEmail(event, workflowUrl)

      case 'REVIEW_READY':
        return this.getReviewReadyEmail(event, workflowUrl)

      case 'PUBLISHING_COMPLETE':
        return this.getPublishingCompleteEmail(event, workflowUrl)

      case 'WORKFLOW_FAILED':
        return this.getWorkflowFailedEmail(event, workflowUrl)

      case 'PERFORMANCE_REPORT':
        return this.getPerformanceReportEmail(event, workflowUrl)

      default:
        return {
          to: event.userEmail,
          subject: 'Workflow Update',
          html: '<p>Workflow update</p>',
        }
    }
  }

  /**
   * Email templates
   */

  private getWorkflowCreatedEmail(
    event: WorkflowEvent,
    workflowUrl: string
  ): EmailNotification {
    return {
      to: event.userEmail,
      subject: `✅ Workflow Created: ${event.workflowName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Workflow Created Successfully</h2>
          <p>Your marketing workflow has been created and is ready to begin content generation.</p>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Workflow Details:</strong>
            <ul style="margin: 10px 0;">
              <li>Name: ${event.workflowName}</li>
              <li>Status: Configuring</li>
              <li>Platforms: ${event.data?.platforms?.join(', ') || 'Multiple'}</li>
            </ul>
          </div>

          <p>Next Steps:</p>
          <ol>
            <li>Review your workflow configuration</li>
            <li>Trigger content generation</li>
            <li>Review and approve generated content</li>
            <li>Publish to your platforms</li>
          </ol>

          <a href="${workflowUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            View Workflow →
          </a>
        </div>
      `,
      text: `Workflow Created: ${event.workflowName}\n\nView your workflow: ${workflowUrl}`,
    }
  }

  private getContentGeneratedEmail(
    event: WorkflowEvent,
    workflowUrl: string
  ): EmailNotification {
    const contentCount = event.data?.contentCount || 0

    return {
      to: event.userEmail,
      subject: `🎯 Content Generated: ${event.workflowName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Content Generation Complete</h2>
          <p>AI has successfully generated ${contentCount} pieces of content for your workflow.</p>

          <div style="background-color: #d1fae5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong style="color: #065f46;">Generation Summary:</strong>
            <ul style="margin: 10px 0; color: #065f46;">
              <li>Content Pieces: ${contentCount}</li>
              <li>Quality Score: ${event.data?.qualityScore || 'N/A'}</li>
              <li>Generation Time: ${event.data?.generationTime || 'N/A'}</li>
            </ul>
          </div>

          <p style="color: #d97706; font-weight: bold;">⚠️ Action Required:</p>
          <p>Please review and approve the generated content before publishing.</p>

          <a href="${workflowUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Review Content →
          </a>
        </div>
      `,
      text: `Content Generated: ${contentCount} pieces\n\nReview your content: ${workflowUrl}`,
    }
  }

  private getReviewReadyEmail(
    event: WorkflowEvent,
    workflowUrl: string
  ): EmailNotification {
    return {
      to: event.userEmail,
      subject: `👀 Review Ready: ${event.workflowName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Content Review Ready</h2>
          <p>Your workflow content is ready for review and approval.</p>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong style="color: #7c2d12;">Review Details:</strong>
            <ul style="margin: 10px 0; color: #7c2d12;">
              <li>Platform(s): ${event.data?.platforms?.join(', ') || 'Multiple'}</li>
              <li>Pending Approval: ${event.data?.pendingCount || 0} items</li>
              <li>Ready to Publish: ${event.data?.readyCount || 0} items</li>
            </ul>
          </div>

          <p>You can:</p>
          <ul>
            <li>Approve content to proceed with publishing</li>
            <li>Edit content before approval</li>
            <li>Reject and regenerate content</li>
            <li>Schedule publishing for specific times</li>
          </ul>

          <a href="${workflowUrl}" style="display: inline-block; background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Review Now →
          </a>
        </div>
      `,
      text: `Review Ready: ${event.workflowName}\n\nApprove your content: ${workflowUrl}`,
    }
  }

  private getPublishingCompleteEmail(
    event: WorkflowEvent,
    workflowUrl: string
  ): EmailNotification {
    const publishedCount = event.data?.publishedCount || 0

    return {
      to: event.userEmail,
      subject: `🚀 Publishing Complete: ${event.workflowName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Workflow Published Successfully</h2>
          <p>Your content has been successfully published to all platforms.</p>

          <div style="background-color: #dcfce7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong style="color: #15803d;">Publishing Summary:</strong>
            <ul style="margin: 10px 0; color: #15803d;">
              <li>Items Published: ${publishedCount}</li>
              <li>Publishing Status: Complete</li>
              <li>Start Monitoring: Real-time analytics available</li>
            </ul>
          </div>

          <p>Your content is now live! Monitor performance in real-time:</p>
          <ul>
            <li>Track engagement metrics</li>
            <li>View platform-specific performance</li>
            <li>Monitor ROI projections</li>
            <li>Adjust strategy based on insights</li>
          </ul>

          <a href="${workflowUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            View Performance →
          </a>
        </div>
      `,
      text: `Publishing Complete: ${publishedCount} items published\n\nView performance: ${workflowUrl}`,
    }
  }

  private getWorkflowFailedEmail(
    event: WorkflowEvent,
    workflowUrl: string
  ): EmailNotification {
    return {
      to: event.userEmail,
      subject: `❌ Workflow Error: ${event.workflowName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Workflow Error</h2>
          <p style="color: #dc2626;">An error occurred while processing your workflow.</p>

          <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; color: #7f1d1d;">
            <strong>Error Details:</strong>
            <p>${event.data?.errorMessage || 'An unexpected error occurred'}</p>
          </div>

          <p><strong>What Happened:</strong></p>
          <p>${event.data?.errorDescription || 'The workflow encountered an error and was paused.'}</p>

          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Review the error details below</li>
            <li>Contact support if you need assistance</li>
            <li>You can retry the workflow from where it failed</li>
          </ol>

          <a href="${workflowUrl}" style="display: inline-block; background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Review Workflow →
          </a>
        </div>
      `,
      text: `Workflow Error: ${event.workflowName}\n\nError: ${event.data?.errorMessage}\n\nReview workflow: ${workflowUrl}`,
    }
  }

  private getPerformanceReportEmail(
    event: WorkflowEvent,
    workflowUrl: string
  ): EmailNotification {
    const metrics = event.data || {}

    return {
      to: event.userEmail,
      subject: `📊 Performance Report: ${event.workflowName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Daily Performance Report</h2>
          <p>Here's how your workflow performed in the last 24 hours.</p>

          <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong style="color: #1e40af;">Performance Metrics:</strong>
            <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">Impressions</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">${metrics.impressions?.toLocaleString() || '0'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">Engagements</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">${metrics.engagements?.toLocaleString() || '0'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">Engagement Rate</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">${metrics.engagementRate || '0'}%</td>
              </tr>
              <tr>
                <td style="padding: 8px;">Projected ROI</td>
                <td style="padding: 8px; text-align: right; font-weight: bold; color: #15803d;">${metrics.roi || '0'}%</td>
              </tr>
            </table>
          </div>

          <p><strong>Top Performing Platform:</strong> ${metrics.topPlatform || 'N/A'}</p>

          <a href="${workflowUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            View Detailed Analytics →
          </a>
        </div>
      `,
      text: `Performance Report: ${event.workflowName}\n\nImpressions: ${metrics.impressions}\nEngagements: ${metrics.engagements}\nROI: ${metrics.roi}%\n\nView analytics: ${workflowUrl}`,
    }
  }

  /**
   * Schedule daily performance reports
   */
  async schedulePerformanceReports(): Promise<void> {
    this.logger.log('Scheduling daily performance reports')

    // This would typically run on a cron job (e.g., every day at 9 AM)
    // For now, just log that this function exists
    this.logger.log('Performance report scheduler initialized')
  }

  /**
   * Get notification preferences for user
   */
  async getNotificationPreferences(userId: string): Promise<any> {
    try {
      // In a real implementation, this would fetch from database
      return {
        emailOnWorkflowCreated: true,
        emailOnContentGenerated: true,
        emailOnReviewReady: true,
        emailOnPublishComplete: true,
        emailOnWorkflowFailed: true,
        dailyPerformanceReport: true,
        weeklyPerformanceReport: false,
      }
    } catch (error: any) {
      this.logger.error(`Failed to get notification preferences: ${error.message}`)
      return {}
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: any
  ): Promise<boolean> {
    try {
      // In a real implementation, this would update in database
      this.logger.log(`Updated notification preferences for user ${userId}`)
      return true
    } catch (error: any) {
      this.logger.error(`Failed to update notification preferences: ${error.message}`)
      return false
    }
  }
}
