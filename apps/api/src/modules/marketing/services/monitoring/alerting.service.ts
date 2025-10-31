import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/**
 * Alerting Service
 * Sends alerts for critical system issues
 */

export interface Alert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  enabled: boolean;
  cooldown: number; // minutes
}

@Injectable()
export class AlertingService {
  private readonly logger = new Logger('Alerting');
  private activeAlerts: Map<string, Alert> = new Map();
  private lastAlertTime: Map<string, Date> = new Map();

  // Alert rules
  private rules: AlertRule[] = [
    {
      name: 'HighErrorRate',
      condition: 'error_rate > threshold',
      threshold: 5, // 5%
      severity: 'CRITICAL',
      enabled: true,
      cooldown: 30,
    },
    {
      name: 'SlowAPIResponse',
      condition: 'avg_response_time > threshold',
      threshold: 1000, // 1000ms
      severity: 'WARNING',
      enabled: true,
      cooldown: 15,
    },
    {
      name: 'DatabaseDown',
      condition: 'database_status == DOWN',
      threshold: 1,
      severity: 'CRITICAL',
      enabled: true,
      cooldown: 5,
    },
    {
      name: 'MLModelFailing',
      condition: 'ml_accuracy < threshold',
      threshold: 60, // 60%
      severity: 'WARNING',
      enabled: true,
      cooldown: 60,
    },
    {
      name: 'HighMemoryUsage',
      condition: 'memory_usage > threshold',
      threshold: 85, // 85%
      severity: 'WARNING',
      enabled: true,
      cooldown: 10,
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send alert
   */
  async sendAlert(
    severity: 'CRITICAL' | 'WARNING' | 'INFO',
    title: string,
    message: string,
    source: string,
    metadata?: Record<string, any>,
  ): Promise<Alert> {
    const alertKey = `${source}-${title}`;

    // Check cooldown
    const lastAlert = this.lastAlertTime.get(alertKey);
    if (lastAlert) {
      const minutesSinceLastAlert =
        (Date.now() - lastAlert.getTime()) / 1000 / 60;

      // Find rule for this alert
      const rule = this.rules.find((r) =>
        title.toLowerCase().includes(r.name.toLowerCase()),
      );
      const cooldown = rule?.cooldown || 15;

      if (minutesSinceLastAlert < cooldown) {
        this.logger.debug(
          `Alert ${alertKey} in cooldown (${minutesSinceLastAlert.toFixed(1)}/${cooldown} min)`,
        );
        return this.activeAlerts.get(alertKey)!;
      }
    }

    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      title,
      message,
      source,
      timestamp: new Date(),
      resolved: false,
      metadata,
    };

    this.activeAlerts.set(alertKey, alert);
    this.lastAlertTime.set(alertKey, new Date());

    // Log alert
    const logMethod =
      severity === 'CRITICAL'
        ? 'error'
        : severity === 'WARNING'
          ? 'warn'
          : 'log';
    this.logger[logMethod](
      `[${severity}] ${title}: ${message}`,
      JSON.stringify(metadata),
    );

    // Send to notification channels
    await this.sendNotifications(alert);

    return alert;
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    for (const [key, alert] of this.activeAlerts.entries()) {
      if (alert.id === alertId) {
        alert.resolved = true;
        alert.resolvedAt = new Date();
        this.logger.log(`Alert resolved: ${alert.title}`);

        // Remove from active alerts
        this.activeAlerts.delete(key);
        break;
      }
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(severity?: 'CRITICAL' | 'WARNING' | 'INFO'): Alert[] {
    const alerts = Array.from(this.activeAlerts.values()).filter(
      (a) => !a.resolved,
    );

    if (severity) {
      return alerts.filter((a) => a.severity === severity);
    }

    return alerts;
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): Alert[] {
    return Array.from(this.activeAlerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Check for system issues and send alerts
   */
  async checkSystemHealth(healthData: any): Promise<void> {
    // Check if any services are down
    const downServices = healthData.services.filter(
      (s: any) => s.status === 'DOWN',
    );

    for (const service of downServices) {
      await this.sendAlert(
        'CRITICAL',
        `Service Down: ${service.name}`,
        `${service.name} is currently unavailable. Error: ${service.errorMessage}`,
        'HealthCheck',
        { service: service.name, error: service.errorMessage },
      );
    }

    // Check for degraded services
    const degradedServices = healthData.services.filter(
      (s: any) => s.status === 'DEGRADED',
    );

    for (const service of degradedServices) {
      await this.sendAlert(
        'WARNING',
        `Service Degraded: ${service.name}`,
        `${service.name} is experiencing degraded performance. Response time: ${service.responseTime}ms`,
        'HealthCheck',
        { service: service.name, responseTime: service.responseTime },
      );
    }

    // Auto-resolve alerts for services that are now healthy
    const healthyServices = healthData.services.filter(
      (s: any) => s.status === 'HEALTHY',
    );

    for (const service of healthyServices) {
      const alertKey = `HealthCheck-Service Down: ${service.name}`;
      const alert = this.activeAlerts.get(alertKey);
      if (alert && !alert.resolved) {
        await this.resolveAlert(alert.id);
      }

      const degradedKey = `HealthCheck-Service Degraded: ${service.name}`;
      const degradedAlert = this.activeAlerts.get(degradedKey);
      if (degradedAlert && !degradedAlert.resolved) {
        await this.resolveAlert(degradedAlert.id);
      }
    }
  }

  /**
   * Check metrics and send alerts if thresholds exceeded
   */
  async checkMetrics(metrics: any): Promise<void> {
    // Check error rate
    if (metrics.totalRequests > 0) {
      const errorRate = (metrics.failedRequests / metrics.totalRequests) * 100;

      if (errorRate > 5) {
        await this.sendAlert(
          'CRITICAL',
          'High Error Rate',
          `API error rate is ${errorRate.toFixed(2)}% (threshold: 5%)`,
          'MetricsCollector',
          { errorRate, totalRequests: metrics.totalRequests },
        );
      } else {
        // Resolve if error rate is back to normal
        const alertKey = 'MetricsCollector-High Error Rate';
        const alert = this.activeAlerts.get(alertKey);
        if (alert && !alert.resolved) {
          await this.resolveAlert(alert.id);
        }
      }
    }

    // Check response time
    if (metrics.avgResponseTime > 1000) {
      await this.sendAlert(
        'WARNING',
        'Slow API Response',
        `Average API response time is ${metrics.avgResponseTime}ms (threshold: 1000ms)`,
        'MetricsCollector',
        { avgResponseTime: metrics.avgResponseTime },
      );
    }

    // Check ML model accuracy
    if (metrics.mlAccuracy < 60) {
      await this.sendAlert(
        'WARNING',
        'ML Model Accuracy Low',
        `ML model accuracy is ${metrics.mlAccuracy}% (threshold: 60%)`,
        'MetricsCollector',
        { accuracy: metrics.mlAccuracy },
      );
    }
  }

  /**
   * Send notifications through configured channels
   */
  private async sendNotifications(alert: Alert): Promise<void> {
    // In production, send to:
    // - Email (SendGrid)
    // - Slack
    // - PagerDuty (for critical alerts)
    // - SMS (Twilio, for critical)

    if (alert.severity === 'CRITICAL') {
      this.logger.error('CRITICAL ALERT - Would send to PagerDuty/SMS');
    }

    // For now, just log
    this.logger.log(`Notification sent for alert: ${alert.title}`);
  }

  /**
   * Get alert rules
   */
  getAlertRules(): AlertRule[] {
    return this.rules;
  }

  /**
   * Update alert rule
   */
  updateAlertRule(
    name: string,
    updates: Partial<AlertRule>,
  ): AlertRule | undefined {
    const rule = this.rules.find((r) => r.name === name);
    if (rule) {
      Object.assign(rule, updates);
      this.logger.log(`Alert rule updated: ${name}`);
      return rule;
    }
    return undefined;
  }

  /**
   * Test alert system
   */
  async testAlert(severity: 'CRITICAL' | 'WARNING' | 'INFO'): Promise<Alert> {
    return this.sendAlert(
      severity,
      'Test Alert',
      'This is a test alert to verify the alerting system is working correctly.',
      'TestSystem',
      { test: true, timestamp: new Date() },
    );
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(): {
    total: number;
    active: number;
    resolved: number;
    bySeverity: {
      critical: number;
      warning: number;
      info: number;
    };
  } {
    const allAlerts = Array.from(this.activeAlerts.values());
    const activeAlerts = allAlerts.filter((a) => !a.resolved);

    return {
      total: allAlerts.length,
      active: activeAlerts.length,
      resolved: allAlerts.filter((a) => a.resolved).length,
      bySeverity: {
        critical: activeAlerts.filter((a) => a.severity === 'CRITICAL').length,
        warning: activeAlerts.filter((a) => a.severity === 'WARNING').length,
        info: activeAlerts.filter((a) => a.severity === 'INFO').length,
      },
    };
  }
}
