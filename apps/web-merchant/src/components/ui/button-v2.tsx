/**
 * Button Component v2.0
 * "Precision OS" Design System
 *
 * Features:
 * - Clean, minimal design (no gradients)
 * - Precise sizing and spacing
 * - Smooth micro-interactions
 * - Full keyboard accessibility
 * - Loading and disabled states
 *
 * Philosophy: Enterprise-grade polish, not flashy
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles (applies to all variants)
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'rounded-md font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary: Solid blue, white text
        primary: [
          'bg-[#0066FF] text-white shadow-sm',
          'hover:bg-[#0052CC] hover:shadow-md hover:-translate-y-0.5',
          'active:bg-[#003D99] active:translate-y-0 active:shadow-sm',
          'focus-visible:ring-[#0066FF]/30',
        ].join(' '),

        // Secondary: Transparent with blue border
        secondary: [
          'border border-[#0066FF] bg-transparent text-[#0066FF]',
          'hover:bg-[#0066FF]/5 hover:border-[#0052CC]',
          'active:bg-[#0066FF]/10',
          'focus-visible:ring-[#0066FF]/30',
        ].join(' '),

        // Ghost: Transparent background
        ghost: [
          'text-[#6B7280] bg-transparent',
          'hover:bg-[#F3F4F6] hover:text-[#111827]',
          'active:bg-[#E5E7EB]',
          'focus-visible:ring-gray-300',
        ].join(' '),

        // Danger: Solid red
        danger: [
          'bg-[#FF3B30] text-white shadow-sm',
          'hover:bg-[#CC2F26] hover:shadow-md hover:-translate-y-0.5',
          'active:bg-[#99231D] active:translate-y-0 active:shadow-sm',
          'focus-visible:ring-[#FF3B30]/30',
        ].join(' '),

        // Success: Solid green
        success: [
          'bg-[#00A86B] text-white shadow-sm',
          'hover:bg-[#008656] hover:shadow-md hover:-translate-y-0.5',
          'active:bg-[#006441] active:translate-y-0 active:shadow-sm',
          'focus-visible:ring-[#00A86B]/30',
        ].join(' '),

        // Link: Text only
        link: [
          'text-[#0066FF] underline-offset-4 hover:underline',
          'focus-visible:ring-[#0066FF]/30',
        ].join(' '),

        // Outline: Neutral gray border
        outline: [
          'border border-[#E5E7EB] bg-white text-[#111827]',
          'hover:bg-[#F9FAFB] hover:border-[#D1D5DB]',
          'active:bg-[#F3F4F6]',
          'focus-visible:ring-gray-300',
        ].join(' '),
      },
      size: {
        xs: 'h-7 px-3 text-[13px]', // 28px height
        sm: 'h-8 px-5 text-sm', // 32px height
        md: 'h-9 px-6 text-[15px]', // 36px height (default)
        lg: 'h-10 px-7 text-[15px]', // 40px height
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child component (e.g., Link) */
  asChild?: boolean;
  /** Show loading spinner */
  loading?: boolean;
  /** Icon to display before text */
  iconBefore?: React.ReactNode;
  /** Icon to display after text */
  iconAfter?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      disabled,
      children,
      iconBefore,
      iconAfter,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    // Determine if button is disabled
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2
            className={cn(
              'animate-spin',
              size === 'xs' && 'h-3 w-3',
              size === 'sm' && 'h-3.5 w-3.5',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-4 w-4',
              children && 'mr-2'
            )}
          />
        )}
        {!loading && iconBefore && (
          <span
            className={cn(
              'inline-flex',
              size === 'xs' && 'h-3 w-3',
              size === 'sm' && 'h-3.5 w-3.5',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-4 w-4',
              children && 'mr-2'
            )}
          >
            {iconBefore}
          </span>
        )}
        {children}
        {!loading && iconAfter && (
          <span
            className={cn(
              'inline-flex',
              size === 'xs' && 'h-3 w-3',
              size === 'sm' && 'h-3.5 w-3.5',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-4 w-4',
              children && 'ml-2'
            )}
          >
            {iconAfter}
          </span>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
