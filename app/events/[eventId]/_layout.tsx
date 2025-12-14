"use client";

import { Stack } from 'expo-router';

/**
 * EVENT DETAIL STACK LAYOUT
 *
 * Nested navigation for event detail screens.
 * Screens:
 * - index: Event dashboard
 * - fabrics: Fabric selection
 * - distribution: Distribution mode
 * - guests: Guest management
 * - invite: Invite links
 * - orders: Event orders
 */
export default function EventDetailStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
