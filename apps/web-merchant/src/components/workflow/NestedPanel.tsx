'use client';

/**
 * Nested Panel Component
 * Phase 3: Enterprise Dashboard Architecture
 *
 * Provides drill-down navigation without leaving the current page
 * Inspired by Linear's nested panel pattern
 *
 * Features:
 * - Slide-in animation from right
 * - Breadcrumb navigation
 * - Stack management (back/forward)
 * - Keyboard shortcuts (Esc to close, ⌘← to go back)
 * - Smooth transitions
 * - Mobile-responsive
 */

import * as React from 'react';
// TODO: Install @radix-ui/react-dialog
// import * as Dialog from '@radix-ui/react-dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button-v2';

export interface PanelView {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface NestedPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView: PanelView;
  className?: string;
}

// TODO: Re-enable when @radix-ui/react-dialog is installed
export function NestedPanel({
  open,
  onOpenChange,
  initialView,
  className,
}: NestedPanelProps) {
  return null;
}

  /* DISABLED - Original implementation (requires @radix-ui/react-dialog):

export function NestedPanel_DISABLED({
  open,
  onOpenChange,
  initialView,
  className,
}: NestedPanelProps) {
  const [viewStack, setViewStack] = React.useState<PanelView[]>([initialView]);
  const currentView = viewStack[viewStack.length - 1];

  // Reset stack when panel closes
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => setViewStack([initialView]), 200);
    }
  }, [open, initialView]);

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc to close
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }

      // ⌘← or Ctrl+← to go back
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, viewStack]);

  const pushView = (view: PanelView) => {
    setViewStack((prev) => [...prev, view]);
  };

  const goBack = () => {
    if (viewStack.length > 1) {
      setViewStack((prev) => prev.slice(0, -1));
    }
  };

  const goToView = (index: number) => {
    if (index >= 0 && index < viewStack.length) {
      setViewStack((prev) => prev.slice(0, index + 1));
    }
  };

  // Width classes
  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full',
  };

  const width = currentView?.width || 'lg';

  // TODO: Re-enable when @radix-ui/react-dialog is installed
  return null;
}
*/

/**
 * Context for nested panel actions
 */
interface NestedPanelContextValue {
  pushView: (view: PanelView) => void;
  goBack: () => void;
}

const NestedPanelContext = React.createContext<NestedPanelContextValue | null>(null);

/**
 * Hook to access nested panel actions
 */
export function useNestedPanel() {
  const context = React.useContext(NestedPanelContext);
  if (!context) {
    throw new Error('useNestedPanel must be used within a NestedPanel');
  }
  return context;
}

/**
 * Hook to manage nested panel state
 */
export function useNestedPanelState(initialView?: PanelView) {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<PanelView | null>(initialView || null);

  const openPanel = React.useCallback((newView: PanelView) => {
    setView(newView);
    setOpen(true);
  }, []);

  const closePanel = React.useCallback(() => {
    setOpen(false);
  }, []);

  return {
    open,
    setOpen,
    view,
    openPanel,
    closePanel,
  };
}

/**
 * Pre-built Panel Content Wrapper (for consistent styling)
 */
export interface PanelContentProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function PanelContent({ children, padding = 'md', className }: PanelContentProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return <div className={cn(paddingClasses[padding], className)}>{children}</div>;
}

/**
 * Panel Section (for organized content)
 */
export interface PanelSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function PanelSection({ title, description, children, className }: PanelSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-sm font-semibold text-[#111827] dark:text-[#FAFAFA]">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-[#6B7280] dark:text-[#A1A1A6] mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Panel Footer (sticky footer with actions)
 */
export interface PanelFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelFooter({ children, className }: PanelFooterProps) {
  return (
    <div
      className={cn(
        'border-t border-[#F3F4F6] dark:border-[#1A1A1D]',
        'px-6 py-4',
        'flex items-center justify-end gap-3',
        'bg-white dark:bg-[#0A0A0B]',
        className,
      )}
    >
      {children}
    </div>
  );
}
