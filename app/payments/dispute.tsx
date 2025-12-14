"use client";

import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { DisputeResolution } from '@/src/components/payments';
import { Order } from '@/src/models/Order';

/**
 * Dispute Screen
 *
 * Wraps the DisputeResolution component in a full screen.
 * Shows order details and handles dispute submission.
 *
 * Non-negotiable:
 * - 30-day dispute window after delivery
 * - Photo/evidence required
 * - Neutral mediator reviews
 */

export default function DisputeScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch order from API
    // const fetchOrder = async () => {
    //   const orderData = await ordersApi.getOrder(orderId);
    //   setOrder(orderData);
    //   setIsLoading(false);
    // };
    // fetchOrder();

    // Mock data
    const mockOrder: Order = {
      id: orderId || 'order_001',
      userId: 'user_123',
      items: [],
      total: 40000,
      currency: 'USD',
      status: 'completed',
      payment: { status: 'released' },
      production: { status: 'completed' },
      delivery: { status: 'delivered' },
      escrow: { status: 'released' },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrder(mockOrder);
    setIsLoading(false);
  }, [orderId]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text>Order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <DisputeResolution
        orderId={order.id}
        escrowId={`escrow_${order.id}`}
        amount={order.total}
        currency={order.currency}
        onInitiate={async (payload) => {
          // TODO: Submit dispute via API
          // await paymentsApi.initiateDispute({
          //   orderId: order.id,
          //   ...payload
          // });
          router.back();
        }}
        onCancel={() => router.back()}
      />
    </ScrollView>
  );
}
