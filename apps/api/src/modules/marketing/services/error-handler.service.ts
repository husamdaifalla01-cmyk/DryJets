import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'

interface RetryConfig {
  maxRetries: number
  initialDelay: number // in milliseconds
  maxDelay: number
  backoffMultiplier: number
}

interface ErrorLog {
  id?: string
  workflowId: string
  errorType: string
  errorMessage: string
  errorStack?: string
  attempt: number
  timestamp: Date
  resolved: boolean
  resolution?: string
}

interface RetryResult {
  success: boolean
  attempts: number
  error?: string
  result?: any
}

type RetryableFunction = (...args: any[]) => Promise<any>

@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger('ErrorHandlerService')

  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
  }

  private readonly errorThresholds = {
    RATE_LIMIT: 429,
    SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  }

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute function with retry logic
   */
  async executeWithRetry(
    fn: RetryableFunction,
    workflowId: string,
    operationName: string,
    args: any[] = [],
    config?: Partial<RetryConfig>
  ): Promise<RetryResult> {
    const finalConfig = { ...this.defaultRetryConfig, ...config }
    let lastError: Error | null = null
    let lastErrorLog: ErrorLog | null = null

    for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
      try {
        this.logger.log(
          `Executing ${operationName} (attempt ${attempt}/${finalConfig.maxRetries + 1})`
        )

        const result = await fn(...args)

        // Resolve any previous error logs
        if (lastErrorLog) {
          await this.resolveErrorLog(lastErrorLog.id || '', operationName)
        }

        return {
          success: true,
          attempts: attempt,
          result,
        }
      } catch (error: any) {
        lastError = error
        const errorType = this.categorizeError(error)

        this.logger.warn(
          `${operationName} failed (attempt ${attempt}): ${error.message}`
        )

        // Log the error
        lastErrorLog = await this.logError({
          workflowId,
          errorType,
          errorMessage: error.message,
          errorStack: error.stack,
          attempt,
          timestamp: new Date(),
          resolved: false,
        })

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          this.logger.error(
            `${operationName} failed with non-retryable error: ${error.message}`
          )
          return {
            success: false,
            attempts: attempt,
            error: error.message,
          }
        }

        // If this is the last attempt, break
        if (attempt >= finalConfig.maxRetries + 1) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateBackoffDelay(
          attempt,
          finalConfig.initialDelay,
          finalConfig.maxDelay,
          finalConfig.backoffMultiplier
        )

        this.logger.log(
          `Retrying ${operationName} after ${delay}ms...`
        )

        // Wait before retrying
        await this.delay(delay)
      }
    }

    // All retries exhausted
    return {
      success: false,
      attempts: finalConfig.maxRetries + 1,
      error: lastError?.message || 'Unknown error',
    }
  }

  /**
   * Execute parallel operations with error handling
   */
  async executeParallel(
    operations: Array<{
      fn: RetryableFunction
      workflowId: string
      operationName: string
      args?: any[]
      config?: Partial<RetryConfig>
    }>
  ): Promise<Array<{ success: boolean; result?: any; error?: string }>> {
    const results = await Promise.all(
      operations.map((op) =>
        this.executeWithRetry(
          op.fn,
          op.workflowId,
          op.operationName,
          op.args,
          op.config
        ).catch((err) => ({
          success: false,
          error: err.message,
        }))
      )
    )

    return results
  }

  /**
   * Handle API errors specifically
   */
  async handleApiError(
    error: any,
    workflowId: string,
    apiName: string
  ): Promise<void> {
    const errorType = this.categorizeError(error)
    const statusCode = error.response?.status

    this.logger.error(`API Error from ${apiName}: ${error.message}`)

    // Log the error
    await this.logError({
      workflowId,
      errorType,
      errorMessage: `${apiName}: ${error.message}`,
      errorStack: error.stack,
      attempt: 1,
      timestamp: new Date(),
      resolved: false,
    })

    // Handle specific error types
    if (statusCode === 429) {
      // Rate limit - extract reset time if available
      const resetTime = error.response?.headers?.['x-ratelimit-reset']
      this.logger.warn(`Rate limited by ${apiName}. Reset at: ${resetTime}`)
    } else if (statusCode >= 500) {
      this.logger.error(`${apiName} server error: ${statusCode}`)
    }
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: any): string {
    const message = error.message?.toLowerCase() || ''
    const statusCode = error.response?.status

    if (statusCode === 429) return 'RATE_LIMIT_ERROR'
    if (statusCode >= 500) return 'SERVER_ERROR'
    if (statusCode === 401 || statusCode === 403)
      return 'AUTHENTICATION_ERROR'
    if (statusCode === 404) return 'NOT_FOUND_ERROR'
    if (message.includes('timeout')) return 'TIMEOUT_ERROR'
    if (message.includes('network')) return 'NETWORK_ERROR'
    if (message.includes('invalid')) return 'VALIDATION_ERROR'

    return 'UNKNOWN_ERROR'
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const statusCode = error.response?.status
    const message = error.message?.toLowerCase() || ''

    // Don't retry authentication or validation errors
    if (statusCode === 401 || statusCode === 403 || statusCode === 400) {
      return false
    }

    // Don't retry not found errors
    if (statusCode === 404) {
      return false
    }

    // Retry on server errors, timeouts, and network issues
    if (
      statusCode >= 500 ||
      statusCode === 429 ||
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    ) {
      return true
    }

    return false
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(
    attempt: number,
    initialDelay: number,
    maxDelay: number,
    multiplier: number
  ): number {
    const exponentialDelay = initialDelay * Math.pow(multiplier, attempt - 1)
    const delayWithJitter = exponentialDelay * (0.5 + Math.random() * 0.5)
    return Math.min(delayWithJitter, maxDelay)
  }

  /**
   * Sleep for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Log error to database
   */
  private async logError(errorLog: Omit<ErrorLog, 'id'>): Promise<ErrorLog> {
    try {
      // In a real implementation, save to database
      this.logger.debug(`Error logged: ${errorLog.errorType} - ${errorLog.errorMessage}`)
      return {
        ...errorLog,
        id: `error-${Date.now()}`,
      }
    } catch (error: any) {
      this.logger.error(`Failed to log error: ${error.message}`)
      return {
        ...errorLog,
        id: undefined,
      }
    }
  }

  /**
   * Resolve error log
   */
  private async resolveErrorLog(
    errorLogId: string,
    resolution: string
  ): Promise<void> {
    try {
      // In a real implementation, update database
      this.logger.debug(`Error resolved: ${errorLogId}`)
    } catch (error: any) {
      this.logger.error(`Failed to resolve error log: ${error.message}`)
    }
  }

  /**
   * Get error logs for workflow
   */
  async getWorkflowErrorLogs(workflowId: string): Promise<ErrorLog[]> {
    try {
      // In a real implementation, fetch from database
      this.logger.debug(`Fetching error logs for workflow: ${workflowId}`)
      return []
    } catch (error: any) {
      this.logger.error(`Failed to fetch error logs: ${error.message}`)
      return []
    }
  }

  /**
   * Get error statistics
   */
  async getErrorStatistics(
    timeRange: 'day' | 'week' | 'month'
  ): Promise<{
    totalErrors: number
    errorsByType: Record<string, number>
    successRate: number
  }> {
    try {
      // In a real implementation, query database
      return {
        totalErrors: 0,
        errorsByType: {},
        successRate: 100,
      }
    } catch (error: any) {
      this.logger.error(`Failed to get error statistics: ${error.message}`)
      return {
        totalErrors: 0,
        errorsByType: {},
        successRate: 0,
      }
    }
  }

  /**
   * Create circuit breaker for service
   */
  createCircuitBreaker(serviceName: string, threshold: number = 5) {
    let failureCount = 0
    let isOpen = false
    let lastFailureTime = 0

    return {
      async execute(fn: RetryableFunction, ...args: any[]): Promise<any> {
        // If circuit is open and cooldown hasn't passed, fail immediately
        if (isOpen && Date.now() - lastFailureTime < 60000) {
          throw new Error(
            `Circuit breaker open for ${serviceName}. Service temporarily unavailable.`
          )
        }

        try {
          const result = await fn(...args)
          failureCount = 0
          isOpen = false
          return result
        } catch (error) {
          failureCount++
          lastFailureTime = Date.now()

          if (failureCount >= threshold) {
            isOpen = true
            this.logger.error(
              `Circuit breaker opened for ${serviceName} after ${failureCount} failures`
            )
          }

          throw error
        }
      },

      getStatus() {
        return {
          isOpen,
          failureCount,
          lastFailureTime,
        }
      },

      reset() {
        failureCount = 0
        isOpen = false
        this.logger.log(`Circuit breaker reset for ${serviceName}`)
      },
    }
  }

  /**
   * Dead letter queue for failed messages
   */
  async addToDeadLetterQueue(
    workflowId: string,
    message: any,
    reason: string
  ): Promise<void> {
    try {
      this.logger.warn(
        `Message added to DLQ for workflow ${workflowId}: ${reason}`
      )

      // In a real implementation, store in database or message queue
      // For now, just log it
    } catch (error: any) {
      this.logger.error(`Failed to add to DLQ: ${error.message}`)
    }
  }
}
