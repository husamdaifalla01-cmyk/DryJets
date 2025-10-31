/**
 * PROFILE FORM WITH VALIDATION
 *
 * Fully validated profile form using react-hook-form + Zod.
 * Can be used for both creating and updating profiles.
 *
 * Features:
 * - Real-time validation with Zod schemas
 * - Type-safe form data
 * - Error messages per field
 * - Loading states
 * - Auto-save support (optional)
 */

'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCreateProfile, useUpdateProfile } from '@/lib/hooks/useProfile';
import {
  createProfileSchema,
  updateProfileSchema,
  CreateProfileFormData,
  UpdateProfileFormData,
} from '@/lib/validations';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandInput, CommandTextarea } from '@/components/command/CommandInput';
import { DataPanel } from '@/components/command/CommandPanel';
import { Loader2, Save, X } from 'lucide-react';
import { MarketingProfile } from '@/types/profile';

interface ProfileFormValidatedProps {
  mode: 'create' | 'update';
  profile?: MarketingProfile;
  onSuccess?: (profileId: string) => void;
  onCancel?: () => void;
}

export const ProfileFormValidated: React.FC<ProfileFormValidatedProps> = ({
  mode,
  profile,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();

  const isCreate = mode === 'create';
  const schema = isCreate ? createProfileSchema : updateProfileSchema;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateProfileFormData | UpdateProfileFormData>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
    defaultValues: isCreate
      ? {
          name: '',
          brandName: '',
          description: '',
          industry: '',
          niche: '',
          targetAudience: '',
          brandVoice: '',
          brandValues: [],
          primaryObjective: undefined,
          goals: [],
        }
      : {
          name: profile?.name || '',
          brandName: profile?.brandName || '',
          description: profile?.description || '',
          industry: profile?.industry || '',
          niche: profile?.niche || '',
          targetAudience: profile?.targetAudience || '',
          brandVoice: profile?.brandVoice || '',
          brandValues: profile?.brandValues || [],
          primaryObjective: profile?.primaryObjective as any,
          goals: profile?.goals || [],
        },
  });

  const onSubmit = async (data: CreateProfileFormData | UpdateProfileFormData) => {
    try {
      if (isCreate) {
        createProfile.mutate(data as CreateProfileFormData, {
          onSuccess: (newProfile) => {
            if (onSuccess) {
              onSuccess(newProfile.id);
            } else {
              router.push(`/profiles/${newProfile.id}`);
            }
          },
        });
      } else {
        updateProfile.mutate(
          { id: profile!.id, data: data as UpdateProfileFormData },
          {
            onSuccess: (updatedProfile) => {
              if (onSuccess) {
                onSuccess(updatedProfile.id);
              } else {
                router.push(`/profiles/${updatedProfile.id}`);
              }
            },
          }
        );
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Watch brandValues and goals for dynamic array inputs
  const brandValues = watch('brandValues') as string[];
  const goals = watch('goals') as string[];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information Section */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              BASIC INFORMATION
            </h3>
          </div>

          {/* Profile Name */}
          <div>
            <label htmlFor="name" className="block text-sm text-text-tertiary uppercase mb-2">
              Profile Name *
            </label>
            <CommandInput
              {...register('name')}
              id="name"
              placeholder="e.g., SaaS Marketing - Q1 2024"
            />
            {errors.name && (
              <p className="text-status-error text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Brand Name */}
          <div>
            <label htmlFor="brandName" className="block text-sm text-text-tertiary uppercase mb-2">
              Brand Name *
            </label>
            <CommandInput
              {...register('brandName')}
              id="brandName"
              placeholder="e.g., TechCorp"
            />
            {errors.brandName && (
              <p className="text-status-error text-xs mt-1">
                {errors.brandName.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm text-text-tertiary uppercase mb-2">
              Description (Optional)
            </label>
            <CommandTextarea
              {...register('description')}
              id="description"
              placeholder="Brief description of this marketing profile..."
              rows={3}
            />
            {errors.description && (
              <p className="text-status-error text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </DataPanel>

      {/* Audience & Industry Section */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              AUDIENCE & INDUSTRY
            </h3>
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-sm text-text-tertiary uppercase mb-2">
              Industry *
            </label>
            <CommandInput
              {...register('industry')}
              id="industry"
              placeholder="e.g., SaaS, E-commerce, Healthcare"
            />
            {errors.industry && (
              <p className="text-status-error text-xs mt-1">
                {errors.industry.message}
              </p>
            )}
          </div>

          {/* Niche */}
          <div>
            <label htmlFor="niche" className="block text-sm text-text-tertiary uppercase mb-2">
              Niche *
            </label>
            <CommandInput
              {...register('niche')}
              id="niche"
              placeholder="e.g., Marketing Automation for SMBs"
            />
            {errors.niche && (
              <p className="text-status-error text-xs mt-1">{errors.niche.message}</p>
            )}
          </div>

          {/* Target Audience */}
          <div>
            <label htmlFor="targetAudience" className="block text-sm text-text-tertiary uppercase mb-2">
              Target Audience *
            </label>
            <CommandTextarea
              {...register('targetAudience')}
              id="targetAudience"
              placeholder="Describe your target audience demographics, pain points, and characteristics..."
              rows={4}
            />
            {errors.targetAudience && (
              <p className="text-status-error text-xs mt-1">
                {errors.targetAudience.message}
              </p>
            )}
          </div>
        </div>
      </DataPanel>

      {/* Brand Voice & Values Section */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              BRAND VOICE & VALUES
            </h3>
          </div>

          {/* Brand Voice */}
          <div>
            <label htmlFor="brandVoice" className="block text-sm text-text-tertiary uppercase mb-2">
              Brand Voice *
            </label>
            <CommandInput
              {...register('brandVoice')}
              id="brandVoice"
              placeholder="e.g., Professional, Friendly, Authoritative"
            />
            <p className="text-text-tertiary text-xs mt-1">
              Choose 1-3 adjectives that describe your brand's communication style
            </p>
            {errors.brandVoice && (
              <p className="text-status-error text-xs mt-1">
                {errors.brandVoice.message}
              </p>
            )}
          </div>

          {/* Brand Values */}
          <div>
            <label htmlFor="brandValues" className="block text-sm text-text-tertiary uppercase mb-2">
              Brand Values * (comma-separated)
            </label>
            <Controller
              name="brandValues"
              control={control}
              render={({ field }) => (
                <CommandInput
                  {...field}
                  id="brandValues"
                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                  onChange={(e) => {
                    const values = e.target.value
                      .split(',')
                      .map((v) => v.trim())
                      .filter(Boolean);
                    field.onChange(values);
                  }}
                  placeholder="e.g., Innovation, Transparency, Customer Success"
                />
              )}
            />
            <p className="text-text-tertiary text-xs mt-1">
              Core values that guide your brand
            </p>
            {errors.brandValues && (
              <p className="text-status-error text-xs mt-1">
                {errors.brandValues.message}
              </p>
            )}
          </div>
        </div>
      </DataPanel>

      {/* Goals & Objectives Section */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              GOALS & OBJECTIVES
            </h3>
          </div>

          {/* Primary Objective */}
          <div>
            <label htmlFor="primaryObjective" className="block text-sm text-text-tertiary uppercase mb-2">
              Primary Objective *
            </label>
            <select
              {...register('primaryObjective')}
              id="primaryObjective"
              className={`input-command w-full ${
                errors.primaryObjective ? 'border-status-error' : ''
              }`}
            >
              <option value="">Select primary objective...</option>
              <option value="brand-awareness">Brand Awareness</option>
              <option value="lead-generation">Lead Generation</option>
              <option value="customer-acquisition">Customer Acquisition</option>
              <option value="engagement">Engagement</option>
              <option value="thought-leadership">Thought Leadership</option>
            </select>
            {errors.primaryObjective && (
              <p className="text-status-error text-xs mt-1">
                {errors.primaryObjective.message}
              </p>
            )}
          </div>

          {/* Marketing Goals */}
          <div>
            <label htmlFor="goals" className="block text-sm text-text-tertiary uppercase mb-2">
              Marketing Goals * (comma-separated)
            </label>
            <Controller
              name="goals"
              control={control}
              render={({ field }) => (
                <CommandTextarea
                  {...field}
                  id="goals"
                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                  onChange={(e) => {
                    const goalsList = e.target.value
                      .split(',')
                      .map((g) => g.trim())
                      .filter(Boolean);
                    field.onChange(goalsList);
                  }}
                  placeholder="e.g., Increase website traffic by 50%, Generate 100 leads per month"
                  rows={4}
                />
              )}
            />
            {errors.goals && (
              <p className="text-status-error text-xs mt-1">{errors.goals.message}</p>
            )}
          </div>
        </div>
      </DataPanel>

      {/* Form Actions */}
      <div className="flex justify-between items-center">
        {onCancel && (
          <CommandButton type="button" variant="ghost" onClick={onCancel}>
            <X className="w-4 h-4" />
            CANCEL
          </CommandButton>
        )}
        <div className="flex gap-3 ml-auto">
          {!isCreate && (
            <CommandButton
              type="button"
              variant="secondary"
              disabled={!isDirty}
              onClick={() => router.back()}
            >
              DISCARD CHANGES
            </CommandButton>
          )}
          <CommandButton
            type="submit"
            disabled={isSubmitting || (createProfile.isPending || updateProfile.isPending)}
            loading={isSubmitting || createProfile.isPending || updateProfile.isPending}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isCreate ? 'CREATING...' : 'SAVING...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isCreate ? 'CREATE PROFILE' : 'SAVE CHANGES'}
              </>
            )}
          </CommandButton>
        </div>
      </div>
    </form>
  );
};

export default ProfileFormValidated;
