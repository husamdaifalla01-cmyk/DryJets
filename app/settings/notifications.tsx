import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { tokens } from '../../theme/tokens';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationPreferencesManager } from '../../lib/notifications';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { preferences, updatePreferences } = useNotifications();

  const [ordersEnabled, setOrdersEnabled] = useState(true);
  const [ordersSound, setOrdersSound] = useState(true);
  const [ordersVibration, setOrdersVibration] = useState(true);

  const [driverEnabled, setDriverEnabled] = useState(true);
  const [driverSound, setDriverSound] = useState(true);
  const [driverVibration, setDriverVibration] = useState(true);

  const [promotionEnabled, setPromotionEnabled] = useState(true);
  const [promotionSound, setPromotionSound] = useState(false);
  const [promotionVibration, setPromotionVibration] = useState(false);

  const [subscriptionEnabled, setSubscriptionEnabled] = useState(true);
  const [subscriptionSound, setSubscriptionSound] = useState(false);
  const [subscriptionVibration, setSubscriptionVibration] = useState(false);

  const [quietHourStart, setQuietHourStart] = useState<string | undefined>();
  const [quietHourEnd, setQuietHourEnd] = useState<string | undefined>();
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  // Initialize from preferences
  useEffect(() => {
    if (preferences) {
      setOrdersEnabled(preferences.ordersEnabled);
      setOrdersSound(preferences.ordersSound);
      setOrdersVibration(preferences.ordersVibration);

      setDriverEnabled(preferences.driverEnabled);
      setDriverSound(preferences.driverSound);
      setDriverVibration(preferences.driverVibration);

      setPromotionEnabled(preferences.promotionEnabled);
      setPromotionSound(preferences.promotionSound);
      setPromotionVibration(preferences.promotionVibration);

      setSubscriptionEnabled(preferences.subscriptionEnabled);
      setSubscriptionSound(preferences.subscriptionSound);
      setSubscriptionVibration(preferences.subscriptionVibration);

      setQuietHourStart(preferences.quietHourStart);
      setQuietHourEnd(preferences.quietHourEnd);
      setDoNotDisturb(preferences.doNotDisturb);
    }
  }, [preferences]);

  const handleSave = () => {
    updatePreferences({
      ordersEnabled,
      ordersSound,
      ordersVibration,
      driverEnabled,
      driverSound,
      driverVibration,
      promotionEnabled,
      promotionSound,
      promotionVibration,
      subscriptionEnabled,
      subscriptionSound,
      subscriptionVibration,
      quietHourStart,
      quietHourEnd,
      doNotDisturb,
    });

    Alert.alert('Success', 'Notification settings saved', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset to Defaults', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await NotificationPreferencesManager.resetToDefaults();
          Alert.alert('Success', 'Settings reset to defaults');
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: tokens.colors.background,
      }}
    >
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: tokens.spacing.lg,
        }}
      >
        {/* Orders Section */}
        <View style={{ marginVertical: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.lg,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.md,
            }}
          >
            Order Notifications
          </Text>

          <View
            style={{
              backgroundColor: tokens.colors.surface,
              borderRadius: tokens.borderRadius.lg,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: tokens.colors.border,
              }}
            >
              <Text style={{ color: tokens.colors.text.primary }}>
                Enable Order Notifications
              </Text>
              <Switch
                value={ordersEnabled}
                onValueChange={setOrdersEnabled}
              />
            </View>

            {ordersEnabled && (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: tokens.spacing.md,
                    paddingVertical: tokens.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: tokens.colors.border,
                  }}
                >
                  <Text style={{ color: tokens.colors.text.primary }}>
                    Sound
                  </Text>
                  <Switch
                    value={ordersSound}
                    onValueChange={setOrdersSound}
                  />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: tokens.spacing.md,
                    paddingVertical: tokens.spacing.md,
                  }}
                >
                  <Text style={{ color: tokens.colors.text.primary }}>
                    Vibration
                  </Text>
                  <Switch
                    value={ordersVibration}
                    onValueChange={setOrdersVibration}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Driver Section */}
        <View style={{ marginVertical: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.lg,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.md,
            }}
          >
            Driver Updates
          </Text>

          <View
            style={{
              backgroundColor: tokens.colors.surface,
              borderRadius: tokens.borderRadius.lg,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: tokens.colors.border,
              }}
            >
              <Text style={{ color: tokens.colors.text.primary }}>
                Enable Driver Notifications
              </Text>
              <Switch
                value={driverEnabled}
                onValueChange={setDriverEnabled}
              />
            </View>

            {driverEnabled && (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: tokens.spacing.md,
                    paddingVertical: tokens.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: tokens.colors.border,
                  }}
                >
                  <Text style={{ color: tokens.colors.text.primary }}>
                    Sound
                  </Text>
                  <Switch
                    value={driverSound}
                    onValueChange={setDriverSound}
                  />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: tokens.spacing.md,
                    paddingVertical: tokens.spacing.md,
                  }}
                >
                  <Text style={{ color: tokens.colors.text.primary }}>
                    Vibration
                  </Text>
                  <Switch
                    value={driverVibration}
                    onValueChange={setDriverVibration}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Promotions Section */}
        <View style={{ marginVertical: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.lg,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.md,
            }}
          >
            Promotions
          </Text>

          <View
            style={{
              backgroundColor: tokens.colors.surface,
              borderRadius: tokens.borderRadius.lg,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: tokens.colors.border,
              }}
            >
              <Text style={{ color: tokens.colors.text.primary }}>
                Special Offers
              </Text>
              <Switch
                value={promotionEnabled}
                onValueChange={setPromotionEnabled}
              />
            </View>

            {promotionEnabled && (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: tokens.spacing.md,
                    paddingVertical: tokens.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: tokens.colors.border,
                  }}
                >
                  <Text style={{ color: tokens.colors.text.primary }}>
                    Sound
                  </Text>
                  <Switch
                    value={promotionSound}
                    onValueChange={setPromotionSound}
                  />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: tokens.spacing.md,
                    paddingVertical: tokens.spacing.md,
                  }}
                >
                  <Text style={{ color: tokens.colors.text.primary }}>
                    Vibration
                  </Text>
                  <Switch
                    value={promotionVibration}
                    onValueChange={setPromotionVibration}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Do Not Disturb Section */}
        <View style={{ marginVertical: tokens.spacing.lg }}>
          <Text
            style={{
              fontSize: tokens.typography.sizes.lg,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing.md,
            }}
          >
            Quiet Hours
          </Text>

          <View
            style={{
              backgroundColor: tokens.colors.surface,
              borderRadius: tokens.borderRadius.lg,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: tokens.colors.border,
              }}
            >
              <Text style={{ color: tokens.colors.text.primary }}>
                Do Not Disturb
              </Text>
              <Switch
                value={doNotDisturb}
                onValueChange={setDoNotDisturb}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            gap: tokens.spacing.md,
            marginVertical: tokens.spacing.lg,
            marginBottom: tokens.spacing.xl,
          }}
        >
          <TouchableOpacity
            onPress={handleReset}
            style={{
              flex: 1,
              paddingVertical: tokens.spacing.md,
              borderRadius: tokens.borderRadius.md,
              borderWidth: 1,
              borderColor: tokens.colors.error,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.error,
              }}
            >
              Reset
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            style={{
              flex: 1,
              paddingVertical: tokens.spacing.md,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primary,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.surface,
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
