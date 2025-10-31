/**
 * PREDICTION WIDGET
 *
 * Displays AI-powered performance predictions for content before publishing.
 * Shows predicted metrics, confidence score, and optimization recommendations.
 */

'use client'

import { useState, useEffect } from 'react'
import { DataPanel } from '@/components/command/CommandPanel'
import { Badge } from '@/components/ui/badge'
import { CommandButton } from '@/components/command/CommandButton'
import {
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MousePointerClick,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Content } from '@/lib/api/content'

export interface ContentPrediction {
  contentId: string
  predictedViews: number
  predictedEngagement: number
  predictedShares: number
  predictedClicks: number
  confidence: number // 0-1
  score: number // 0-100
  factors: PredictionFactor[]
  recommendations: Recommendation[]
  optimalPublishTime: Date
  competitorComparison: {
    betterThan: number // percentage
    averageViews: number
  }
}

interface PredictionFactor {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  score: number
  description: string
}

interface Recommendation {
  type: 'critical' | 'important' | 'suggestion'
  title: string
  description: string
  expectedImpact: string // e.g., "+15% engagement"
}

interface PredictionWidgetProps {
  content: Partial<Content>
  onRefresh?: () => void
  compact?: boolean
}

/**
 * Mock prediction service - replace with real API
 */
const generateMockPrediction = (content: Partial<Content>): ContentPrediction => {
  const baseViews = 5000 + Math.random() * 10000
  const baseEngagement = 5 + Math.random() * 15

  return {
    contentId: content.id || 'temp',
    predictedViews: Math.round(baseViews),
    predictedEngagement: Number(baseEngagement.toFixed(1)),
    predictedShares: Math.round(baseViews * 0.02),
    predictedClicks: Math.round(baseViews * 0.15),
    confidence: 0.75 + Math.random() * 0.2,
    score: Math.round(60 + Math.random() * 30),
    factors: [
      {
        name: 'Title Length',
        impact: content.title && content.title.length < 60 ? 'positive' : 'negative',
        score: content.title ? Math.min(100, (60 / content.title.length) * 100) : 50,
        description: content.title && content.title.length < 60
          ? 'Title length is optimal for engagement'
          : 'Title is too long, consider shortening to under 60 characters',
      },
      {
        name: 'Content Length',
        impact: 'positive',
        score: 85,
        description: 'Content length is suitable for the target platform',
      },
      {
        name: 'Publishing Time',
        impact: 'neutral',
        score: 70,
        description: 'Scheduled for moderate engagement time',
      },
      {
        name: 'Topic Relevance',
        impact: 'positive',
        score: 90,
        description: 'Topic aligns well with audience interests',
      },
    ],
    recommendations: [
      {
        type: 'critical',
        title: 'Optimize Title',
        description: 'Shorten title to 50-60 characters for better click-through rates',
        expectedImpact: '+23% CTR',
      },
      {
        type: 'important',
        title: 'Add Visual Content',
        description: 'Include 2-3 images or graphics to increase engagement',
        expectedImpact: '+18% engagement',
      },
      {
        type: 'suggestion',
        title: 'Optimal Posting Time',
        description: 'Post at 10:00 AM for 15% higher engagement',
        expectedImpact: '+15% engagement',
      },
    ],
    optimalPublishTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow 10 AM
    competitorComparison: {
      betterThan: 65,
      averageViews: 8500,
    },
  }
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-status-success'
  if (score >= 60) return 'text-neon-cyan'
  if (score >= 40) return 'text-neon-yellow'
  return 'text-status-error'
}

const getRecommendationIcon = (type: Recommendation['type']) => {
  switch (type) {
    case 'critical':
      return AlertCircle
    case 'important':
      return TrendingUp
    case 'suggestion':
      return Sparkles
  }
}

const getRecommendationColor = (type: Recommendation['type']) => {
  switch (type) {
    case 'critical':
      return 'border-status-error bg-status-error/10'
    case 'important':
      return 'border-neon-yellow bg-neon-yellow/10'
    case 'suggestion':
      return 'border-neon-cyan bg-neon-cyan/10'
  }
}

