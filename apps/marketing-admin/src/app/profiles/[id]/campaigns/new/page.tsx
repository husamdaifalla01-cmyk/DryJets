'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/lib/hooks/useProfile';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandInput } from '@/components/command/CommandInput';
import { CommandPanel } from '@/components/command/CommandPanel';
import { ArrowLeft, Zap, Check, Sparkles, Target, TrendingUp, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Platform, PLATFORM_INFO } from '@/types/connection';

/**
 * CAMPAIGN LAUNCH WIZARD - Refined Minimal
 *
 * Simplified 3-step wizard with template selection and AI suggestions.
 */

const STEPS = [
  { id: 1, label: 'Choose Template' },
  { id: 2, label: 'Configure Campaign' },
  { id: 3, label: 'Review & Launch' },
];

const TEMPLATES = [
  {
    id: 'quick-launch',
    name: 'Quick Launch',
    description: 'Get started in 60 seconds with smart defaults',
    icon: Rocket,
    color: 'primary',
    duration: 7,
    blogPosts: 2,
    socialPosts: 20,
    recommended: true,
  },
  {
    id: 'brand-awareness',
    name: 'Brand Awareness',
    description: 'Build recognition with consistent content',
    icon: Target,
    color: 'accent-info',
    duration: 14,
    blogPosts: 4,
    socialPosts: 40,
  },
  {
    id: 'growth-sprint',
    name: 'Growth Sprint',
    description: 'Aggressive push for rapid growth',
    icon: TrendingUp,
    color: 'accent-success',
    duration: 30,
    blogPosts: 8,
    socialPosts: 80,
  },
];

const ALL_PLATFORMS: Platform[] = ['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube'];

