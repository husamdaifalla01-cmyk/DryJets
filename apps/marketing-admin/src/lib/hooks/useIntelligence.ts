import { useQuery } from '@tanstack/react-query';
import {
  getNarrativeInsights,
  getGrowthInsights,
  getAlgorithmInsights,
  getEEATInsights,
  getAttributionInsights,
  getCreativeInsights,
  getMemoryInsights,
  NarrativeInsights,
  GrowthInsights,
  AlgorithmInsights,
  EEATInsights,
  AttributionInsights,
  CreativeInsights,
  MemoryInsights,
} from '@/lib/api/intelligence';

/**
 * INTELLIGENCE REACT QUERY HOOKS
 *
 * Custom hooks for AI-powered intelligence insights.
 * 7 intelligence domains with auto-refetching.
 */

export const INTELLIGENCE_QUERY_KEYS = {
  all: (profileId: string) => ['intelligence', profileId] as const,
  narrative: (profileId: string) => [...INTELLIGENCE_QUERY_KEYS.all(profileId), 'narrative'] as const,
  growth: (profileId: string) => [...INTELLIGENCE_QUERY_KEYS.all(profileId), 'growth'] as const,
  algorithm: (profileId: string) => [...INTELLIGENCE_QUERY_KEYS.all(profileId), 'algorithm'] as const,
  eeat: (profileId: string) => [...INTELLIGENCE_QUERY_KEYS.all(profileId), 'eeat'] as const,
  attribution: (profileId: string) => [...INTELLIGENCE_QUERY_KEYS.all(profileId), 'attribution'] as const,
  creative: (profileId: string) => [...INTELLIGENCE_QUERY_KEYS.all(profileId), 'creative'] as const,
  memory: (profileId: string) => [...INTELLIGENCE_QUERY_KEYS.all(profileId), 'memory'] as const,
};

/**
 * Narrative Intelligence
 * Refetches every 10 minutes
 */
export const useNarrativeInsights = (profileId: string) => {
  return useQuery<NarrativeInsights>({
    queryKey: INTELLIGENCE_QUERY_KEYS.narrative(profileId),
    queryFn: () => getNarrativeInsights(profileId),
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
};

/**
 * Growth Intelligence
 * Refetches every 5 minutes
 */
export const useGrowthInsights = (profileId: string) => {
  return useQuery<GrowthInsights>({
    queryKey: INTELLIGENCE_QUERY_KEYS.growth(profileId),
    queryFn: () => getGrowthInsights(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

/**
 * Algorithm Intelligence
 * Refetches every 15 minutes
 */
export const useAlgorithmInsights = (profileId: string) => {
  return useQuery<AlgorithmInsights>({
    queryKey: INTELLIGENCE_QUERY_KEYS.algorithm(profileId),
    queryFn: () => getAlgorithmInsights(profileId),
    enabled: !!profileId,
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};

/**
 * E-E-A-T Intelligence
 * Refetches every 30 minutes
 */
export const useEEATInsights = (profileId: string) => {
  return useQuery<EEATInsights>({
    queryKey: INTELLIGENCE_QUERY_KEYS.eeat(profileId),
    queryFn: () => getEEATInsights(profileId),
    enabled: !!profileId,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
};

/**
 * Attribution Intelligence
 * Refetches every 10 minutes
 */
export const useAttributionInsights = (profileId: string) => {
  return useQuery<AttributionInsights>({
    queryKey: INTELLIGENCE_QUERY_KEYS.attribution(profileId),
    queryFn: () => getAttributionInsights(profileId),
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
};

/**
 * Creative Intelligence
 * Refetches every 10 minutes
 */
export const useCreativeInsights = (profileId: string) => {
  return useQuery<CreativeInsights>({
    queryKey: INTELLIGENCE_QUERY_KEYS.creative(profileId),
    queryFn: () => getCreativeInsights(profileId),
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
};

/**
 * Memory/Learning Intelligence
 * Refetches every 15 minutes
 */
export const useMemoryInsights = (profileId: string) => {
  return useQuery<MemoryInsights>({
    queryKey: INTELLIGENCE_QUERY_KEYS.memory(profileId),
    queryFn: () => getMemoryInsights(profileId),
    enabled: !!profileId,
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
};
