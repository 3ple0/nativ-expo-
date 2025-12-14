"use client";

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider } from '@clerk/clerk-expo';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { tokenCache } from '@/lib/tokenCache';
import { AuthProvider } from '@/src/context/AuthContext';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

/**
 * ROOT LAYOUT
 *
 * Navigation tree source of truth using Expo Router.
 * File-based routing provides:
 * - Clean stack nesting
 * - Predictable deep links (event invites, QR joins)
 * - Automatic route generation
 *
 * Structure:
 * - (auth) - Authentication screens (splash, sign-in, sign-up)
 * - (tabs) - Main app with bottom tab navigation
 * - events - Event creation and management
 * - fabrics - Fabric browsing and details
 * - makers - Maker profiles and services
 * - cart - Shopping cart
 * - payments - Checkout and payment flows
 * - modal - Auth gate and other modals
 */
export default function RootLayout() {
  useFrameworkReady();

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Authentication Flow */}
          <Stack.Screen 
            name="(auth)" 
            options={{
              animationEnabled: false,
              headerShown: false,
            }}
          />

          {/* Main App with Bottom Tabs */}
          <Stack.Screen 
            name="(tabs)" 
            options={{
              animationEnabled: false,
              headerShown: false,
            }}
          />

          {/* Event Management (Full Stack) */}
          <Stack.Screen 
            name="events"
            options={{
              animationEnabled: true,
              headerShown: false,
            }}
          />

          {/* Fabric Browsing */}
          <Stack.Screen 
            name="fabrics"
            options={{
              animationEnabled: true,
              headerShown: false,
            }}
          />

          {/* Maker Profiles */}
          <Stack.Screen 
            name="makers"
            options={{
              animationEnabled: true,
              headerShown: false,
            }}
          />

          {/* Shopping Cart */}
          <Stack.Screen 
            name="cart"
            options={{
              animationEnabled: true,
              headerShown: false,
            }}
          />

          {/* Payments & Checkout */}
          <Stack.Screen 
            name="payments"
            options={{
              animationEnabled: true,
              headerShown: false,
            }}
          />

          {/* Modals (Auth Gate, etc) */}
          <Stack.Screen 
            name="modal" 
            options={{
              presentation: 'modal',
              animationEnabled: true,
              headerShown: false,
            }}
          />

          {/* 404 Fallback */}
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </ClerkProvider>
  );
}
