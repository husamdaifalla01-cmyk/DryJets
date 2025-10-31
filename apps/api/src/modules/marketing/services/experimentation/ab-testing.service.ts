import { Injectable, Logger } from '@nestjs/common';

export interface ABTest {
  id: string;
  name: string;
  hypothesis: string;
  variants: Variant[];
  status: 'running' | 'completed' | 'paused';
  results?: TestResults;
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  traffic: number; // percentage
  metrics: VariantMetrics;
}

export interface VariantMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cvr: number;
  revenue: number;
}

export interface TestResults {
  winner: string;
  confidence: number;
  improvement: number;
  recommendation: string;
}

@Injectable()
export class ABTestingService {
  private readonly logger = new Logger('ABTesting');

  /**
   * Create new A/B test
   */
  async createTest(test: Partial<ABTest>): Promise<ABTest> {
    this.logger.log(`Creating A/B test: ${test.name}`);

    return {
      id: `test_${Date.now()}`,
      name: test.name || 'Untitled Test',
      hypothesis: test.hypothesis || '',
      variants: test.variants || [],
      status: 'running',
    };
  }

  /**
   * Analyze test results
   */
  async analyzeTest(testId: string, variants: Variant[]): Promise<TestResults> {
    this.logger.log(`Analyzing test ${testId}...`);

    // Find best performing variant by conversion rate
    const sortedVariants = [...variants].sort((a, b) => b.metrics.cvr - a.metrics.cvr);
    const winner = sortedVariants[0];
    const control = variants.find(v => v.name.toLowerCase().includes('control')) || variants[0];

    const improvement = ((winner.metrics.cvr - control.metrics.cvr) / control.metrics.cvr) * 100;
    const confidence = this.calculateConfidence(winner.metrics, control.metrics);

    return {
      winner: winner.name,
      confidence,
      improvement,
      recommendation: this.generateRecommendation(confidence, improvement),
    };
  }

  private calculateConfidence(variantA: VariantMetrics, variantB: VariantMetrics): number {
    // Simplified confidence calculation (use proper statistical test in production)
    const sampleSizeA = variantA.impressions;
    const sampleSizeB = variantB.impressions;

    if (sampleSizeA < 100 || sampleSizeB < 100) {
      return 0; // Not enough data
    }

    // Simulate confidence based on sample size and difference
    const sizeFactor = Math.min(100, (sampleSizeA + sampleSizeB) / 100);
    const diffFactor = Math.abs(variantA.cvr - variantB.cvr) * 10;

    return Math.min(99, sizeFactor * 0.5 + diffFactor * 0.5);
  }

  private generateRecommendation(confidence: number, improvement: number): string {
    if (confidence < 80) {
      return '⏳ Keep test running - not enough statistical confidence yet';
    }

    if (improvement > 10) {
      return `✅ Winner! Roll out variant - ${improvement.toFixed(1)}% improvement with ${confidence.toFixed(0)}% confidence`;
    } else if (improvement > 0) {
      return `⚠️ Minor improvement (${improvement.toFixed(1)}%) - consider if worth implementing`;
    } else {
      return `❌ No improvement - stick with control`;
    }
  }

  /**
   * Get test recommendations for next experiments
   */
  async getTestRecommendations(): Promise<string[]> {
    return [
      'Test headline variations (curiosity vs value-driven)',
      'Test CTA button colors (green vs orange vs red)',
      'Test page layout (sidebar vs no sidebar)',
      'Test form length (short vs comprehensive)',
      'Test pricing display (monthly vs annual first)',
      'Test social proof placement (above vs below fold)',
      'Test video vs image hero',
      'Test testimonial format (video vs text)',
    ];
  }

  /**
   * Auto-generate test variations
   */
  async generateVariations(element: string, count: number = 3): Promise<any[]> {
    const variations: Record<string, any[]> = {
      headline: [
        { text: 'Save 4 Hours Every Week on Laundry', angle: 'Time-saving' },
        { text: 'Dry Cleaning Delivered to Your Door in 24h', angle: 'Convenience' },
        { text: 'Join 10,000+ People Who Never Visit Dry Cleaners', angle: 'Social proof' },
      ],
      cta_button: [
        { text: 'Get Started Free', color: '#22c55e' },
        { text: 'Try DryJets Now', color: '#f97316' },
        { text: 'Schedule Pickup', color: '#3b82f6' },
      ],
      value_prop: [
        'Free pickup and delivery. Professional cleaning. Time back in your life.',
        'On-demand dry cleaning that fits your schedule. Order in 60 seconds.',
        'The last dry cleaning service you\'ll ever need. Guaranteed satisfaction.',
      ],
    };

    return variations[element] || [];
  }
}
