'use client';

/**
 * DryJetsButton - Enterprise-grade button with tactile effects
 *
 * Features:
 * - Neon glow effects on hover
 * - Tactile press animations
 * - Loading states with spinner
 * - Icon support (left/right)
 * - Multiple variants (primary, success, danger, outline, ghost)
 * - Multiple sizes (sm, md, lg, xl)
 * - Keyboard accessible
 */

import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../../apps/web-merchant/src/lib/utils';

export type ButtonVariant = 'primary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DryJetsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant (default: primary) */
  variant?: ButtonVariant;
  /** Button size (default: md) */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Icon to show on the left */
  iconLeft?: ReactNode;
  /** Icon to show on the right */
  iconRight?: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Children (button text) */
  children?: ReactNode;
}

const DryJetsButton = forwardRef<HTMLButtonElement, DryJetsButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantStyles = {
      primary: cn(
        'bg-gradient-to-br from-primary-500 to-primary-600',
        'text-white font-semibold',
        'border border-primary-400/50',
        'shadow-lg shadow-primary-500/20',
        'hover:shadow-glow-primary hover:from-primary-400 hover:to-primary-500',
        'active:scale-[0.98] active:shadow-md',
        'disabled:from-primary-800 disabled:to-primary-900 disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-50'
      ),
      success: cn(
        'bg-gradient-to-br from-success-500 to-success-600',
        'text-white font-semibold',
        'border border-success-400/50',
        'shadow-lg shadow-success-500/20',
        'hover:shadow-glow-success hover:from-success-400 hover:to-success-500',
        'active:scale-[0.98] active:shadow-md',
        'disabled:from-success-800 disabled:to-success-900 disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-50'
      ),
      danger: cn(
        'bg-gradient-to-br from-danger-500 to-danger-600',
        'text-white font-semibold',
        'border border-danger-400/50',
        'shadow-lg shadow-danger-500/20',
        'hover:shadow-glow-danger hover:from-danger-400 hover:to-danger-500',
        'active:scale-[0.98] active:shadow-md',
        'disabled:from-danger-800 disabled:to-danger-900 disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-50'
      ),
      warning: cn(
        'bg-gradient-to-br from-warning-500 to-warning-600',
        'text-white font-semibold',
        'border border-warning-400/50',
        'shadow-lg shadow-warning-500/20',
        'hover:shadow-glow-warning hover:from-warning-400 hover:to-warning-500',
        'active:scale-[0.98] active:shadow-md',
        'disabled:from-warning-800 disabled:to-warning-900 disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-50'
      ),
      outline: cn(
        'bg-transparent',
        'text-primary-500 font-semibold',
        'border-2 border-primary-500',
        'hover:bg-primary-500/10 hover:shadow-glow-primary',
        'active:scale-[0.98]',
        'disabled:border-primary-800 disabled:text-primary-800 disabled:cursor-not-allowed disabled:opacity-50'
      ),
      ghost: cn(
        'bg-transparent',
        'text-foreground-secondary font-medium',
        'border border-transparent',
        'hover:bg-background-subtle hover:text-foreground-DEFAULT',
        'active:scale-[0.98]',
        'disabled:text-foreground-disabled disabled:cursor-not-allowed disabled:opacity-50'
      ),
    };

    // Size styles
    const sizeStyles = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-base gap-2',
      lg: 'h-12 px-6 text-lg gap-2.5',
      xl: 'h-14 px-8 text-xl gap-3',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background-DEFAULT',
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          // Custom className
          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        {/* Left icon */}
        {!loading && iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}

        {/* Children */}
        {children && <span className={loading ? 'opacity-0' : ''}>{children}</span>}

        {/* Right icon */}
        {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

DryJetsButton.displayName = 'DryJetsButton';

export { DryJetsButton };