export default function NewCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;
  const { data: profile } = useProfile(profileId);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: 7,
    mode: 'full_auto',
    blogPosts: 2,
    socialPosts: 20,
    platforms: ALL_PLATFORMS,
  });

  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      duration: template.duration,
      blogPosts: template.blogPosts,
      socialPosts: template.socialPosts,
    });
    setCurrentStep(2);
  };

  const handleLaunch = () => {
    // Simulate campaign launch
    alert('Campaign launched successfully!');
    router.push(`/profiles/${profileId}/campaigns/1`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back Button */}
      <Link
        href={`/profiles/${profileId}`}
        className="inline-flex items-center gap-2 text-text-tertiary hover:text-primary transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Launch New Campaign
        </h1>
        <p className="text-text-secondary">
          Create an autonomous marketing campaign for {profile?.brandName}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm transition-all',
                currentStep === step.id && 'bg-primary text-white',
                currentStep > step.id && 'bg-accent-success text-white',
                currentStep < step.id && 'bg-bg-elevated text-text-tertiary'
              )}>
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={cn(
                'text-sm font-medium',
                currentStep >= step.id ? 'text-text-primary' : 'text-text-tertiary'
              )}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn(
                'w-12 h-0.5 rounded-full',
                currentStep > step.id ? 'bg-accent-success' : 'bg-border-default'
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <CommandPanel variant="elevated">
        {/* STEP 1: Template Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Your Campaign Type</h2>
              <p className="text-text-secondary">
                Select a template to get started with optimized defaults
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="relative p-6 rounded-xl border-2 border-border-subtle hover:border-primary transition-all text-left group"
                >
                  {template.recommended && (
                    <div className="absolute -top-3 left-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Recommended
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-lg bg-${template.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <template.icon className={`w-6 h-6 text-${template.color}`} />
                  </div>

                  <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-text-secondary mb-4">{template.description}</p>

                  <div className="space-y-1 text-xs text-text-tertiary">
                    <div>Duration: {template.duration} days</div>
                    <div>Content: {template.blogPosts} blog posts, {template.socialPosts} social posts</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Configure Campaign */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Configure Your Campaign</h2>
              <p className="text-text-secondary">
                Fine-tune the settings or use our AI-suggested defaults
              </p>
            </div>

            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Campaign Name</label>
              <CommandInput
                placeholder="e.g., Q4 Product Launch"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                inputSize="lg"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Duration (Days)
                <span className="ml-2 text-xs text-text-tertiary">
                  AI suggests: {selectedTemplate?.duration} days
                </span>
              </label>
              <CommandInput
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>

            {/* Content Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Blog Posts</label>
                <CommandInput
                  type="number"
                  value={formData.blogPosts}
                  onChange={(e) => setFormData({ ...formData, blogPosts: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Social Posts</label>
                <CommandInput
                  type="number"
                  value={formData.socialPosts}
                  onChange={(e) => setFormData({ ...formData, socialPosts: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Automation Mode */}
            <div>
              <label className="block text-sm font-medium mb-3">Automation Mode</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'full_auto', label: 'Full Auto', desc: 'AI handles everything' },
                  { value: 'semi_auto', label: 'Semi Auto', desc: 'Review before publishing' },
                  { value: 'hybrid', label: 'Hybrid', desc: 'Mix of both' },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setFormData({ ...formData, mode: mode.value })}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      formData.mode === mode.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border-subtle hover:border-border-default'
                    )}
                  >
                    <div className="font-medium mb-1">{mode.label}</div>
                    <div className="text-xs text-text-tertiary">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Target Platforms</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ALL_PLATFORMS.map((platform) => (
                  <label
                    key={platform}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                      formData.platforms.includes(platform)
                        ? 'border-primary bg-primary/5'
                        : 'border-border-subtle hover:border-border-default'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, platforms: [...formData.platforms, platform] });
                        } else {
                          setFormData({
                            ...formData,
                            platforms: formData.platforms.filter(p => p !== platform),
                          });
                        }
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-medium">{PLATFORM_INFO[platform].name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <CommandButton
                variant="ghost"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </CommandButton>
              <CommandButton
                variant="primary"
                onClick={() => setCurrentStep(3)}
                disabled={!formData.name}
                className="flex-1"
              >
                Continue to Review
              </CommandButton>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Launch */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Review & Launch</h2>
              <p className="text-text-secondary">
                Confirm your campaign settings before launching
              </p>
            </div>

            {/* Campaign Summary */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-bg-elevated border border-border-subtle">
                <div className="text-sm text-text-tertiary mb-1">Campaign Name</div>
                <div className="font-semibold">{formData.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-bg-elevated border border-border-subtle">
                  <div className="text-sm text-text-tertiary mb-1">Template</div>
                  <div className="font-semibold">{selectedTemplate?.name}</div>
                </div>
                <div className="p-4 rounded-lg bg-bg-elevated border border-border-subtle">
                  <div className="text-sm text-text-tertiary mb-1">Duration</div>
                  <div className="font-semibold">{formData.duration} days</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-bg-elevated border border-border-subtle">
                  <div className="text-sm text-text-tertiary mb-1">Blog Posts</div>
                  <div className="font-semibold">{formData.blogPosts} posts</div>
                </div>
                <div className="p-4 rounded-lg bg-bg-elevated border border-border-subtle">
                  <div className="text-sm text-text-tertiary mb-1">Social Posts</div>
                  <div className="font-semibold">{formData.socialPosts} posts</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-bg-elevated border border-border-subtle">
                <div className="text-sm text-text-tertiary mb-2">Target Platforms</div>
                <div className="flex flex-wrap gap-2">
                  {formData.platforms.map((platform) => (
                    <span key={platform} className="badge badge-default">
                      {PLATFORM_INFO[platform].name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-bg-elevated border border-border-subtle">
                <div className="text-sm text-text-tertiary mb-1">Automation Mode</div>
                <div className="font-semibold capitalize">{formData.mode.replace('_', ' ')}</div>
              </div>
            </div>

            {/* Launch Actions */}
            <div className="flex gap-3 pt-4">
              <CommandButton
                variant="ghost"
                onClick={() => setCurrentStep(2)}
              >
                Back
              </CommandButton>
              <CommandButton
                variant="primary"
                onClick={handleLaunch}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Launch Campaign
              </CommandButton>
            </div>
          </div>
        )}
      </CommandPanel>
    </div>
  );
}
