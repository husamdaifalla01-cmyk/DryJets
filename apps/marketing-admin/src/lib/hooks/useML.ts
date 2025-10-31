import { useQuery } from '@tanstack/react-query';
import {
  getTrendPredictions,
  getContentOptimizations,
  getABTestResults,
  getKeywordOpportunities,
  getCampaignForecasts,
  getModelPerformance,
  TrendPrediction,
  ContentOptimization,
  ABTestResult,
  KeywordOpportunity,
  CampaignForecast,
  ModelPerformance,
} from '@/lib/api/ml';

/**
 * ML PREDICTION REACT QUERY HOOKS
 *
 * Custom hooks for ML-powered predictions and analytics.
 */

export const ML_QUERY_KEYS = {
  all: (profileId: string) => ['ml', profileId] as const,
  trends: (profileId: string) => [...ML_QUERY_KEYS.all(profileId), 'trends'] as const,
  contentOpt: (profileId: string) => [...ML_QUERY_KEYS.all(profileId), 'content-opt'] as const,
  abTests: (profileId: string) => [...ML_QUERY_KEYS.all(profileId), 'ab-tests'] as const,
  keywords: (profileId: string) => [...ML_QUERY_KEYS.all(profileId), 'keywords'] as const,
  forecasts: (profileId: string) => [...ML_QUERY_KEYS.all(profileId), 'forecasts'] as const,
  models: (profileId: string) => [...ML_QUERY_KEYS.all(profileId), 'models'] as const,
};

export const useTrendPredictions = (profileId: string) => {
  return useQuery<TrendPrediction[]>({
    queryKey: ML_QUERY_KEYS.trends(profileId),
    queryFn: () => getTrendPredictions(profileId),
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useContentOptimizations = (profileId: string) => {
  return useQuery<ContentOptimization[]>({
    queryKey: ML_QUERY_KEYS.contentOpt(profileId),
    queryFn: () => getContentOptimizations(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useABTestResults = (profileId: string) => {
  return useQuery<ABTestResult[]>({
    queryKey: ML_QUERY_KEYS.abTests(profileId),
    queryFn: () => getABTestResults(profileId),
    enabled: !!profileId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useKeywordOpportunities = (profileId: string) => {
  return useQuery<KeywordOpportunity[]>({
    queryKey: ML_QUERY_KEYS.keywords(profileId),
    queryFn: () => getKeywordOpportunities(profileId),
    enabled: !!profileId,
    staleTime: 30 * 60 * 1000,
  });
};

export const useCampaignForecasts = (profileId: string) => {
  return useQuery<CampaignForecast[]>({
    queryKey: ML_QUERY_KEYS.forecasts(profileId),
    queryFn: () => getCampaignForecasts(profileId),
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useModelPerformance = (profileId: string) => {
  return useQuery<ModelPerformance[]>({
    queryKey: ML_QUERY_KEYS.models(profileId),
    queryFn: () => getModelPerformance(profileId),
    enabled: !!profileId,
    staleTime: 15 * 60 * 1000,
  });
};
