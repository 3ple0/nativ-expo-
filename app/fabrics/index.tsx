"use client";

import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { theme } from '@/constants/theme';

/**
 * FABRICS INDEX SCREEN
 *
 * Browse all available fabrics.
 * Displays fabrics list with search and filter.
 */
export default function FabricsIndexScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: theme.colors.neutral[900],
            marginBottom: 4,
          }}
        >
          Browse Fabrics
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.neutral[600],
            marginBottom: 16,
          }}
        >
          Search and discover fabrics
        </Text>

        {/* TODO: Add fabric grid */}
        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 32,
            alignItems: 'center',
            minHeight: 300,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.neutral[600],
            }}
          >
            Fabric list loading...
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
