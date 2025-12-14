"use client";

import { Stack } from 'expo-router';

/**
 * FABRICS STACK LAYOUT
 *
 * Navigation for fabric discovery and detail flows.
 * Screens:
 * - index: Browse all fabrics
 * - [fabricId]: Fabric detail with options to add to order
 */
export default function FabricsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[fabricId]" />
    </Stack>
  );
}
