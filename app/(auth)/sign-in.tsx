import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { theme } from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';
import { ChevronLeft } from 'lucide-react-native';

/**
 * SIGN IN SCREEN
 *
 * Email/password authentication with Supabase.
 * On success, AuthContext listener hydrates auth store and routes to tabs.
 */
export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * HANDLE SIGN IN
   *
   * 1. Validate input
   * 2. Call supabase.auth.signInWithPassword
   * 3. AuthContext listener will hydrate auth store
   * 4. Route to tabs automatically
   */
  async function handleSignIn() {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        Alert.alert('Sign In Failed', signInError.message);
        return;
      }

      // AuthContext will auto-navigate on successful sign in
    } catch (err: any) {
      const message = err.message || 'An unexpected error occurred';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.white }}
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
      >
        {/* Header */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginBottom: 24,
            padding: 8,
            marginLeft: -8,
          }}
        >
          <ChevronLeft color={theme.colors.neutral[900]} size={24} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: theme.colors.neutral[900],
            marginBottom: 8,
          }}
        >
          Welcome Back
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.neutral[600],
            marginBottom: 32,
            lineHeight: 20,
          }}
        >
          Sign in to access your events, orders, and account settings.
        </Text>

        {/* Error Message */}
        {error && (
          <View
            style={{
              backgroundColor: theme.colors.status.error_light,
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                color: theme.colors.status.error,
                fontSize: 13,
              }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Email Input */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.neutral[900],
              marginBottom: 8,
            }}
          >
            Email
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.colors.neutral[50],
              borderWidth: 1,
              borderColor: theme.colors.neutral[200],
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 14,
              color: theme.colors.neutral[900],
            }}
            placeholder="your@email.com"
            placeholderTextColor={theme.colors.neutral[400]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.neutral[900],
              marginBottom: 8,
            }}
          >
            Password
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.colors.neutral[50],
              borderWidth: 1,
              borderColor: theme.colors.neutral[200],
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 14,
              color: theme.colors.neutral[900],
            }}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.neutral[400]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
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
            marginBottom: 16,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text
              style={{
                color: theme.colors.white,
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Footer */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.neutral[600],
            }}
          >
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push('/sign-up')}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: theme.colors.primary[600],
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
