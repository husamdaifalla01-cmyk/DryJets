import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * COMMAND BUTTON
 *
 * Primary action button component with Refined Minimal styling.
 * Moderate curves, sophisticated colors, smooth interactions.
 *
 * Variants:
 * - primary (default): Indigo filled, elevated
 * - secondary: Elevated with border, no fill
 * - ghost: Minimal, hover fill
 * - danger: Error red, filled
 */

export interface CommandButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const CommandButton = React.forwardRef<
  HTMLButtonElement,
  CommandButtonProps
>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 transition-all duration-200';

    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
    };

    const sizes = {
      sm: 'btn-primary-sm',
      md: '',
      lg: 'btn-primary-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

CommandButton.displayName = 'CommandButton';

export default CommandButton;
