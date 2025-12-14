import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { LogIn, UserPlus, Eye } from 'lucide-react-native';

/**
 * AUTH CHOICE SCREEN
 *
 * Lets user choose to:
 * - Sign in (existing account)
 * - Sign up (new account, defaults to 'guest' role)
 * - Browse as guest (no account needed)
 */
export default function AuthChoiceScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}
      contentContainerStyle={{ justifyContent: 'space-between', minHeight: '100%' }}
    >
      <View style={{ padding: 20, marginTop: 40 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: theme.colors.neutral[900],
            marginBottom: 8,
          }}
        >
          Join Nativ+
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.neutral[600],
            marginBottom: 40,
            lineHeight: 20,
          }}
        >
          Buy, coordinate, and deliver ASO-EBI fabrics with trust.
        </Text>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={() => router.push('/sign-in')}
          style={{
            backgroundColor: theme.colors.neutral[50],
            borderWidth: 2,
            borderColor: theme.colors.primary[600],
            borderRadius: 8,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <LogIn color={theme.colors.primary[600]} size={20} />
          <Text
            style={{
              color: theme.colors.primary[600],
              fontSize: 16,
              fontWeight: '700',
            }}
          >
            Sign In
          </Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={() => router.push('/sign-up')}
          style={{
            backgroundColor: theme.colors.primary[600],
            borderRadius: 8,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <UserPlus color={theme.colors.neutral[50]} size={20} />
          <Text
            style={{
              color: theme.colors.neutral[50],
              fontSize: 16,
              fontWeight: '700',
            }}
          >
            Create Account
          </Text>
        </TouchableOpacity>

        {/* Browse as Guest */}
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={{
            backgroundColor: theme.colors.neutral[100],
            borderRadius: 8,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Eye color={theme.colors.neutral[700]} size={20} />
          <Text
            style={{
              color: theme.colors.neutral[700],
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            Browse as Guest
          </Text>
        </TouchableOpacity>

        {/* Info Box */}
        <View
          style={{
            backgroundColor: theme.colors.primary[50],
            borderRadius: 8,
            padding: 12,
            marginTop: 24,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.neutral[700],
              lineHeight: 18,
            }}
          >
            ✓ Browse fabrics, events, and makers without an account
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.neutral[700],
              lineHeight: 18,
              marginTop: 8,
            }}
          >
            ✓ Sign in or create an account to make purchases
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          padding: 20,
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.neutral[500],
            textAlign: 'center',
          }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </ScrollView>
  );
}
