import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';
import { useCartStore } from '@/src/store/cart.store';

/**
 * CART SCREEN
 *
 * Shopping cart for current order.
 * Displays:
 * - Items in cart
 * - Pricing breakdown
 * - Checkout button
 */
export default function CartScreen() {
  const { items, total } = useCartStore((state) => ({
    items: state.items,
    total: state.items.reduce((sum, item) => sum + item.price, 0),
  }));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <View style={{ padding: 16 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.neutral[900],
          marginBottom: 4,
        }}>
          Shopping Cart
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.colors.neutral[600],
          marginBottom: 16,
        }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </Text>

        {items.length === 0 ? (
          <View style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 32,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
          }}>
            <Text style={{
              fontSize: 16,
              color: theme.colors.neutral[600],
              marginBottom: 8,
            }}>
              Your cart is empty
            </Text>
            <Text style={{
              fontSize: 13,
              color: theme.colors.neutral[500],
            }}>
              Browse fabrics or events to add items
            </Text>
          </View>
        ) : (
          <>
            <View style={{
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              elevation: 2,
            }}>
              {items.map((item, index) => (
                <View key={index} style={{
                  paddingVertical: 12,
                  borderBottomWidth: index < items.length - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.neutral[200],
                }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.colors.neutral[900],
                    }}>
                      {item.fabric?.name || 'Item'}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: theme.colors.primary[600],
                    }}>
                      ₦{item.price.toLocaleString()}
                    </Text>
                  </View>
                  {item.maker && (
                    <Text style={{
                      fontSize: 12,
                      color: theme.colors.neutral[600],
                    }}>
                      Maker: {item.maker.name}
                    </Text>
                  )}
                  {item.meters && (
                    <Text style={{
                      fontSize: 12,
                      color: theme.colors.neutral[600],
                    }}>
                      Quantity: {item.meters}m
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Total */}
            <View style={{
              backgroundColor: theme.colors.primary[50],
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.neutral[900],
              }}>
                Total
              </Text>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: theme.colors.primary[600],
              }}>
                ₦{total.toLocaleString()}
              </Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
