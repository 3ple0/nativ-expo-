import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { theme } from '@/constants/theme';
import { useCartStore } from '@/src/store/cart.store';
import { PaymentMethodSelector } from '@/src/components/payments';

/**
 * CHECKOUT SCREEN
 *
 * Review order and select payment method.
 * Displays:
 * - Order summary
 * - Pricing breakdown
 * - Payment method selector
 * - Proceed to payment
 */
export default function CheckoutScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'transfer' | null>(null);
  const [loading, setLoading] = useState(false);

  const { items, total } = useCartStore((state) => ({
    items: state.items,
    total: state.items.reduce((sum, item) => sum + item.price, 0),
  }));

  const handleProceed = async () => {
    if (!selectedMethod) {
      console.warn('Please select a payment method');
      return;
    }

    try {
      setLoading(true);
      // TODO: Initiate payment with selected method
      // router.push('/payments/nativpay');
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <View style={{ padding: 16 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.neutral[900],
          marginBottom: 4,
        }}>
          Checkout
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.colors.neutral[600],
          marginBottom: 16,
        }}>
          Review and confirm your order
        </Text>

        {/* Order Summary */}
        <View style={{
          backgroundColor: theme.colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          elevation: 2,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.neutral[900],
            marginBottom: 12,
          }}>
            Order Summary
          </Text>

          {items.map((item, index) => (
            <View
              key={index}
              style={{
                paddingVertical: 8,
                borderBottomWidth: index < items.length - 1 ? 1 : 0,
                borderBottomColor: theme.colors.neutral[200],
              }}
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}>
                <Text style={{ fontSize: 13, color: theme.colors.neutral[700] }}>
                  {item.fabric?.name || 'Item'}
                </Text>
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: theme.colors.neutral[900],
                }}>
                  ₦{item.price.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}

          {/* Total */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 2,
            borderTopColor: theme.colors.primary[100],
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: theme.colors.neutral[900],
            }}>
              Total
            </Text>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.colors.primary[600],
            }}>
              ₦{total.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.neutral[900],
            marginBottom: 12,
          }}>
            Select Payment Method
          </Text>
          <PaymentMethodSelector
            value={selectedMethod}
            onChange={setSelectedMethod}
          />
        </View>

        {/* Escrow Info */}
        <View style={{
          backgroundColor: theme.colors.status.success_light,
          borderRadius: 12,
          padding: 12,
          marginBottom: 20,
        }}>
          <Text style={{
            fontSize: 13,
            color: theme.colors.neutral[700],
            lineHeight: 18,
          }}>
            💰 Your payment will be held in escrow until delivery is confirmed. No funds will be released until you receive your order.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleProceed}
          disabled={!selectedMethod || loading}
          style={{
            backgroundColor: selectedMethod ? theme.colors.primary[600] : theme.colors.neutral[300],
            borderRadius: 8,
            padding: 16,
            alignItems: 'center',
            marginBottom: 16,
            opacity: loading ? 0.5 : 1,
          }}
        >
          <Text style={{
            color: theme.colors.white,
            fontSize: 16,
            fontWeight: '700',
          }}>
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
