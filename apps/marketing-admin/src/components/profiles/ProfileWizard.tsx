'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProfile } from '@/lib/hooks/useProfile';
import { CreateProfileDto } from '@/types/profile';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandInput, CommandTextarea } from '@/components/command/CommandInput';
import { DataPanel } from '@/components/command/CommandPanel';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * PROFILE WIZARD
 *
 * Multi-step form for creating new marketing profiles.
 *
 * Steps:
 * 1. Basic Info (name, brand name, description)
 * 2. Target Audience & Industry
 * 3. Brand Voice & Values
 * 4. Goals & Objectives
 * 5. Review & Create
 */

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Audience' },
  { id: 3, label: 'Brand Voice' },
  { id: 4, label: 'Goals' },
  { id: 5, label: 'Review' },
];

interface ProfileWizardProps {
  onComplete?: (profileId: string) => void;
}

export const ProfileWizard: React.FC<ProfileWizardProps> = ({ onComplete }) => {
  const router = useRouter();
  const createProfile = useCreateProfile();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateProfileDto>>({
    name: '',
    brandName: '',
    description: '',
    industry: '',
    niche: '',
    targetAudience: '',
    brandVoice: '',
    brandValues: [],
    primaryObjective: '',
    goals: [],
  });

  const updateFormData = (field: keyof CreateProfileDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.brandName);
      case 2:
        return !!(formData.industry && formData.niche && formData.targetAudience);
      case 3:
        return !!(formData.brandVoice && formData.brandValues && formData.brandValues.length > 0);
      case 4:
        return !!(formData.primaryObjective && formData.goals && formData.goals.length > 0);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid(4)) return;

    createProfile.mutate(formData as CreateProfileDto, {
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
                  currentStep > step.id && 'border-neon-green text-neon-green bg-neon-green/10',
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
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., SaaS Marketing - Q1 2024"
              />
              <p className="text-text-tertiary text-xs mt-1">
                Internal name for this profile
              </p>
            </div>

            <div>
              <label className="block text-sm text-text-tertiary uppercase mb-2">
                Brand Name *
              </label>
              <CommandInput
                value={formData.brandName}
                onChange={(e) => updateFormData('brandName', e.target.value)}
                placeholder="e.g., TechCorp"
              />
            </div>

            <div>
              <label className="block text-sm text-text-tertiary uppercase mb-2">
                Description (Optional)
              </label>
              <CommandTextarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Brief description of this marketing profile..."
                rows={3}
              />
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
                value={formData.industry}
                onChange={(e) => updateFormData('industry', e.target.value)}
                placeholder="e.g., SaaS, E-commerce, Healthcare"
              />
            </div>

            <div>
              <label className="block text-sm text-text-tertiary uppercase mb-2">
                Niche *
              </label>
              <CommandInput
                value={formData.niche}
                onChange={(e) => updateFormData('niche', e.target.value)}
                placeholder="e.g., Marketing Automation for SMBs"
              />
            </div>

            <div>
              <label className="block text-sm text-text-tertiary uppercase mb-2">
                Target Audience *
              </label>
              <CommandTextarea
                value={formData.targetAudience}
                onChange={(e) => updateFormData('targetAudience', e.target.value)}
                placeholder="Describe your target audience demographics, pain points, and characteristics..."
                rows={4}
              />
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
                value={formData.brandVoice}
                onChange={(e) => updateFormData('brandVoice', e.target.value)}
                placeholder="e.g., Professional, Friendly, Authoritative"
              />
              <p className="text-text-tertiary text-xs mt-1">
                Choose 1-3 adjectives that describe your brand's communication style
              </p>
            </div>

            <div>
              <label className="block text-sm text-text-tertiary uppercase mb-2">
                Brand Values * (comma-separated)
              </label>
              <CommandInput
                value={formData.brandValues?.join(', ')}
                onChange={(e) =>
                  updateFormData(
                    'brandValues',
                    e.target.value.split(',').map((v) => v.trim()).filter(Boolean)
                  )
                }
                placeholder="e.g., Innovation, Transparency, Customer Success"
              />
              <p className="text-text-tertiary text-xs mt-1">
                Core values that guide your brand
              </p>
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
                className="input-command w-full"
                value={formData.primaryObjective}
                onChange={(e) => updateFormData('primaryObjective', e.target.value)}
              >
                <option value="">Select primary objective...</option>
                <option value="brand-awareness">Brand Awareness</option>
                <option value="lead-generation">Lead Generation</option>
                <option value="customer-acquisition">Customer Acquisition</option>
                <option value="engagement">Engagement</option>
                <option value="thought-leadership">Thought Leadership</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-tertiary uppercase mb-2">
                Marketing Goals * (comma-separated)
              </label>
              <CommandTextarea
                value={formData.goals?.join(', ')}
                onChange={(e) =>
                  updateFormData(
                    'goals',
                    e.target.value.split(',').map((g) => g.trim()).filter(Boolean)
                  )
                }
                placeholder="e.g., Increase website traffic by 50%, Generate 100 leads per month, Build social media following"
                rows={4}
              />
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
                <div className="text-xs text-text-tertiary uppercase mb-1">Profile Name</div>
                <div className="font-medium">{formData.name}</div>
              </div>

              <div className="border-l-2 border-neon-cyan pl-4">
                <div className="text-xs text-text-tertiary uppercase mb-1">Brand Name</div>
                <div className="font-medium">{formData.brandName}</div>
              </div>

              <div className="border-l-2 border-neon-cyan pl-4">
                <div className="text-xs text-text-tertiary uppercase mb-1">Industry / Niche</div>
                <div className="font-medium">{formData.industry} • {formData.niche}</div>
              </div>

              <div className="border-l-2 border-neon-cyan pl-4">
                <div className="text-xs text-text-tertiary uppercase mb-1">Brand Voice</div>
                <div className="font-medium">{formData.brandVoice}</div>
              </div>

              <div className="border-l-2 border-neon-cyan pl-4">
                <div className="text-xs text-text-tertiary uppercase mb-1">Brand Values</div>
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
                <div className="text-xs text-text-tertiary uppercase mb-1">Primary Objective</div>
                <div className="font-medium capitalize">
                  {formData.primaryObjective?.replace('-', ' ')}
                </div>
              </div>

              <div className="border-l-2 border-neon-cyan pl-4">
                <div className="text-xs text-text-tertiary uppercase mb-1">Goals ({formData.goals?.length})</div>
                <ul className="list-disc list-inside space-y-1">
                  {formData.goals?.map((goal, idx) => (
                    <li key={idx} className="text-sm text-text-secondary">{goal}</li>
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
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          BACK
        </CommandButton>

        {currentStep < 5 ? (
          <CommandButton onClick={handleNext} disabled={!isStepValid(currentStep)}>
            NEXT
            <ChevronRight className="w-4 h-4" />
          </CommandButton>
        ) : (
          <CommandButton
            onClick={handleSubmit}
            loading={createProfile.isPending}
            disabled={createProfile.isPending}
          >
            CREATE PROFILE
          </CommandButton>
        )}
      </div>
    </div>
  );
};

export default ProfileWizard;
