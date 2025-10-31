'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProfile, useProfileStats } from '@/lib/hooks/useProfile';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandPanel, DataPanel } from '@/components/command/CommandPanel';
import { StatusBadge } from '@/components/command/StatusBadge';
import { MetricDisplay } from '@/components/command/MetricDisplay';
import {
  Activity,
  Target,
  Globe,
  Zap,
  FileText,
  Share2,
  BarChart3,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * PROFILE OVERVIEW PAGE
 *
 * Main dashboard for a single marketing profile.
 * Shows key metrics, profile info, and navigation to sub-pages.
 */

export default function ProfileOverviewPage() {
  const params = useParams();
  const profileId = params.id as string;

  const { data: profile, isLoading, error } = useProfile(profileId);
  const { data: stats } = useProfileStats(profileId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-text-tertiary text-sm font-mono uppercase">
            LOADING PROFILE
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <CommandPanel variant="magenta">
        <h3 className="font-bold">PROFILE NOT FOUND</h3>
        <p className="text-text-secondary text-sm mt-2">
          The requested profile could not be found.
        </p>
        <Link href="/profiles" className="mt-4 inline-block">
          <CommandButton variant="ghost">BACK TO PROFILES</CommandButton>
        </Link>
      </CommandPanel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/profiles"
        className="inline-flex items-center gap-2 text-text-tertiary hover:text-neon-cyan transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO PROFILES
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{profile.brandName}</h1>
            <StatusBadge status={profile.status} showPulse={profile.status === 'active'} />
          </div>
          <p className="text-text-tertiary">{profile.description || 'No description'}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-tertiary">
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {profile.industry} • {profile.niche}
            </div>
            <span>•</span>
            <span>Updated {formatDistanceToNow(new Date(profile.updatedAt), { addSuffix: true })}</span>
          </div>
        </div>
        <CommandButton>
          <Settings className="w-4 h-4" />
          SETTINGS
        </CommandButton>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricDisplay
          label="TOTAL CAMPAIGNS"
          value={stats?.totalCampaigns || 0}
          trend="+0"
          trendDirection="neutral"
          icon={Zap}
        />
        <MetricDisplay
          label="CONTENT CREATED"
          value={stats?.totalContent || 0}
          trend="+0"
          trendDirection="neutral"
          icon={FileText}
          variant="green"
        />
        <MetricDisplay
          label="TOTAL REACH"
          value={stats?.totalReach || 0}
          trend="+0%"
          trendDirection="neutral"
          icon={BarChart3}
          variant="purple"
        />
        <MetricDisplay
          label="ENGAGEMENT RATE"
          value={`${stats?.avgEngagementRate || 0}%`}
          trend="+0%"
          trendDirection="neutral"
          icon={Activity}
          variant="magenta"
        />
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-2 gap-6">
        {/* Brand Voice & Values */}
        <CommandPanel>
          <h3 className="text-sm text-text-tertiary uppercase mb-4">BRAND IDENTITY</h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-text-tertiary mb-1">BRAND VOICE</div>
              <div className="text-text-primary font-medium">{profile.brandVoice}</div>
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-2">BRAND VALUES</div>
              <div className="flex flex-wrap gap-2">
                {profile.brandValues?.map((value, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-bg-tertiary border border-neon-cyan text-xs"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CommandPanel>

        {/* Target Audience */}
        <CommandPanel variant="green">
          <h3 className="text-sm text-text-tertiary uppercase mb-4">TARGET AUDIENCE</h3>
          <p className="text-text-secondary text-sm">{profile.targetAudience}</p>
        </CommandPanel>

        {/* Goals */}
        <CommandPanel variant="magenta">
          <h3 className="text-sm text-text-tertiary uppercase mb-4">MARKETING GOALS</h3>
          <div className="space-y-2">
            <div className="text-xs text-text-tertiary mb-2">
              PRIMARY: <span className="text-text-primary capitalize">{profile.primaryObjective?.replace('-', ' ')}</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {profile.goals?.map((goal, idx) => (
                <li key={idx} className="text-sm text-text-secondary">{goal}</li>
              ))}
            </ul>
          </div>
        </CommandPanel>

        {/* Quick Stats */}
        <DataPanel>
          <h3 className="text-sm text-text-tertiary uppercase mb-4">PROFILE STATS</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-text-tertiary mb-1">COMPLETENESS</div>
              <div className="text-2xl font-bold font-mono text-neon-cyan">
                {stats?.completenessScore || 0}%
              </div>
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-1">PLATFORMS</div>
              <div className="text-2xl font-bold font-mono">
                {stats?.connectedPlatformsCount || 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-1">ACTIVE CAMPAIGNS</div>
              <div className="text-2xl font-bold font-mono text-neon-green">
                {stats?.activeCampaigns || 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-1">PUBLISHED</div>
              <div className="text-2xl font-bold font-mono">
                {stats?.totalPublished || 0}
              </div>
            </div>
          </div>
        </DataPanel>
      </div>

      {/* Quick Actions */}
      <DataPanel>
        <h3 className="text-sm text-text-tertiary uppercase mb-4">QUICK ACTIONS</h3>
        <div className="grid grid-cols-4 gap-4">
          <Link href={`/profiles/${profileId}/connections`}>
            <CommandButton variant="ghost" className="w-full">
              <Share2 className="w-4 h-4" />
              CONNECT PLATFORMS
            </CommandButton>
          </Link>
          <Link href={`/profiles/${profileId}/strategy`}>
            <CommandButton variant="ghost" className="w-full">
              <Target className="w-4 h-4" />
              VIEW STRATEGY
            </CommandButton>
          </Link>
          <Link href={`/profiles/${profileId}/campaigns/new`}>
            <CommandButton className="w-full">
              <Zap className="w-4 h-4" />
              LAUNCH CAMPAIGN
            </CommandButton>
          </Link>
          <Link href={`/profiles/${profileId}/analytics`}>
            <CommandButton variant="ghost" className="w-full">
              <BarChart3 className="w-4 h-4" />
              VIEW ANALYTICS
            </CommandButton>
          </Link>
        </div>
      </DataPanel>
    </div>
  );
}
