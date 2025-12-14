import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  FulfillmentTracker,
  EscrowStatusBadge,
  DeliveryConfirmation,
} from '../../src/components/payments';
import { useOrderStore } from '@/src/store/order.store';

/**
 * OrderDetail Screen
 *
 * Comprehensive order view with:
 * - Full fulfillment tracking (4 dimensions)
 * - Escrow status
 * - Delivery confirmation flow
 * - Action buttons (confirm delivery, refund, dispute)
 *
 * Non-negotiable: Shows exact order state and available actions.
 */

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] = useState(false);
  const { orders, selectedOrder, fetchOrder, isLoading, error, confirmDelivery } = useOrderStore();
  const order = selectedOrder?.id === id
    ? selectedOrder
    : orders.find((o) => o.id === id) ?? null;

  useEffect(() => {
    if (!id) return;
    fetchOrder(id).catch((err) => {
      console.error('Failed to fetch order', err);
    });
  }, [id, fetchOrder]);

  const handleConfirmDelivery = async (proofUrl?: string) => {
    if (!order) return;
    try {
      await confirmDelivery(order.id, proofUrl);
      setShowDeliveryConfirmation(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delivery confirmation failed';
      Alert.alert('Delivery Error', message);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if delivery confirmation is needed
  const showDeliveryButton =
    order.status === 'in_progress' &&
    order.payment.status === 'held' &&
    order.delivery.status === 'pending';

  // Check if dispute is available
  const canDispute = order.status === 'completed' && order.escrow.status === 'released';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order #{order.id.slice(0, 8)}</Text>
        <Text style={styles.date}>
          Placed {new Date(order.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Fulfillment Tracker */}
      <View style={styles.section}>
        <FulfillmentTracker
          payment={order.payment}
          production={order.production}
          delivery={order.delivery}
          escrow={order.escrow}
          orderId={order.id}
        />
      </View>

      {/* Escrow Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Escrow Status</Text>
        <EscrowStatusBadge
          status={order.escrow.status as any}
          variant="large"
          showDescription
        />
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items?.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemType}>{item.type}</Text>
            </View>
            <View style={styles.itemDetails}>
              <View>
                <Text style={styles.itemLabel}>Quantity</Text>
                <Text style={styles.itemValue}>{item.quantity}</Text>
              </View>
              <View>
                <Text style={styles.itemLabel}>Unit Price</Text>
                <Text style={styles.itemValue}>
                  {order.currency} {(item.unitPrice / 100).toFixed(2)}
                </Text>
              </View>
              <View>
                <Text style={styles.itemLabel}>Subtotal</Text>
                <Text style={styles.itemValueHighlight}>
                  {order.currency} {(item.amount / 100).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {order.currency} {(order.total / 100).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowDivider]}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValueHighlight}>
              {order.currency} {(order.total / 100).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryNote}>
            <Text style={styles.summaryNoteText}>
              Amount held in escrow until delivery confirmed
            </Text>
          </View>
        </View>
      </View>

      {/* Delivery Confirmation */}
      {showDeliveryButton && (
        <View style={styles.section}>
          {!showDeliveryConfirmation ? (
            <TouchableOpacity
              style={styles.deliveryButton}
              onPress={() => setShowDeliveryConfirmation(true)}
            >
              <Text style={styles.deliveryButtonIcon}>📦</Text>
              <View style={styles.deliveryButtonContent}>
                <Text style={styles.deliveryButtonTitle}>Confirm Delivery</Text>
                <Text style={styles.deliveryButtonSubtitle}>
                  Item arrived? Upload proof and release payment
                </Text>
              </View>
              <Text style={styles.deliveryButtonArrow}>→</Text>
            </TouchableOpacity>
          ) : (
            <DeliveryConfirmation
              orderId={order.id}
              escrowId={`escrow_${order.id}`}
              amount={order.total}
              currency={order.currency}
              onCancel={() => setShowDeliveryConfirmation(false)}
              onConfirm={handleConfirmDelivery}
            />
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.section}>
        <View style={styles.actionsContainer}>
          {order.status !== 'completed' && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📞 Contact Support</Text>
            </TouchableOpacity>
          )}

          {order.escrow.status === 'locked' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={() => router.push(`/orders/${order.id}/dispute`)}
            >
              <Text style={styles.actionButtonText}>⚠ Raise Dispute</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📋 Download Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <View style={styles.helpItem}>
          <Text style={styles.helpIcon}>❓</Text>
          <View style={styles.helpContent}>
            <Text style={styles.helpItemTitle}>How does escrow work?</Text>
            <Text style={styles.helpItemSubtitle}>
              Funds are held safely until you confirm delivery
            </Text>
          </View>
        </View>
        <View style={styles.helpItem}>
          <Text style={styles.helpIcon}>⏱</Text>
          <View style={styles.helpContent}>
            <Text style={styles.helpItemTitle}>When will I receive my order?</Text>
            <Text style={styles.helpItemSubtitle}>
              Production: {order.production.status === 'completed' ? '✓' : '⏳'} |
              Delivery: {order.delivery.status === 'delivered' ? '✓' : '⏳'}
            </Text>
          </View>
        </View>
        <View style={styles.helpItem}>
          <Text style={styles.helpIcon}>💬</Text>
          <View style={styles.helpContent}>
            <Text style={styles.helpItemTitle}>Contact Support</Text>
            <Text style={styles.helpItemSubtitle}>
              support@nativpay.com or tap the button above
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  errorBanner: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.error + '10',
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  itemType: {
    fontSize: typography.fontSize.xs,
    backgroundColor: colors.secondaryLight + '40',
    color: colors.secondaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    fontWeight: typography.fontWeight.semibold,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  itemValue: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  itemValueHighlight: {
    fontSize: typography.fontSize.base,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  summaryRowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.gray600,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  summaryValueHighlight: {
    fontSize: typography.fontSize.lg,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },
  summaryNote: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  summaryNoteText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
    fontStyle: 'italic',
  },
  deliveryButton: {
    backgroundColor: colors.successLight,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  deliveryButtonIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  deliveryButtonContent: {
    flex: 1,
  },
  deliveryButtonTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  deliveryButtonSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.successDark,
  },
  deliveryButtonArrow: {
    fontSize: typography.fontSize.lg,
    color: colors.success,
    marginLeft: spacing.md,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonDanger: {
    borderColor: colors.error,
  },
  actionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  helpSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  helpTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  helpItem: {
    backgroundColor: colors.infoBg,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helpIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  helpContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  helpItemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray700,
  },
});
