import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

/**
 * FulfillmentTracker Component
 *
 * Displays four independent fulfillment tracking dimensions:
 * 1. Payment Status: pending → held → released/refunded
 * 2. Production Status: in_progress → completed
 * 3. Delivery Status: pending → shipped → delivered
 * 4. Escrow Status: locked → released
 *
 * Each dimension tracks independently and can transition at different times.
 * This allows users to see exact order state across all lifecycle phases.
 *
 * Usage:
 * ```tsx
 * <FulfillmentTracker
 *   payment={{status: 'held', updatedAt: '2025-12-14T10:00:00Z'}}
 *   production={{status: 'in_progress', updatedAt: '2025-12-14T09:00:00Z'}}
 *   delivery={{status: 'pending', updatedAt: '2025-12-14T08:00:00Z'}}
 *   escrow={{status: 'locked', updatedAt: '2025-12-14T10:00:00Z'}}
 * />
 * ```
 */

export interface FulfillmentStatus {
  status: string;
  updatedAt: string;
  reason?: string;
}

interface FulfillmentTrackerProps {
  payment: FulfillmentStatus;
  production: FulfillmentStatus;
  delivery: FulfillmentStatus;
  escrow: FulfillmentStatus;
  orderId?: string;
}

/**
 * Get status color based on current state
 */
const getStatusColor = (status: string, type: 'payment' | 'production' | 'delivery' | 'escrow'): string => {
  // Payment states
  if (type === 'payment') {
    if (status === 'released' || status === 'refunded') return colors.success;
    if (status === 'held') return colors.warning;
    if (status === 'failed') return colors.error;
    return colors.gray400;
  }

  // Production states
  if (type === 'production') {
    if (status === 'completed') return colors.success;
    if (status === 'in_progress') return colors.info;
    if (status === 'on_hold') return colors.warning;
    return colors.gray400;
  }

  // Delivery states
  if (type === 'delivery') {
    if (status === 'delivered') return colors.success;
    if (status === 'shipped') return colors.info;
    if (status === 'pending') return colors.warning;
    if (status === 'returned') return colors.error;
    return colors.gray400;
  }

  // Escrow states
  if (type === 'escrow') {
    if (status === 'released') return colors.success;
    if (status === 'locked') return colors.warning;
    return colors.gray400;
  }

  return colors.gray400;
};

/**
 * Get display label for status
 */
const getStatusLabel = (status: string, type: 'payment' | 'production' | 'delivery' | 'escrow'): string => {
  const labels: Record<string, string> = {
    // Payment
    pending: 'Pending Payment',
    held: 'Payment Held',
    released: 'Released',
    refunded: 'Refunded',
    failed: 'Payment Failed',

    // Production
    in_progress: 'In Production',
    completed: 'Completed',
    on_hold: 'On Hold',

    // Delivery
    pending: 'Pending Shipment',
    shipped: 'Shipped',
    delivered: 'Delivered',
    returned: 'Returned',

    // Escrow
    locked: 'Escrow Locked',
    released: 'Escrow Released',
  };

  return labels[status] || status;
};

const StatusItem: React.FC<{
  label: string;
  status: string;
  type: 'payment' | 'production' | 'delivery' | 'escrow';
  updatedAt?: string;
}> = ({ label, status, type, updatedAt }) => {
  const color = getStatusColor(status, type);
  const displayLabel = getStatusLabel(status, type);
  const date = updatedAt ? new Date(updatedAt).toLocaleDateString() : '';

  return (
    <View style={styles.statusItem}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusLabel}>{label}</Text>
        <View style={[styles.statusBadge, { backgroundColor: color }]}>
          <Text style={styles.statusBadgeText}>{displayLabel}</Text>
        </View>
      </View>
      {date && <Text style={styles.statusDate}>{date}</Text>}
    </View>
  );
};

export const FulfillmentTracker: React.FC<FulfillmentTrackerProps> = ({
  payment,
  production,
  delivery,
  escrow,
  orderId,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Status</Text>
        {orderId && <Text style={styles.orderId}>Order #{orderId?.slice(0, 8)}</Text>}
      </View>

      <View style={styles.content}>
        <StatusItem
          label="Payment"
          status={payment.status}
          type="payment"
          updatedAt={payment.updatedAt}
        />
        <View style={styles.divider} />

        <StatusItem
          label="Production"
          status={production.status}
          type="production"
          updatedAt={production.updatedAt}
        />
        <View style={styles.divider} />

        <StatusItem
          label="Delivery"
          status={delivery.status}
          type="delivery"
          updatedAt={delivery.updatedAt}
        />
        <View style={styles.divider} />

        <StatusItem
          label="Escrow"
          status={escrow.status}
          type="escrow"
          updatedAt={escrow.updatedAt}
        />
      </View>

      {/* Status summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          All statuses update independently based on order progress
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginVertical: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  orderId: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
  },
  content: {
    paddingVertical: spacing.md,
  },
  statusItem: {
    marginVertical: spacing.sm,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  statusDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.sm,
  },
  summary: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  summaryText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
    fontStyle: 'italic',
  },
});
