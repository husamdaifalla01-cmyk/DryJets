/**
 * CAMPAIGN LAUNCH DIALOG
 *
 * Dialog for launching campaigns with scheduling options.
 * Validates with launchCampaignSchema.
 *
 * Features:
 * - Immediate or scheduled launch
 * - Platform override selection
 * - Confirmation step
 * - Full Zod validation
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLaunchCampaign } from '@/lib/hooks/useCampaignsQuery';
import { Campaign } from '@/lib/api/campaigns';
import {
  launchCampaignSchema,
  LaunchCampaignFormData,
  PUBLISHING_PLATFORMS,
} from '@/lib/validations';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandInput } from '@/components/command/CommandInput';
import { DataPanel } from '@/components/command/CommandPanel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Rocket, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CampaignLaunchDialogProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CampaignLaunchDialog: React.FC<CampaignLaunchDialogProps> = ({
  campaign,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const launchCampaign = useLaunchCampaign();
  const [step, setStep] = useState<'configure' | 'confirm'>('configure');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LaunchCampaignFormData>({
    mode: 'onBlur',
    resolver: zodResolver(launchCampaignSchema),
    defaultValues: {
      campaignId: campaign.id,
      publishImmediately: true,
      scheduledAt: undefined,
      platforms: campaign.targetPlatforms,
      confirm: true,
    },
  });

  const publishImmediately = watch('publishImmediately');
  const selectedPlatforms = watch('platforms') || campaign.targetPlatforms;
  const scheduledAt = watch('scheduledAt');

  const onSubmit = async (data: LaunchCampaignFormData) => {
    if (step === 'configure') {
      // Move to confirmation step
      setStep('confirm');
      return;
    }

    // Launch the campaign
    launchCampaign.mutate(data, {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
        setStep('configure');
      },
    });
  };

  const handleBack = () => {
    setStep('configure');
  };

  const handleCancel = () => {
    onClose();
    setStep('configure');
  };

  const togglePlatform = (platform: string) => {
    const current = selectedPlatforms || [];
    const updated = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    setValue('platforms', updated, { shouldValidate: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gradient-cyan">
            <Rocket className="w-5 h-5" />
            LAUNCH CAMPAIGN
          </DialogTitle>
          <DialogDescription>
            Configure launch settings for {campaign.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {step === 'configure' && (
            <>
              {/* Campaign Summary */}
              <DataPanel>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{campaign.name}</h3>
                      <p className="text-text-tertiary text-sm">
                        {campaign.type.replace('-', ' ').toUpperCase()} Campaign
                      </p>
                    </div>
                    <Badge
                      variant={campaign.status === 'draft' ? 'outline' : 'default'}
                    >
                      {campaign.status.toUpperCase()}
                    </Badge>
                  </div>

                  {campaign.description && (
                    <p className="text-sm text-text-secondary">
                      {campaign.description}
                    </p>
                  )}

                  <div className="flex gap-4 text-xs text-text-tertiary">
                    <div>
                      <span className="uppercase">Start:</span>{' '}
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </div>
                    {campaign.endDate && (
                      <div>
                        <span className="uppercase">End:</span>{' '}
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                    )}
                    {campaign.budget && (
                      <div>
                        <span className="uppercase">Budget:</span> $
                        {campaign.budget.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </DataPanel>

              {/* Launch Schedule */}
              <DataPanel>
                <div className="space-y-4">
                  <h4 className="font-bold uppercase text-sm">LAUNCH SCHEDULE</h4>

                  {/* Immediate vs Scheduled */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setValue('publishImmediately', true)}
                      className={cn(
                        'flex-1 p-4 border transition-all',
                        publishImmediately
                          ? 'border-neon-cyan bg-neon-cyan/10'
                          : 'border-border-emphasis hover:border-neon-cyan/50'
                      )}
                    >
                      <Rocket
                        className={cn(
                          'w-6 h-6 mx-auto mb-2',
                          publishImmediately ? 'text-neon-cyan' : 'text-text-tertiary'
                        )}
                      />
                      <div className="text-sm font-mono uppercase">
                        Launch Immediately
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        Start campaign now
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setValue('publishImmediately', false)}
                      className={cn(
                        'flex-1 p-4 border transition-all',
                        !publishImmediately
                          ? 'border-neon-cyan bg-neon-cyan/10'
                          : 'border-border-emphasis hover:border-neon-cyan/50'
                      )}
                    >
                      <Calendar
                        className={cn(
                          'w-6 h-6 mx-auto mb-2',
                          !publishImmediately ? 'text-neon-cyan' : 'text-text-tertiary'
                        )}
                      />
                      <div className="text-sm font-mono uppercase">
                        Schedule Launch
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        Set future date
                      </div>
                    </button>
                  </div>

                  {/* Scheduled Date Input */}
                  {!publishImmediately && (
                    <div>
                      <label className="block text-sm text-text-tertiary uppercase mb-2">
                        Schedule For *
                      </label>
                      <CommandInput
                        {...register('scheduledAt')}
                id="scheduledAt"
                        type="datetime-local"
                        
                      />
                      {errors.scheduledAt && (
                        <p className="text-status-error text-xs mt-1">
                          {errors.scheduledAt.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </DataPanel>

              {/* Platform Selection */}
              <DataPanel>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold uppercase text-sm mb-1">
                      TARGET PLATFORMS
                    </h4>
                    <p className="text-xs text-text-tertiary">
                      Override default platforms or keep campaign settings
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {PUBLISHING_PLATFORMS.map((platform) => {
                      const isSelected = selectedPlatforms?.includes(platform);
                      const isDefaultPlatform =
                        campaign.targetPlatforms.includes(platform);

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
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase font-mono capitalize">
                              {platform}
                            </span>
                            {isDefaultPlatform && (
                              <span className="text-[10px] text-text-tertiary">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <div className="text-[10px] text-neon-cyan mt-1">
                              ✓ SELECTED
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.platforms && (
                    <p className="text-status-error text-xs mt-1">
                      {errors.platforms.message}
                    </p>
                  )}
                </div>
              </DataPanel>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <CommandButton type="button" variant="ghost" onClick={handleCancel}>
                  CANCEL
                </CommandButton>
                <CommandButton type="submit">
                  REVIEW & LAUNCH
                  <Rocket className="w-4 h-4" />
                </CommandButton>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              {/* Confirmation Summary */}
              <DataPanel variant="cyan">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold mb-2">CONFIRM CAMPAIGN LAUNCH</h4>
                      <p className="text-sm text-text-secondary">
                        Please review the following details before launching:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pl-8">
                    <div className="border-l-2 border-neon-cyan pl-4">
                      <div className="text-xs text-text-tertiary uppercase">
                        Campaign
                      </div>
                      <div className="font-medium">{campaign.name}</div>
                    </div>

                    <div className="border-l-2 border-neon-cyan pl-4">
                      <div className="text-xs text-text-tertiary uppercase">
                        Launch Time
                      </div>
                      <div className="font-medium">
                        {publishImmediately
                          ? 'Immediately upon confirmation'
                          : scheduledAt
                          ? new Date(scheduledAt).toLocaleString()
                          : 'Not scheduled'}
                      </div>
                    </div>

                    <div className="border-l-2 border-neon-cyan pl-4">
                      <div className="text-xs text-text-tertiary uppercase mb-1">
                        Platforms ({selectedPlatforms?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedPlatforms?.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {publishImmediately && (
                      <div className="bg-neon-cyan/10 border border-neon-cyan/30 p-3 text-xs">
                        <CheckCircle2 className="w-4 h-4 inline mr-2 text-neon-cyan" />
                        Campaign will start immediately and begin publishing content
                        to selected platforms.
                      </div>
                    )}
                  </div>
                </div>
              </DataPanel>

              {/* Confirmation Actions */}
              <div className="flex justify-between">
                <CommandButton type="button" variant="ghost" onClick={handleBack}>
                  BACK
                </CommandButton>
                <div className="flex gap-3">
                  <CommandButton
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                  >
                    CANCEL
                  </CommandButton>
                  <CommandButton
                    type="submit"
                    loading={launchCampaign.isPending}
                    disabled={launchCampaign.isPending}
                  >
                    {publishImmediately ? 'LAUNCH NOW' : 'SCHEDULE LAUNCH'}
                    <Rocket className="w-4 h-4" />
                  </CommandButton>
                </div>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignLaunchDialog;
