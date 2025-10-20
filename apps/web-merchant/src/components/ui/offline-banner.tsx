'use client';

/**
 * OfflineBanner Component
 * Alert banner shown when the app is offline
 *
 * Features:
 * - Shows when network is offline
 * - Displays pending sync count
 * - Manual retry button
 * - Auto-dismisses when back online
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Button } from '@/components/ui/button-v2';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
  const { status, pendingSyncCount, retry } = useNetworkStatus();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <AnimatePresence>
      {status === 'offline' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'flex items-center justify-between px-6 py-3',
              'bg-yellow-50 dark:bg-yellow-900/20',
              'border-b border-yellow-200 dark:border-yellow-800'
            )}
          >
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                  Working Offline
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  {pendingSyncCount > 0
                    ? `${pendingSyncCount} ${pendingSyncCount === 1 ? 'order' : 'orders'} will sync when reconnected`
                    : 'Orders will sync when reconnected'}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
              className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
            >
              <RefreshCw className={cn('h-4 w-4 mr-1', isRetrying && 'animate-spin')} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        </motion.div>
      )}

      {status === 'syncing' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'flex items-center justify-between px-6 py-3',
              'bg-blue-50 dark:bg-blue-900/20',
              'border-b border-blue-200 dark:border-blue-800'
            )}
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Syncing Orders
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {pendingSyncCount > 0
                    ? `Syncing ${pendingSyncCount} ${pendingSyncCount === 1 ? 'order' : 'orders'}...`
                    : 'Checking for updates...'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
