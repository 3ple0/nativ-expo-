import { Stack } from 'expo-router';

/**
 * MODAL LAYOUT
 *
 * Presents modal screens above main navigation stack.
 * Used for:
 * - Auth gate (payment confirmation)
 * - Full-screen modals
 */
export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="auth-gate"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
