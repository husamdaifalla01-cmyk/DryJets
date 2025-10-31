import React from 'react';
import { cn } from '@/lib/utils';

/**
 * STATUS BADGE
 *
 * Status indicator with color-coded borders and glow effects.
 * Includes optional pulse dot for active states.
 *
 * Status types:
 * - active: Green (running campaigns, connected platforms)
 * - paused: Yellow (paused campaigns)
 * - failed: Magenta (failed operations)
 * - generating: Cyan (AI generation in progress)
 * - completed: Green (finished operations)
 */

export type BadgeStatus =
  | 'active'
  | 'paused'
  | 'failed'
  | 'generating'
  | 'completed'
  | 'pending'
  | 'scheduled'
  | 'published';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: BadgeStatus;
  showPulse?: boolean;
  children?: React.ReactNode;
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, showPulse = false, children, ...props }, ref) => {
    const statusConfig = {
      active: {
        className: 'badge-active',
        label: 'ACTIVE',
        pulseClass: 'pulse-dot-green',
      },
      paused: {
        className: 'badge-paused',
        label: 'PAUSED',
        pulseClass: 'bg-status-paused',
      },
      failed: {
        className: 'badge-failed',
        label: 'FAILED',
        pulseClass: 'bg-status-failed',
      },
      generating: {
        className: 'badge-generating',
        label: 'GENERATING',
        pulseClass: 'pulse-dot',
      },
      completed: {
        className: 'badge-active',
        label: 'COMPLETED',
        pulseClass: 'pulse-dot-green',
      },
      pending: {
        className: 'badge-status border-border-emphasis text-text-tertiary',
        label: 'PENDING',
        pulseClass: 'bg-text-tertiary',
      },
      scheduled: {
        className: 'badge-generating',
        label: 'SCHEDULED',
        pulseClass: 'pulse-dot',
      },
      published: {
        className: 'badge-active',
        label: 'PUBLISHED',
        pulseClass: 'pulse-dot-green',
      },
    };

    const config = statusConfig[status];

    return (
      <span
        ref={ref}
        className={cn('badge-status', config.className, className)}
        {...props}
      >
        {showPulse && (
          <span className={cn('w-2 h-2 rounded-full animate-pulse', config.pulseClass)} />
        )}
        {children || config.label}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
