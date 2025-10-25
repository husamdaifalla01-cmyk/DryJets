import { Injectable, Logger } from '@nestjs/common'
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../../common/prisma/prisma.service'

interface WorkflowStatus {
  workflowId: string
  status: string
  progress: number
  message?: string
  timestamp: Date
  stats?: {
    contentGenerated: number
    contentApproved: number
    contentPublished: number
    totalReach: number
  }
}

interface EngagementMetric {
  workflowId: string
  platform: string
  timestamp: Date
  impressions: number
  engagements: number
  clicks: number
  shares: number
}

interface CostUpdate {
  workflowId: string
  timestamp: Date
  totalCost: number
  apiCost: number
  promotionCost: number
  roi: number
}

@Injectable()
@WebSocketGateway({
  namespace: 'marketing',
  cors: {
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  },
})
export class WorkflowGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger('WorkflowGateway')

  @WebSocketServer()
  server: Server

  private connectedUsers: Map<string, Set<string>> = new Map()
  private workflowSubscriptions: Map<string, Set<string>> = new Map()

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Handle client connection
   */
  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token
      const decoded = this.jwtService.verify(token)
      const userId = decoded.sub

      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set())
      }

      this.connectedUsers.get(userId)!.add(client.id)

      this.logger.log(
        `Client connected: ${client.id} for user ${userId}`
      )
      client.emit('connected', {
        message: 'Connected to marketing real-time updates',
        clientId: client.id,
      })
    } catch (error) {
      this.logger.error(`Authentication error: ${error}`)
      client.disconnect()
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    for (const [userId, clients] of this.connectedUsers.entries()) {
      if (clients.has(client.id)) {
        clients.delete(client.id)
        if (clients.size === 0) {
          this.connectedUsers.delete(userId)
        }
      }
    }

    for (const [, subscribers] of this.workflowSubscriptions.entries()) {
      subscribers.delete(client.id)
    }

    this.logger.log(`Client disconnected: ${client.id}`)
  }

  /**
   * Subscribe to workflow updates
   */
  @SubscribeMessage('subscribe:workflow')
  subscribeToWorkflow(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workflowId: string }
  ) {
    const { workflowId } = data

    if (!this.workflowSubscriptions.has(workflowId)) {
      this.workflowSubscriptions.set(workflowId, new Set())
    }

    this.workflowSubscriptions.get(workflowId)!.add(client.id)

    this.logger.log(
      `Client ${client.id} subscribed to workflow ${workflowId}`
    )

    client.emit('subscribed', {
      workflowId,
      message: `Successfully subscribed to workflow ${workflowId}`,
    })
  }

  /**
   * Unsubscribe from workflow updates
   */
  @SubscribeMessage('unsubscribe:workflow')
  unsubscribeFromWorkflow(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workflowId: string }
  ) {
    const { workflowId } = data

    if (this.workflowSubscriptions.has(workflowId)) {
      this.workflowSubscriptions.get(workflowId)!.delete(client.id)
    }

    this.logger.log(
      `Client ${client.id} unsubscribed from workflow ${workflowId}`
    )

    client.emit('unsubscribed', { workflowId })
  }

  /**
   * Broadcast workflow status update
   */
  broadcastWorkflowStatusUpdate(status: WorkflowStatus) {
    const workflowId = status.workflowId
    const subscribers = this.workflowSubscriptions.get(workflowId)

    if (subscribers && subscribers.size > 0) {
      for (const clientId of subscribers) {
        this.server.to(clientId).emit('workflow:status', status)
      }

      this.logger.debug(
        `Broadcast status update to ${subscribers.size} subscribers for workflow ${workflowId}`
      )
    }
  }

  /**
   * Broadcast engagement metric update
   */
  broadcastEngagementMetric(metric: EngagementMetric) {
    const workflowId = metric.workflowId
    const subscribers = this.workflowSubscriptions.get(workflowId)

    if (subscribers && subscribers.size > 0) {
      for (const clientId of subscribers) {
        this.server.to(clientId).emit('workflow:engagement', metric)
      }

      this.logger.debug(
        `Broadcast engagement metric for workflow ${workflowId}`
      )
    }
  }

  /**
   * Broadcast cost update
   */
  broadcastCostUpdate(costUpdate: CostUpdate) {
    const workflowId = costUpdate.workflowId
    const subscribers = this.workflowSubscriptions.get(workflowId)

    if (subscribers && subscribers.size > 0) {
      for (const clientId of subscribers) {
        this.server.to(clientId).emit('workflow:cost', costUpdate)
      }

      this.logger.debug(
        `Broadcast cost update for workflow ${workflowId}`
      )
    }
  }

  /**
   * Broadcast content generation progress
   */
  broadcastContentProgress(workflowId: string, progress: number, contentCount: number) {
    const subscribers = this.workflowSubscriptions.get(workflowId)

    if (subscribers && subscribers.size > 0) {
      const message = {
        workflowId,
        progress,
        contentCount,
        timestamp: new Date(),
        message: `Generated ${contentCount} content pieces`,
      }

      for (const clientId of subscribers) {
        this.server.to(clientId).emit('workflow:content-progress', message)
      }
    }
  }

  /**
   * Broadcast publishing progress
   */
  broadcastPublishingProgress(
    workflowId: string,
    publishedCount: number,
    totalCount: number,
    currentPlatform: string
  ) {
    const subscribers = this.workflowSubscriptions.get(workflowId)
    const progress = (publishedCount / totalCount) * 100

    if (subscribers && subscribers.size > 0) {
      const message = {
        workflowId,
        publishedCount,
        totalCount,
        progress,
        currentPlatform,
        timestamp: new Date(),
        message: `Published ${publishedCount}/${totalCount} on ${currentPlatform}`,
      }

      for (const clientId of subscribers) {
        this.server.to(clientId).emit('workflow:publishing-progress', message)
      }
    }
  }

  /**
   * Broadcast error notification
   */
  broadcastError(workflowId: string, error: string, severity: 'warning' | 'error' | 'critical') {
    const subscribers = this.workflowSubscriptions.get(workflowId)

    if (subscribers && subscribers.size > 0) {
      const errorMessage = {
        workflowId,
        error,
        severity,
        timestamp: new Date(),
      }

      for (const clientId of subscribers) {
        this.server.to(clientId).emit('workflow:error', errorMessage)
      }

      this.logger.warn(
        `Broadcast error to ${subscribers.size} subscribers: ${error}`
      )
    }
  }

  /**
   * Request live metrics update from client
   */
  @SubscribeMessage('request:metrics')
  async requestMetrics(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workflowId: string }
  ) {
    try {
      const { workflowId } = data

      // In real implementation, fetch from database
      const metrics = {
        workflowId,
        totalReach: Math.floor(Math.random() * 100000),
        totalEngagements: Math.floor(Math.random() * 5000),
        averageEngagementRate: (Math.random() * 10).toFixed(2),
        roi: Math.floor(Math.random() * 500),
        timestamp: new Date(),
      }

      client.emit('metrics:response', metrics)
    } catch (error: any) {
      client.emit('error', { message: error.message })
    }
  }

  /**
   * Broadcast platform-specific update
   */
  broadcastPlatformUpdate(
    workflowId: string,
    platform: string,
    data: {
      posted: number
      impressions: number
      engagements: number
      reach: number
    }
  ) {
    const subscribers = this.workflowSubscriptions.get(workflowId)

    if (subscribers && subscribers.size > 0) {
      const update = {
        workflowId,
        platform,
        ...data,
        timestamp: new Date(),
      }

      for (const clientId of subscribers) {
        this.server.to(clientId).emit('workflow:platform-update', update)
      }
    }
  }

  /**
   * Broadcast workflow completion
   */
  broadcastWorkflowComplete(
    workflowId: string,
    summary: {
      totalReach: number
      totalEngagements: number
      roi: number
      totalCost: number
    }
  ) {
    const subscribers = this.workflowSubscriptions.get(workflowId)

    if (subscribers && subscribers.size > 0) {
      const completion = {
        workflowId,
        ...summary,
        timestamp: new Date(),
        message: 'Workflow completed successfully',
      }

      for (const clientId of subscribers) {
        this.server.to(clientId).emit('workflow:completed', completion)
      }

      // Clean up subscription after broadcast
      this.workflowSubscriptions.delete(workflowId)
    }
  }

  /**
   * Get connected user count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size
  }

  /**
   * Get workflow subscriber count
   */
  getWorkflowSubscriberCount(workflowId: string): number {
    return this.workflowSubscriptions.get(workflowId)?.size || 0
  }
}
