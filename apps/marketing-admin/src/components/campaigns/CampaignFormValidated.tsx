/**
 * CAMPAIGN FORM WITH VALIDATION
 *
 * Fully validated campaign form using react-hook-form + Zod.
 * Can be used for both creating and updating campaigns.
 *
 * Features:
 * - Real-time validation with Zod schemas
 * - Type-safe form data
 * - Platform multi-select
 * - Date range validation
 * - Budget formatting
 * - Loading states
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCreateCampaign, useUpdateCampaign } from '@/lib/hooks/useCampaignsQuery';
import { Campaign } from '@/lib/api/campaigns';
import {
  createCampaignSchema,
  updateCampaignSchema,
  CreateCampaignFormData,
  UpdateCampaignFormData,
  CAMPAIGN_TYPES,
  PUBLISHING_PLATFORMS,
} from '@/lib/validations';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandInput, CommandTextarea } from '@/components/command/CommandInput';
import { DataPanel } from '@/components/command/CommandPanel';
import { Loader2, Save, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CampaignFormValidatedProps {
  mode: 'create' | 'update';
  campaign?: Campaign;
  profileId: string;
  onSuccess?: (campaignId: string) => void;
  onCancel?: () => void;
}

export const CampaignFormValidated: React.FC<CampaignFormValidatedProps> = ({
  mode,
  campaign,
  profileId,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const isCreate = mode === 'create';
  const schema = isCreate ? createCampaignSchema : updateCampaignSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateCampaignFormData | UpdateCampaignFormData>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
    defaultValues: isCreate
      ? {
          profileId,
          name: '',
          description: '',
          type: undefined,
          targetPlatforms: [],
          startDate: new Date().toISOString().split('T')[0],
          endDate: undefined,
          budget: undefined,
          targetAudience: '',
          goals: [],
          kpis: [],
          tags: [],
        }
      : {
          name: campaign?.name || '',
          description: campaign?.description || '',
          type: campaign?.type,
          targetPlatforms: campaign?.targetPlatforms || [],
          startDate: campaign?.startDate?.split('T')[0] || '',
          endDate: campaign?.endDate?.split('T')[0] || '',
          budget: campaign?.budget,
          targetAudience: campaign?.targetAudience || '',
          goals: campaign?.goals || [],
          kpis: campaign?.kpis || [],
          tags: campaign?.tags || [],
        },
  });

  const targetPlatforms = watch('targetPlatforms') as string[];
  const goals = watch('goals') as string[];
  const kpis = watch('kpis') as string[];
  const tags = watch('tags') as string[];

  const onSubmit = async (data: CreateCampaignFormData | UpdateCampaignFormData) => {
    try {
      if (isCreate) {
        createCampaign.mutate(data as CreateCampaignFormData, {
          onSuccess: (newCampaign) => {
            if (onSuccess) {
              onSuccess(newCampaign.id);
            } else {
              router.push(`/campaigns/${newCampaign.id}`);
            }
          },
        });
      } else {
        updateCampaign.mutate(
          { id: campaign!.id, data: data as UpdateCampaignFormData },
          {
            onSuccess: (updatedCampaign) => {
              if (onSuccess) {
                onSuccess(updatedCampaign.id);
              } else {
                router.push(`/campaigns/${updatedCampaign.id}`);
              }
            },
          }
        );
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const togglePlatform = (platform: string) => {
    const current = targetPlatforms || [];
    const updated = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    setValue('targetPlatforms', updated, { shouldValidate: true });
  };

  const addArrayItem = (field: 'goals' | 'kpis' | 'tags', value: string) => {
    if (!value.trim()) return;
    const current = watch(field) as string[];
    setValue(field, [...(current || []), value.trim()], { shouldValidate: true });
  };

  const removeArrayItem = (field: 'goals' | 'kpis' | 'tags', index: number) => {
    const current = watch(field) as string[];
    setValue(
      field,
      current.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              CAMPAIGN DETAILS
            </h3>
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-sm text-text-tertiary uppercase mb-2">
              Campaign Name *
            </label>
            <CommandInput
              {...register('name')}
              id="name"
              placeholder="e.g., Q1 Social Media Blitz"
              className={errors.name ? 'border-status-error' : ''}
            />
            {errors.name && (
              <p className="text-status-error text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-text-tertiary uppercase mb-2">
              Description (Optional)
            </label>
            <CommandTextarea
              {...register('description')}
              id="description"
              placeholder="Describe the campaign goals and strategy..."
              rows={3}
              className={errors.description}
            />
            {errors.description && (
              <p className="text-status-error text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Campaign Type */}
          <div>
            <label className="block text-sm text-text-tertiary uppercase mb-2">
              Campaign Type *
            </label>
            <select {...register('type')} id="type" className="input-command w-full">
              <option value="">Select campaign type...</option>
              {CAMPAIGN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace('-', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-status-error text-xs mt-1">{errors.type.message}</p>
            )}
          </div>
        </div>
      </DataPanel>

      {/* Target Platforms */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              TARGET PLATFORMS
            </h3>
            <p className="text-text-tertiary text-sm">
              Select platforms where this campaign will run
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {PUBLISHING_PLATFORMS.map((platform) => {
              const isSelected = targetPlatforms?.includes(platform);
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={cn(
                    'p-3 border transition-all text-left',
                    isSelected
                      ? 'border-neon-cyan bg-neon-cyan/10'
                      : 'border-border-emphasis hover:border-neon-cyan/50'
                  )}
                >
                  <div className="text-sm uppercase font-mono capitalize">
                    {platform}
                  </div>
                  {isSelected && (
                    <div className="text-xs text-neon-cyan mt-1">✓ SELECTED</div>
                  )}
                </button>
              );
            })}
          </div>
          {errors.targetPlatforms && (
            <p className="text-status-error text-xs mt-1">
              {errors.targetPlatforms.message}
            </p>
          )}
        </div>
      </DataPanel>

      {/* Schedule & Budget */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              SCHEDULE & BUDGET
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm text-text-tertiary uppercase mb-2">
                Start Date *
              </label>
              <CommandInput
                {...register('startDate')}
              id="startDate"
                type="date"
                className={errors.startDate}
              />
              {errors.startDate && (
                <p className="text-status-error text-xs mt-1">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm text-text-tertiary uppercase mb-2">
                End Date (Optional)
              </label>
              <CommandInput
                {...register('endDate')}
              id="endDate"
                type="date"
                className={errors.endDate}
              />
              {errors.endDate && (
                <p className="text-status-error text-xs mt-1">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm text-text-tertiary uppercase mb-2">
              Budget (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                $
              </span>
              <CommandInput
                {...register('budget', { valueAsNumber: true })}
              id="budget"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={cn('pl-8', errors.budget && 'border-status-error')}
              />
            </div>
            {errors.budget && (
              <p className="text-status-error text-xs mt-1">
                {errors.budget.message}
              </p>
            )}
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm text-text-tertiary uppercase mb-2">
              Target Audience (Optional)
            </label>
            <CommandTextarea
              {...register('targetAudience')}
              id="targetAudience"
              placeholder="Describe your target audience for this campaign..."
              rows={3}
              className={errors.targetAudience}
            />
            {errors.targetAudience && (
              <p className="text-status-error text-xs mt-1">
                {errors.targetAudience.message}
              </p>
            )}
          </div>
        </div>
      </DataPanel>

      {/* Goals & KPIs */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              GOALS & KPIs
            </h3>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm text-text-tertiary uppercase mb-2">
              Campaign Goals (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <CommandInput
                id="goal-input"
                placeholder="Add a goal..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    addArrayItem('goals', input.value);
                    input.value = '';
                  }
                }}
              />
              <CommandButton
                type="button"
                size="sm"
                onClick={() => {
                  const input = document.getElementById(
                    'goal-input'
                  ) as HTMLInputElement;
                  if (input) {
                    addArrayItem('goals', input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </CommandButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {goals?.map((goal, idx) => (
                <Badge key={idx} variant="outline" className="gap-2">
                  {goal}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('goals', idx)}
                    className="hover:text-status-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div>
            <label className="block text-sm text-text-tertiary uppercase mb-2">
              Key Performance Indicators (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <CommandInput
                id="kpi-input"
                placeholder="Add a KPI..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    addArrayItem('kpis', input.value);
                    input.value = '';
                  }
                }}
              />
              <CommandButton
                type="button"
                size="sm"
                onClick={() => {
                  const input = document.getElementById(
                    'kpi-input'
                  ) as HTMLInputElement;
                  if (input) {
                    addArrayItem('kpis', input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </CommandButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {kpis?.map((kpi, idx) => (
                <Badge key={idx} variant="outline" className="gap-2">
                  {kpi}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('kpis', idx)}
                    className="hover:text-status-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-text-tertiary uppercase mb-2">
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <CommandInput
                id="tag-input"
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    addArrayItem('tags', input.value);
                    input.value = '';
                  }
                }}
              />
              <CommandButton
                type="button"
                size="sm"
                onClick={() => {
                  const input = document.getElementById(
                    'tag-input'
                  ) as HTMLInputElement;
                  if (input) {
                    addArrayItem('tags', input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </CommandButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="gap-2">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('tags', idx)}
                    className="hover:text-status-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
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
            disabled={
              isSubmitting || createCampaign.isPending || updateCampaign.isPending
            }
            loading={isSubmitting || createCampaign.isPending || updateCampaign.isPending}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isCreate ? 'CREATING...' : 'SAVING...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isCreate ? 'CREATE CAMPAIGN' : 'SAVE CHANGES'}
              </>
            )}
          </CommandButton>
        </div>
      </div>
    </form>
  );
};

export default CampaignFormValidated;
