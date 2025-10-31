import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

/**
 * METRIC DISPLAY
 *
 * Large metric display component for dashboards and analytics.
 * Features monospace numbers, labels, trends, and optional icons.
 */

export interface MetricDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'cyan' | 'green' | 'magenta' | 'purple';
}

export const MetricDisplay = React.forwardRef<HTMLDivElement, MetricDisplayProps>(
  (
    {
      className,
      label,
      value,
      trend,
      trendDirection = 'neutral',
      subtitle,
      icon: Icon,
      variant = 'cyan',
      ...props
    },
    ref
  ) => {
    const borderColors = {
      cyan: 'border-neon-cyan',
      green: 'border-neon-green',
      magenta: 'border-neon-magenta',
      purple: 'border-neon-purple',
    };

    const trendClasses = {
      positive: 'metric-trend-positive',
      negative: 'metric-trend-negative',
      neutral: 'text-text-tertiary',
    };

    return (
      <div
        ref={ref}
        className={cn('metric-display', borderColors[variant], className)}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className="metric-label">{label}</span>
          {Icon && <Icon className="w-4 h-4 text-neon-cyan" />}
        </div>
        <span className="metric-value">{value}</span>
        {trend && (
          <span className={cn('metric-trend', trendClasses[trendDirection])}>
            {trend}
          </span>
        )}
        {subtitle && (
          <span className="text-text-tertiary text-xs mt-1">{subtitle}</span>
        )}
      </div>
    );
  }
);

MetricDisplay.displayName = 'MetricDisplay';

/**
 * COMPACT METRIC
 *
 * Smaller inline metric display for cards and grids.
 */
export interface CompactMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
}

export const CompactMetric = React.forwardRef<HTMLDivElement, CompactMetricProps>(
  ({ className, label, value, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col gap-1', className)} {...props}>
        <span className="text-text-tertiary text-xs uppercase tracking-wide">
          {label}
        </span>
        <span className="text-text-primary text-lg font-bold font-mono tabular-nums">
          {value}
        </span>
      </div>
    );
  }
);

CompactMetric.displayName = 'CompactMetric';

export default MetricDisplay;
