"use client";

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { theme } from '@/constants/theme';

/**
 * NATIVPAY PAYMENT SCREEN
 *
 * Payment processing with nativPay.
 * Handles:
 * - Payment gateway integration
 * - Escrow initiation
 * - Loading states
 * - Error handling
 */
export default function NativePayScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  const handleSuccess = () => {
    setStatus('success');
    // TODO: Update escrow store, navigate to fulfillment
    setTimeout(() => {
      router.replace('/orders');
    }, 2000);
  };

  const handleError = () => {
    setStatus('error');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}
      contentContainerStyle={{ justifyContent: 'center', minHeight: '100%' }}
    >
      <View style={{ padding: 16, alignItems: 'center' }}>
        {status === 'processing' && (
          <>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary[600]}
              style={{ marginBottom: 16 }}
            />
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.colors.neutral[900],
              marginBottom: 8,
              textAlign: 'center',
            }}>
              Processing Payment
            </Text>
            <Text style={{
              fontSize: 14,
              color: theme.colors.neutral[600],
              textAlign: 'center',
              lineHeight: 20,
            }}>
              Initializing escrow with nativPay...{'\n'}
              Please do not leave this screen.
            </Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.colors.status.success_light,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 32,
                color: theme.colors.status.success,
              }}>
                ✓
              </Text>
            </View>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.colors.neutral[900],
              marginBottom: 8,
              textAlign: 'center',
            }}>
              Payment Successful
            </Text>
            <Text style={{
              fontSize: 14,
              color: theme.colors.neutral[600],
              textAlign: 'center',
              lineHeight: 20,
            }}>
              Your order has been placed and payment is held in escrow.{'\n'}
              Redirecting to orders...
            </Text>
          </>
        )}

        {status === 'error' && (
          <>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.colors.status.error_light,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 32,
                color: theme.colors.status.error,
              }}>
                ✕
              </Text>
            </View>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.colors.neutral[900],
              marginBottom: 8,
              textAlign: 'center',
            }}>
              Payment Failed
            </Text>
            <Text style={{
              fontSize: 14,
              color: theme.colors.neutral[600],
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: 20,
            }}>
              We were unable to process your payment. Please try again.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: theme.colors.primary[600],
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
              }}
            >
              <Text style={{
                color: theme.colors.white,
                fontSize: 16,
                fontWeight: '700',
              }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
