/**
 * Badge Component v2.0
 * "Precision OS" Design System
 *
 * Features:
 * - Subtle backgrounds (no loud colors)
 * - Clean, minimal design
 * - Two sizes for flexibility
 * - Semantic color variants
 *
 * Philosophy: Use sparingly, not every status needs a badge
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded font-medium transition-colors',
    'whitespace-nowrap',
  ].join(' '),
  {
    variants: {
      variant: {
        // Default: Neutral gray
        default: [
          'bg-[#F3F4F6] text-[#374151]',
          'dark:bg-[#2A2A2D] dark:text-[#A1A1A6]',
        ].join(' '),

        // Primary: Blue
        primary: [
          'bg-[#EFF6FF] text-[#0066FF]',
          'dark:bg-[#0066FF]/10 dark:text-[#60A5FA]',
        ].join(' '),

        // Success: Green
        success: [
          'bg-[#ECFDF5] text-[#00A86B]',
          'dark:bg-[#00A86B]/10 dark:text-[#34D399]',
        ].join(' '),

        // Warning: Amber
        warning: [
          'bg-[#FFF7ED] text-[#FF9500]',
          'dark:bg-[#FF9500]/10 dark:text-[#FB923C]',
        ].join(' '),

        // Danger/Error: Red
        danger: [
          'bg-[#FEF2F2] text-[#FF3B30]',
          'dark:bg-[#FF3B30]/10 dark:text-[#F87171]',
        ].join(' '),

        // Outline: Border only
        outline: [
          'border border-[#E5E7EB] bg-transparent text-[#6B7280]',
          'dark:border-[#2A2A2D] dark:text-[#A1A1A6]',
        ].join(' '),

        // Accent: Indigo (premium features)
        accent: [
          'bg-[#EEF2FF] text-[#6366F1]',
          'dark:bg-[#6366F1]/10 dark:text-[#A5B4FC]',
        ].join(' '),
      },
      size: {
        sm: 'h-5 px-2.5 text-xs', // 20px height, 12px text
        md: 'h-6 px-3 text-[13px]', // 24px height, 13px text
      },
      pill: {
        true: 'rounded-full',
      },
      dot: {
        true: 'pl-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      pill: false,
      dot: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Show status dot before text */
  showDot?: boolean;
  /** Custom dot color (overrides variant color) */
  dotColor?: string;
}

function Badge({
  className,
  variant,
  size,
  pill,
  dot,
  showDot,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  // Determine dot color based on variant
  const defaultDotColor = {
    default: '#9CA3AF',
    primary: '#0066FF',
    success: '#00A86B',
    warning: '#FF9500',
    danger: '#FF3B30',
    outline: '#6B7280',
    accent: '#6366F1',
  }[variant || 'default'];

  const finalDotColor = dotColor || defaultDotColor;

  return (
    <div
      className={cn(badgeVariants({ variant, size, pill, dot: showDot || dot, className }))}
      {...props}
    >
      {(showDot || dot) && (
        <span
          className={cn(
            'inline-block rounded-full mr-1.5',
            size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'
          )}
          style={{ backgroundColor: finalDotColor }}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
