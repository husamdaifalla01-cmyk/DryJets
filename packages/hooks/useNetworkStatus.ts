/**
 * useNetworkStatus - Simple network status hook for cloud-first applications
 *
 * Monitors online/offline status without local storage or sync logic.
 * All data operations go directly to Supabase.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Network connection status
 */
export enum NetworkStatus {
  /** Connected to internet */
  ONLINE = 'online',
  /** No internet connection */
  OFFLINE = 'offline',
}

/**
 * Network state interface
 */
export interface NetworkState {
  /** Current network status */
  status: NetworkStatus;

  /** Actions */
  setStatus: (status: NetworkStatus) => void;
  checkConnection: () => Promise<boolean>;
  reset: () => void;
}

/**
 * Network status store
 */
export const useNetworkStatus = create<NetworkState>()(
  persist(
    (set, get) => ({
      status: typeof window !== 'undefined' && navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE,

      setStatus: (status: NetworkStatus) => set({ status }),

      checkConnection: async () => {
        try {
          // Try to ping a reliable endpoint
          const response = await fetch('https://www.google.com/favicon.ico', {
            mode: 'no-cors',
            cache: 'no-cache',
          });
          const isOnline = true;
          set({ status: NetworkStatus.ONLINE });
          return isOnline;
        } catch (error) {
          set({ status: NetworkStatus.OFFLINE });
          return false;
        }
      },

      reset: () =>
        set({
          status: typeof window !== 'undefined' && navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE,
        }),
    }),
    {
      name: 'dryjets-network-status',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Initialize network status monitoring
 *
 * Call this once in your app's root component
 */
export function initNetworkStatusMonitoring(): () => void {
  // Online/offline listeners
  const handleOnline = () => {
    console.log('[useNetworkStatus] Network connected');
    useNetworkStatus.getState().setStatus(NetworkStatus.ONLINE);
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

  // Cleanup function
  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOffline);
      window.removeEventListener('offline', handleOffline);
    }
  };
}

/**
 * Hook to get network status as boolean
 */
export function useIsOnline(): boolean {
  const status = useNetworkStatus((state) => state.status);
  return status === NetworkStatus.ONLINE;
}

/**
 * Get network status display info (for UI widgets)
 */
export function getNetworkStatusDisplay(status: NetworkStatus): {
  label: string;
  color: string;
  icon: 'online' | 'offline';
} {
  switch (status) {
    case NetworkStatus.ONLINE:
      return {
        label: 'Online',
        color: '#00B7A5', // Success green/teal
        icon: 'online',
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
