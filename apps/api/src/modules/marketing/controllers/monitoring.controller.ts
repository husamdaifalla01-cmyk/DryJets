import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { HealthCheckService } from '../services/monitoring/health-check.service';
import { MetricsCollectorService } from '../services/monitoring/metrics-collector.service';
import { AlertingService } from '../services/monitoring/alerting.service';

/**
 * Monitoring Controller
 * Provides endpoints for system health, metrics, and alerts
 */
@Controller('marketing/monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  private readonly logger = new Logger('MonitoringController');

  constructor(
    private readonly healthCheck: HealthCheckService,
    private readonly metricsCollector: MetricsCollectorService,
    private readonly alerting: AlertingService,
  ) {}

  // ============================================
  // HEALTH CHECK ENDPOINTS
  // ============================================

  /**
   * GET /marketing/monitoring/health
   * Get overall system health
   */
  @Get('health')
  async getSystemHealth() {
    this.logger.log('Getting system health');
    return this.healthCheck.checkSystemHealth();
  }

  /**
   * GET /marketing/monitoring/health/:service
   * Get health of specific service
   */
  @Get('health/:service')
  async getServiceHealth(@Param('service') service: string) {
    this.logger.log(`Getting health for service: ${service}`);
    return this.healthCheck.getServiceHealth(service);
  }

  /**
   * GET /marketing/monitoring/health/alerts/critical
   * Get critical health alerts
   */
  @Get('health/alerts/critical')
  async getCriticalAlerts() {
    this.logger.log('Getting critical health alerts');
    return this.healthCheck.getCriticalAlerts();
  }

  /**
   * GET /marketing/monitoring/health/alerts/degraded
   * Get degraded services
   */
  @Get('health/alerts/degraded')
  async getDegradedServices() {
    this.logger.log('Getting degraded services');
    return this.healthCheck.getDegradedServices();
  }

  // ============================================
  // METRICS ENDPOINTS
  // ============================================

  /**
   * GET /marketing/monitoring/metrics
   * Get performance metrics
   */
  @Get('metrics')
  async getPerformanceMetrics(@Query('period') period?: string) {
    const validPeriod = ['hour', 'day', 'week', 'month'].includes(period || '')
      ? (period as 'hour' | 'day' | 'week' | 'month')
      : 'day';

    this.logger.log(`Getting performance metrics for period: ${validPeriod}`);
    return this.metricsCollector.getPerformanceMetrics(validPeriod);
  }

  /**
   * GET /marketing/monitoring/metrics/system
   * Get system-wide metrics
   */
  @Get('metrics/system')
  async getSystemMetrics() {
    this.logger.log('Getting system-wide metrics');
    return this.metricsCollector.getSystemMetrics();
  }

  /**
   * GET /marketing/monitoring/metrics/api
   * Get API performance metrics
   */
  @Get('metrics/api')
  async getAPIMetrics() {
    this.logger.log('Getting API metrics');
    return this.metricsCollector.getAPIMetrics();
  }

  /**
   * GET /marketing/monitoring/metrics/ml
   * Get ML model metrics
   */
  @Get('metrics/ml')
  async getMLModelMetrics() {
    this.logger.log('Getting ML model metrics');
    return this.metricsCollector.getMLModelMetrics();
  }

  /**
   * GET /marketing/monitoring/metrics/content
   * Get content generation metrics
   */
  @Get('metrics/content')
  async getContentMetrics() {
    this.logger.log('Getting content metrics');
    return this.metricsCollector.getContentMetrics();
  }

  /**
   * GET /marketing/monitoring/metrics/linkbuilding
   * Get link building metrics
   */
  @Get('metrics/linkbuilding')
  async getLinkBuildingMetrics() {
    this.logger.log('Getting link building metrics');
    return this.metricsCollector.getLinkBuildingMetrics();
  }

  /**
   * POST /marketing/monitoring/metrics/record
   * Manually record a metric
   */
  @Post('metrics/record')
  async recordMetric(
    @Body()
    body: {
      name: string;
      value: number;
      unit?: string;
      tags?: Record<string, string>;
    },
  ) {
    this.logger.log(`Recording metric: ${body.name} = ${body.value}`);
    await this.metricsCollector.recordMetric(
      body.name,
      body.value,
      body.unit,
      body.tags,
    );
    return { success: true };
  }

  // ============================================
  // ALERTING ENDPOINTS
  // ============================================

  /**
   * GET /marketing/monitoring/alerts
   * Get active alerts
   */
  @Get('alerts')
  async getActiveAlerts(@Query('severity') severity?: string) {
    const validSeverity = ['CRITICAL', 'WARNING', 'INFO'].includes(
      severity || '',
    )
      ? (severity as 'CRITICAL' | 'WARNING' | 'INFO')
      : undefined;

    this.logger.log(
      `Getting active alerts${validSeverity ? ` (${validSeverity})` : ''}`,
    );
    return this.alerting.getActiveAlerts(validSeverity);
  }

  /**
   * GET /marketing/monitoring/alerts/history
   * Get alert history
   */
  @Get('alerts/history')
  async getAlertHistory(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 100;
    this.logger.log(`Getting alert history (limit: ${limitNum})`);
    return this.alerting.getAlertHistory(limitNum);
  }

  /**
   * GET /marketing/monitoring/alerts/statistics
   * Get alert statistics
   */
  @Get('alerts/statistics')
  async getAlertStatistics() {
    this.logger.log('Getting alert statistics');
    return this.alerting.getAlertStatistics();
  }

  /**
   * POST /marketing/monitoring/alerts/send
   * Send manual alert
   */
  @Post('alerts/send')
  async sendAlert(
    @Body()
    body: {
      severity: 'CRITICAL' | 'WARNING' | 'INFO';
      title: string;
      message: string;
      source: string;
      metadata?: Record<string, any>;
    },
  ) {
    this.logger.log(`Sending alert: ${body.title}`);
    return this.alerting.sendAlert(
      body.severity,
      body.title,
      body.message,
      body.source,
      body.metadata,
    );
  }

  /**
   * POST /marketing/monitoring/alerts/:id/resolve
   * Resolve an alert
   */
  @Post('alerts/:id/resolve')
  async resolveAlert(@Param('id') id: string) {
    this.logger.log(`Resolving alert: ${id}`);
    await this.alerting.resolveAlert(id);
    return { success: true };
  }

  /**
   * GET /marketing/monitoring/alerts/rules
   * Get alert rules
   */
  @Get('alerts/rules')
  async getAlertRules() {
    this.logger.log('Getting alert rules');
    return this.alerting.getAlertRules();
  }

  /**
   * POST /marketing/monitoring/alerts/rules/:name
   * Update alert rule
   */
  @Post('alerts/rules/:name')
  async updateAlertRule(
    @Param('name') name: string,
    @Body() updates: any,
  ) {
    this.logger.log(`Updating alert rule: ${name}`);
    return this.alerting.updateAlertRule(name, updates);
  }

  /**
   * POST /marketing/monitoring/alerts/test
   * Test alert system
   */
  @Post('alerts/test')
  async testAlert(
    @Body() body: { severity: 'CRITICAL' | 'WARNING' | 'INFO' },
  ) {
    this.logger.log(`Testing alert system (${body.severity})`);
    return this.alerting.testAlert(body.severity);
  }

  // ============================================
  // DASHBOARD ENDPOINT
  // ============================================

  /**
   * GET /marketing/monitoring/dashboard
   * Get comprehensive monitoring dashboard
   */
  @Get('dashboard')
  async getMonitoringDashboard() {
    this.logger.log('Getting monitoring dashboard');

    const [systemHealth, metrics, alerts, alertStats] = await Promise.all([
      this.healthCheck.checkSystemHealth(),
      this.metricsCollector.getSystemMetrics(),
      this.alerting.getActiveAlerts(),
      this.alerting.getAlertStatistics(),
    ]);

    return {
      timestamp: new Date(),
      health: {
        overall: systemHealth.overall,
        services: systemHealth.summary,
        criticalIssues: systemHealth.services.filter(
          (s) => s.status === 'DOWN',
        ).length,
        degradedServices: systemHealth.services.filter(
          (s) => s.status === 'DEGRADED',
        ).length,
      },
      metrics: {
        uptime: metrics.uptime,
        totalRequests: metrics.totalRequests,
        errorRate: metrics.errorRate,
        avgResponseTime: metrics.avgResponseTime,
        mlPredictions: metrics.mlPredictions,
        contentGenerated: metrics.contentGenerated,
        backlinksAcquired: metrics.backlinksAcquired,
      },
      alerts: {
        active: alertStats.active,
        critical: alertStats.bySeverity.critical,
        warning: alertStats.bySeverity.warning,
        recentAlerts: alerts.slice(0, 5),
      },
      status:
        systemHealth.overall === 'HEALTHY' && alertStats.bySeverity.critical === 0
          ? 'OPERATIONAL'
          : systemHealth.overall === 'DOWN' || alertStats.bySeverity.critical > 0
            ? 'MAJOR_OUTAGE'
            : 'DEGRADED_PERFORMANCE',
    };
  }

  // ============================================
  // AUTOMATED MONITORING
  // ============================================

  /**
   * POST /marketing/monitoring/check
   * Run automated health and metrics check
   */
  @Post('check')
  async runAutomatedCheck() {
    this.logger.log('Running automated monitoring check');

    const [systemHealth, metrics] = await Promise.all([
      this.healthCheck.checkSystemHealth(),
      this.metricsCollector.getPerformanceMetrics('hour'),
    ]);

    // Check for issues and send alerts
    await Promise.all([
      this.alerting.checkSystemHealth(systemHealth),
      this.alerting.checkMetrics(metrics),
    ]);

    return {
      checkTime: new Date(),
      systemHealth: systemHealth.overall,
      alertsTriggered: this.alerting.getActiveAlerts().length,
    };
  }
}
