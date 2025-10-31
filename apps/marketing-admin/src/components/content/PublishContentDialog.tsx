/**
 * PUBLISH CONTENT DIALOG
 *
 * Dialog for publishing content to multiple platforms with scheduling.
 * Validates with publishContentSchema and scheduleContentSchema.
 *
 * Features:
 * - Multi-platform selection
 * - Immediate or scheduled publishing
 * - Platform-specific settings
 * - Publishing status feedback
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePublishContent, useScheduleContent } from '@/lib/hooks/useContent';
import { Content } from '@/lib/api/content';
import {
  publishContentSchema,
  scheduleContentSchema,
  PublishContentFormData,
  ScheduleContentFormData,
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
import {
  Send,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PublishContentDialogProps {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PublishContentDialog: React.FC<PublishContentDialogProps> = ({
  content,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const publishContent = usePublishContent();
  const scheduleContent = useScheduleContent();
  const [step, setStep] = useState<'configure' | 'confirm'>('configure');
  const [publishMode, setPublishMode] = useState<'immediate' | 'scheduled'>('immediate');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PublishContentFormData | ScheduleContentFormData>({
    resolver: zodResolver(
      publishMode === 'immediate' ? publishContentSchema : scheduleContentSchema
    ),
    defaultValues: {
      contentId: content.id,
      publishImmediately: true,
      platforms: content.targetPlatforms,
      scheduledAt: undefined,
    },
  });

  const selectedPlatforms = watch('platforms') || content.targetPlatforms;
  const scheduledAt = watch('scheduledAt');

  const onSubmit = async (data: PublishContentFormData | ScheduleContentFormData) => {
    if (step === 'configure') {
      setStep('confirm');
      return;
    }

    try {
      if (publishMode === 'immediate') {
        publishContent.mutate(data as PublishContentFormData, {
          onSuccess: () => {
            if (onSuccess) onSuccess();
            handleClose();
          },
        });
      } else {
        scheduleContent.mutate(data as ScheduleContentFormData, {
          onSuccess: () => {
            if (onSuccess) onSuccess();
            handleClose();
          },
        });
      }
    } catch (error) {
      console.error('Publishing error:', error);
    }
  };

  const handleBack = () => {
    setStep('configure');
  };

  const handleClose = () => {
    onClose();
    setStep('configure');
    setPublishMode('immediate');
    reset();
  };

  const togglePlatform = (platform: string) => {
    const current = selectedPlatforms || [];
    const updated = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    setValue('platforms', updated, { shouldValidate: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gradient-cyan">
            <Send className="w-5 h-5" />
            PUBLISH CONTENT
          </DialogTitle>
          <DialogDescription>
            Publish {content.title} to selected platforms
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {step === 'configure' && (
            <>
              {/* Content Summary */}
              <DataPanel>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{content.title}</h3>
                      <p className="text-text-tertiary text-sm">
                        {content.type.replace('-', ' ').toUpperCase()}
                      </p>
                    </div>
                    <Badge
                      variant={content.status === 'draft' ? 'outline' : 'default'}
                    >
                      {content.status.toUpperCase()}
                    </Badge>
                  </div>

                  {content.excerpt && (
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {content.excerpt}
                    </p>
                  )}

                  <div className="flex gap-4 text-xs text-text-tertiary">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>
                        {content.targetPlatforms.length} platform
                        {content.targetPlatforms.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    {content.tags && content.tags.length > 0 && (
                      <div>
                        {content.tags.length} tag{content.tags.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </DataPanel>

              {/* Publishing Mode */}
              <DataPanel>
                <div className="space-y-4">
                  <h4 className="font-bold uppercase text-sm">PUBLISHING MODE</h4>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPublishMode('immediate');
                        setValue('publishImmediately', true);
                        setValue('scheduledAt', undefined);
                      }}
                      className={cn(
                        'flex-1 p-4 border transition-all',
                        publishMode === 'immediate'
                          ? 'border-neon-cyan bg-neon-cyan/10'
                          : 'border-border-emphasis hover:border-neon-cyan/50'
                      )}
                    >
                      <Send
                        className={cn(
                          'w-6 h-6 mx-auto mb-2',
                          publishMode === 'immediate'
                            ? 'text-neon-cyan'
                            : 'text-text-tertiary'
                        )}
                      />
                      <div className="text-sm font-mono uppercase">
                        Publish Now
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        Publish immediately
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPublishMode('scheduled');
                        setValue('publishImmediately', false);
                      }}
                      className={cn(
                        'flex-1 p-4 border transition-all',
                        publishMode === 'scheduled'
                          ? 'border-neon-cyan bg-neon-cyan/10'
                          : 'border-border-emphasis hover:border-neon-cyan/50'
                      )}
                    >
                      <Calendar
                        className={cn(
                          'w-6 h-6 mx-auto mb-2',
                          publishMode === 'scheduled'
                            ? 'text-neon-cyan'
                            : 'text-text-tertiary'
                        )}
                      />
                      <div className="text-sm font-mono uppercase">
                        Schedule
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        Set future date
                      </div>
                    </button>
                  </div>

                  {/* Schedule Date Input */}
                  {publishMode === 'scheduled' && (
                    <div>
                      <label className="block text-sm text-text-tertiary uppercase mb-2">
                        Schedule For *
                      </label>
                      <CommandInput
                        {...register('scheduledAt')}
                id="scheduledAt"
                        type="datetime-local"
                        className={errors.scheduledAt ? 'border-status-error' : ''}
                      />
                      {errors.scheduledAt && (
                        <p className="text-status-error text-xs mt-1">
                          {errors.scheduledAt.message}
                        </p>
                      )}
                      <p className="text-text-tertiary text-xs mt-1">
                        Content will be published automatically at this time
                      </p>
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
                      Select platforms to publish to
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {PUBLISHING_PLATFORMS.map((platform) => {
                      const isSelected = selectedPlatforms?.includes(platform);
                      const isDefault = content.targetPlatforms.includes(platform);

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
                            {isDefault && (
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
                <CommandButton type="button" variant="ghost" onClick={handleClose}>
                  CANCEL
                </CommandButton>
                <CommandButton type="submit">
                  REVIEW & PUBLISH
                  <Send className="w-4 h-4" />
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
                      <h4 className="font-bold mb-2">CONFIRM PUBLISHING</h4>
                      <p className="text-sm text-text-secondary">
                        Please review the following details before publishing:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pl-8">
                    <div className="border-l-2 border-neon-cyan pl-4">
                      <div className="text-xs text-text-tertiary uppercase">
                        Content
                      </div>
                      <div className="font-medium">{content.title}</div>
                    </div>

                    <div className="border-l-2 border-neon-cyan pl-4">
                      <div className="text-xs text-text-tertiary uppercase">
                        Publish Time
                      </div>
                      <div className="font-medium flex items-center gap-2">
                        {publishMode === 'immediate' ? (
                          <>
                            <Send className="w-4 h-4 text-neon-cyan" />
                            Immediately upon confirmation
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-neon-cyan" />
                            {scheduledAt
                              ? new Date(scheduledAt).toLocaleString()
                              : 'Not scheduled'}
                          </>
                        )}
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

                    {publishMode === 'immediate' && (
                      <div className="bg-neon-cyan/10 border border-neon-cyan/30 p-3 text-xs">
                        <CheckCircle2 className="w-4 h-4 inline mr-2 text-neon-cyan" />
                        Content will be published immediately to all selected
                        platforms.
                      </div>
                    )}

                    {publishMode === 'scheduled' && (
                      <div className="bg-neon-purple/10 border border-neon-purple/30 p-3 text-xs">
                        <Clock className="w-4 h-4 inline mr-2 text-neon-purple" />
                        Content will be published automatically at the scheduled time.
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
                    onClick={handleClose}
                  >
                    CANCEL
                  </CommandButton>
                  <CommandButton
                    type="submit"
                    loading={
                      publishContent.isPending || scheduleContent.isPending
                    }
                    disabled={
                      publishContent.isPending || scheduleContent.isPending
                    }
                  >
                    {publishMode === 'immediate'
                      ? 'PUBLISH NOW'
                      : 'SCHEDULE PUBLISH'}
                    <Send className="w-4 h-4" />
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

export default PublishContentDialog;
