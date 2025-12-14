import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/src/store/auth.store';

/**
 * AUTH GATE MODAL
 *
 * Enforces authentication for protected features.
 * Displayed when guest users try to:
 * - Make payments
 * - Create events (host only)
 * - Join ASO-EBI groups
 * - Access other member-only features
 *
 * Non-dismissible - user must choose action:
 * - Sign In (go to sign-in screen)
 * - Create Account (go to sign-up screen)
 * - Continue Browsing (return to previous screen)
 */
export default function AuthGateModal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // If user is already authenticated, redirect back
  if (isAuthenticated) {
    router.back();
    return null;
  }

  const handleSignIn = async () => {
    try {
      setLoading(true);
      // Navigate to sign-in screen (replace current modal)
      router.replace('/sign-in');
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      // Navigate to sign-up screen (replace current modal)
      router.replace('/sign-up');
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueBrowsing = () => {
    // Go back to previous screen
    router.back();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.neutral[50],
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 32,
          paddingHorizontal: 20,
          paddingBottom: 32,
          maxHeight: '85%',
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: theme.colors.neutral[900],
                marginBottom: 8,
              }}
            >
              Sign In to Continue
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.neutral[600],
                lineHeight: 20,
              }}
            >
              Create an account or sign in to access this feature and make purchases on Nativ+.
            </Text>
          </View>

          {/* Feature List */}
          <View
            style={{
              backgroundColor: theme.colors.primary[50],
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: theme.colors.neutral[900],
                marginBottom: 12,
              }}
            >
              With your account, you can:
            </Text>
            {[
              'Make secure purchases with Nativ Pay escrow',
              'Create and manage events',
              'Join ASO-EBI groups',
              'Track orders and deliveries',
              'Save favorite fabrics and makers',
            ].map((feature, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: idx < 4 ? 8 : 0,
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.colors.primary[600],
                    fontWeight: '700',
                    marginTop: 2,
                  }}
                >
                  ✓
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.colors.neutral[700],
                    lineHeight: 18,
                    flex: 1,
                  }}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            style={{
              backgroundColor: theme.colors.primary[600],
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 12,
              opacity: loading ? 0.6 : 1,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.neutral[50]} />
            ) : (
              <>
                <Text
                  style={{
                    color: theme.colors.neutral[50],
                    fontSize: 16,
                    fontWeight: '700',
                  }}
                >
                  Sign In
                </Text>
                <ChevronRight color={theme.colors.neutral[50]} size={20} />
              </>
            )}
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            style={{
              backgroundColor: theme.colors.neutral[50],
              borderWidth: 2,
              borderColor: theme.colors.primary[600],
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 12,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: theme.colors.primary[600],
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Continue Browsing Button */}
          <TouchableOpacity
            onPress={handleContinueBrowsing}
            disabled={loading}
            style={{
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: theme.colors.neutral[600],
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Continue Browsing
            </Text>
          </TouchableOpacity>

          {/* Info Text */}
          <View
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: theme.colors.neutral[200],
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.neutral[500],
                textAlign: 'center',
                lineHeight: 18,
              }}
            >
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
