"use client";

import { Stack } from 'expo-router';

/**
 * EVENTS STACK LAYOUT
 *
 * Navigation for event management flows.
 * Screens:
 * - create: Create new event
 * - [eventId]: Event dashboard
 * - [eventId]/fabrics: Event fabric selection
 * - [eventId]/distribution: Payment mode selection
 * - [eventId]/guests: Guest list management
 * - [eventId]/invite: Invite link generation
 * - [eventId]/orders: Event orders
 */
export default function EventsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="create" />
      <Stack.Screen
        name="[eventId]"
        options={{
          animationEnabled: true,
        }}
      />
    </Stack>
  );
}
