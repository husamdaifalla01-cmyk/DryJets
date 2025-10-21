import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  notificationsManager,
  NotificationPreferencesManager,
  type NotificationPreferences,
} from '../lib/notifications';
import { notificationsApi } from '../lib/api';
import { useAuthStore } from '../lib/store';

/**
 * Hook for managing push notifications
 */
export function useNotifications() {
  const { customerId } = useAuthStore();
  const [initialized, setInitialized] = useState(false);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);

  // Initialize notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Request permissions
        const hasPermission = await notificationsManager.requestPermissions();
        if (!hasPermission) {
          console.warn('Notification permissions denied');
          return;
        }

        // Get device token
        const token = await notificationsManager.getDeviceToken();
        if (token) {
          setDeviceToken(token);

          // Register device token with backend
          if (customerId) {
            try {
              await notificationsApi.registerDeviceToken(
                customerId,
                token,
                'ios' // or 'android' based on platform
              );
            } catch (error) {
              console.error('Error registering device token:', error);
            }
          }
        }

        // Set up notification listener
        const subscription = notificationsManager.onNotification(
          (notification) => {
            // Handle notification received
            console.log('Notification received:', notification);
          }
        );

        setInitialized(true);

        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, [customerId]);

  // Get notification preferences
  const { data: preferences, refetch: refetchPreferences } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: NotificationPreferencesManager.getPreferences,
  });

  // Update notification preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (newPreferences: NotificationPreferences) =>
      Promise.resolve(
        NotificationPreferencesManager.savePreferences(newPreferences)
      ),
    onSuccess: () => {
      refetchPreferences();
      // Also update backend preferences
      if (customerId) {
        notificationsApi.updatePreferences(customerId, preferences || {});
      }
    },
  });

  // Get notifications list
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications', customerId],
    queryFn: () =>
      customerId
        ? notificationsApi.list(customerId)
        : Promise.resolve({ data: { data: [] } }),
    enabled: !!customerId,
  });

  const notifications = notificationsData?.data?.data || [];

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      refetchNotifications();
    },
  });

  const markAsRead = useCallback(
    (notificationId: string) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation]
  );

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    await notificationsManager.clearAllNotifications();
    await notificationsManager.setBadgeCount(0);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    initialized,
    deviceToken,
    notifications,
    unreadCount,
    preferences: preferences,
    updatePreferences: (newPreferences: NotificationPreferences) => {
      updatePreferencesMutation.mutate(newPreferences);
    },
    markAsRead,
    clearAllNotifications,
    refetchNotifications,
  };
}
