/**
 * CONTENT PERFORMANCE WIDGET
 *
 * Dashboard widget showing content performance metrics.
 * Displays views, engagement, conversions for recent content.
 */

'use client'

import { DataPanel } from '@/components/command/CommandPanel'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Eye, Heart, Share2, MousePointerClick } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContentMetrics {
  id: string
  title: string
  type: 'blog' | 'social-post' | 'video-script' | 'email'
  platform: string
  views: number
  engagement: number
  shares: number
  clicks: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  publishedAt: string
}

interface ContentPerformanceWidgetProps {
  profileId?: string
  limit?: number
}

// Mock data - replace with actual API call
const MOCK_METRICS: ContentMetrics[] = [
  {
    id: '1',
    title: '10 Marketing Automation Tips',
    type: 'blog',
    platform: 'Medium',
    views: 12500,
    engagement: 8.5,
    shares: 234,
    clicks: 1420,
    trend: 'up',
    trendPercentage: 23,
    publishedAt: '2025-10-28',
  },
  {
    id: '2',
    title: 'How to Build Your First Campaign',
    type: 'social-post',
    platform: 'LinkedIn',
    views: 8900,
    engagement: 12.3,
    shares: 145,
    clicks: 892,
    trend: 'up',
    trendPercentage: 45,
    publishedAt: '2025-10-29',
  },
  {
    id: '3',
    title: 'Weekly Marketing Newsletter',
    type: 'email',
    platform: 'Email',
    views: 5400,
    engagement: 24.5,
    shares: 67,
    clicks: 1320,
    trend: 'down',
    trendPercentage: 12,
    publishedAt: '2025-10-30',
  },
  {
    id: '4',
    title: 'Content Strategy Framework',
    type: 'blog',
    platform: 'Substack',
    views: 4200,
    engagement: 15.8,
    shares: 89,
    clicks: 665,
    trend: 'stable',
    trendPercentage: 2,
    publishedAt: '2025-10-27',
  },
]

const TYPE_COLORS = {
  blog: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan',
  'social-post': 'bg-neon-pink/20 text-neon-pink border-neon-pink',
  'video-script': 'bg-neon-purple/20 text-neon-purple border-neon-purple',
  email: 'bg-neon-green/20 text-neon-green border-neon-green',
}

export function ContentPerformanceWidget({
  profileId: _profileId,
  limit = 5,
}: ContentPerformanceWidgetProps) {
  // TODO: Replace with actual API call
  const metrics = MOCK_METRICS.slice(0, limit)

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <DataPanel className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Content Performance</h3>
          <p className="text-sm text-text-tertiary">Top performing content from the last 7 days</p>
        </div>
        <Badge variant="secondary">
          {metrics.length} items
        </Badge>
      </div>

      <div className="space-y-4">
        {metrics.map((item, index) => (
          <div
            key={item.id}
            className="p-4 rounded-lg border border-border hover:border-border-emphasis transition-all cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-text-tertiary text-xs font-bold">#{index + 1}</span>
                  <Badge className={cn('text-xs border', TYPE_COLORS[item.type])}>
                    {item.type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {item.platform}
                  </Badge>
                </div>
                <h4 className="font-semibold text-text-primary truncate">{item.title}</h4>
              </div>

              {/* Trend Badge */}
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-xs font-bold',
                  item.trend === 'up' && 'bg-status-success/20 text-status-success',
                  item.trend === 'down' && 'bg-status-error/20 text-status-error',
                  item.trend === 'stable' && 'bg-bg-secondary text-text-tertiary'
                )}
              >
                {item.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {item.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {item.trendPercentage > 0 && `${item.trendPercentage}%`}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-text-tertiary" />
                <div>
                  <p className="text-xs text-text-tertiary">Views</p>
                  <p className="font-bold text-text-primary">{formatNumber(item.views)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-text-tertiary" />
                <div>
                  <p className="text-xs text-text-tertiary">Engagement</p>
                  <p className="font-bold text-text-primary">{item.engagement}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-text-tertiary" />
                <div>
                  <p className="text-xs text-text-tertiary">Shares</p>
                  <p className="font-bold text-text-primary">{formatNumber(item.shares)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-text-tertiary" />
                <div>
                  <p className="text-xs text-text-tertiary">Clicks</p>
                  <p className="font-bold text-text-primary">{formatNumber(item.clicks)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">
            {formatNumber(metrics.reduce((sum, m) => sum + m.views, 0))}
          </p>
          <p className="text-xs text-text-tertiary uppercase">Total Views</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">
            {(metrics.reduce((sum, m) => sum + m.engagement, 0) / metrics.length).toFixed(1)}%
          </p>
          <p className="text-xs text-text-tertiary uppercase">Avg Engagement</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">
            {formatNumber(metrics.reduce((sum, m) => sum + m.shares, 0))}
          </p>
          <p className="text-xs text-text-tertiary uppercase">Total Shares</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">
            {formatNumber(metrics.reduce((sum, m) => sum + m.clicks, 0))}
          </p>
          <p className="text-xs text-text-tertiary uppercase">Total Clicks</p>
        </div>
      </div>
    </DataPanel>
  )
}
