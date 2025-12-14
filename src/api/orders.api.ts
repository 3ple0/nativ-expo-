import { apiClient } from './client';
import { Order, Cart, EventOrder } from '../models/Order';

/**
 * Orders API
 *
 * Handles:
 * - Regular fabric/design orders
 * - Event-based orders (ASO-EBI)
 * - Fulfillment tracking (payment, production, delivery, escrow)
 * - Cart management
 */

export const ordersApi = {
  // Orders
  getOrders: async (userId: string): Promise<Order[]> => {
    const { data } = await apiClient.get('/orders', { params: { userId } });
    return data;
  },

  getOrder: async (orderId: string): Promise<Order> => {
    const { data } = await apiClient.get(`/orders/${orderId}`);
    return data;
  },

  /**
   * Create order (regular or event-based)
   *
   * Sample payload:
   * POST /orders
   * {
   *   event_id,          // Optional, for event-based orders
   *   fabric_id,
   *   maker_id,          // Tailor/maker
   *   buyer_id,
   *   pricing: {
   *     fabric_cost,
   *     tailoring,
   *     shipping,
   *     tax
   *   }
   * }
   */
  createOrder: async (payload: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const { data } = await apiClient.post('/orders', payload);
    return data;
  },

  /**
   * Create event-based order (ASO-EBI)
   */
  createEventOrder: async (payload: Omit<EventOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventOrder> => {
    const { data } = await apiClient.post('/events/orders', payload);
    return data;
  },

  updateOrder: async (orderId: string, updates: Partial<Order>): Promise<Order> => {
    const { data } = await apiClient.patch(`/orders/${orderId}`, updates);
    return data;
  },

  /**
   * Update fulfillment status
   * Tracks payment, production, delivery, escrow status
   */
  updateFulfillmentStatus: async (
    orderId: string,
    status: {
      payment?: 'pending' | 'held' | 'released' | 'refunded';
      production?: 'in_progress' | 'completed' | 'on_hold';
      delivery?: 'pending' | 'shipped' | 'delivered' | 'returned';
      escrow?: 'locked' | 'released';
    }
  ): Promise<Order> => {
    const { data } = await apiClient.patch(`/orders/${orderId}/fulfillment`, status);
    return data;
  },

  /**
   * Cancel order (within allowed timeframe)
   */
  cancelOrder: async (orderId: string): Promise<void> => {
    await apiClient.post(`/orders/${orderId}/cancel`);
  },

  /**
   * Get orders for an event
   */
  getEventOrders: async (eventId: string): Promise<EventOrder[]> => {
    const { data } = await apiClient.get(`/events/${eventId}/orders`);
    return data;
  },

  // Cart
  getCart: async (userId: string): Promise<Cart> => {
    const { data } = await apiClient.get('/cart', { params: { userId } });
    return data;
  },

  addToCart: async (itemId: string, itemType: 'fabric' | 'design', quantity: number): Promise<Cart> => {
    const { data } = await apiClient.post('/cart/items', { itemId, itemType, quantity });
    return data;
  },

  removeFromCart: async (itemId: string): Promise<Cart> => {
    const { data } = await apiClient.delete(`/cart/items/${itemId}`);
    return data;
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const { data } = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
    return data;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.post('/cart/clear');
  },

  /**
   * Convert cart to order (checkout)
   * Auto-initiates escrow for each item
   */
  checkoutCart: async (paymentMethod: 'card' | 'transfer' | 'wallet'): Promise<Order[]> => {
    const { data } = await apiClient.post('/cart/checkout', { paymentMethod });
    return data;
  },
};
