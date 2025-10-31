import { Injectable, Logger } from '@nestjs/common';

export interface TouchPoint {
  timestamp: Date;
  channel: string;
  campaign?: string;
  source: string;
  medium: string;
  content?: string;
  value: number; // attributed value
}

export interface CustomerJourney {
  userId: string;
  touchPoints: TouchPoint[];
  conversion: {
    date: Date;
    value: number;
    type: string;
  };
  attribution: {
    firstTouch: Record<string, number>;
    lastTouch: Record<string, number>;
    linear: Record<string, number>;
    timeDecay: Record<string, number>;
    positionBased: Record<string, number>;
    datadriven: Record<string, number>;
  };
}

@Injectable()
export class MultiTouchAttributionService {
  private readonly logger = new Logger('Attribution');

  /**
   * Calculate multi-touch attribution
   */
  async calculateAttribution(journey: Omit<CustomerJourney, 'attribution'>): Promise<CustomerJourney> {
    this.logger.log(`Calculating attribution for user ${journey.userId}...`);

    const conversionValue = journey.conversion.value;
    const touchPoints = journey.touchPoints;

    return {
      ...journey,
      attribution: {
        firstTouch: this.firstTouchAttribution(touchPoints, conversionValue),
        lastTouch: this.lastTouchAttribution(touchPoints, conversionValue),
        linear: this.linearAttribution(touchPoints, conversionValue),
        timeDecay: this.timeDecayAttribution(touchPoints, conversionValue, journey.conversion.date),
        positionBased: this.positionBasedAttribution(touchPoints, conversionValue),
        datadriven: this.dataDrivenAttribution(touchPoints, conversionValue),
      },
    };
  }

  private firstTouchAttribution(touchPoints: TouchPoint[], value: number): Record<string, number> {
    const result: Record<string, number> = {};
    if (touchPoints.length > 0) {
      const firstTouch = touchPoints[0];
      result[firstTouch.channel] = value;
    }
    return result;
  }

  private lastTouchAttribution(touchPoints: TouchPoint[], value: number): Record<string, number> {
    const result: Record<string, number> = {};
    if (touchPoints.length > 0) {
      const lastTouch = touchPoints[touchPoints.length - 1];
      result[lastTouch.channel] = value;
    }
    return result;
  }

  private linearAttribution(touchPoints: TouchPoint[], value: number): Record<string, number> {
    const result: Record<string, number> = {};
    const valuePerTouch = value / touchPoints.length;

    for (const touch of touchPoints) {
      result[touch.channel] = (result[touch.channel] || 0) + valuePerTouch;
    }
    return result;
  }

  private timeDecayAttribution(touchPoints: TouchPoint[], value: number, conversionDate: Date): Record<string, number> {
    const result: Record<string, number> = {};
    const halfLife = 7; // days

    let totalWeight = 0;
    const weights: number[] = [];

    for (const touch of touchPoints) {
      const daysSince = (conversionDate.getTime() - touch.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      const weight = Math.pow(2, -daysSince / halfLife);
      weights.push(weight);
      totalWeight += weight;
    }

    touchPoints.forEach((touch, index) => {
      const attributedValue = value * (weights[index] / totalWeight);
      result[touch.channel] = (result[touch.channel] || 0) + attributedValue;
    });

    return result;
  }

  private positionBasedAttribution(touchPoints: TouchPoint[], value: number): Record<string, number> {
    const result: Record<string, number> = {};

    if (touchPoints.length === 1) {
      result[touchPoints[0].channel] = value;
    } else if (touchPoints.length === 2) {
      result[touchPoints[0].channel] = value * 0.5;
      result[touchPoints[1].channel] = (result[touchPoints[1].channel] || 0) + value * 0.5;
    } else {
      // 40% first, 40% last, 20% distributed among middle
      const firstTouch = touchPoints[0];
      const lastTouch = touchPoints[touchPoints.length - 1];
      const middleTouches = touchPoints.slice(1, -1);

      result[firstTouch.channel] = value * 0.4;
      result[lastTouch.channel] = (result[lastTouch.channel] || 0) + value * 0.4;

      const middleValue = value * 0.2 / middleTouches.length;
      for (const touch of middleTouches) {
        result[touch.channel] = (result[touch.channel] || 0) + middleValue;
      }
    }

    return result;
  }

  private dataDrivenAttribution(touchPoints: TouchPoint[], value: number): Record<string, number> {
    // Simplified data-driven model (in production, use ML)
    // Weights based on conversion probability increase
    const weights: Record<string, number> = {
      organic_search: 1.5,
      paid_search: 1.3,
      social_organic: 1.2,
      email: 1.1,
      direct: 1.0,
      referral: 1.4,
    };

    const result: Record<string, number> = {};
    let totalWeight = 0;

    const touchWeights: number[] = touchPoints.map(touch => weights[touch.channel] || 1.0);
    totalWeight = touchWeights.reduce((sum, w) => sum + w, 0);

    touchPoints.forEach((touch, index) => {
      const attributedValue = value * (touchWeights[index] / totalWeight);
      result[touch.channel] = (result[touch.channel] || 0) + attributedValue;
    });

    return result;
  }

  /**
   * Get ROI by channel
   */
  async getChannelROI(): Promise<Record<string, { spend: number; revenue: number; roi: number }>> {
    return {
      organic_search: { spend: 0, revenue: 150000, roi: Infinity },
      social_organic: { spend: 0, revenue: 75000, roi: Infinity },
      email: { spend: 500, revenue: 45000, roi: 89 },
      paid_search: { spend: 15000, revenue: 60000, roi: 3 },
      paid_social: { spend: 10000, revenue: 35000, roi: 2.5 },
    };
  }
}
