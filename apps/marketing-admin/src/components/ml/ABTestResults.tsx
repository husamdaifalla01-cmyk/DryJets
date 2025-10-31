/**
 * A/B TEST RESULTS
 *
 * Display A/B test results with statistical significance analysis.
 * Shows winner, confidence level, and detailed metrics comparison.
 */

'use client'

import { DataPanel } from '@/components/command/CommandPanel'
import { Badge } from '@/components/ui/badge'
import { CommandButton } from '@/components/command/CommandButton'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Share2,
  MousePointerClick,
  Target,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ABTestVariant {
  id: string
  name: string
  description?: string
  metrics: {
    views: number
    engagement: number
    shares: number
    clicks: number
    conversions: number
  }
  sampleSize: number
  conversionRate: number
}

interface ABTestResults {
  id: string
  name: string
  status: 'running' | 'completed' | 'paused'
  metric: string
  variants: ABTestVariant[]
  winnerId?: string
  statisticalSignificance: number // 0-1
  confidence: number // 0-1
  startDate: Date
  endDate: Date
  totalImpressions: number
}

interface ABTestResultsProps {
  test: ABTestResults
  onStopTest?: () => void
  onExport?: () => void
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const getComparisonColor = (current: number, baseline: number): string => {
  if (current > baseline) return 'text-status-success'
  if (current < baseline) return 'text-status-error'
  return 'text-text-tertiary'
}

const getComparisonIcon = (current: number, baseline: number) => {
  if (current > baseline) return TrendingUp
  if (current < baseline) return TrendingDown
  return Target
}

const calculatePercentageChange = (current: number, baseline: number): string => {
  const change = ((current - baseline) / baseline) * 100
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
}

export function ABTestResults({ test, onStopTest, onExport }: ABTestResultsProps) {
  const baselineVariant = test.variants[0] // Control is always first
  const winner = test.variants.find((v) => v.id === test.winnerId)
  const hasWinner = test.statisticalSignificance >= 0.95

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <DataPanel className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-text-primary">{test.name}</h2>
              <Badge variant={test.status === 'completed' ? 'default' : 'outline'}>
                {test.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-text-secondary mb-4">
              Testing: <span className="font-semibold capitalize">{test.metric}</span>
            </p>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-text-tertiary">Started</p>
                <p className="font-semibold text-text-primary">
                  {test.startDate.toLocaleDateString()}
                </p>
              </div>
              {test.endDate && (
                <div>
                  <p className="text-text-tertiary">Ended</p>
                  <p className="font-semibold text-text-primary">
                    {test.endDate.toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-text-tertiary">Total Impressions</p>
                <p className="font-semibold text-text-primary">
                  {formatNumber(test.totalImpressions)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {test.status === 'running' && (
              <CommandButton variant="secondary" onClick={onStopTest}>
                STOP TEST
              </CommandButton>
            )}
            <CommandButton variant="secondary" onClick={onExport}>
              EXPORT RESULTS
            </CommandButton>
          </div>
        </div>
      </DataPanel>

      {/* Statistical Significance */}
      <DataPanel
        className={cn(
          'p-6',
          hasWinner ? 'border-status-success bg-status-success/5' : 'border-neon-yellow bg-neon-yellow/5'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasWinner ? (
              <CheckCircle2 className="w-8 h-8 text-status-success" />
            ) : (
              <AlertCircle className="w-8 h-8 text-neon-yellow" />
            )}
            <div>
              <h3 className="font-bold text-text-primary text-lg mb-1">
                {hasWinner ? 'Statistical Significance Achieved!' : 'Test Still Running'}
              </h3>
              <p className="text-text-secondary text-sm">
                {hasWinner
                  ? `With ${Math.round(test.confidence * 100)}% confidence, we have a clear winner.`
                  : `Current significance: ${Math.round(test.statisticalSignificance * 100)}% (need 95%)`}
              </p>
            </div>
          </div>
          {hasWinner && winner && (
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-neon-yellow" />
              <div className="text-right">
                <p className="text-sm text-text-tertiary">Winner</p>
                <p className="font-bold text-text-primary">{winner.name}</p>
              </div>
            </div>
          )}
        </div>
      </DataPanel>

      {/* Variants Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {test.variants.map((variant, index) => {
          const isControl = index === 0
          const isWinner = variant.id === test.winnerId
          const ComparisonIcon = getComparisonIcon(
            variant.metrics.engagement,
            baselineVariant.metrics.engagement
          )

          return (
            <DataPanel
              key={variant.id}
              className={cn(
                'p-6',
                isWinner && hasWinner && 'border-status-success border-2',
                isControl && 'bg-bg-secondary'
              )}
            >
              {/* Variant Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-text-primary text-lg">{variant.name}</h3>
                    {isControl && <Badge variant="outline">CONTROL</Badge>}
                    {isWinner && hasWinner && (
                      <Badge variant="default" className="bg-status-success">
                        <Trophy className="w-3 h-3 mr-1" />
                        WINNER
                      </Badge>
                    )}
                  </div>
                  {variant.description && (
                    <p className="text-sm text-text-tertiary">{variant.description}</p>
                  )}
                </div>
              </div>

              {/* Sample Size */}
              <div className="mb-4">
                <p className="text-xs text-text-tertiary uppercase mb-1">Sample Size</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatNumber(variant.sampleSize)}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-bg-base rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">Views</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-text-primary">
                      {formatNumber(variant.metrics.views)}
                    </p>
                    {!isControl && (
                      <p
                        className={cn(
                          'text-xs',
                          getComparisonColor(variant.metrics.views, baselineVariant.metrics.views)
                        )}
                      >
                        {calculatePercentageChange(variant.metrics.views, baselineVariant.metrics.views)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-bg-base rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">Engagement</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-text-primary">
                      {variant.metrics.engagement}%
                    </p>
                    {!isControl && (
                      <p
                        className={cn(
                          'text-xs',
                          getComparisonColor(variant.metrics.engagement, baselineVariant.metrics.engagement)
                        )}
                      >
                        {calculatePercentageChange(
                          variant.metrics.engagement,
                          baselineVariant.metrics.engagement
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-bg-base rounded-lg">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">Shares</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-text-primary">
                      {formatNumber(variant.metrics.shares)}
                    </p>
                    {!isControl && (
                      <p
                        className={cn(
                          'text-xs',
                          getComparisonColor(variant.metrics.shares, baselineVariant.metrics.shares)
                        )}
                      >
                        {calculatePercentageChange(variant.metrics.shares, baselineVariant.metrics.shares)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-bg-base rounded-lg">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">Clicks</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-text-primary">
                      {formatNumber(variant.metrics.clicks)}
                    </p>
                    {!isControl && (
                      <p
                        className={cn(
                          'text-xs',
                          getComparisonColor(variant.metrics.clicks, baselineVariant.metrics.clicks)
                        )}
                      >
                        {calculatePercentageChange(variant.metrics.clicks, baselineVariant.metrics.clicks)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Conversion Rate</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-text-primary">
                      {variant.conversionRate}%
                    </p>
                    {!isControl && (
                      <p
                        className={cn(
                          'text-xs flex items-center gap-1 justify-end',
                          getComparisonColor(variant.conversionRate, baselineVariant.conversionRate)
                        )}
                      >
                        <ComparisonIcon className="w-3 h-3" />
                        {calculatePercentageChange(variant.conversionRate, baselineVariant.conversionRate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DataPanel>
          )
        })}
      </div>

      {/* Recommendations */}
      {hasWinner && winner && (
        <DataPanel className="p-6 bg-status-success/10 border-status-success">
          <h3 className="font-bold text-text-primary mb-3">Recommendations</h3>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">
              ✓ <strong className="text-text-primary">{winner.name}</strong> performed{' '}
              {calculatePercentageChange(winner.conversionRate, baselineVariant.conversionRate)} better
              than the control
            </p>
            <p className="text-sm text-text-secondary">
              ✓ Consider making this the new default for all future content
            </p>
            <p className="text-sm text-text-secondary">
              ✓ Test additional variations to further optimize performance
            </p>
          </div>
        </DataPanel>
      )}
    </div>
  )
}