export function PredictionWidget({ content, onRefresh, compact = false }: PredictionWidgetProps) {
  const [prediction, setPrediction] = useState<ContentPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setIsLoading(true)
    const timer = setTimeout(() => {
      const mockPrediction = generateMockPrediction(content)
      setPrediction(mockPrediction)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [content.title, content.body, content.targetPlatforms])

  if (isLoading) {
    return (
      <DataPanel className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-neon-cyan mx-auto mb-3" />
            <p className="text-text-secondary text-sm">Analyzing content...</p>
          </div>
        </div>
      </DataPanel>
    )
  }

  if (!prediction) return null

  if (compact) {
    return (
      <DataPanel className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('text-3xl font-bold', getScoreColor(prediction.score))}>
              {prediction.score}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Performance Score</p>
              <p className="text-xs text-text-tertiary">
                {Math.round(prediction.confidence * 100)}% confidence
              </p>
            </div>
          </div>
          <CommandButton size="sm" variant="secondary" onClick={onRefresh}>
            <Sparkles className="w-4 h-4 mr-1" />
            REFRESH
          </CommandButton>
        </div>
      </DataPanel>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <DataPanel className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-neon-cyan" />
            <div>
              <h3 className="text-lg font-bold text-text-primary">Performance Prediction</h3>
              <p className="text-sm text-text-tertiary">
                AI-powered insights based on historical data
              </p>
            </div>
          </div>
          <CommandButton size="sm" variant="secondary" onClick={onRefresh}>
            REFRESH
          </CommandButton>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <div className={cn('text-6xl font-bold mb-2', getScoreColor(prediction.score))}>
              {prediction.score}
            </div>
            <p className="text-text-secondary">Performance Score</p>
            <Badge variant="outline" className="mt-2">
              {Math.round(prediction.confidence * 100)}% Confidence
            </Badge>
          </div>
        </div>

        {/* Predicted Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-bg-secondary rounded-lg">
            <Eye className="w-5 h-5 text-text-tertiary mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">
              {formatNumber(prediction.predictedViews)}
            </p>
            <p className="text-xs text-text-tertiary">Views</p>
          </div>
          <div className="text-center p-3 bg-bg-secondary rounded-lg">
            <Heart className="w-5 h-5 text-text-tertiary mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">
              {prediction.predictedEngagement}%
            </p>
            <p className="text-xs text-text-tertiary">Engagement</p>
          </div>
          <div className="text-center p-3 bg-bg-secondary rounded-lg">
            <Share2 className="w-5 h-5 text-text-tertiary mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">
              {formatNumber(prediction.predictedShares)}
            </p>
            <p className="text-xs text-text-tertiary">Shares</p>
          </div>
          <div className="text-center p-3 bg-bg-secondary rounded-lg">
            <MousePointerClick className="w-5 h-5 text-text-tertiary mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">
              {formatNumber(prediction.predictedClicks)}
            </p>
            <p className="text-xs text-text-tertiary">Clicks</p>
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="bg-neon-cyan/10 border border-neon-cyan rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Predicted to perform better than{' '}
            <span className="font-bold text-neon-cyan">
              {prediction.competitorComparison.betterThan}%
            </span>{' '}
            of similar content
          </p>
        </div>
      </DataPanel>

      {/* Key Factors */}
      <DataPanel className="p-6">
        <h4 className="font-bold text-text-primary mb-4">Key Factors</h4>
        <div className="space-y-3">
          {prediction.factors.map((factor, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {factor.impact === 'positive' && (
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                  )}
                  {factor.impact === 'negative' && (
                    <AlertCircle className="w-4 h-4 text-status-error" />
                  )}
                  {factor.impact === 'neutral' && (
                    <Clock className="w-4 h-4 text-text-tertiary" />
                  )}
                  <span className="font-semibold text-text-primary text-sm">{factor.name}</span>
                </div>
                <p className="text-xs text-text-tertiary">{factor.description}</p>
              </div>
              <div className="text-right ml-4">
                <p className={cn('text-lg font-bold', getScoreColor(factor.score))}>
                  {factor.score}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DataPanel>

      {/* Recommendations */}
      <DataPanel className="p-6">
        <h4 className="font-bold text-text-primary mb-4">Recommendations</h4>
        <div className="space-y-3">
          {prediction.recommendations.map((rec, index) => {
            const Icon = getRecommendationIcon(rec.type)
            return (
              <div
                key={index}
                className={cn('p-4 rounded-lg border', getRecommendationColor(rec.type))}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-text-primary">{rec.title}</h5>
                      <Badge variant="outline" className="text-xs">
                        {rec.expectedImpact}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary">{rec.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </DataPanel>

      {/* Optimal Time */}
      <DataPanel className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon-cyan" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Optimal Publishing Time</p>
              <p className="text-xs text-text-tertiary">
                {prediction.optimalPublishTime.toLocaleString()}
              </p>
            </div>
          </div>
          <Badge variant="default" className="bg-neon-cyan">
            +15% engagement
          </Badge>
        </div>
      </DataPanel>
    </div>
  )
}
