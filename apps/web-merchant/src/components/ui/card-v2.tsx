/**
 * Card Component v2.0
 * "Precision OS" Design System
 *
 * Features:
 * - Clean, minimal design (no dark navy backgrounds)
 * - Subtle borders and shadows
 * - Smooth hover transitions
 * - Flexible composition with compound components
 *
 * Philosophy: Light, airy, enterprise-grade polish
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Card variants
const cardVariants = cva(
  [
    'rounded-lg transition-all duration-200',
    'bg-white dark:bg-[#161618]',
  ].join(' '),
  {
    variants: {
      variant: {
        // Default: Light background with border
        default: [
          'border border-[#E5E7EB] dark:border-[#2A2A2D]',
          'shadow-sm',
        ].join(' '),

        // Elevated: No border, more shadow
        elevated: [
          'shadow-md',
        ].join(' '),

        // Interactive: Hover effects
        interactive: [
          'border border-[#E5E7EB] dark:border-[#2A2A2D]',
          'shadow-sm cursor-pointer',
          'hover:border-[#D1D5DB] dark:hover:border-[#3A3A3C]',
          'hover:shadow-md hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-sm',
        ].join(' '),

        // Outline: Border only, no shadow
        outline: [
          'border border-[#E5E7EB] dark:border-[#2A2A2D]',
        ].join(' '),

        // Ghost: No border or shadow
        ghost: [
          'shadow-none',
        ].join(' '),
      },
      padding: {
        none: 'p-0',
        compact: 'p-4', // 16px
        default: 'p-6', // 24px
        spacious: 'p-8', // 32px
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Card can be clicked */
  onClick?: () => void;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, onClick, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// Card Header
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { noPadding?: boolean }
>(({ className, noPadding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5',
      !noPadding && 'pb-4',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// Card Title
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    /** Title size variant */
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-semibold leading-none tracking-tight',
      'text-[#111827] dark:text-[#FAFAFA]',
      size === 'sm' && 'text-base', // 16px
      size === 'md' && 'text-lg', // 18px
      size === 'lg' && 'text-xl', // 20px
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// Card Description
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm leading-relaxed',
      'text-[#6B7280] dark:text-[#A1A1A6]',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { noPadding?: boolean }
>(({ className, noPadding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      !noPadding && 'pt-0',
      className
    )}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

// Card Footer
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { noPadding?: boolean }
>(({ className, noPadding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center',
      !noPadding && 'pt-4',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Divider for separating card sections
const CardDivider = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn(
      'border-t border-[#F3F4F6] dark:border-[#1A1A1D]',
      'my-4',
      className
    )}
    {...props}
  />
));
CardDivider.displayName = 'CardDivider';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardDivider,
  cardVariants,
};
