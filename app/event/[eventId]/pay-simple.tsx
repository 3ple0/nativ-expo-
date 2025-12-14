import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { usePaymentStore } from '@/src/store/payment.store';
import { useAuthStore } from '@/src/store/auth.store';
import { spacing, colors } from '@/src/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Lock, Shield } from 'lucide-react-native';

const mockEvent = {
  id: '1',
  title: 'AsoEbi Event 2024',
  price_per_person: 85000,
};

export default function GuestPaymentScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { user } = useAuthStore();
  const { recordPayment, isLoading } = usePaymentStore();

  const [amountToPay, setAmountToPay] = useState('50000');
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const activeEvent = mockEvent;

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to make a payment');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the payment terms');
      return;
    }

    const finalAmount = useCustom
      ? parseFloat(customAmount)
      : parseFloat(amountToPay);

    if (isNaN(finalAmount) || finalAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await recordPayment({
        event_id: eventId,
        payer_id: user.id,
        amount: finalAmount,
        currency: 'NGN',
        status: 'pending',
        payment_method: 'nativpay',
      });

      Alert.alert('Payment Initiated', 'Your payment is now in escrow. Tailor will begin work shortly.', [
        {
          text: 'Track Order',
          onPress: () => router.replace('/orders'),
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      Alert.alert('Payment Error', message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!activeEvent) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.neutral[50], justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.error[600], fontSize: 18, fontWeight: '600' }}>
          Event not found
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
        <View style={{ padding: spacing.lg }}>
          {/* Header */}
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.neutral[900] }}>
            Payment
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.neutral[600], marginTop: spacing.sm }}>
            Secure escrow-based payment
          </Text>

          {/* Error Alert */}
          {error && (
            <View
              style={{
                backgroundColor: colors.error[50],
                borderLeftWidth: 4,
                borderLeftColor: colors.error[500],
                padding: spacing.md,
                marginVertical: spacing.lg,
                borderRadius: 6,
                flexDirection: 'row',
              }}
            >
              <AlertCircle size={20} color={colors.error[500]} style={{ marginRight: spacing.sm }} />
              <Text style={{ fontSize: 16, lineHeight: 24, color: colors.error[700], flex: 1 }}>
                {error}
              </Text>
            </View>
          )}

          {/* Event Summary */}
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: spacing.lg,
              marginVertical: spacing.lg,
              borderWidth: 1,
              borderColor: colors.neutral[200],
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: spacing.md, letterSpacing: 0.5 }}>
              Event Summary
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: spacing.md,
                paddingBottom: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.neutral[200],
              }}
            >
              <Text style={{ fontSize: 16, lineHeight: 24, color: colors.neutral[600] }}>
                Event
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.neutral[900] }}>
                {activeEvent.title}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, lineHeight: 24, color: colors.neutral[600] }}>
                Amount
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary[600] }}>
                ₦{(useCustom ? parseFloat(customAmount) : parseFloat(amountToPay)).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Amount Selection */}
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: spacing.lg,
              marginBottom: spacing.lg,
              borderWidth: 1,
              borderColor: colors.neutral[200],
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: spacing.lg, letterSpacing: 0.5 }}>
              Payment Amount
            </Text>

            <TouchableOpacity
              onPress={() => setUseCustom(false)}
              style={{
                backgroundColor: !useCustom ? colors.primary[50] : colors.neutral[100],
                borderWidth: !useCustom ? 2 : 1,
                borderColor: !useCustom ? colors.primary[300] : colors.neutral[200],
                borderRadius: 8,
                padding: spacing.md,
                marginBottom: spacing.md,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: !useCustom ? colors.primary[900] : colors.neutral[700] }}>
                  Standard Rate
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: !useCustom ? colors.primary[700] : colors.neutral[600], marginTop: spacing.xs }}>
                  Recommended event price
                </Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: !useCustom ? colors.primary[600] : colors.neutral[600] }}>
                ₦{activeEvent.price_per_person?.toLocaleString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setUseCustom(true)}
              style={{
                backgroundColor: useCustom ? colors.primary[50] : colors.neutral[100],
                borderWidth: useCustom ? 2 : 1,
                borderColor: useCustom ? colors.primary[300] : colors.neutral[200],
                borderRadius: 8,
                padding: spacing.md,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: useCustom ? colors.primary[900] : colors.neutral[700] }}>
                Custom Amount
              </Text>
              {useCustom && (
                <View style={{ marginTop: spacing.md }}>
                  <Input
                    placeholder="Enter amount (₦)"
                    value={customAmount}
                    onChangeText={setCustomAmount}
                    keyboardType="decimal-pad"
                    editable={!isProcessing}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Escrow Guarantee */}
          <View
            style={{
              backgroundColor: colors.success[50],
              borderLeftWidth: 4,
              borderLeftColor: colors.success[500],
              padding: spacing.lg,
              borderRadius: 8,
              marginBottom: spacing.lg,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md }}>
              <Shield size={20} color={colors.success[600]} style={{ marginRight: spacing.md, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.success[700] }}>
                  Escrow Protection
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.success[700], marginTop: spacing.xs }}>
                  Your payment is held securely. Funds are only released after you confirm delivery.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Lock size={20} color={colors.success[600]} style={{ marginRight: spacing.md, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.success[700] }}>
                  No Work Without Payment
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.success[700], marginTop: spacing.xs }}>
                  Tailor will not start work until escrow is held. Your money is protected.
                </Text>
              </View>
            </View>
          </View>

          {/* Terms Agreement */}
          <TouchableOpacity
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, paddingVertical: spacing.md }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: agreedToTerms ? colors.primary[600] : colors.neutral[300],
                backgroundColor: agreedToTerms ? colors.primary[600] : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md,
              }}
            >
              {agreedToTerms && <Text style={{ color: colors.white, fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
            </View>
            <Text style={{ fontSize: 16, lineHeight: 24, color: colors.neutral[700], flex: 1 }}>
              I understand payment terms and escrow protection
            </Text>
          </TouchableOpacity>

          {/* Payment Button */}
          <Button
            title={isProcessing ? 'Processing...' : `Pay ₦${(useCustom ? parseFloat(customAmount) : parseFloat(amountToPay)).toLocaleString()}`}
            onPress={handlePayment}
            disabled={isProcessing || !agreedToTerms}
            style={{ marginBottom: spacing.xl }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
