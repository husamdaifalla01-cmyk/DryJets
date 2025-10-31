import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileStats,
  activateProfile,
  pauseProfile,
  archiveProfile,
} from '@/lib/api/profiles';
import {
  MarketingProfile,
  CreateProfileDto,
  UpdateProfileDto,
} from '@/types/profile';

/**
 * PROFILE REACT QUERY HOOKS
 *
 * Custom hooks for profile data management with React Query.
 * Includes automatic caching, refetching, and optimistic updates.
 */

export const PROFILE_QUERY_KEYS = {
  all: ['profiles'] as const,
  lists: () => [...PROFILE_QUERY_KEYS.all, 'list'] as const,
  list: () => [...PROFILE_QUERY_KEYS.lists()] as const,
  details: () => [...PROFILE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PROFILE_QUERY_KEYS.details(), id] as const,
  stats: (id: string) => [...PROFILE_QUERY_KEYS.detail(id), 'stats'] as const,
};

/**
 * Get all profiles
 */
export const useProfiles = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.list(),
    queryFn: getAllProfiles,
  });
};

/**
 * Get single profile by ID
 */
export const useProfile = (id: string) => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.detail(id),
    queryFn: () => getProfileById(id),
    enabled: !!id,
  });
};

/**
 * Get profile statistics
 */
export const useProfileStats = (id: string) => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.stats(id),
    queryFn: () => getProfileStats(id),
    enabled: !!id,
  });
};

/**
 * Create new profile
 */
export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfileDto) => createProfile(data),
    onSuccess: (newProfile) => {
      // Invalidate profiles list
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.list() });

      toast.success('PROFILE CREATED', {
        description: `${newProfile.name} has been created successfully.`,
      });
    },
    onError: () => {
      toast.error('CREATION FAILED', {
        description: 'Failed to create profile. Please try again.',
      });
    },
  });
};

/**
 * Update profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfileDto }) =>
      updateProfile(id, data),
    onSuccess: (updatedProfile) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEYS.detail(updatedProfile.id),
      });

      toast.success('PROFILE UPDATED', {
        description: 'Changes saved successfully.',
      });
    },
    onError: () => {
      toast.error('UPDATE FAILED', {
        description: 'Failed to update profile. Please try again.',
      });
    },
  });
};

/**
 * Delete profile
 */
export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: () => {
      // Invalidate profiles list
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.list() });

      toast.success('PROFILE DELETED', {
        description: 'Profile has been permanently deleted.',
      });
    },
    onError: () => {
      toast.error('DELETION FAILED', {
        description: 'Failed to delete profile. Please try again.',
      });
    },
  });
};

/**
 * Activate profile
 */
export const useActivateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateProfile(id),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEYS.detail(profile.id),
      });

      toast.success('PROFILE ACTIVATED', {
        description: `${profile.name} is now active.`,
      });
    },
  });
};

/**
 * Pause profile
 */
export const usePauseProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pauseProfile(id),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEYS.detail(profile.id),
      });

      toast.success('PROFILE PAUSED', {
        description: `${profile.name} has been paused.`,
      });
    },
  });
};

/**
 * Archive profile
 */
export const useArchiveProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveProfile(id),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEYS.detail(profile.id),
      });

      toast.success('PROFILE ARCHIVED', {
        description: `${profile.name} has been archived.`,
      });
    },
  });
};
