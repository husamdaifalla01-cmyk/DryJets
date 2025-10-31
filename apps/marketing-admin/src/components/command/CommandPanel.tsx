import React from 'react';
import { cn } from '@/lib/utils';

/**
 * COMMAND PANEL (Card)
 *
 * Card container with refined minimal styling.
 * Features subtle borders, rounded corners, smooth hover transitions.
 *
 * Variants:
 * - default: Basic card style
 * - elevated: Card with shadow elevation
 * - interactive: Card with hover effects and cursor pointer
 */

export interface CommandPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
  children: React.ReactNode;
}

export const CommandPanel = React.forwardRef<HTMLDivElement, CommandPanelProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'card',
      elevated: 'card-elevated',
      interactive: 'card-interactive',
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CommandPanel.displayName = 'CommandPanel';

/**
 * DATA PANEL (Card)
 *
 * Card wrapper for data display with refined styling.
 * Same as CommandPanel but with semantic naming for data contexts.
 */
export interface DataPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

export const DataPanel = React.forwardRef<HTMLDivElement, DataPanelProps>(
  ({ className, elevated = false, interactive = false, children, ...props }, ref) => {
    const cardClass = interactive ? 'card-interactive' : elevated ? 'card-elevated' : 'card';

    return (
      <div
        ref={ref}
        className={cn(cardClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DataPanel.displayName = 'DataPanel';

export default CommandPanel;
