"use client";

import { Stack } from 'expo-router';

/**
 * CART STACK LAYOUT
 *
 * Shopping cart screen.
 */
export default function CartStackLayout() {
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
