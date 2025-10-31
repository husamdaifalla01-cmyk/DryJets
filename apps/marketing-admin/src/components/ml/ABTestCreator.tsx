/**
 * A/B TEST CREATOR
 *
 * Interface for creating and managing A/B tests for content.
 * Allows testing different variations to optimize performance.
 */

'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DataPanel } from '@/components/command/CommandPanel'
import { CommandButton } from '@/components/command/CommandButton'
import { CommandInput } from '@/components/command/CommandInput'
import { CommandTextarea } from '@/components/command/CommandInput'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  X,
  Target,
  Calendar,
  TrendingUp,
  Users,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const createABTestSchema = z.object({
  name: z.string().min(3, 'Test name must be at least 3 characters'),
  description: z.string().optional(),
  metric: z.enum(['views', 'engagement', 'clicks', 'conversions', 'shares']),
  targetAudience: z.string().optional(),
  duration: z.number().min(1).max(30),
  variants: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    })
  ).min(2, 'At least 2 variants required'),
})

type ABTestFormData = z.infer<typeof createABTestSchema>

interface ABTestCreatorProps {
  contentId?: string
  onSuccess?: (testId: string) => void
  onCancel?: () => void
}

const METRICS = [
  { value: 'views', label: 'Views', icon: TrendingUp, description: 'Total content views' },
  { value: 'engagement', label: 'Engagement', icon: Target, description: 'Likes, comments, shares' },
  { value: 'clicks', label: 'Clicks', icon: Target, description: 'Click-through rate' },
  { value: 'conversions', label: 'Conversions', icon: Target, description: 'Goal completions' },
  { value: 'shares', label: 'Shares', icon: TrendingUp, description: 'Social shares' },
]

