import { Stack } from 'expo-router';
import { tokens } from '../../theme/tokens';

export default function ReviewsLayout() {
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
        name="create-review"
        options={{
          title: 'Leave a Review',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Review Details',
        }}
      />
    </Stack>
  );
}
