import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Order } from '@/src/models/Order';
import { useOrderStore } from '@/src/store/order.store';
import { useAuthStore } from '@/src/store/auth.store';

/**
 * OrdersList Screen
 *
 * Displays all user orders with quick status view.
 * Non-negotiable: Shows fulfillment status across all dimensions.
 *
 * Features:
 * - Lists all orders (regular + event-based)
 * - Quick status indicators
 * - Filter by status
 * - Tap to view details
 */

export default function OrdersListScreen() {
  const router = useRouter();
  const { orders, isLoading, error, fetchOrders } = useOrderStore();
  const userId = useAuthStore((state) => state.user?.id);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    if (!userId) return;

    fetchOrders(userId).catch((err) => {
      console.error('Failed to fetch orders', err);
    });
  }, [userId, fetchOrders]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'in_progress':
        return colors.info;
      case 'completed':
        return colors.success;
      default:
        return colors.gray400;
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      canceled: 'Canceled',
    };
    return labels[status] || status;
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const renderOrderItem = ({ item: order }: { item: Order }) => {
    const isEventOrder = Boolean(order.eventId);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/orders/${order.id}`)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status) },
            ]}
          >
            <Text style={styles.statusBadgeText}>{getStatusLabel(order.status)}</Text>
          </View>
        </View>

        {/* Amount & Event Badge */}
        <View style={styles.cardContent}>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>USD {order.total.toLocaleString()}</Text>
            {isEventOrder && <Text style={styles.eventBadge}>📅 Event</Text>}
          </View>

          {/* Quick Status Indicators */}
          <View style={styles.statusIndicators}>
            <StatusIndicator
              label="Payment"
              status={order.payment.status}
              type="payment"
            />
            <StatusIndicator
              label="Production"
              status={order.production.status}
              type="production"
            />
            <StatusIndicator
              label="Delivery"
              status={order.delivery.status}
              type="delivery"
            />
            <StatusIndicator
              label="Escrow"
              status={order.escrow.status}
              type="escrow"
            />
          </View>
        </View>

        {/* Action Hint */}
        <View style={styles.actionHint}>
          <Text style={styles.actionHintText}>
            {order.status === 'in_progress' && order.delivery.status === 'pending'
              ? '→ Confirm delivery'
              : order.status === 'completed'
              ? '→ View details'
              : '→ Track order'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyTitle}>Sign in to view your orders</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>Track all your orders and escrows</Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'in_progress', 'completed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f as typeof filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f && styles.filterButtonTextActive,
              ]}
            >
              {f === 'all' ? 'All' : f === 'in_progress' ? 'Active' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={[styles.emptyState, styles.centerContent]}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No Orders</Text>
          <Text style={styles.emptySubtitle}>
            You haven't placed any {filter !== 'all' ? filter : ''} orders yet
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * StatusIndicator Component - Quick status dot
 */
const StatusIndicator: React.FC<{
  label: string;
  status: string;
  type: 'payment' | 'production' | 'delivery' | 'escrow';
}> = ({ label, status, type }) => {
  let color = colors.gray400;

  if (type === 'payment') {
    if (status === 'released') color = colors.success;
    else if (status === 'held') color = colors.warning;
    else if (status === 'failed') color = colors.error;
  } else if (type === 'production') {
    if (status === 'completed') color = colors.success;
    else if (status === 'in_progress') color = colors.info;
  } else if (type === 'delivery') {
    if (status === 'delivered') color = colors.success;
    else if (status === 'shipped') color = colors.info;
  } else if (type === 'escrow') {
    if (status === 'released') color = colors.success;
    else if (status === 'locked') color = colors.warning;
  }

  return (
    <View style={styles.statusIndicator}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={styles.statusIndicatorLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
  },
  errorBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.error + '10',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray200,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderId: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  orderDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  cardContent: {
    marginBottom: spacing.md,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  amount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  eventBadge: {
    fontSize: typography.fontSize.xs,
    backgroundColor: colors.infoBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  statusIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusIndicatorLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray700,
  },
  actionHint: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  actionHintText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyState: {
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray600,
    textAlign: 'center',
  },
});
