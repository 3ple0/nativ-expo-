import { Stack } from 'expo-router';

/**
 * MAKERS STACK LAYOUT
 *
 * Navigation for tailor discovery and profile flows.
 * Screens:
 * - index: Browse all makers
 * - [makerId]: Maker profile and booking
 */
export default function MakersStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[makerId]" />
    </Stack>
  );
}
