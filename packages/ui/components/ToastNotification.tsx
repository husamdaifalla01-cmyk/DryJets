'use client';

/**
 * Toast Notification System for DryJetsOS
 *
 * Features:
 * - Multiple variants (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Manual dismiss
 * - Stacking notifications
 * - Slide-in animations
 * - Icon support
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '../../../apps/web-merchant/src/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = {
      id,
      duration: 5000,
      dismissible: true,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({ variant: 'success', title, message });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({ variant: 'error', title, message });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast({ variant: 'warning', title, message });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({ variant: 'info', title, message });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-toast p-6 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const variantConfig = {
    success: {
      icon: CheckCircle,
      bg: 'bg-success-500/10',
      border: 'border-success-500/30',
      iconColor: 'text-success-500',
      textColor: 'text-success-500',
    },
    error: {
      icon: XCircle,
      bg: 'bg-danger-500/10',
      border: 'border-danger-500/30',
      iconColor: 'text-danger-500',
      textColor: 'text-danger-500',
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-warning-500/10',
      border: 'border-warning-500/30',
      iconColor: 'text-warning-500',
      textColor: 'text-warning-500',
    },
    info: {
      icon: Info,
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/30',
      iconColor: 'text-primary-500',
      textColor: 'text-primary-500',
    },
  };

  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm',
        'min-w-[320px] max-w-[480px]',
        'shadow-lg',
        'animate-slide-up',
        'pointer-events-auto',
        config.bg,
        config.border
      )}
    >
      {/* Icon */}
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('font-semibold text-sm', config.textColor)}>{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-foreground-secondary mt-1">{toast.message}</p>
        )}
      </div>

      {/* Dismiss button */}
      {toast.dismissible && (
        <button
          onClick={() => onRemove(toast.id)}
          className={cn(
            'flex-shrink-0 p-1 rounded-md',
            'hover:bg-background-subtle',
            'transition-colors',
            'text-foreground-tertiary hover:text-foreground-DEFAULT'
          )}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}