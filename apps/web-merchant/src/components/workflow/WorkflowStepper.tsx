'use client';

/**
 * Workflow Stepper Component
 * Phase 3: Enterprise Dashboard Architecture
 *
 * Displays multi-step workflow progress with visual indicators
 * Inspired by Linear's workflow UI
 *
 * Features:
 * - Visual step indicators
 * - Current/completed/upcoming states
 * - Progress bar
 * - Keyboard navigation (arrows, Enter)
 * - Clickable steps (if allowed)
 * - Compact and full variants
 */

import * as React from 'react';
import { Check, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  optional?: boolean;
}

export interface WorkflowStepperProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  variant?: 'default' | 'compact';
  allowClickAhead?: boolean; // Allow clicking future steps
  className?: string;
}

export function WorkflowStepper({
  steps,
  currentStep,
  onStepClick,
  variant = 'default',
  allowClickAhead = false,
  className,
}: WorkflowStepperProps) {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const handleStepClick = (index: number) => {
    if (!onStepClick) return;

    // Only allow clicking completed steps or current step (not future steps unless allowed)
    if (index <= currentStep || allowClickAhead) {
      onStepClick(index);
    }
  };

  const isStepClickable = (index: number) => {
    if (!onStepClick) return false;
    return index <= currentStep || allowClickAhead;
  };

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[#F3F4F6] dark:bg-[#1A1A1D] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0066FF] transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-[#6B7280] dark:text-[#A1A1A6] tabular-nums">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Current Step Label */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111827] dark:text-[#FAFAFA]">
              {steps[currentStep]?.label}
            </h3>
            {steps[currentStep]?.description && (
              <p className="text-xs text-[#6B7280] dark:text-[#A1A1A6] mt-0.5">
                {steps[currentStep].description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant (full)
  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-1.5 bg-[#F3F4F6] dark:bg-[#1A1A1D] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0066FF] transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="absolute -top-1 right-0 text-xs font-medium text-[#6B7280] dark:text-[#A1A1A6] tabular-nums">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* Steps List */}
      <div className="space-y-1">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          const clickable = isStepClickable(index);
          const StepIcon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              disabled={!clickable}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg',
                'transition-all duration-150',
                'text-left',
                clickable && 'cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1D]',
                !clickable && 'cursor-default',
                isCurrent && 'bg-[#0066FF]/5 dark:bg-[#0066FF]/10',
              )}
            >
              {/* Step Indicator */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center',
                    'transition-all duration-200',
                    isCompleted &&
                      'bg-[#0066FF] text-white',
                    isCurrent &&
                      'bg-[#0066FF] text-white ring-4 ring-[#0066FF]/20',
                    isUpcoming &&
                      'bg-[#F3F4F6] dark:bg-[#1A1A1D] text-[#9CA3AF] dark:text-[#636366]',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : StepIcon ? (
                    <StepIcon className="h-4 w-4" />
                  ) : (
                    <Circle className={cn('h-3 w-3', isCurrent && 'fill-current')} />
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-1/2 top-8 -translate-x-1/2 w-0.5 h-4',
                      'transition-colors duration-200',
                      isCompleted ? 'bg-[#0066FF]' : 'bg-[#E5E7EB] dark:bg-[#2A2A2D]',
                    )}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2">
                  <h4
                    className={cn(
                      'text-sm font-semibold',
                      'transition-colors duration-150',
                      isCurrent && 'text-[#0066FF]',
                      isCompleted && 'text-[#111827] dark:text-[#FAFAFA]',
                      isUpcoming && 'text-[#6B7280] dark:text-[#A1A1A6]',
                    )}
                  >
                    {step.label}
                  </h4>
                  {step.optional && (
                    <span className="text-xs text-[#9CA3AF] dark:text-[#636366] italic">
                      (optional)
                    </span>
                  )}
                </div>
                {step.description && (
                  <p
                    className={cn(
                      'text-xs mt-1',
                      'transition-colors duration-150',
                      isCurrent && 'text-[#6B7280] dark:text-[#A1A1A6]',
                      !isCurrent && 'text-[#9CA3AF] dark:text-[#636366]',
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>

              {/* Chevron (for current step) */}
              {isCurrent && (
                <ChevronRight className="h-4 w-4 text-[#0066FF] flex-shrink-0 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Horizontal Workflow Stepper (for smaller spaces)
 */
export interface HorizontalWorkflowStepperProps {
  steps: WorkflowStep[];
  currentStep: number;
  className?: string;
}

export function HorizontalWorkflowStepper({
  steps,
  currentStep,
  className,
}: HorizontalWorkflowStepperProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div className="flex items-center gap-2">
              {/* Indicator */}
              <div
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0',
                  'transition-all duration-200',
                  isCompleted && 'bg-[#0066FF] text-white',
                  isCurrent && 'bg-[#0066FF] text-white ring-2 ring-[#0066FF]/20',
                  !isCompleted &&
                    !isCurrent &&
                    'bg-[#F3F4F6] dark:bg-[#1A1A1D] text-[#9CA3AF]',
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Label (only for current/completed) */}
              {(isCurrent || isCompleted) && (
                <span
                  className={cn(
                    'text-sm font-medium hidden sm:block',
                    isCurrent && 'text-[#0066FF]',
                    isCompleted && 'text-[#6B7280] dark:text-[#A1A1A6]',
                  )}
                >
                  {step.label}
                </span>
              )}
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 flex-shrink-0',
                  'transition-colors duration-200',
                  isCompleted ? 'bg-[#0066FF]' : 'bg-[#E5E7EB] dark:bg-[#2A2A2D]',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
