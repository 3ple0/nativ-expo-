import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { theme } from '@/constants/theme';

/**
 * ORDERS TAB SCREEN
 *
 * Redirect to orders stack for better organization.
 * Orders are managed in /app/orders/index.tsx
 */
export default function OrdersTabScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to orders stack
    router.replace('/orders');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      <Text style={{
        marginTop: 12,
        color: theme.colors.neutral[600],
        fontSize: 14,
      }}>
        Loading orders...
      </Text>
    </View>
  );
}
