/**
 * Strategy-related interfaces for marketing services
 * Centralized type definitions for strategy planning, competitor analysis, and content validation
 */

/**
 * Competitor analysis result structure
 * Used by landscape-analyzer to build competitive intelligence
 */
export interface CompetitorAnalysis {
  name: string;
  url: string;
  strength: 'weak' | 'moderate' | 'strong' | 'dominant';
  strategies: string[];
  weaknesses: string[];
  contentTypes: string[];
  platforms: string[];
  estimatedBudget: string;
}

/**
 * Platform-specific metrics
 * Compatible with @packages/types PlatformMetrics
 */
export interface PlatformMetrics {
  platform: string;
  followers: number;
  engagement_rate: number;
  posting_frequency: number;
  reach?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
}

/**
 * Estimated budget breakdown
 */
export interface EstimatedBudget {
  min: number;
  max: number;
  currency: string;
  confidence: 'low' | 'medium' | 'high';
  breakdown?: {
    content: number;
    ads: number;
    tools: number;
    other: number;
  };
}

/**
 * Market analysis result
 */
export interface MarketAnalysis {
  totalAddressableMarket: string;
  marketSize: number;
  growthRate: number;
  trends: string[];
  opportunities: string[];
  threats: string[];
  barriers: string[];
  saturation: 'low' | 'medium' | 'high';
}

/**
 * Competitive landscape overview
 */
export interface CompetitiveLandscape {
  competitors: CompetitorAnalysis[];
  marketPosition: string;
  competitiveAdvantages: string[];
  competitiveDisadvantages: string[];
  marketShare: {
    estimated: number;
    confidence: string;
  };
  recommendations: string[];
}

/**
 * Content platform validation result
 */
export interface PlatformValidation {
  platform: string;
  isValid: boolean;
  confidence: number;
  reasons: string[];
  alternatives?: string[];
  estimatedReach?: number;
  difficulty?: 'easy' | 'moderate' | 'hard';
}

/**
 * Content strategy recommendation
 */
export interface ContentStrategy {
  platforms: string[];
  contentTypes: string[];
  frequency: {
    platform: string;
    postsPerWeek: number;
  }[];
  themes: string[];
  tone: string;
  goals: string[];
  kpis: string[];
  estimatedBudget: EstimatedBudget;
  timeline: {
    phase: string;
    duration: string;
    milestones: string[];
  }[];
}

/**
 * Repurposing strategy result
 */
export interface RepurposingStrategy {
  sourceContentType: string;
  targetPlatforms: string[];
  transformations: {
    platform: string;
    format: string;
    adaptations: string[];
    estimatedEffort: 'low' | 'medium' | 'high';
  }[];
  expectedReach: number;
  expectedEngagement: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Cost calculation result
 */
export interface CostEstimate {
  total: number;
  currency: string;
  breakdown: {
    category: string;
    amount: number;
    description: string;
  }[];
  timeframe: string;
  confidence: number;
  assumptions: string[];
}
