import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getLandscape,
  analyzeLandscape,
  getStrategy,
  generateStrategy,
} from '@/lib/api/strategy';
import { LandscapeAnalysis, MarketingStrategy } from '@/types/strategy';

/**
 * STRATEGY REACT QUERY HOOKS
 *
 * Custom hooks for strategy and landscape analysis with React Query.
 */

export const STRATEGY_QUERY_KEYS = {
  all: (profileId: string) => ['strategy', profileId] as const,
  landscape: (profileId: string) => [...STRATEGY_QUERY_KEYS.all(profileId), 'landscape'] as const,
  strategy: (profileId: string) => [...STRATEGY_QUERY_KEYS.all(profileId), 'strategy'] as const,
};

/**
 * Get landscape analysis (cached)
 */
export const useLandscape = (profileId: string) => {
  return useQuery<LandscapeAnalysis>({
    queryKey: STRATEGY_QUERY_KEYS.landscape(profileId),
    queryFn: () => getLandscape(profileId),
    enabled: !!profileId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Get marketing strategy (cached)
 */
export const useStrategy = (profileId: string) => {
  return useQuery<MarketingStrategy>({
    queryKey: STRATEGY_QUERY_KEYS.strategy(profileId),
    queryFn: () => getStrategy(profileId),
    enabled: !!profileId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Analyze landscape (trigger AI analysis)
 */
export const useAnalyzeLandscape = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => analyzeLandscape(profileId),
    onSuccess: (data) => {
      // Update cache with new analysis
      queryClient.setQueryData(STRATEGY_QUERY_KEYS.landscape(profileId), data);

      toast.success('LANDSCAPE ANALYZED', {
        description: 'Market analysis completed successfully.',
      });
    },
    onError: () => {
      toast.error('ANALYSIS FAILED', {
        description: 'Failed to analyze landscape. Please try again.',
      });
    },
  });
};

/**
 * Generate strategy (trigger AI strategy generation)
 */
export const useGenerateStrategy = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateStrategy(profileId),
    onSuccess: (data) => {
      // Update cache with new strategy
      queryClient.setQueryData(STRATEGY_QUERY_KEYS.strategy(profileId), data);

      toast.success('STRATEGY GENERATED', {
        description: 'Marketing strategy created successfully.',
      });
    },
    onError: () => {
      toast.error('GENERATION FAILED', {
        description: 'Failed to generate strategy. Please try again.',
      });
    },
  });
};
