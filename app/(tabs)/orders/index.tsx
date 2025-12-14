import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOrderStore } from '@/src/store/order.store';
import { useAuthStore } from '@/src/store/auth.store';
import { spacing, colors, typography } from '@/src/theme';
import { Button } from '@/components/ui/Button';
import { Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react-native';

/**
 * Orders List Screen (U3)
 *
 * Shows all user orders with production timeline visualization.
 * Features:
 * - Order cards with status timeline
 * - Filters: All / Pending / In Production / Delivered / Disputed
 * - Quick actions (confirm delivery, raise dispute)
 * - Empty state with guidance
 */

type OrderFilter = 'all' | 'in_production' | 'delivered' | 'completed' | 'disputed';

interface OrderCardProps {
  orderId: string;
  fabricName: string;
  makerName: string;
  amount: number;
  status: string;
  deliveryStatus: string;
  paymentStatus: string;
  createdAt: string;
  onPress: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  fabricName,
  makerName,
  amount,
  status,
  deliveryStatus,
  paymentStatus,
  createdAt,
  onPress,
}) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'in_production':
        return { bg: colors.info[50], text: colors.info[700] };
      case 'in_delivery':
        return { bg: colors.warning[50], text: colors.warning[700] };
      case 'delivered':
        return { bg: colors.success[50], text: colors.success[700] };
      case 'completed':
        return { bg: colors.success[100], text: colors.success[800] };
      case 'disputed':
        return { bg: colors.error[50], text: colors.error[700] };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[700] };
    }
  };

  const getTimelineStages = () => {
    const stages = [
      { id: 'payment', label: 'Payment', icon: '💳', active: paymentStatus === 'held' },
      {
        id: 'production',
        label: 'Production',
        icon: '⚙️',
        active: status === 'in_production',
      },
      { id: 'delivery', label: 'Delivery', icon: '📦', active: status === 'in_delivery' },
      {
        id: 'complete',
        label: 'Complete',
        icon: '✓',
        active: status === 'delivered' || deliveryStatus === 'confirmed',
      },
    ];
    return stages;
  };

  const stages = getTimelineStages();
  const badgeColor = getStatusBadgeColor(status);
  const daysAgo = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary[500],
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              typography.body2Bold,
              { color: colors.neutral[900], marginBottom: spacing.xs },
            ]}
          >
            Order #{orderId.slice(0, 8)}
          </Text>
          <Text
            style={[
              typography.body3,
              { color: colors.neutral[600] },
            ]}
          >
            {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago
          </Text>
        </View>
        <View
          style={{
            backgroundColor: badgeColor.bg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: 6,
          }}
        >
          <Text
            style={[
              typography.body3,
              { color: badgeColor.text, fontWeight: '600' },
            ]}
          >
            {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Fabric & Maker */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={[typography.body2, { color: colors.neutral[900] }]}>{fabricName}</Text>
        <Text style={[typography.body3, { color: colors.neutral[600] }]}>By {makerName}</Text>
      </View>

      {/* Timeline */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
          paddingVertical: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
          borderBottomWidth: 1,
          borderBottomColor: colors.neutral[200],
        }}
      >
        {stages.map((stage, index) => (
          <View
            key={stage.id}
            style={{ alignItems: 'center', flex: 1 }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: stage.active ? colors.primary[500] : colors.neutral[200],
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.xs,
              }}
            >
              <Text style={{ fontSize: 14 }}>{stage.icon}</Text>
            </View>
            <Text
              style={[
                typography.body3,
                {
                  color: stage.active ? colors.primary[700] : colors.neutral[500],
                  textAlign: 'center',
                  fontSize: 10,
                },
              ]}
            >
              {stage.label}
            </Text>

            {/* Connector */}
            {index < stages.length - 1 && (
              <View
                style={{
                  position: 'absolute',
                  left: '60%',
                  top: 16,
                  width: '40%',
                  height: 2,
                  backgroundColor:
                    stage.active || stages[index + 1]?.active
                      ? colors.primary[300]
                      : colors.neutral[300],
                }}
              />
            )}
          </View>
        ))}
      </View>

      {/* Amount & Action */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={[
            typography.heading3,
            { color: colors.primary[600] },
          ]}
        >
          ₦{(amount / 100).toFixed(2)}
        </Text>
        <Text
          style={[
            typography.body3,
            { color: colors.primary[500] },
          ]}
        >
          View →
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function OrdersListScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const {
    orders,
    isLoading,
    fetchOrders,
    getOrdersByStatus,
  } = useOrderStore();

  const [filter, setFilter] = useState<OrderFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id]);

  const loadOrders = async () => {
    try {
      if (user?.id) {
        await fetchOrders(user.id);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredOrders =
    filter === 'all'
      ? orders
      : orders.filter((order) => order.status === filter);

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xl,
      }}
    >
      <Text
        style={[
          typography.heading2,
          { color: colors.neutral[600], marginBottom: spacing.md, textAlign: 'center' },
        ]}
      >
        No Orders Yet
      </Text>
      <Text
        style={[
          typography.body2,
          { color: colors.neutral[500], marginBottom: spacing.lg, textAlign: 'center' },
        ]}
      >
        Start shopping to see your orders here
      </Text>
      <Button
        title="Browse Events"
        onPress={() => router.push('/(tabs)/events')}
      />
    </View>
  );

  if (isLoading && orders.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.neutral[50],
        }}
      >
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.neutral[50] }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary[600]]}
        />
      }
    >
      <View style={{ padding: spacing.lg }}>
        {/* Header */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={[
              typography.heading2,
              { color: colors.neutral[900], marginBottom: spacing.md },
            ]}
          >
            My Orders
          </Text>
          <Text
            style={[
              typography.body2,
              { color: colors.neutral[600] },
            ]}
          >
            Track your purchases and production progress
          </Text>
        </View>

        {/* Filters */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            marginBottom: spacing.lg,
            overflow: 'hidden',
          }}
        >
          {(['all', 'in_production', 'delivered', 'completed'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: 8,
                backgroundColor:
                  filter === f ? colors.primary[600] : colors.white,
                borderWidth: 1,
                borderColor:
                  filter === f ? colors.primary[600] : colors.neutral[200],
              }}
            >
              <Text
                style={[
                  typography.body3,
                  {
                    color:
                      filter === f ? colors.white : colors.neutral[700],
                    fontWeight: '600',
                  },
                ]}
              >
                {f === 'all'
                  ? 'All'
                  : f === 'in_production'
                    ? 'Production'
                    : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <View style={{ marginTop: spacing.lg }}>
            <Text
              style={[
                typography.body2,
                {
                  color: colors.neutral[600],
                  textAlign: 'center',
                  marginVertical: spacing.lg,
                },
              ]}
            >
              No {filter !== 'all' ? filter : ''} orders
            </Text>
          </View>
        ) : (
          <View>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                orderId={order.id}
                fabricName="Ankara Print Fabric" // TODO: Get from fabric store
                makerName="Master Tailor" // TODO: Get from maker store
                amount={order.amount || 40000}
                status={order.status}
                deliveryStatus={order.deliveryStatus || 'pending'}
                paymentStatus={order.paymentStatus || 'held'}
                createdAt={order.createdAt}
                onPress={() => router.push(`/orders/${order.id}`)}
              />
            ))}
          </View>
        )}

        {/* Help Section */}
        {orders.length > 0 && (
          <View
            style={{
              backgroundColor: colors.info[50],
              borderRadius: 12,
              padding: spacing.lg,
              marginTop: spacing.lg,
              marginBottom: spacing.lg,
            }}
          >
            <Text
              style={[
                typography.body2Bold,
                { color: colors.info[700], marginBottom: spacing.md },
              ]}
            >
              📚 Order Status Guide
            </Text>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Text style={{ color: colors.info[700] }}>💳</Text>
                <Text style={[typography.body3, { color: colors.info[700], flex: 1 }]}>
                  <Text style={{ fontWeight: '600' }}>Payment:</Text> Funds held in escrow
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Text style={{ color: colors.info[700] }}>⚙️</Text>
                <Text style={[typography.body3, { color: colors.info[700], flex: 1 }]}>
                  <Text style={{ fontWeight: '600' }}>Production:</Text> Tailor working on your order
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Text style={{ color: colors.info[700] }}>📦</Text>
                <Text style={[typography.body3, { color: colors.info[700], flex: 1 }]}>
                  <Text style={{ fontWeight: '600' }}>Delivery:</Text> In transit to you
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Text style={{ color: colors.info[700] }}>✓</Text>
                <Text style={[typography.body3, { color: colors.info[700], flex: 1 }]}>
                  <Text style={{ fontWeight: '600' }}>Complete:</Text> Payment released to tailor
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
