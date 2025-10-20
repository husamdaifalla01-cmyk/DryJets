'use client';

/**
 * SyncStatusIndicator - Visual indicator for sync status
 *
 * Shows a colored dot with optional tooltip for item sync status:
 * - 🟡 Yellow: PENDING (not yet synced)
 * - 🔵 Blue pulsing: SYNCING (currently syncing)
 * - 🟢 Green: SYNCED (successfully synced)
 * - 🔴 Red: FAILED (sync failed)
 */

import React from 'react';
import { cn } from '../../../apps/web-merchant/src/lib/utils';
import { SyncStatus } from '../../storage';

export interface SyncStatusIndicatorProps {
  /** Sync status */
  status: SyncStatus | string;
  /** Show label text (default: false) */
  showLabel?: boolean;
  /** Custom size (default: md) */
  size?: 'sm' | 'md' | 'lg';
  /** Last synced timestamp (for tooltip) */
  lastSyncedAt?: Date | null;
  /** Error message (for tooltip) */
  syncError?: string | null;
  /** Retry count */
  syncRetries?: number;
}

export function SyncStatusIndicator({
  status,
  showLabel = false,
  size = 'md',
  lastSyncedAt,
  syncError,
  syncRetries = 0,
}: SyncStatusIndicatorProps) {
  // Size classes
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  // Status config
  const statusConfig = {
    [SyncStatus.PENDING]: {
      color: 'bg-warning-500',
      label: 'Pending',
      description: 'Waiting to sync',
      icon: '🟡',
      animate: false,
    },
    [SyncStatus.SYNCING]: {
      color: 'bg-primary-500',
      label: 'Syncing',
      description: 'Currently syncing...',
      icon: '🔵',
      animate: true,
    },
    [SyncStatus.SYNCED]: {
      color: 'bg-success-500',
      label: 'Synced',
      description: lastSyncedAt
        ? `Synced ${formatTimeSince(lastSyncedAt)}`
        : 'Successfully synced',
      icon: '🟢',
      animate: false,
    },
    [SyncStatus.FAILED]: {
      color: 'bg-danger-500',
      label: 'Failed',
      description: syncError || `Sync failed (${syncRetries} retries)`,
      icon: '🔴',
      animate: false,
    },
  };

  const config = statusConfig[status as SyncStatus] || statusConfig[SyncStatus.PENDING];

  return (
    <div className="inline-flex items-center gap-2" title={config.description}>
      {/* Dot indicator */}
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            'rounded-full',
            sizeClasses[size],
            config.color,
            config.animate && 'animate-pulse'
          )}
        />
        {/* Outer ring for syncing */}
        {config.animate && (
          <div
            className={cn(
              'absolute rounded-full border-2',
              config.color.replace('bg-', 'border-'),
              'opacity-30 animate-ping',
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-5 h-5',
              size === 'lg' && 'w-6 h-6'
            )}
          />
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <span
          className={cn(
            'font-medium',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base',
            config.color.replace('bg-', 'text-')
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}

/**
 * Format time since last sync
 */
function formatTimeSince(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 0) return `${seconds}s ago`;
  return 'just now';
}