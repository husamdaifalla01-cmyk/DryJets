'use client'

import { DashboardHeader } from '@/components/dashboard/header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Marketing Dashboard"
        description="Manage your AI-powered marketing campaigns and content"
      />

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
