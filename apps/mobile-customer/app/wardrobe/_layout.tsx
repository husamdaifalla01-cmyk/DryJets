import { Stack } from 'expo-router';
import { tokens } from '../../theme/tokens';

export default function WardrobeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: tokens.colors.background,
        },
        headerTintColor: tokens.colors.text.primary,
        headerTitleStyle: {
          fontWeight: tokens.typography.weights.semibold,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'My Wardrobe',
        }}
      />
      <Stack.Screen
        name="add-item"
        options={{
          title: 'Add Item',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Item Details',
        }}
      />
    </Stack>
  );
}
