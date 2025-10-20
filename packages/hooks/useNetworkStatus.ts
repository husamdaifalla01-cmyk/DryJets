/**
 * useNetworkStatus - Global network and sync state management
 *
 * Uses Zustand for state management with real-time network detection
 * and automatic sync triggering when connection is restored.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StorageAdapter, NetworkStatus, SyncResult } from '../storage/web';

/**
 * Network state interface
 */
export interface NetworkState {
  /** Current network status */
  status: NetworkStatus;

  /** Timestamp of last successful sync */
  lastSync: Date | null;

  /** Number of items pending sync */
  pendingCount: number;

  /** Whether auto-sync is enabled */
  autoSyncEnabled: boolean;

  /** Last sync error message */
  lastSyncError: string | null;

  /** Sync results from last operation */
  lastSyncResults: SyncResult[];

  /** Actions */
  setStatus: (status: NetworkStatus) => void;
  setPendingCount: (count: number) => void;
  setLastSync: (date: Date) => void;
  setLastSyncError: (error: string | null) => void;
  setLastSyncResults: (results: SyncResult[]) => void;
  toggleAutoSync: () => void;
  triggerSync: () => Promise<void>;
  reset: () => void;
}

/**
 * Storage adapter instance (injected externally)
 */
let storageAdapter: StorageAdapter | null = null;

/**
 * Set the storage adapter instance
 */
export function setStorageAdapter(adapter: StorageAdapter): void {
  storageAdapter = adapter;
}

/**
 * Network status store
 */
export const useNetworkStatus = create<NetworkState>()(
  persist(
    (set, get) => ({
      status: typeof window !== 'undefined' && navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE,
      lastSync: null,
      pendingCount: 0,
      autoSyncEnabled: true,
      lastSyncError: null,
      lastSyncResults: [],

      setStatus: (status: NetworkStatus) => set({ status }),

      setPendingCount: (count: number) => set({ pendingCount: count }),

      setLastSync: (date: Date) => set({ lastSync: date }),

      setLastSyncError: (error: string | null) => set({ lastSyncError: error }),

      setLastSyncResults: (results: SyncResult[]) => set({ lastSyncResults: results }),

      toggleAutoSync: () => set((state) => ({ autoSyncEnabled: !state.autoSyncEnabled })),

      triggerSync: async () => {
        if (!storageAdapter) {
          console.error('[useNetworkStatus] Storage adapter not initialized');
          return;
        }

        const state = get();

        // Check if already syncing
        if (state.status === NetworkStatus.SYNCING) {
          console.warn('[useNetworkStatus] Sync already in progress');
          return;
        }

        // Check if offline
        if (state.status === NetworkStatus.OFFLINE) {
          console.warn('[useNetworkStatus] Cannot sync while offline');
          return;
        }

        try {
          // Update status to syncing
          set({ status: NetworkStatus.SYNCING, lastSyncError: null });

          // Trigger sync
          const results = await storageAdapter.triggerSync();

          // Check for failures
          const failures = results.filter((r) => !r.success);
          const hasFailures = failures.length > 0;

          // Update state
          set({
            status: NetworkStatus.ONLINE,
            lastSync: new Date(),
            lastSyncResults: results,
            lastSyncError: hasFailures
              ? `${failures.length} items failed to sync`
              : null,
          });

          // Update pending count
          const pendingCount = await storageAdapter.getPendingCount();
          set({ pendingCount });

          console.log(
            `[useNetworkStatus] Sync complete: ${results.length - failures.length} succeeded, ${failures.length} failed`
          );
        } catch (error) {
          console.error('[useNetworkStatus] Sync error:', error);

          set({
            status: NetworkStatus.ONLINE,
            lastSyncError: error instanceof Error ? error.message : 'Sync failed',
          });
        }
      },

      reset: () =>
        set({
          status: typeof window !== 'undefined' && navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE,
          lastSync: null,
          pendingCount: 0,
          autoSyncEnabled: true,
          lastSyncError: null,
          lastSyncResults: [],
        }),
    }),
    {
      name: 'dryjets-network-status',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastSync: state.lastSync,
        autoSyncEnabled: state.autoSyncEnabled,
      }),
    }
  )
);

