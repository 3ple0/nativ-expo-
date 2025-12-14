import { create } from 'zustand';
import { Order } from '@/src/models/Order';
import { orderSupabaseService } from '@/src/api/supabase/orders';

/**
 * Order Store (U3, U4)
 *
 * Manages:
 * - Order retrieval and listing
 * - Delivery confirmation (buyer-only)
 * - Dispute raising (buyer/maker)
 * - Order status tracking
 * - Escrow interaction
 */

interface OrderState {
  // State
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  // Actions - Fetching
  fetchOrders: (userId: string) => Promise<void>;
  fetchOrder: (orderId: string) => Promise<Order>;
  getOrdersByStatus: (status: string) => Order[];

  // Actions - Delivery Confirmation (U3)
  /**
   * Confirms delivery of an order
   * Non-negotiable rules:
   * - Only buyer can confirm delivery (auth.user.id === order.buyer_id)
   * - Only if order.status === 'delivered'
   * - Only if escrow.status === 'held'
   * - Triggers: escrow.status = 'released', payout to maker
   */
  confirmDelivery: (
    orderId: string,
    proofUrl?: string
  ) => Promise<{ success: boolean; escrowReleased: boolean }>;

  // Actions - Dispute Raising (U4)
  /**
   * Raises a dispute on an order
   * Non-negotiable rules:
   * - Can be initiated by buyer or maker
   * - Only if escrow.status === 'held'
   * - Freezes escrow immediately (prevents release)
   * - Requires description and reason
   * - Admin must review and resolve
   */
  raiseDispute: (
    orderId: string,
    reason: string,
    description: string,
    initiatorId: string
  ) => Promise<{ success: boolean; disputeId: string }>;

  // Actions - Timeline
  getOrderTimeline: (orderId: string) => {
    status: string;
    timestamp: string;
    description: string;
  }[];

  // Actions - Status Checks
  canConfirmDelivery: (order: Order, userId: string) => boolean;
  canRaiseDispute: (order: Order, userId: string) => boolean;
  canRefund: (order: Order) => boolean;

  // Cleanup
  clearError: () => void;
  reset: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Initial State
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  // Fetch Orders
  fetchOrders: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const orders = await orderSupabaseService.fetchOrdersByUser(userId);
      set({ orders });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch orders';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch Single Order
  fetchOrder: async (orderId: string): Promise<Order> => {
    set({ isLoading: true, error: null });
    try {
      const order = await orderSupabaseService.fetchOrderById(orderId);
      set({ selectedOrder: order });
      return order;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch order';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Get Orders by Status
  getOrdersByStatus: (status: string): Order[] => {
    const { orders } = get();
    return orders.filter((order) => order.status === status);
  },

  // Confirm Delivery (U3)
  confirmDelivery: async (orderId: string, proofUrl?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { orders } = get();
      const order = orders.find((o) => o.id === orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.payment.status !== 'held' || order.delivery.status !== 'pending') {
        throw new Error('Order is not eligible for delivery confirmation');
      }

      const updatedOrder = await orderSupabaseService.confirmDelivery(order, proofUrl);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
        selectedOrder: state.selectedOrder?.id === orderId ? updatedOrder : state.selectedOrder,
      }));

      return { success: true, escrowReleased: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to confirm delivery';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Raise Dispute (U4)
  raiseDispute: async (orderId: string, reason: string, description: string, initiatorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { orders } = get();
      const order = orders.find((o) => o.id === orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.escrow.status !== 'locked') {
        throw new Error('Escrow must be locked to raise a dispute');
      }

      const buyerId = order.buyerId ?? order.userId;
      const isBuyer = initiatorId === buyerId;
      const isMaker = order.makerId ? initiatorId === order.makerId : false;

      if (!isBuyer && !isMaker) {
        throw new Error('Only buyer or maker can raise disputes');
      }

      const result = await orderSupabaseService.raiseDispute(order, {
        reason,
        description,
        initiatorId,
      });

      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? result.order : o)),
        selectedOrder: state.selectedOrder?.id === orderId ? result.order : state.selectedOrder,
      }));

      return { success: true, disputeId: result.disputeId };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to raise dispute';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Get Order Timeline
  getOrderTimeline: (orderId: string) => {
    const { orders } = get();
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
      return [];
    }

    const fallbackTimestamp = (value?: string) => value ?? order.updatedAt;
    const timeline: {
      status: string;
      timestamp: string;
      description: string;
    }[] = [
      {
        status: 'created',
        timestamp: order.createdAt,
        description: 'Order placed and escrow initiated',
      },
    ];

    if (order.production.status === 'in_progress') {
      timeline.push({
        status: 'production_in_progress',
        timestamp: fallbackTimestamp(order.production.startedAt ?? order.production.updatedAt),
        description: 'Tailor started production',
      });
    }

    if (order.production.status === 'completed') {
      timeline.push({
        status: 'production_completed',
        timestamp: fallbackTimestamp(order.production.completedAt ?? order.production.updatedAt),
        description: 'Production completed',
      });
    }

    if (order.delivery.status === 'shipped') {
      timeline.push({
        status: 'in_delivery',
        timestamp: fallbackTimestamp(order.delivery.shippedAt ?? order.delivery.updatedAt),
        description: 'Item shipped and in transit',
      });
    }

    if (order.delivery.status === 'delivered') {
      timeline.push({
        status: 'delivered',
        timestamp: fallbackTimestamp(order.delivery.deliveredAt ?? order.delivery.updatedAt),
        description: 'Item delivered to buyer',
      });
    }

    if (order.payment.status === 'released') {
      timeline.push({
        status: 'payment_released',
        timestamp: fallbackTimestamp(order.payment.releasedAt ?? order.payment.updatedAt),
        description: 'Payment released to maker',
      });
    }

    if (order.escrow.status === 'released') {
      timeline.push({
        status: 'escrow_released',
        timestamp: fallbackTimestamp(order.escrow.updatedAt),
        description: 'Escrow closed after successful delivery',
      });
    }

    return timeline;
  },

  // Can Confirm Delivery Check
  canConfirmDelivery: (order: Order, userId: string): boolean => {
    const buyerId = order.buyerId ?? order.userId;
    return (
      buyerId === userId &&
      order.delivery.status === 'pending' &&
      order.payment.status === 'held'
    );
  },

  // Can Raise Dispute Check
  canRaiseDispute: (order: Order, userId: string): boolean => {
    const buyerId = order.buyerId ?? order.userId;
    return (
      (buyerId === userId || order.makerId === userId) &&
      order.escrow.status === 'locked'
    );
  },

  // Can Refund Check (admin only)
  canRefund: (order: Order): boolean => {
    return order.escrow.status === 'frozen' && order.status !== 'completed';
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },

  // Reset
  reset: () => {
    set({
      orders: [],
      selectedOrder: null,
      isLoading: false,
      error: null,
    });
  },
}));
