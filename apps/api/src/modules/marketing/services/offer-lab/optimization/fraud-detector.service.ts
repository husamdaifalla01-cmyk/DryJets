import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

/**
 * Fraud Detector Service
 *
 * Detects fraudulent traffic patterns:
 * - Bot traffic
 * - Click fraud
 * - Proxy/VPN traffic
 * - Suspicious conversion patterns
 */

export interface FraudAlert {
  connectionId: string;
  campaignId?: string;
  fraudType: 'bot-traffic' | 'click-fraud' | 'proxy-traffic' | 'suspicious-conversions';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100%
  evidence: string[];
  recommendation: string;
}

export interface FraudAnalysis {
  connectionId: string;
  isFraudulent: boolean;
  fraudScore: number; // 0-100
  alerts: FraudAlert[];
  safeToRun: boolean;
}

@Injectable()
export class FraudDetectorService {
  private readonly logger = new Logger(FraudDetectorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analyze connection for fraud
   */
  async analyzeConnection(connectionId: string): Promise<FraudAnalysis> {
    this.logger.log(`Analyzing connection ${connectionId} for fraud...`);

    const connection = await this.prisma.trafficConnection.findUnique({
      where: { id: connectionId },
      include: {
        campaigns: {
          where: { status: 'active' },
          include: {
            metrics: {
              orderBy: { timestamp: 'desc' },
              take: 20,
            },
          },
        },
      },
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    const alerts: FraudAlert[] = [];

    // Run fraud detection checks
    for (const campaign of connection.campaigns) {
      const campaignAlerts = await this.analyzeCampaign(campaign);
      alerts.push(...campaignAlerts);
    }

    // Calculate overall fraud score
    const fraudScore = this.calculateOverallFraudScore(alerts);
    const isFraudulent = fraudScore >= 70;
    const safeToRun = fraudScore < 50;

    return {
      connectionId,
      isFraudulent,
      fraudScore,
      alerts,
      safeToRun,
    };
  }

  /**
   * Analyze campaign for fraud patterns
   */
  private async analyzeCampaign(campaign: any): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = [];
    const metrics = campaign.metrics;

    if (metrics.length === 0) {
      return alerts;
    }

    // Calculate aggregate metrics
    const totals = metrics.reduce(
      (acc, m) => ({
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
        spend: acc.spend + parseFloat(m.spend.toString()),
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0 },
    );

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cvr = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

    // Check 1: Bot traffic (very high CTR but no conversions)
    if (ctr > 5 && totals.conversions === 0 && totals.clicks > 100) {
      alerts.push({
        connectionId: campaign.connectionId,
        campaignId: campaign.id,
        fraudType: 'bot-traffic',
        severity: 'high',
        confidence: 85,
        evidence: [
          `Abnormally high CTR: ${ctr.toFixed(2)}%`,
          `Zero conversions after ${totals.clicks} clicks`,
          `Spent $${totals.spend.toFixed(2)} with no results`,
        ],
        recommendation: 'Pause campaign immediately. Likely bot traffic.',
      });
    }

    // Check 2: Click fraud (high clicks, very low spend-to-click ratio suggests repeated clicking)
    const costPerClick = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    if (totals.clicks > 500 && costPerClick < 0.01 && totals.conversions === 0) {
      alerts.push({
        connectionId: campaign.connectionId,
        campaignId: campaign.id,
        fraudType: 'click-fraud',
        severity: 'critical',
        confidence: 90,
        evidence: [
          `Suspiciously low CPC: $${costPerClick.toFixed(4)}`,
          `High click volume: ${totals.clicks} clicks`,
          `No conversions`,
        ],
        recommendation: 'CRITICAL: Pause all campaigns on this source. Investigate click fraud.',
      });
    }

    // Check 3: Suspicious conversion pattern (too perfect)
    if (cvr > 15 && totals.conversions > 10) {
      alerts.push({
        connectionId: campaign.connectionId,
        campaignId: campaign.id,
        fraudType: 'suspicious-conversions',
        severity: 'medium',
        confidence: 65,
        evidence: [
          `Unusually high CVR: ${cvr.toFixed(2)}%`,
          `${totals.conversions} conversions`,
        ],
        recommendation: 'Monitor closely. Conversion rate is suspiciously high.',
      });
    }

    // Check 4: Time-based fraud patterns
    const recentMetrics = metrics.slice(0, 5); // Last 5 snapshots
    const hasSpikes = this.detectTrafficSpikes(recentMetrics);
    if (hasSpikes) {
      alerts.push({
        connectionId: campaign.connectionId,
        campaignId: campaign.id,
        fraudType: 'bot-traffic',
        severity: 'medium',
        confidence: 70,
        evidence: [
          'Unnatural traffic spikes detected',
          'Pattern suggests automated traffic',
        ],
        recommendation: 'Traffic pattern is suspicious. Monitor for fraud.',
      });
    }

    return alerts;
  }

  /**
   * Detect unnatural traffic spikes
   */
  private detectTrafficSpikes(metrics: any[]): boolean {
    if (metrics.length < 3) return false;

    const clickCounts = metrics.map((m) => m.clicks);
    const avgClicks = clickCounts.reduce((a, b) => a + b, 0) / clickCounts.length;

    // Check if any metric has clicks > 3x average
    for (const clicks of clickCounts) {
      if (clicks > avgClicks * 3 && avgClicks > 10) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate overall fraud score from alerts
   */
  private calculateOverallFraudScore(alerts: FraudAlert[]): number {
    if (alerts.length === 0) return 0;

    const severityWeights = {
      low: 15,
      medium: 30,
      high: 60,
      critical: 90,
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const alert of alerts) {
      const weight = severityWeights[alert.severity];
      const score = (alert.confidence / 100) * weight;
      totalScore += score;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.min(100, (totalScore / totalWeight) * 100) : 0;
  }

  /**
   * Get fraud alerts for all connections
   */
  async getAllFraudAlerts(): Promise<FraudAlert[]> {
    const connections = await this.prisma.trafficConnection.findMany({
      where: { isActive: true },
    });

    const allAlerts: FraudAlert[] = [];

    for (const connection of connections) {
      const analysis = await this.analyzeConnection(connection.id);
      allAlerts.push(...analysis.alerts);
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return allAlerts;
  }

  /**
   * Auto-pause fraudulent campaigns
   */
  async autoPauseFraudulentCampaigns(): Promise<{
    pausedCount: number;
    pausedCampaigns: string[];
  }> {
    const alerts = await this.getAllFraudAlerts();
    const pausedCampaigns: string[] = [];

    for (const alert of alerts) {
      if (alert.severity === 'critical' || alert.severity === 'high') {
        if (alert.campaignId) {
          try {
            await this.prisma.adCampaign.update({
              where: { id: alert.campaignId },
              data: {
                status: 'paused',
                pauseReason: `Fraud detected: ${alert.fraudType}`,
                pausedAt: new Date(),
              },
            });

            pausedCampaigns.push(alert.campaignId);
            this.logger.warn(`Auto-paused campaign ${alert.campaignId} due to ${alert.fraudType}`);
          } catch (error) {
            this.logger.error(`Error pausing campaign ${alert.campaignId}: ${error.message}`);
          }
        }
      }
    }

    return {
      pausedCount: pausedCampaigns.length,
      pausedCampaigns,
    };
  }

  /**
   * Check if IP is suspicious (placeholder - would integrate with IP reputation service)
   */
  checkIPReputation(ip: string): {
    isSuspicious: boolean;
    isProxy: boolean;
    isVPN: boolean;
    score: number; // 0-100
  } {
    // Placeholder implementation
    // In production, integrate with services like:
    // - IPQualityScore
    // - MaxMind
    // - IPHub
    // - AbuseIPDB

    return {
      isSuspicious: false,
      isProxy: false,
      isVPN: false,
      score: 80,
    };
  }

  /**
   * Validate user agent (detect bots)
   */
  isBotUserAgent(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawl/i,
      /spider/i,
      /scrape/i,
      /headless/i,
      /phantom/i,
      /selenium/i,
      /puppeteer/i,
    ];

    return botPatterns.some((pattern) => pattern.test(userAgent));
  }

  /**
   * Calculate fraud risk score for a single click
   */
  calculateClickFraudRisk(data: {
    ip: string;
    userAgent: string;
    timeOnPage: number;
    referrer?: string;
  }): {
    riskScore: number; // 0-100
    isHighRisk: boolean;
    reasons: string[];
  } {
    let riskScore = 0;
    const reasons: string[] = [];

    // Check user agent
    if (this.isBotUserAgent(data.userAgent)) {
      riskScore += 40;
      reasons.push('Bot user agent detected');
    }

    // Check time on page
    if (data.timeOnPage < 3) {
      riskScore += 30;
      reasons.push('Suspiciously short time on page');
    }

    // Check referrer
    if (!data.referrer || data.referrer === 'direct') {
      riskScore += 10;
      reasons.push('No referrer or direct traffic');
    }

    // Check IP reputation
    const ipRep = this.checkIPReputation(data.ip);
    if (ipRep.isProxy || ipRep.isVPN) {
      riskScore += 20;
      reasons.push('Proxy or VPN detected');
    }

    return {
      riskScore: Math.min(100, riskScore),
      isHighRisk: riskScore >= 60,
      reasons,
    };
  }
}
