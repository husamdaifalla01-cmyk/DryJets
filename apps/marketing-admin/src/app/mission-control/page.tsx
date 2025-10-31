'use client';

import React from 'react';
import { CommandPanel, DataPanel } from '@/components/command/CommandPanel';
import { MetricDisplay } from '@/components/command/MetricDisplay';
import { StatusBadge } from '@/components/command/StatusBadge';
import { Zap, Activity, FileText, BarChart3, TrendingUp } from 'lucide-react';

/**
 * MISSION CONTROL DASHBOARD
 *
 * Real-time monitoring of all active campaigns across all profiles.
 * Central command center for autonomous marketing operations.
 */

const mockCampaigns = [
  { id: '1', name: 'Product Launch', profile: 'SaaS Marketing', status: 'generating', progress: 45, platforms: 3 },
  { id: '2', name: 'Thought Leadership', profile: 'Personal Brand', status: 'active', progress: 78, platforms: 5 },
  { id: '3', name: 'Case Study Series', profile: 'Agency Portfolio', status: 'active', progress: 92, platforms: 4 },
];

const mockActivity = [
  { timestamp: '2 min ago', message: 'Published 3 posts to LinkedIn for Campaign "Product Launch"' },
  { timestamp: '8 min ago', message: 'Generated 15 social media posts from blog content' },
  { timestamp: '15 min ago', message: 'Analyzed competitor landscape for "SaaS Marketing" profile' },
  { timestamp: '23 min ago', message: 'Connected Instagram account for "Personal Brand" profile' },
];

export default function MissionControlPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient-cyan mb-2">
          MISSION CONTROL
        </h1>
        <p className="text-text-tertiary">
          Real-time campaign monitoring and autonomous execution
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricDisplay
          label="ACTIVE CAMPAIGNS"
          value={mockCampaigns.length}
          icon={Zap}
          trend="+2"
          trendDirection="positive"
        />
        <MetricDisplay
          label="TOTAL REACH (30D)"
          value="2.5M"
          icon={BarChart3}
          trend="+24.7%"
          trendDirection="positive"
          variant="green"
        />
        <MetricDisplay
          label="CONTENT PUBLISHED"
          value="487"
          icon={FileText}
          trend="+156"
          trendDirection="positive"
          variant="purple"
        />
        <MetricDisplay
          label="AVG ENGAGEMENT"
          value="5.8%"
          icon={Activity}
          trend="+1.2%"
          trendDirection="positive"
          variant="magenta"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Active Campaigns */}
        <div className="col-span-8 space-y-4">
          <h2 className="text-xl font-bold">ACTIVE CAMPAIGNS</h2>
          {mockCampaigns.map((campaign) => (
            <DataPanel key={campaign.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold">{campaign.name}</h3>
                  <p className="text-text-tertiary text-sm">{campaign.profile}</p>
                </div>
                <StatusBadge status={campaign.status} showPulse />
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-tertiary">PROGRESS</span>
                  <span className="text-neon-cyan font-mono">{campaign.progress}%</span>
                </div>
                <div className="h-2 bg-bg-elevated">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-green transition-all"
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-text-tertiary">Platforms:</span>
                  <span className="ml-2 font-mono">{campaign.platforms}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Status:</span>
                  <span className="ml-2 capitalize">{campaign.status}</span>
                </div>
              </div>
            </DataPanel>
          ))}
        </div>

        {/* Live Activity Feed */}
        <div className="col-span-4">
          <CommandPanel>
            <h3 className="text-sm text-text-tertiary uppercase mb-4">LIVE ACTIVITY</h3>
            <div className="space-y-3">
              {mockActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 animate-slide-down">
                  <div className="w-2 h-2 mt-2 bg-neon-cyan rounded-full animate-glow-pulse" />
                  <div>
                    <p className="text-sm">{activity.message}</p>
                    <span className="text-xs text-text-tertiary font-mono">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CommandPanel>

          {/* Quick Stats */}
          <DataPanel className="mt-4">
            <h3 className="text-sm text-text-tertiary uppercase mb-4">SYSTEM STATUS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">API Health:</span>
                <span className="text-neon-green">OPERATIONAL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Queue Status:</span>
                <span className="text-neon-cyan">12 PENDING</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">AI Models:</span>
                <span className="text-neon-green">ONLINE</span>
              </div>
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
