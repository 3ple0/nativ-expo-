"use client";

import { Stack } from 'expo-router';

/**
 * PAYMENTS STACK LAYOUT
 *
 * Navigation for payment and escrow flows.
 * Screens:
 * - checkout: Review order and payment method
 * - nativpay: nativPay payment processing
 * - dispute: Dispute resolution
 */
export default function PaymentsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="checkout" />
      <Stack.Screen name="nativpay" />
      <Stack.Screen name="dispute" />
    </Stack>
  );
}
