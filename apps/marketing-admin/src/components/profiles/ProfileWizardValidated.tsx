/**
 * PROFILE WIZARD WITH VALIDATION
 *
 * Multi-step wizard for creating profiles with full Zod validation.
 * Combines the great UX of the wizard with runtime type safety.
 *
 * Features:
 * - 5-step wizard flow
 * - Per-step validation with Zod
 * - Real-time error messages
 * - Type-safe form data
 * - Progress tracking
 * - Back/Next navigation with validation
 */

'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useCreateProfile } from '@/lib/hooks/useProfile';
import { createProfileSchema, CreateProfileFormData } from '@/lib/validations';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandInput, CommandTextarea } from '@/components/command/CommandInput';
import { DataPanel } from '@/components/command/CommandPanel';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Audience' },
  { id: 3, label: 'Brand Voice' },
  { id: 4, label: 'Goals' },
  { id: 5, label: 'Review' },
];

// Step-specific validation schemas
const step1Schema = createProfileSchema.pick({
  name: true,
  brandName: true,
  description: true,
});

const step2Schema = createProfileSchema.pick({
  industry: true,
  niche: true,
  targetAudience: true,
});

const step3Schema = createProfileSchema.pick({
  brandVoice: true,
  brandValues: true,
});

const step4Schema = createProfileSchema.pick({
  primaryObjective: true,
  goals: true,
});

interface ProfileWizardValidatedProps {
  onComplete?: (profileId: string) => void;
}

