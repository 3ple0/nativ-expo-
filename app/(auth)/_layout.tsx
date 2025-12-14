import { Stack } from 'expo-router';

/**
 * AUTH STACK LAYOUT
 *
 * Navigation for authentication flows.
 * Screens:
 * - splash: Splash screen on app start
 * - onboarding: Feature intro
 * - auth-choice: Sign in or sign up choice
 * - sign-in: Sign in form
 * - sign-up: Sign up form
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animationEnabled: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="auth-choice" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
