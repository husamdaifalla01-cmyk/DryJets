'use client'

import { FileText, BarChart3, Zap, Megaphone, TrendingUp } from 'lucide-react'

interface StatCard {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendColor?: 'positive' | 'negative'
}

const stats: StatCard[] = [
  {
    label: 'Blog Posts',
    value: '12',
    icon: <FileText className="w-6 h-6" />,
    trend: '+3 this week',
    trendColor: 'positive',
  },
  {
    label: 'Active Campaigns',
    value: '4',
    icon: <Megaphone className="w-6 h-6" />,
    trend: '2 pending',
    trendColor: 'positive',
  },
  {
    label: 'Content Assets',
    value: '48',
    icon: <Zap className="w-6 h-6" />,
    trend: '+12 repurposed',
    trendColor: 'positive',
  },
  {
    label: 'Avg. Engagement',
    value: '3.2%',
    icon: <BarChart3 className="w-6 h-6" />,
    trend: '+0.5% vs last week',
    trendColor: 'positive',
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              {stat.icon}
            </div>
            {stat.trend && (
              <div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  stat.trendColor === 'positive'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
          <p className="text-3xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
