import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from './notificationTypes';

// ============================================
// NOTIFICATION PREFERENCES STORAGE
// ============================================

const PREFERENCES_KEY = '@dryjets_notification_preferences';

export class NotificationPreferencesManager {
  /**
   * Get notification preferences
   */
  static async getPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored) as NotificationPreferences;
      }
      return DEFAULT_NOTIFICATION_PREFERENCES;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }
  }

  /**
   * Save notification preferences
   */
  static async savePreferences(
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        PREFERENCES_KEY,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  /**
   * Update specific preference
   */
  static async updatePreference<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ): Promise<void> {
    try {
      const preferences = await this.getPreferences();
      preferences[key] = value;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating notification preference:', error);
    }
  }

  /**
   * Check if notification type is enabled
   */
  static async isNotificationEnabled(
    category: 'orders' | 'driver' | 'promotion' | 'subscription'
  ): Promise<boolean> {
    try {
      const preferences = await this.getPreferences();

      // Check do not disturb
      if (preferences.doNotDisturb) {
        return false;
      }

      // Check quiet hours
      if (
        preferences.quietHourStart &&
        preferences.quietHourEnd
      ) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startHour, startMin] = preferences.quietHourStart
          .split(':')
          .map(Number);
        const [endHour, endMin] = preferences.quietHourEnd
          .split(':')
          .map(Number);

        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        if (startTime < endTime) {
          if (currentTime >= startTime && currentTime < endTime) {
            return false;
          }
        } else {
          // Quiet hours span midnight
          if (currentTime >= startTime || currentTime < endTime) {
            return false;
          }
        }
      }

      // Check category
      const categoryKey = `${category}Enabled` as keyof NotificationPreferences;
      return preferences[categoryKey] as boolean;
    } catch (error) {
      console.error('Error checking notification enabled:', error);
      return true;
    }
  }

  /**
   * Check if sound should play
   */
  static async shouldPlaySound(
    category: 'orders' | 'driver' | 'promotion' | 'subscription'
  ): Promise<boolean> {
    try {
      const preferences = await this.getPreferences();

      if (preferences.doNotDisturb) {
        return false;
      }

      const soundKey = `${category}Sound` as keyof NotificationPreferences;
      return preferences[soundKey] as boolean;
    } catch (error) {
      console.error('Error checking sound preference:', error);
      return true;
    }
  }

  /**
   * Check if vibration should trigger
   */
  static async shouldVibrate(
    category: 'orders' | 'driver' | 'promotion' | 'subscription'
  ): Promise<boolean> {
    try {
      const preferences = await this.getPreferences();

      if (preferences.doNotDisturb) {
        return false;
      }

      const vibrationKey = `${category}Vibration` as keyof NotificationPreferences;
      return preferences[vibrationKey] as boolean;
    } catch (error) {
      console.error('Error checking vibration preference:', error);
      return true;
    }
  }

  /**
   * Reset to default preferences
   */
  static async resetToDefaults(): Promise<void> {
    try {
      await this.savePreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    } catch (error) {
      console.error('Error resetting notification preferences:', error);
    }
  }
}
