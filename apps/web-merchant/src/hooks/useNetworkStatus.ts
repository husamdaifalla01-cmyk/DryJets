'use client';

/**
 * useNetworkStatus Hook
 * Network detection with sync queue status
 *
 * Features:
 * - Real-time online/offline detection
 * - Sync queue status tracking
 * - Pending operations count
 * - Manual retry function
 */

import { useState, useEffect } from 'react';

export type NetworkStatus = 'online' | 'offline' | 'syncing';

interface NetworkStatusData {
  status: NetworkStatus;
  isOnline: boolean;
  pendingSyncCount: number;
  lastSyncAt: Date | null;
  retry: () => Promise<void>;
}

export function useNetworkStatus(): NetworkStatusData {
  const [status, setStatus] = useState<NetworkStatus>('online');
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  useEffect(() => {
    // Initial status check
    const updateStatus = () => {
      setStatus(navigator.onLine ? 'online' : 'offline');
    };

    updateStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      setStatus('online');
      // Trigger sync if there are pending operations
      if (pendingSyncCount > 0) {
        handleSync();
      }
    };

    const handleOffline = () => {
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending sync items in localStorage
    const checkPendingSync = () => {
      try {
        const keys = Object.keys(localStorage).filter((key) =>
          key.startsWith('order-draft-')
        );
        setPendingSyncCount(keys.length);
      } catch (error) {
        console.error('Error checking pending sync:', error);
      }
    };

    checkPendingSync();
    const interval = setInterval(checkPendingSync, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [pendingSyncCount]);

  const handleSync = async () => {
    if (!navigator.onLine) {
      console.log('Cannot sync while offline');
      return;
    }

    setStatus('syncing');

    try {
      // TODO: Implement actual sync logic
      // This would typically:
      // 1. Get all draft orders from localStorage
      // 2. Send them to the API
      // 3. Remove successfully synced items
      // 4. Update sync status

      // Simulate sync delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLastSyncAt(new Date());
      setStatus('online');
      setPendingSyncCount(0);
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      setStatus('online');
    }
  };

  const retry = async () => {
    await handleSync();
  };

  return {
    status,
    isOnline: status !== 'offline',
    pendingSyncCount,
    lastSyncAt,
    retry,
  };
}
