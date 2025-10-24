'use client'

import { formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Activity {
  id: string
  type: 'blog_generated' | 'campaign_created' | 'content_repurposed' | 'post_published'
  title: string
  agent: string
  timestamp: Date
  status: 'success' | 'pending' | 'processing'
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'blog_generated',
    title: 'Generated "5 Tips for Dry Cleaning at Home"',
    agent: 'Mira',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: 'success',
  },
  {
    id: '2',
    type: 'content_repurposed',
    title: 'Repurposed blog to 5 social media variations',
    agent: 'Leo',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'success',
  },
  {
    id: '3',
    type: 'campaign_created',
    title: 'Created awareness campaign for Ottawa market',
    agent: 'Ava',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    status: 'success',
  },
  {
    id: '4',
    type: 'blog_generated',
    title: 'Generating "Best Laundry Services in Toronto"...',
    agent: 'Mira',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    status: 'processing',
  },
]

const getStatusColor = (status: Activity['status']) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
  }
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'blog_generated':
      return '📝'
    case 'campaign_created':
      return '🚀'
    case 'content_repurposed':
      return '♻️'
    case 'post_published':
      return '✨'
  }
}

export function RecentActivity() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
          >
            <div className="text-2xl flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{activity.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {activity.agent}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(activity.timestamp)}
                </span>
              </div>
            </div>
            <Badge className={`flex-shrink-0 text-xs ${getStatusColor(activity.status)}`}>
              {activity.status === 'processing' ? '⏳ Processing' : '✓ Success'}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
