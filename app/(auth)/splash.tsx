import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/src/store/auth.store';

/**
 * SPLASH SCREEN
 *
 * Checks authentication state and routes accordingly:
 * - Authenticated → Main app (tabs)
 * - Not authenticated → Onboarding
 *
 * Waits for auth store hydration before routing.
 */
export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return; // Wait for hydration

    // Route based on auth state
    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isLoading]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 36,
            fontWeight: '900',
            color: theme.colors.neutral[50],
            marginBottom: 12,
            letterSpacing: -1,
          }}
        >
          Nativ
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.primary[100],
            marginBottom: 32,
          }}
        >
          ASO-EBI Marketplace
        </Text>

        <ActivityIndicator
          size="large"
          color={theme.colors.neutral[50]}
          style={{ opacity: 0.6 }}
        />
      </View>
    </View>
  );
}
