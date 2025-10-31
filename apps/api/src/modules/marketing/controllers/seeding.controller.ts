import { Controller, Post, Get, Delete, Logger } from '@nestjs/common';
import { SeedingOrchestratorService } from '../services/seeding/orchestrator.service';

/**
 * Seeding Controller
 * API endpoints for data seeding and validation
 */
@Controller('marketing/seeding')
export class SeedingController {
  private readonly logger = new Logger('SeedingController');

  constructor(private readonly orchestrator: SeedingOrchestratorService) {}

  /**
   * Run complete seeding pipeline with validation
   * POST /marketing/seeding/run
   */
  @Post('run')
  async runCompleteSeeding() {
    this.logger.log('Starting complete seeding pipeline...');

    try {
      const report = await this.orchestrator.runCompleteSeeding();

      return {
        success: report.overallSuccess,
        message: report.overallSuccess
          ? 'Seeding and validation completed successfully'
          : 'Seeding completed with validation issues',
        data: {
          duration: report.totalDuration,
          recordsCreated: report.totalRecordsCreated,
          validationScore: report.validation?.overallScore,
          phases: report.phases.map((p) => ({
            phase: p.phase,
            success: p.success,
            records: p.recordsCreated,
            duration: p.duration,
          })),
          validation: {
            passed: report.validation?.passed,
            score: report.validation?.overallScore,
            dimensions: Object.entries(report.validation?.dimensions || {}).map(([name, result]: [string, any]) => ({
              name,
              score: result.score,
              passed: result.passed,
              testCount: result.tests.length,
              issueCount: result.issues.length,
            })),
          },
        },
      };
    } catch (error) {
      this.logger.error('Seeding failed:', error);
      return {
        success: false,
        message: 'Seeding failed',
        error: error.message,
      };
    }
  }

  /**
   * Run quick validation only
   * GET /marketing/seeding/validate
   */
  @Get('validate')
  async runQuickValidation() {
    this.logger.log('Running quick validation...');

    try {
      const counts = await this.orchestrator.runQuickValidation();

      return {
        success: true,
        message: 'Validation complete',
        data: counts,
      };
    } catch (error) {
      this.logger.error('Validation failed:', error);
      return {
        success: false,
        message: 'Validation failed',
        error: error.message,
      };
    }
  }

  /**
   * Clear all seeded data
   * DELETE /marketing/seeding/clear
   */
  @Delete('clear')
  async clearAllData() {
    this.logger.warn('Clearing all seeded data...');

    try {
      await this.orchestrator.clearAllData();

      return {
        success: true,
        message: 'All seeded data cleared',
      };
    } catch (error) {
      this.logger.error('Clear failed:', error);
      return {
        success: false,
        message: 'Clear failed',
        error: error.message,
      };
    }
  }

  /**
   * Get seeding status
   * GET /marketing/seeding/status
   */
  @Get('status')
  async getSeedingStatus() {
    try {
      const counts = await this.orchestrator.runQuickValidation();
      const total: number = Object.values(counts).reduce((sum: number, c: unknown) => sum + (Number(c) || 0), 0) as number;

      return {
        success: true,
        message: 'Status retrieved',
        data: {
          totalRecords: total,
          breakdown: counts,
          isSeeded: total > 0,
          estimatedCompleteness: Math.min(100, (total / 72000) * 100).toFixed(1) + '%',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to get status',
        error: error.message,
      };
    }
  }
}