export const ProfileWizardValidated: React.FC<ProfileWizardValidatedProps> = ({
  onComplete,
}) => {
  const router = useRouter();
  const createProfile = useCreateProfile();
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateProfileFormData>({
    mode: 'onBlur',
    resolver: zodResolver(createProfileSchema),
    mode: 'onChange',
    defaultValues: {
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
    },
  });

  const formData = watch();

  // Validate current step
  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof CreateProfileFormData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['name', 'brandName', 'description'];
        break;
      case 2:
        fieldsToValidate = ['industry', 'niche', 'targetAudience'];
        break;
      case 3:
        fieldsToValidate = ['brandVoice', 'brandValues'];
        break;
      case 4:
        fieldsToValidate = ['primaryObjective', 'goals'];
        break;
      case 5:
        return true; // Review step has no validation
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CreateProfileFormData) => {
    createProfile.mutate(data, {
      onSuccess: (profile) => {
        if (onComplete) {
          onComplete(profile.id);
        } else {
          router.push(`/profiles/${profile.id}`);
        }
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-12">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'w-10 h-10 flex items-center justify-center border-2 font-mono font-bold transition-all',
                  currentStep === step.id &&
                    'border-neon-cyan text-neon-cyan shadow-glow-cyan-sm',
                  currentStep > step.id &&
                    'border-neon-green text-neon-green bg-neon-green/10',
                  currentStep < step.id && 'border-border-emphasis text-text-tertiary'
                )}
              >
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span
                className={cn(
                  'text-xs mt-2 uppercase font-mono',
                  currentStep >= step.id ? 'text-text-primary' : 'text-text-tertiary'
                )}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4 transition-colors',
                  currentStep > step.id ? 'bg-neon-green' : 'bg-border-emphasis'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <DataPanel>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">BASIC INFORMATION</h2>
                <p className="text-text-tertiary text-sm">
                  Let's start with the basics of your marketing profile
                </p>
              </div>

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Profile Name *
                </label>
                <CommandInput
                  {...register('name')}
                  placeholder="e.g., SaaS Marketing - Q1 2024"
                />
                {errors.name && (
                  <p className="text-status-error text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Brand Name *
                </label>
                <CommandInput
                  {...register('brandName')}
                  placeholder="e.g., TechCorp"
                />
                {errors.brandName && (
                  <p className="text-status-error text-xs mt-1">
                    {errors.brandName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Description (Optional)
                </label>
                <CommandTextarea
                  {...register('description')}
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
          )}

          {/* Step 2: Audience & Industry */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">AUDIENCE & INDUSTRY</h2>
                <p className="text-text-tertiary text-sm">
                  Define your target market and industry focus
                </p>
              </div>

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Industry *
                </label>
                <CommandInput
                  {...register('industry')}
                  placeholder="e.g., SaaS, E-commerce, Healthcare"
                />
                {errors.industry && (
                  <p className="text-status-error text-xs mt-1">
                    {errors.industry.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Niche *
                </label>
                <CommandInput
                  {...register('niche')}
                  placeholder="e.g., Marketing Automation for SMBs"
                />
                {errors.niche && (
                  <p className="text-status-error text-xs mt-1">
                    {errors.niche.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Target Audience *
                </label>
                <CommandTextarea
                  {...register('targetAudience')}
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
          )}

          {/* Step 3: Brand Voice & Values */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">BRAND VOICE & VALUES</h2>
                <p className="text-text-tertiary text-sm">
                  Define how your brand communicates
                </p>
              </div>

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Brand Voice *
                </label>
                <CommandInput
                  {...register('brandVoice')}
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

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Brand Values * (comma-separated)
                </label>
                <Controller
                  name="brandValues"
                  control={control}
                  render={({ field }) => (
                    <CommandInput
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
          )}

          {/* Step 4: Goals & Objectives */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">GOALS & OBJECTIVES</h2>
                <p className="text-text-tertiary text-sm">
                  What do you want to achieve with this profile?
                </p>
              </div>

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Primary Objective *
                </label>
                <select
                  {...register('primaryObjective')}
                  className="input-command w-full"
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

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Marketing Goals * (comma-separated)
                </label>
                <Controller
                  name="goals"
                  control={control}
                  render={({ field }) => (
                    <CommandTextarea
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
                  <p className="text-status-error text-xs mt-1">
                    {errors.goals.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">REVIEW & CREATE</h2>
                <p className="text-text-tertiary text-sm">
                  Review your profile details before creating
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-l-2 border-neon-cyan pl-4">
                  <div className="text-xs text-text-tertiary uppercase mb-1">
                    Profile Name
                  </div>
                  <div className="font-medium">{formData.name}</div>
                </div>

                <div className="border-l-2 border-neon-cyan pl-4">
                  <div className="text-xs text-text-tertiary uppercase mb-1">
                    Brand Name
                  </div>
                  <div className="font-medium">{formData.brandName}</div>
                </div>

                <div className="border-l-2 border-neon-cyan pl-4">
                  <div className="text-xs text-text-tertiary uppercase mb-1">
                    Industry / Niche
                  </div>
                  <div className="font-medium">
                    {formData.industry} • {formData.niche}
                  </div>
                </div>

                <div className="border-l-2 border-neon-cyan pl-4">
                  <div className="text-xs text-text-tertiary uppercase mb-1">
                    Brand Voice
                  </div>
                  <div className="font-medium">{formData.brandVoice}</div>
                </div>

                <div className="border-l-2 border-neon-cyan pl-4">
                  <div className="text-xs text-text-tertiary uppercase mb-1">
                    Brand Values
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.brandValues?.map((value, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-bg-elevated border border-neon-cyan text-xs"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-l-2 border-neon-cyan pl-4">
                  <div className="text-xs text-text-tertiary uppercase mb-1">
                    Primary Objective
                  </div>
                  <div className="font-medium capitalize">
                    {formData.primaryObjective?.replace('-', ' ')}
                  </div>
                </div>

                <div className="border-l-2 border-neon-cyan pl-4">
                  <div className="text-xs text-text-tertiary uppercase mb-1">
                    Goals ({formData.goals?.length})
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {formData.goals?.map((goal, idx) => (
                      <li key={idx} className="text-sm text-text-secondary">
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </DataPanel>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <CommandButton
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            BACK
          </CommandButton>

          {currentStep < 5 ? (
            <CommandButton type="button" onClick={handleNext}>
              NEXT
              <ChevronRight className="w-4 h-4" />
            </CommandButton>
          ) : (
            <CommandButton
              type="submit"
              loading={createProfile.isPending}
              disabled={createProfile.isPending}
            >
              CREATE PROFILE
            </CommandButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileWizardValidated;
