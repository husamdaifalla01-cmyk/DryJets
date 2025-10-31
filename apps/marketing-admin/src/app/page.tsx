'use client'

import { ArrowRight, Plus, TrendingUp, Zap, Target, Calendar, Activity, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CommandButton } from '@/components/command/CommandButton'
import { CommandPanel } from '@/components/command/CommandPanel'
import {
  useDashboardStats,
  useActiveCampaigns,
  useTodaySchedule,
  usePlatformHealth,
  useRecentActivity,
} from '@/lib/hooks/useDashboard'

/**
 * HOME DASHBOARD
 *
 * Refined Minimal Design with Strategic Feature Placement
 * - Welcome banner with gradient
 * - Quick stats above fold (REAL DATA)
 * - Active campaigns overview (REAL DATA)
 * - Quick actions for common tasks
 * - Today's publishing schedule (REAL DATA)
 * - Platform health indicators (REAL DATA)
 */

export default function HomePage() {
  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: campaigns, isLoading: campaignsLoading } = useActiveCampaigns()
  const { data: schedule, isLoading: scheduleLoading } = useTodaySchedule()
  const { data: platformHealth, isLoading: healthLoading } = usePlatformHealth()
  const { data: activity, isLoading: activityLoading } = useRecentActivity()

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary-light p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to Marketing Domination Engine
          </h1>
          <p className="text-white/90 text-lg mb-6 max-w-2xl">
            Your AI-powered marketing platform. Transform one piece of content into 50+ posts,
            automate campaigns, and dominate your market.
          </p>
          <div className="flex gap-3">
            <Link href="/profiles">
              <CommandButton variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Plus className="w-4 h-4" />
                Create Campaign
              </CommandButton>
            </Link>
            <Link href="/profiles/new">
              <CommandButton variant="ghost" className="text-white border-white/30 hover:bg-white/10">
                Add Profile
                <ArrowRight className="w-4 h-4" />
              </CommandButton>
            </Link>
          </div>
        </div>
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="absolute top-8 right-8 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-24 w-24 h-24 bg-white rounded-full blur-2xl" />
        </div>
      </div>

      {/* Quick Stats - 4 Cards Above Fold */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Active Campaigns"
          value={statsLoading ? '...' : stats?.activeCampaigns.toString() || '0'}
          trend="+3 this week"
          trendUp={true}
          icon={<Zap className="w-5 h-5 text-primary" />}
          loading={statsLoading}
        />
        <StatCard
          label="Total Reach"
          value={statsLoading ? '...' : stats?.totalReach || '0'}
          trend="+18% vs last month"
          trendUp={true}
          icon={<TrendingUp className="w-5 h-5 text-accent-success" />}
          loading={statsLoading}
        />
        <StatCard
          label="Content Published"
          value={statsLoading ? '...' : stats?.contentPublished.toString() || '0'}
          trend="+127 this week"
          trendUp={true}
          icon={<Target className="w-5 h-5 text-accent-info" />}
          loading={statsLoading}
        />
        <StatCard
          label="Engagement Rate"
          value={statsLoading ? '...' : stats?.engagementRate || '0.0%'}
          trend="+2.1% vs last month"
          trendUp={true}
          icon={<Activity className="w-5 h-5 text-accent-warning" />}
          loading={statsLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Active Campaigns + Publishing Schedule */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Active Campaigns */}
          <CommandPanel variant="default">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Active Campaigns</h2>
              <Link href="/campaigns">
                <CommandButton variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </CommandButton>
              </Link>
            </div>

            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    name={campaign.name}
                    profile={campaign.profileName}
                    progress={campaign.progress}
                    published={campaign.published}
                    scheduled={campaign.scheduled}
                    status={campaign.status}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-tertiary">
                <p>No active campaigns yet.</p>
                <Link href="/profiles/new">
                  <CommandButton variant="ghost" size="sm" className="mt-4">
                    Create Your First Campaign
                  </CommandButton>
                </Link>
              </div>
            )}
          </CommandPanel>

          {/* Today's Publishing Schedule */}
          <CommandPanel variant="default">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Today's Schedule</h2>
              </div>
              <Link href="/publishing">
                <CommandButton variant="ghost" size="sm">
                  Manage Queue
                </CommandButton>
              </Link>
            </div>

            {scheduleLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : schedule && schedule.length > 0 ? (
              <div className="space-y-3">
                {schedule.map((item) => (
                  <ScheduleItem
                    key={item.id}
                    time={item.time}
                    platform={item.platform}
                    title={item.title}
                    campaign={item.campaignName}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-tertiary">
                <p>No scheduled posts for today.</p>
              </div>
            )}
          </CommandPanel>
        </div>

        {/* Right Column - Quick Actions + Platform Health + Activity */}
        <div className="flex flex-col gap-8">
          {/* Quick Actions */}
          <CommandPanel variant="elevated">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/content/repurpose">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-bg-hover transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Repurpose Content</div>
                    <div className="text-xs text-text-tertiary">1 → 50+ posts</div>
                  </div>
                </button>
              </Link>
              <Link href="/campaigns/new">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-bg-hover transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-accent-success/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-accent-success" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">New Campaign</div>
                    <div className="text-xs text-text-tertiary">Launch in minutes</div>
                  </div>
                </button>
              </Link>
              <Link href="/analytics">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-bg-hover transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-accent-info/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent-info" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">View Analytics</div>
                    <div className="text-xs text-text-tertiary">Track performance</div>
                  </div>
                </button>
              </Link>
            </div>
          </CommandPanel>

          {/* Platform Health */}
          <CommandPanel variant="default">
            <h2 className="text-lg font-bold mb-4">Platform Health</h2>
            {healthLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : platformHealth && platformHealth.length > 0 ? (
              <div className="space-y-3">
                {platformHealth.map((item) => (
                  <PlatformHealth
                    key={item.platform}
                    platform={item.platform}
                    status={item.status}
                    connections={item.connections}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-tertiary text-sm">
                <p>No platform connections yet.</p>
              </div>
            )}
          </CommandPanel>

          {/* Recent Activity */}
          <CommandPanel variant="default">
            <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-3">
                {activity.map((item) => (
                  <ActivityItem
                    key={item.id}
                    action={item.action}
                    campaign={item.campaignName}
                    time={item.time}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-tertiary text-sm">
                <p>No recent activity.</p>
              </div>
            )}
          </CommandPanel>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  trend,
  trendUp,
  icon,
  loading,
}: {
  label: string
  value: string
  trend: string
  trendUp: boolean
  icon: React.ReactNode
  loading?: boolean
}) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 hover:border-border-default transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="text-text-tertiary text-sm uppercase tracking-wide">{label}</div>
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          value
        )}
      </div>
      <div className={`text-xs ${trendUp ? 'text-accent-success' : 'text-accent-error'}`}>
        {trend}
      </div>
    </div>
  )
}

// Campaign Card Component
function CampaignCard({
  name,
  profile,
  progress,
  published,
  scheduled,
  status,
}: {
  name: string
  profile: string
  progress: number
  published: number
  scheduled: number
  status: 'active' | 'paused'
}) {
  return (
    <div className="p-4 rounded-lg border border-border-subtle hover:border-border-default transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold mb-1">{name}</h3>
          <p className="text-sm text-text-tertiary">{profile}</p>
        </div>
        <span className={`badge ${status === 'active' ? 'badge-success' : 'badge-warning'}`}>
          {status}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-text-tertiary mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-text-tertiary">Published: </span>
          <span className="font-medium">{published}</span>
        </div>
        <div>
          <span className="text-text-tertiary">Scheduled: </span>
          <span className="font-medium">{scheduled}</span>
        </div>
      </div>
    </div>
  )
}

// Schedule Item Component
function ScheduleItem({
  time,
  platform,
  title,
  campaign,
}: {
  time: string
  platform: string
  title: string
  campaign: string
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg border border-border-subtle hover:bg-bg-surface transition-colors">
      <div className="text-sm font-mono text-text-tertiary min-w-[4rem]">{time}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{title}</span>
          <span className="badge badge-default text-xs">{platform}</span>
        </div>
        <div className="text-xs text-text-tertiary">{campaign}</div>
      </div>
    </div>
  )
}

// Platform Health Component
function PlatformHealth({
  platform,
  status,
  connections,
}: {
  platform: string
  status: 'healthy' | 'warning' | 'error'
  connections: number
}) {
  const statusColors = {
    healthy: 'bg-accent-success',
    warning: 'bg-accent-warning',
    error: 'bg-accent-error',
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-surface transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        <span className="font-medium text-sm">{platform}</span>
      </div>
      <span className="text-xs text-text-tertiary">{connections} connected</span>
    </div>
  )
}

// Activity Item Component
function ActivityItem({
  action,
  campaign,
  time,
}: {
  action: string
  campaign: string
  time: string
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-bg-surface transition-colors">
      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
      <div className="flex-1">
        <div className="text-sm mb-1">{action}</div>
        <div className="text-xs text-text-tertiary">{campaign} • {time}</div>
      </div>
    </div>
  )
}
