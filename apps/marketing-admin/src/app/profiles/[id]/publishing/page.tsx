'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/lib/hooks/useProfile';
import { usePublishingStats, usePublishingQueue, useCancelScheduledPost } from '@/lib/hooks/usePublishing';
import { CommandButton } from '@/components/command/CommandButton';
import { DataPanel } from '@/components/command/CommandPanel';
import { StatusBadge } from '@/components/command/StatusBadge';
import { DataTable } from '@/components/command/DataTable';
import { ArrowLeft, Send, Calendar, Eye, Trash, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

/**
 * PUBLISHING QUEUE PAGE
 *
 * Manage scheduled and published content across all platforms.
 * NOW WITH REAL DATA from backend API.
 */

export default function PublishingPage() {
  const params = useParams();
  const profileId = params.id as string;
  const { data: profile } = useProfile(profileId);

  // Fetch real data
  const { data: stats, isLoading: statsLoading } = usePublishingStats(profileId);
  const { data: queue, isLoading: queueLoading } = usePublishingQueue(profileId);
  const cancelPost = useCancelScheduledPost(profileId);

  const handleCancelPost = async (postId: string) => {
    if (confirm('Are you sure you want to cancel this scheduled post?')) {
      await cancelPost.mutateAsync(postId);
    }
  };

  const scheduledCount = stats?.scheduledCount || 0;
  const publishedCount = stats?.publishedToday || 0;
  const inQueue = stats?.inQueue || queue?.length || 0;

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Publishing Queue
          </h1>
          <p className="text-text-tertiary">
            Manage scheduled and published content for {profile?.brandName || 'this profile'}
          </p>
        </div>
        <CommandButton variant="primary">
          <Send className="w-4 h-4" />
          Publish Now
        </CommandButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <DataPanel elevated>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs text-text-tertiary uppercase">SCHEDULED</div>
              <div className="text-2xl font-bold font-mono tabular-nums">
                {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : scheduledCount}
              </div>
            </div>
          </div>
        </DataPanel>
        <DataPanel elevated>
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-accent-success" />
            <div>
              <div className="text-xs text-text-tertiary uppercase">PUBLISHED TODAY</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-accent-success">
                {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : publishedCount}
              </div>
            </div>
          </div>
        </DataPanel>
        <DataPanel elevated>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <div>
              <div className="text-xs text-text-tertiary uppercase">IN QUEUE</div>
              <div className="text-2xl font-bold font-mono tabular-nums">
                {statsLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : inQueue}
              </div>
            </div>
          </div>
        </DataPanel>
      </div>

      {/* Queue Table */}
      {queueLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : queue && queue.length > 0 ? (
        <DataTable
          columns={[
            {
              key: 'title',
              header: 'CONTENT',
              render: (row) => (
                <div>
                  <div className="font-medium">{row.title || 'Untitled'}</div>
                  <div className="text-xs text-text-tertiary">{row.platform}</div>
                </div>
              ),
            },
            {
              key: 'scheduledFor',
              header: 'SCHEDULED FOR',
              render: (row) => (
                <div className="font-mono text-sm">
                  {row.scheduledFor ? format(new Date(row.scheduledFor), 'MMM dd, yyyy HH:mm') : '-'}
                </div>
              ),
            },
            {
              key: 'status',
              header: 'STATUS',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'actions',
              header: 'ACTIONS',
              render: (row) => (
                <div className="flex gap-2">
                  {row.externalUrl && (
                    <a
                      href={row.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-bg-elevated transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  {(row.status === 'scheduled' || row.status === 'failed') && (
                    <button
                      onClick={() => handleCancelPost(row.id)}
                      disabled={cancelPost.isPending}
                      className="p-2 hover:bg-bg-elevated transition-colors text-accent-error disabled:opacity-50"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          data={queue}
        />
      ) : (
        <div className="text-center py-12">
          <div className="text-text-tertiary mb-4">
            <Send className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No scheduled or published posts yet.</p>
            <p className="text-sm mt-2">Content will appear here once you start publishing.</p>
          </div>
        </div>
      )}
    </div>
  );
}
