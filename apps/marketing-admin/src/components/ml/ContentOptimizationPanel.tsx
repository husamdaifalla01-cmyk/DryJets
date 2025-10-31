/**
 * CONTENT OPTIMIZATION PANEL
 *
 * Real-time content optimization suggestions and scoring.
 * Provides SEO, readability, and engagement recommendations.
 */

'use client'

import { useMemo } from 'react'
import { DataPanel } from '@/components/command/CommandPanel'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  FileText,
  Eye,
  Search,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptimizationScore {
  overall: number // 0-100
  seo: number
  readability: number
  engagement: number
}

interface Optimization {
  type: 'critical' | 'warning' | 'suggestion' | 'success'
  category: 'seo' | 'readability' | 'engagement' | 'general'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

interface ContentOptimizationPanelProps {
  content: {
    title?: string
    body?: string
    excerpt?: string
    keywords?: string[]
    targetPlatforms?: string[]
  }
  compact?: boolean
}

/**
 * Analyze content and generate optimizations
 */
const analyzeContent = (content: ContentOptimizationPanelProps['content']): {
  score: OptimizationScore
  optimizations: Optimization[]
} => {
  const optimizations: Optimization[] = []
  const wordCount = content.body?.split(/\s+/).length || 0
  const titleLength = content.title?.length || 0
  const hasKeywords = (content.keywords?.length || 0) > 0
  const excerptLength = content.excerpt?.length || 0

  // SEO Score calculation
  let seoScore = 50
  if (titleLength >= 30 && titleLength <= 60) seoScore += 20
  if (hasKeywords) seoScore += 15
  if (excerptLength >= 120 && excerptLength <= 160) seoScore += 15

  // Readability Score
  let readabilityScore = 60
  if (wordCount >= 300 && wordCount <= 2000) readabilityScore += 20
  if (content.body && content.body.includes('\n\n')) readabilityScore += 10
  if (content.body && (content.body.match(/#{1,3} /g)?.length || 0) > 0) readabilityScore += 10

  // Engagement Score
  let engagementScore = 55
  if (content.title && content.title.match(/[0-9]/)) engagementScore += 15
  if (content.title && (content.title.includes('?') || content.title.includes('!'))) engagementScore += 10
  if (wordCount >= 800) engagementScore += 10
  if (content.targetPlatforms && content.targetPlatforms.length > 1) engagementScore += 10

  // Generate optimizations

  // Title optimizations
  if (titleLength < 30) {
    optimizations.push({
      type: 'warning',
      category: 'seo',
      title: 'Title Too Short',
      description: `Your title is ${titleLength} characters. Aim for 30-60 characters for better SEO.`,
      impact: 'high',
    })
  } else if (titleLength > 60) {
    optimizations.push({
      type: 'warning',
      category: 'seo',
      title: 'Title Too Long',
      description: `Your title is ${titleLength} characters. Keep it under 60 for optimal display.`,
      impact: 'medium',
    })
  } else {
    optimizations.push({
      type: 'success',
      category: 'seo',
      title: 'Title Length Perfect',
      description: `Your title is ${titleLength} characters - ideal for SEO!`,
      impact: 'high',
    })
  }

  // Keywords
  if (!hasKeywords) {
    optimizations.push({
      type: 'critical',
      category: 'seo',
      title: 'Missing Keywords',
      description: 'Add 3-5 target keywords to improve discoverability.',
      impact: 'high',
    })
  } else {
    optimizations.push({
      type: 'success',
      category: 'seo',
      title: 'Keywords Added',
      description: `${content.keywords!.length} keywords defined.`,
      impact: 'high',
    })
  }

  // Excerpt/Meta Description
  if (excerptLength === 0) {
    optimizations.push({
      type: 'critical',
      category: 'seo',
      title: 'Missing Excerpt',
      description: 'Add a meta description (120-160 characters) to improve SEO.',
      impact: 'high',
    })
  } else if (excerptLength < 120) {
    optimizations.push({
      type: 'warning',
      category: 'seo',
      title: 'Excerpt Too Short',
      description: `Your excerpt is ${excerptLength} characters. Aim for 120-160.`,
      impact: 'medium',
    })
  } else if (excerptLength > 160) {
    optimizations.push({
      type: 'suggestion',
      category: 'seo',
      title: 'Excerpt Too Long',
      description: `Your excerpt is ${excerptLength} characters. Shorten to 120-160.`,
      impact: 'low',
    })
  }

  // Word count
  if (wordCount < 300) {
    optimizations.push({
      type: 'warning',
      category: 'readability',
      title: 'Content Too Short',
      description: `Add more content. Current: ${wordCount} words. Recommended: 800-2000 words.`,
      impact: 'high',
    })
  } else if (wordCount > 2000) {
    optimizations.push({
      type: 'suggestion',
      category: 'readability',
      title: 'Consider Breaking Up',
      description: `Your content is ${wordCount} words. Consider splitting into multiple posts.`,
      impact: 'low',
    })
  } else {
    optimizations.push({
      type: 'success',
      category: 'readability',
      title: 'Good Content Length',
      description: `${wordCount} words is a good length for engagement.`,
      impact: 'medium',
    })
  }

  // Engagement elements
  if (content.title && !content.title.match(/[0-9]/)) {
    optimizations.push({
      type: 'suggestion',
      category: 'engagement',
      title: 'Add Numbers to Title',
      description: 'Titles with numbers get 36% more clicks (e.g., "5 Ways", "10 Tips").',
      impact: 'medium',
    })
  }

  if (content.title && !content.title.includes('?') && !content.title.includes('!')) {
    optimizations.push({
      type: 'suggestion',
      category: 'engagement',
      title: 'Make Title More Engaging',
      description: 'Consider using a question or exclamation for more engagement.',
      impact: 'low',
    })
  }

  const overallScore = Math.round((seoScore + readabilityScore + engagementScore) / 3)

  return {
    score: {
      overall: overallScore,
      seo: seoScore,
      readability: readabilityScore,
      engagement: engagementScore,
    },
    optimizations,
  }
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-status-success'
  if (score >= 60) return 'text-neon-cyan'
  if (score >= 40) return 'text-neon-yellow'
  return 'text-status-error'
}

const getOptimizationIcon = (type: Optimization['type']) => {
  switch (type) {
    case 'critical': return AlertCircle
    case 'warning': return AlertTriangle
    case 'suggestion': return Sparkles
    case 'success': return CheckCircle2
  }
}

const getOptimizationColor = (type: Optimization['type']) => {
  switch (type) {
    case 'critical': return 'border-status-error text-status-error'
    case 'warning': return 'border-neon-yellow text-neon-yellow'
    case 'suggestion': return 'border-neon-cyan text-neon-cyan'
    case 'success': return 'border-status-success text-status-success'
  }
}

const getCategoryIcon = (category: Optimization['category']) => {
  switch (category) {
    case 'seo': return Search
    case 'readability': return FileText
    case 'engagement': return MessageSquare
    default: return Eye
  }
}

export function ContentOptimizationPanel({ content, compact = false }: ContentOptimizationPanelProps) {
  const { score, optimizations } = useMemo(() => analyzeContent(content), [
    content.title,
    content.body,
    content.excerpt,
    content.keywords?.length,
    content.targetPlatforms?.length,
  ])

  const criticalCount = optimizations.filter((o) => o.type === 'critical').length
  const warningCount = optimizations.filter((o) => o.type === 'warning').length

  if (compact) {
    return (
      <DataPanel className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('text-3xl font-bold', getScoreColor(score.overall))}>
              {score.overall}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Optimization Score</p>
              <p className="text-xs text-text-tertiary">
                {criticalCount} critical, {warningCount} warnings
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="text-text-tertiary">SEO: {score.seo}</p>
            <p className="text-text-tertiary">Readability: {score.readability}</p>
            <p className="text-text-tertiary">Engagement: {score.engagement}</p>
          </div>
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
              <h3 className="text-lg font-bold text-text-primary">Content Optimization</h3>
              <p className="text-sm text-text-tertiary">Real-time analysis and recommendations</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <div className={cn('text-6xl font-bold mb-2', getScoreColor(score.overall))}>
              {score.overall}
            </div>
            <p className="text-text-secondary">Overall Score</p>
          </div>
        </div>

        {/* Category Scores */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-bg-secondary rounded-lg">
            <Search className="w-5 h-5 text-text-tertiary mx-auto mb-2" />
            <p className={cn('text-2xl font-bold', getScoreColor(score.seo))}>{score.seo}</p>
            <p className="text-xs text-text-tertiary">SEO</p>
          </div>
          <div className="text-center p-3 bg-bg-secondary rounded-lg">
            <FileText className="w-5 h-5 text-text-tertiary mx-auto mb-2" />
            <p className={cn('text-2xl font-bold', getScoreColor(score.readability))}>
              {score.readability}
            </p>
            <p className="text-xs text-text-tertiary">Readability</p>
          </div>
          <div className="text-center p-3 bg-bg-secondary rounded-lg">
            <TrendingUp className="w-5 h-5 text-text-tertiary mx-auto mb-2" />
            <p className={cn('text-2xl font-bold', getScoreColor(score.engagement))}>
              {score.engagement}
            </p>
            <p className="text-xs text-text-tertiary">Engagement</p>
          </div>
        </div>
      </DataPanel>

      {/* Optimizations List */}
      <DataPanel className="p-6">
        <h4 className="font-bold text-text-primary mb-4">Recommendations</h4>
        <div className="space-y-3">
          {optimizations.map((opt, index) => {
            const Icon = getOptimizationIcon(opt.type)
            const CategoryIcon = getCategoryIcon(opt.category)

            return (
              <div
                key={index}
                className={cn('p-4 rounded-lg border', getOptimizationColor(opt.type), 'bg-opacity-10')}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-text-primary">{opt.title}</h5>
                        <Badge variant="outline" className="text-xs">
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {opt.category.toUpperCase()}
                        </Badge>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          opt.impact === 'high' && 'border-status-error',
                          opt.impact === 'medium' && 'border-neon-yellow',
                          opt.impact === 'low' && 'border-text-tertiary'
                        )}
                      >
                        {opt.impact.toUpperCase()} IMPACT
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary">{opt.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </DataPanel>
    </div>
  )
}