/**
 * Initialize network status monitoring
 *
 * Call this once in your app's root component
 */
export function initNetworkStatusMonitoring(adapter: StorageAdapter): () => void {
  setStorageAdapter(adapter);

  // Online/offline listeners
  const handleOnline = async () => {
    console.log('[useNetworkStatus] Network connected');
    useNetworkStatus.getState().setStatus(NetworkStatus.ONLINE);

    // Auto-sync when coming back online
    const { autoSyncEnabled } = useNetworkStatus.getState();
    if (autoSyncEnabled) {
      console.log('[useNetworkStatus] Auto-syncing on reconnect...');
      await useNetworkStatus.getState().triggerSync();
    }
  };

  const handleOffline = () => {
    console.log('[useNetworkStatus] Network disconnected');
    useNetworkStatus.getState().setStatus(NetworkStatus.OFFLINE);
  };

  // Add listeners (browser only)
  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status check
    if (navigator.onLine) {
      useNetworkStatus.getState().setStatus(NetworkStatus.ONLINE);
    } else {
      useNetworkStatus.getState().setStatus(NetworkStatus.OFFLINE);
    }
  }

  // Update pending count periodically
  const updatePendingCount = async () => {
    if (storageAdapter) {
      const count = await storageAdapter.getPendingCount();
      useNetworkStatus.getState().setPendingCount(count);
    }
  };

  // Initial count
  updatePendingCount();

  // Update every 10 seconds
  const countInterval = setInterval(updatePendingCount, 10000);

  // Cleanup function
  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
    clearInterval(countInterval);
  };
}

/**
 * Hook to get network status as boolean
 */
export function useIsOnline(): boolean {
  const status = useNetworkStatus((state) => state.status);
  return status === NetworkStatus.ONLINE || status === NetworkStatus.SYNCING;
}

/**
 * Hook to get sync status
 */
export function useIsSyncing(): boolean {
  const status = useNetworkStatus((state) => state.status);
  return status === NetworkStatus.SYNCING;
}

/**
 * Hook to get pending count
 */
export function usePendingCount(): number {
  return useNetworkStatus((state) => state.pendingCount);
}

/**
 * Hook to get last sync info
 */
export function useLastSync(): { date: Date | null; error: string | null } {
  const lastSync = useNetworkStatus((state) => state.lastSync);
  const lastSyncError = useNetworkStatus((state) => state.lastSyncError);

  return { date: lastSync, error: lastSyncError };
}

/**
 * Format time since last sync
 */
export function formatTimeSinceSync(lastSync: Date | null): string {
  if (!lastSync) return 'Never';

  const now = Date.now();
  const diff = now - lastSync.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 0) return `${seconds}s ago`;
  return 'Just now';
}

/**
 * Get network status display info (for UI widgets)
 */
export function getNetworkStatusDisplay(status: NetworkStatus): {
  label: string;
  color: string;
  icon: 'online' | 'syncing' | 'offline';
} {
  switch (status) {
    case NetworkStatus.ONLINE:
      return {
        label: 'Online',
        color: '#00B7A5', // Success green/teal
        icon: 'online',
      };
    case NetworkStatus.SYNCING:
      return {
        label: 'Syncing',
        color: '#0A78FF', // Primary blue
        icon: 'syncing',
      };
    case NetworkStatus.OFFLINE:
      return {
        label: 'Offline',
        color: '#FF3B30', // Danger red
        icon: 'offline',
      };
    default:
      return {
        label: 'Unknown',
        color: '#718096', // Gray
        icon: 'offline',
      };
  }
}