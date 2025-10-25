import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { firstValueFrom } from 'rxjs'
import * as crypto from 'crypto'

interface WebhookPayload {
  id: string
  event: string
  timestamp: Date
  data: any
}

interface WebhookEvent {
  workflowId: string
  type:
    | 'workflow.created'
    | 'workflow.publishing'
    | 'content.generated'
    | 'content.approved'
    | 'content.published'
    | 'engagement.updated'
    | 'cost.updated'
    | 'error.occurred'
  data: any
  timestamp: Date
}

interface WebhookConfig {
  url: string
  events: string[]
  active: boolean
  secret?: string
  headers?: Record<string, string>
  retryPolicy?: {
    maxRetries: number
    backoffMultiplier: number
    initialDelayMs: number
  }
}

interface WebhookHistory {
  webhookId: string
  event: string
  status: 'success' | 'failed' | 'pending'
  statusCode?: number
  responseTime: number
  retries: number
  error?: string
  timestamp: Date
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger('WebhookService')
  private webhooks: Map<string, WebhookConfig> = new Map()
  private deadLetterQueue: WebhookPayload[] = []
  private eventHistory: WebhookHistory[] = []
  private readonly maxHistorySize = 10000
  private readonly maxDLQSize = 1000

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.initializeWebhooks()
  }

  /**
   * Initialize webhooks from database on service startup
   */
  private async initializeWebhooks(): Promise<void> {
    try {
      // In a real scenario, this would load webhooks from database
      // For now, initialize empty map
      this.logger.log('Webhook service initialized')
    } catch (error: any) {
      this.logger.error(`Failed to initialize webhooks: ${error.message}`)
    }
  }

  /**
   * Register a new webhook
   */
  async registerWebhook(
    workflowId: string,
    config: WebhookConfig,
  ): Promise<{ webhookId: string; secret: string }> {
    try {
      const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const secret = this.generateSecret()

      const webhookConfig: WebhookConfig = {
        ...config,
        secret,
        retryPolicy: config.retryPolicy || {
          maxRetries: 5,
          backoffMultiplier: 2,
          initialDelayMs: 1000,
        },
      }

      this.webhooks.set(webhookId, webhookConfig)

      this.logger.log(
        `Webhook registered: ${webhookId} for workflow ${workflowId}`,
      )

      // Store in database (pseudo-code for actual implementation)
      // await this.prisma.webhook.create({...})

      return {
        webhookId,
        secret,
      }
    } catch (error: any) {
      this.logger.error(`Failed to register webhook: ${error.message}`)
      throw error
    }
  }

  /**
   * Unregister a webhook
   */
  async unregisterWebhook(webhookId: string): Promise<boolean> {
    try {
      const existed = this.webhooks.has(webhookId)
      if (existed) {
        this.webhooks.delete(webhookId)
        this.logger.log(`Webhook unregistered: ${webhookId}`)
      }
      return existed
    } catch (error: any) {
      this.logger.error(`Failed to unregister webhook: ${error.message}`)
      return false
    }
  }

  /**
   * Update webhook configuration
   */
  async updateWebhook(
    webhookId: string,
    config: Partial<WebhookConfig>,
  ): Promise<boolean> {
    try {
      const existing = this.webhooks.get(webhookId)
      if (!existing) {
        return false
      }

      const updated = {
        ...existing,
        ...config,
        secret: existing.secret, // Don't allow secret updates via this method
      }

      this.webhooks.set(webhookId, updated)
      this.logger.log(`Webhook updated: ${webhookId}`)
      return true
    } catch (error: any) {
      this.logger.error(`Failed to update webhook: ${error.message}`)
      return false
    }
  }

  /**
   * Dispatch event to all matching webhooks
   */
  async dispatchEvent(event: WebhookEvent): Promise<void> {
    try {
      const matchingWebhooks = Array.from(this.webhooks.entries()).filter(
        ([, config]) =>
          config.active && config.events.includes(event.type),
      )

      if (matchingWebhooks.length === 0) {
        this.logger.warn(`No webhooks registered for event: ${event.type}`)
        return
      }

      const payload: WebhookPayload = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        event: event.type,
        timestamp: event.timestamp,
        data: event.data,
      }

      // Dispatch to all matching webhooks
      await Promise.all(
        matchingWebhooks.map(([webhookId, config]) =>
          this.deliverWebhook(webhookId, config, payload).catch((error) => {
            this.logger.error(
              `Failed to deliver webhook ${webhookId}: ${error.message}`,
            )
          }),
        ),
      )
    } catch (error: any) {
      this.logger.error(`Failed to dispatch event: ${error.message}`)
    }
  }

  /**
   * Deliver webhook with retry logic
   */
  private async deliverWebhook(
    webhookId: string,
    config: WebhookConfig,
    payload: WebhookPayload,
    attempt: number = 1,
  ): Promise<void> {
    const startTime = Date.now()
    const retryPolicy = config.retryPolicy || {
      maxRetries: 5,
      backoffMultiplier: 2,
      initialDelayMs: 1000,
    }

    try {
      // Sign the payload
      const signature = this.generateSignature(
        JSON.stringify(payload),
        config.secret || '',
      )

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-ID': webhookId,
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': payload.timestamp.toISOString(),
        ...((config.headers as any) || {}),
      }

      // Send webhook
      const response = await firstValueFrom(
        this.http.post(config.url, payload, {
          headers,
          timeout: 30000,
        }),
      )

      const responseTime = Date.now() - startTime
      this.recordHistory({
        webhookId,
        event: payload.event,
        status: 'success',
        statusCode: response.status,
        responseTime,
        retries: attempt - 1,
        timestamp: new Date(),
      })

      this.logger.log(
        `Webhook delivered: ${webhookId} (${responseTime}ms, attempt ${attempt})`,
      )
    } catch (error: any) {
      const responseTime = Date.now() - startTime
      const isRetryable =
        error.response?.status >= 500 ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT'

      if (isRetryable && attempt < retryPolicy.maxRetries) {
        // Calculate backoff delay
        const delayMs =
          retryPolicy.initialDelayMs *
          Math.pow(retryPolicy.backoffMultiplier, attempt - 1)

        this.logger.warn(
          `Webhook delivery failed for ${webhookId}, retrying in ${delayMs}ms (attempt ${attempt}/${retryPolicy.maxRetries})`,
        )

        // Schedule retry
        setTimeout(() => {
          this.deliverWebhook(
            webhookId,
            config,
            payload,
            attempt + 1,
          ).catch((error) => {
            this.logger.error(
              `Webhook retry failed: ${webhookId}: ${error.message}`,
            )
          })
        }, delayMs)
      } else {
        // Max retries exceeded or non-retryable error
        this.recordHistory({
          webhookId,
          event: payload.event,
          status: 'failed',
          statusCode: error.response?.status,
          responseTime,
          retries: attempt - 1,
          error: error.message,
          timestamp: new Date(),
        })

        // Add to dead letter queue
        if (this.deadLetterQueue.length < this.maxDLQSize) {
          this.deadLetterQueue.push(payload)
          this.logger.error(
            `Webhook delivery permanently failed: ${webhookId}. Added to DLQ.`,
          )
        } else {
          this.logger.error(`Dead letter queue is full, webhook discarded`)
        }
      }
    }
  }

  /**
   * Test webhook delivery
   */
  async testWebhook(webhookId: string): Promise<{
    success: boolean
    statusCode?: number
    responseTime?: number
    error?: string
  }> {
    try {
      const config = this.webhooks.get(webhookId)
      if (!config) {
        return {
          success: false,
          error: 'Webhook not found',
        }
      }

      const testPayload: WebhookPayload = {
        id: `test_${Date.now()}`,
        event: 'workflow.test',
        timestamp: new Date(),
        data: {
          message: 'This is a test webhook delivery',
          webhookId,
        },
      }

      const startTime = Date.now()
      const signature = this.generateSignature(
        JSON.stringify(testPayload),
        config.secret || '',
      )

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-ID': webhookId,
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': testPayload.timestamp.toISOString(),
        'X-Webhook-Test': 'true',
      }

      const response = await firstValueFrom(
        this.http.post(config.url, testPayload, {
          headers,
          timeout: 10000,
        }),
      )

      const responseTime = Date.now() - startTime
      this.recordHistory({
        webhookId,
        event: 'webhook.test',
        status: 'success',
        statusCode: response.status,
        responseTime,
        retries: 0,
        timestamp: new Date(),
      })

      this.logger.log(`Webhook test successful: ${webhookId}`)

      return {
        success: true,
        statusCode: response.status,
        responseTime,
      }
    } catch (error: any) {
      this.logger.error(`Webhook test failed: ${error.message}`)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Get webhook configuration
   */
  getWebhook(webhookId: string): WebhookConfig | undefined {
    return this.webhooks.get(webhookId)
  }

  /**
   * Get all webhooks
   */
  getAllWebhooks(): Array<{
    id: string
    config: WebhookConfig
  }> {
    return Array.from(this.webhooks.entries()).map(([id, config]) => ({
      id,
      config,
    }))
  }

  /**
   * Get webhook delivery history
   */
  getHistory(
    webhookId?: string,
    limit: number = 100,
  ): WebhookHistory[] {
    let history = this.eventHistory

    if (webhookId) {
      history = history.filter((h) => h.webhookId === webhookId)
    }

    return history.slice(-limit)
  }

  /**
   * Get dead letter queue
   */
  getDeadLetterQueue(limit: number = 50): WebhookPayload[] {
    return this.deadLetterQueue.slice(-limit)
  }

  /**
   * Retry dead letter queue item
   */
  async retryDeadLetterItem(payloadId: string): Promise<boolean> {
    try {
      const index = this.deadLetterQueue.findIndex((p) => p.id === payloadId)
      if (index === -1) {
        return false
      }

      const payload = this.deadLetterQueue[index]

      // Dispatch to all active webhooks that handle this event
      const matchingWebhooks = Array.from(this.webhooks.entries()).filter(
        ([, config]) => config.active && config.events.includes(payload.event),
      )

      for (const [webhookId, config] of matchingWebhooks) {
        await this.deliverWebhook(webhookId, config, payload)
      }

      // Remove from DLQ on successful delivery attempt
      this.deadLetterQueue.splice(index, 1)
      this.logger.log(`Dead letter item retried: ${payloadId}`)
      return true
    } catch (error: any) {
      this.logger.error(`Failed to retry dead letter item: ${error.message}`)
      return false
    }
  }

  /**
   * Get webhook statistics
   */
  getStatistics(): {
    totalWebhooks: number
    activeWebhooks: number
    totalEvents: number
    successRate: number
    failureRate: number
    averageResponseTime: number
    deadLetterCount: number
  } {
    const webhhooks = Array.from(this.webhooks.values())
    const activeCount = webhhooks.filter((w) => w.active).length

    const successCount = this.eventHistory.filter(
      (h) => h.status === 'success',
    ).length
    const failureCount = this.eventHistory.filter(
      (h) => h.status === 'failed',
    ).length
    const totalCount = this.eventHistory.length

    const avgResponseTime =
      totalCount > 0
        ? this.eventHistory.reduce((sum, h) => sum + h.responseTime, 0) /
          totalCount
        : 0

    return {
      totalWebhooks: this.webhooks.size,
      activeWebhooks: activeCount,
      totalEvents: totalCount,
      successRate:
        totalCount > 0 ? (successCount / totalCount) * 100 : 0,
      failureRate:
        totalCount > 0 ? (failureCount / totalCount) * 100 : 0,
      averageResponseTime: Math.round(avgResponseTime),
      deadLetterCount: this.deadLetterQueue.length,
    }
  }

  /**
   * Clear dead letter queue
   */
  clearDeadLetterQueue(): number {
    const count = this.deadLetterQueue.length
    this.deadLetterQueue = []
    this.logger.log(`Dead letter queue cleared: ${count} items removed`)
    return count
  }

  /**
   * Clear event history (with size limit)
   */
  private recordHistory(history: WebhookHistory): void {
    this.eventHistory.push(history)

    // Keep only recent events
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize)
    }
  }

  /**
   * Generate webhook secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Generate webhook signature using HMAC-SHA256
   */
  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
  }

  /**
   * Verify webhook signature
   */
  verifySignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  }
}
