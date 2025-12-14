"use client";

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
import { supabase } from '@/lib/supabase';
import { ChevronLeft } from 'lucide-react-native';

/**
 * SIGN UP SCREEN
 *
 * New account creation with Supabase.
 * Creates user with 'guest' role by default.
 * On success, user can sign in.
 */
export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * HANDLE SIGN UP
   *
   * 1. Validate inputs
   * 2. Check password match
   * 3. Call supabase.auth.signUp
   * 4. Show confirmation message
   * 5. User signs in with credentials
   */
  async function handleSignUp() {
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        Alert.alert('Sign Up Failed', signUpError.message);
        return;
      }

      Alert.alert(
        'Account Created',
        'Please check your email to verify your account, then sign in.'
      );
      router.replace('/sign-in');
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
          Create Account
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.neutral[600],
            marginBottom: 32,
            lineHeight: 20,
          }}
        >
          Join Nativ+ to buy, coordinate, and deliver with trust.
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
        <View style={{ marginBottom: 16 }}>
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
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.neutral[500],
              marginTop: 6,
            }}
          >
            At least 6 characters
          </Text>
        </View>

        {/* Confirm Password Input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.neutral[900],
              marginBottom: 8,
            }}
          >
            Confirm Password
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
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={handleSignUp}
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
              Create Account
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
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push('/sign-in')}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: theme.colors.primary[600],
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