export function ABTestCreator({ contentId, onSuccess, onCancel }: ABTestCreatorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createdTestId, setCreatedTestId] = useState<string | null>(null)

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ABTestFormData>({
    mode: 'onBlur',
    resolver: zodResolver(createABTestSchema),
    defaultValues: {
      name: '',
      description: '',
      metric: 'engagement',
      duration: 7,
      variants: [
        { name: 'Variant A (Control)', description: '' },
        { name: 'Variant B', description: '' },
      ],
    },
  })

  const variants = watch('variants')
  const selectedMetric = watch('metric')

  const handleAddVariant = () => {
    const newVariants = [
      ...variants,
      { name: `Variant ${String.fromCharCode(65 + variants.length)}`, description: '' },
    ]
    setValue('variants', newVariants)
  }

  const handleRemoveVariant = (index: number) => {
    if (variants.length > 2) {
      const newVariants = variants.filter((_, i) => i !== index)
      setValue('variants', newVariants)
    }
  }

  const onSubmit = async (data: ABTestFormData) => {
    setIsCreating(true)

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockTestId = `test-${Date.now()}`
      setCreatedTestId(mockTestId)

      setTimeout(() => {
        onSuccess?.(mockTestId)
      }, 1500)
    } catch (error) {
      console.error('Failed to create A/B test:', error)
      setIsCreating(false)
    }
  }

  if (createdTestId) {
    return (
      <DataPanel className="p-8">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-status-success mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-text-primary mb-2">A/B Test Created!</h3>
          <p className="text-text-secondary mb-6">
            Your test is now running and collecting data.
          </p>
          <div className="flex gap-3 justify-center">
            <CommandButton onClick={() => onSuccess?.(createdTestId)}>
              VIEW TEST RESULTS
            </CommandButton>
            <CommandButton variant="secondary" onClick={onCancel}>
              CREATE ANOTHER
            </CommandButton>
          </div>
        </div>
      </DataPanel>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Test Details */}
      <DataPanel className="p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Test Details</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-tertiary uppercase mb-2">
              Test Name *
            </label>
            <CommandInput
              {...register('name')}
              placeholder="e.g., Headline Optimization Test"
              className={errors.name ? 'border-status-error' : ''}
            />
            {errors.name && (
              <p className="text-status-error text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-tertiary uppercase mb-2">
              Description (Optional)
            </label>
            <CommandTextarea
              {...register('description')}
              placeholder="What are you testing and why?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-tertiary uppercase mb-2">
                Target Audience (Optional)
              </label>
              <CommandInput
                {...register('targetAudience')}
                placeholder="e.g., Tech professionals"
              />
            </div>

            <div>
              <label className="block text-sm text-text-tertiary uppercase mb-2">
                Duration (Days) *
              </label>
              <CommandInput
                type="number"
                {...register('duration', { valueAsNumber: true })}
                min={1}
                max={30}
                className={errors.duration ? 'border-status-error' : ''}
              />
              {errors.duration && (
                <p className="text-status-error text-xs mt-1">{errors.duration.message}</p>
              )}
            </div>
          </div>
        </div>
      </DataPanel>

      {/* Success Metric */}
      <DataPanel className="p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Success Metric</h3>
        <p className="text-sm text-text-tertiary mb-4">
          Choose which metric to optimize for
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {METRICS.map((metric) => {
            const Icon = metric.icon
            const isSelected = selectedMetric === metric.value

            return (
              <button
                key={metric.value}
                type="button"
                onClick={() => setValue('metric', metric.value as any)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  'hover:border-border-emphasis',
                  isSelected
                    ? 'border-neon-cyan bg-neon-cyan/10'
                    : 'border-border'
                )}
              >
                <Icon className="w-5 h-5 text-text-primary mb-2" />
                <h4 className="font-semibold text-text-primary text-sm mb-1">
                  {metric.label}
                </h4>
                <p className="text-xs text-text-tertiary">{metric.description}</p>
              </button>
            )
          })}
        </div>
        {errors.metric && (
          <p className="text-status-error text-xs mt-2">{errors.metric.message}</p>
        )}
      </DataPanel>

      {/* Variants */}
      <DataPanel className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Test Variants</h3>
            <p className="text-sm text-text-tertiary">Define the versions you want to test</p>
          </div>
          <CommandButton
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleAddVariant}
            disabled={variants.length >= 5}
          >
            <Plus className="w-4 h-4 mr-1" />
            ADD VARIANT
          </CommandButton>
        </div>

        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="p-4 bg-bg-secondary rounded-lg border border-border"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={index === 0 ? 'default' : 'outline'}>
                        {index === 0 ? 'CONTROL' : `TEST ${index}`}
                      </Badge>
                      {index === 0 && (
                        <span className="text-xs text-text-tertiary">
                          (Original version)
                        </span>
                      )}
                    </div>
                    <CommandInput
                      {...register(`variants.${index}.name`)}
                      placeholder="Variant name"
                      className={errors.variants?.[index]?.name ? 'border-status-error' : ''}
                    />
                  </div>
                  <CommandTextarea
                    {...register(`variants.${index}.description`)}
                    placeholder="What's different in this variant?"
                    rows={2}
                  />
                </div>
                {index > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="p-2 hover:bg-bg-hover rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-text-tertiary" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {errors.variants && typeof errors.variants === 'object' && 'message' in errors.variants && (
          <p className="text-status-error text-xs mt-2">{String(errors.variants.message)}</p>
        )}
      </DataPanel>

      {/* Test Summary */}
      <DataPanel className="p-6 bg-neon-cyan/10 border-neon-cyan">
        <h4 className="font-bold text-text-primary mb-3">Test Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-text-tertiary mb-1">Variants</p>
            <p className="font-bold text-text-primary">{variants.length}</p>
          </div>
          <div>
            <p className="text-text-tertiary mb-1">Duration</p>
            <p className="font-bold text-text-primary">{watch('duration')} days</p>
          </div>
          <div>
            <p className="text-text-tertiary mb-1">Metric</p>
            <p className="font-bold text-text-primary capitalize">{selectedMetric}</p>
          </div>
          <div>
            <p className="text-text-tertiary mb-1">Sample Size</p>
            <p className="font-bold text-text-primary">Auto-calculated</p>
          </div>
        </div>
      </DataPanel>

      {/* Actions */}
      <div className="flex gap-3">
        <CommandButton
          type="submit"
          disabled={isCreating}
          className="flex-1"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              CREATING TEST...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              CREATE A/B TEST
            </>
          )}
        </CommandButton>
        <CommandButton
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isCreating}
        >
          CANCEL
        </CommandButton>
      </div>
    </form>
  )
}
