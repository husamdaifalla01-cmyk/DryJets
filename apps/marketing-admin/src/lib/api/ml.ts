import apiClient from './client';

/**
 * ML PREDICTION API FUNCTIONS
 *
 * API calls for ML-powered predictions and optimizations.
 * Maps to backend MLController (16 endpoints).
 */

const getBasePath = (profileId: string) => `/marketing/profiles/${profileId}/ml`;

/**
 * Trend Predictions
 */
export interface TrendPrediction {
  topic: string;
  momentum: 'rising' | 'stable' | 'declining';
  confidence: number;
  peakDate: string;
  relatedTopics: string[];
}

export const getTrendPredictions = async (profileId: string) => {
  const res = await apiClient.get<{ predictions: TrendPrediction[] }>(
    `${getBasePath(profileId)}/trends`
  );
  return res.data.predictions;
};

/**
 * Content Optimization
 */
export interface ContentOptimization {
  contentId: string;
  title: string;
  currentScore: number;
  optimizedScore: number;
  suggestions: OptimizationSuggestion[];
}

export interface OptimizationSuggestion {
  type: 'headline' | 'structure' | 'keywords' | 'cta' | 'length';
  suggestion: string;
  impact: number;
}

export const getContentOptimizations = async (profileId: string) => {
  const res = await apiClient.get<{ optimizations: ContentOptimization[] }>(
    `${getBasePath(profileId)}/content-optimization`
  );
  return res.data.optimizations;
};

/**
 * A/B Test Results
 */
export interface ABTestResult {
  testId: string;
  name: string;
  status: 'running' | 'completed' | 'stopped';
  variants: TestVariant[];
  winner?: string;
  confidence: number;
  sampleSize: number;
}

export interface TestVariant {
  id: string;
  name: string;
  conversionRate: number;
  impressions: number;
  conversions: number;
}

export const getABTestResults = async (profileId: string) => {
  const res = await apiClient.get<{ tests: ABTestResult[] }>(
    `${getBasePath(profileId)}/ab-tests`
  );
  return res.data.tests;
};

/**
 * Keyword Opportunities
 */
export interface KeywordOpportunity {
  keyword: string;
  searchVolume: number;
  difficulty: 'easy' | 'medium' | 'hard';
  opportunity: number;
  relatedKeywords: string[];
}

export const getKeywordOpportunities = async (profileId: string) => {
  const res = await apiClient.get<{ keywords: KeywordOpportunity[] }>(
    `${getBasePath(profileId)}/keywords`
  );
  return res.data.keywords;
};

/**
 * Campaign Forecasts
 */
export interface CampaignForecast {
  campaignId: string;
  name: string;
  projectedReach: number;
  projectedEngagement: number;
  projectedConversions: number;
  projectedROI: number;
  confidence: number;
}

export const getCampaignForecasts = async (profileId: string) => {
  const res = await apiClient.get<{ forecasts: CampaignForecast[] }>(
    `${getBasePath(profileId)}/campaign-forecasts`
  );
  return res.data.forecasts;
};

/**
 * Model Performance
 */
export interface ModelPerformance {
  modelId: string;
  name: string;
  type: string;
  accuracy: number;
  lastTrained: string;
  predictions: number;
  status: 'active' | 'training' | 'stale';
}

export const getModelPerformance = async (profileId: string) => {
  const res = await apiClient.get<{ models: ModelPerformance[] }>(
    `${getBasePath(profileId)}/models`
  );
  return res.data.models;
};
