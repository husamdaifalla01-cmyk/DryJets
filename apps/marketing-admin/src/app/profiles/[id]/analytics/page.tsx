'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/lib/hooks/useProfile';
import { usePerformanceStats, usePlatformAnalytics, useTopContent } from '@/lib/hooks/useAnalytics';
import { DataPanel } from '@/components/command/CommandPanel';
import { MetricDisplay } from '@/components/command/MetricDisplay';
import { DataTable } from '@/components/command/DataTable';
import { ArrowLeft, TrendingUp, Users, Heart, MousePointer, Loader2 } from 'lucide-react';

/**
 * ANALYTICS DASHBOARD
 *
 * Cross-platform performance analytics and insights.
 * NOW WITH REAL DATA from backend API.
 */

export default function AnalyticsPage() {
  const params = useParams();
  const profileId = params.id as string;
  const { data: profile } = useProfile(profileId);

  // Fetch real data
  const { data: stats, isLoading: statsLoading } = usePerformanceStats(profileId);
  const { data: platforms, isLoading: platformsLoading } = usePlatformAnalytics(profileId);
  const { data: topContent, isLoading: topContentLoading } = useTopContent(profileId, 10);

  const totalReach = stats?.totalReach || 0;
  const totalEngagement = stats?.totalEngagements || 0;
  const avgRate = stats?.engagementRate || 0;
  const conversions = stats?.conversions || 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href={`/profiles/${profileId}`}
        className="inline-flex items-center gap-2 text-text-tertiary hover:text-primary transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-text-tertiary">
          Cross-platform performance metrics for {profile?.brandName || 'this profile'}
        </p>
      </div>

      {/* Key Metrics */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <MetricDisplay
            label="TOTAL REACH"
            value={totalReach.toLocaleString()}
            icon={Users}
            trend={stats?.trends?.reach || '+0%'}
            trendDirection="positive"
          />
          <MetricDisplay
            label="ENGAGEMENT"
            value={totalEngagement.toLocaleString()}
            icon={Heart}
            trend={stats?.trends?.engagements || '+0%'}
            trendDirection="positive"
            variant="green"
          />
          <MetricDisplay
            label="ENGAGEMENT RATE"
            value={`${avgRate.toFixed(1)}%`}
            icon={TrendingUp}
            trend={stats?.trends?.engagementRate || '+0%'}
            trendDirection="positive"
            variant="purple"
          />
          <MetricDisplay
            label="CONVERSIONS"
            value={conversions.toLocaleString()}
            icon={MousePointer}
            trend={stats?.trends?.conversions || '+0%'}
            trendDirection="positive"
            variant="magenta"
          />
        </div>
      )}

      {/* Platform Performance */}
      <div>
        <h2 className="text-xl font-bold mb-4">Platform Performance</h2>
        {platformsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : platforms && platforms.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {platforms.map((platform, idx) => (
              <DataPanel key={idx}>
                <h3 className="font-bold text-lg mb-4">{platform.platform}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-text-tertiary uppercase mb-1">Reach</div>
                    <div className="text-xl font-mono font-bold">{platform.reach.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary uppercase mb-1">Engagement</div>
                    <div className="text-xl font-mono font-bold text-primary">{platform.engagement.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary uppercase mb-1">Rate</div>
                    <div className="text-xl font-mono font-bold text-accent-success">{platform.rate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary uppercase mb-1">Posts</div>
                    <div className="text-xl font-mono font-bold">{platform.posts}</div>
                  </div>
                </div>
              </DataPanel>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-tertiary">
            <p>No platform data available yet.</p>
          </div>
        )}
      </div>

      {/* Top Content */}
      <div>
        <h2 className="text-xl font-bold mb-4">Top Performing Content</h2>
        {topContentLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : topContent && topContent.length > 0 ? (
          <DataTable
            columns={[
              { key: 'title', header: 'TITLE' },
              { key: 'platform', header: 'PLATFORM' },
              {
                key: 'reach',
                header: 'REACH',
                render: (row) => <span className="font-mono">{row.reach.toLocaleString()}</span>,
              },
              {
                key: 'engagement',
                header: 'ENGAGEMENT',
                render: (row) => <span className="font-mono text-primary">{row.engagement.toLocaleString()}</span>,
              },
              {
                key: 'roi',
                header: 'ROI',
                render: (row) => <span className="font-mono text-accent-success">+{row.roi}%</span>,
              },
            ]}
            data={topContent}
          />
        ) : (
          <div className="text-center py-12 text-text-tertiary">
            <p>No content performance data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
