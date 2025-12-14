import { supabase } from '@/lib/supabase';
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentState,
  ProductionState,
  DeliveryState,
  EscrowState,
} from '@/src/models/Order';

interface OrderRow {
  id: string;
  user_id: string;
  buyer_id?: string;
  maker_id?: string;
  event_id?: string;
  guest_id?: string;
  fabric_id?: string;
  escrow_id?: string;
  status?: OrderStatus;
  currency?: string;
  total?: number;
  total_price?: number;
  items?: OrderItem[];
  payment?: PaymentState;
  production?: ProductionState;
  delivery?: DeliveryState;
  escrow?: EscrowState;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface OrderDisputeRow {
  id: string;
}

interface OrderDisputeInsert {
  order_id: string;
  initiator_id: string;
  reason: string;
  description: string;
  status: string;
}

const mapOrderRow = (row: OrderRow): Order => ({
  id: row.id,
  userId: row.user_id,
  buyerId: row.buyer_id ?? row.user_id,
  makerId: row.maker_id ?? undefined,
  eventId: row.event_id ?? undefined,
  guestId: row.guest_id ?? undefined,
  fabricId: row.fabric_id ?? undefined,
  escrowId: row.escrow_id ?? undefined,
  status: row.status ?? 'pending',
  currency: row.currency ?? 'USD',
  total: row.total ?? row.total_price ?? 0,
  items: row.items ?? [],
  metadata: row.metadata ?? undefined,
  payment: {
    status: row.payment?.status ?? 'pending',
    escrowId: row.payment?.escrowId ?? row.escrow_id,
    method: row.payment?.method,
    releasedAt: row.payment?.releasedAt,
    proofUrl: row.payment?.proofUrl,
    updatedAt: row.payment?.updatedAt ?? row.updated_at,
  },
  production: {
    status: row.production?.status ?? 'in_progress',
    startedAt: row.production?.startedAt,
    completedAt: row.production?.completedAt,
    notes: row.production?.notes,
    updatedAt: row.production?.updatedAt ?? row.updated_at,
  },
  delivery: {
    status: row.delivery?.status ?? 'pending',
    shippingAddress: row.delivery?.shippingAddress,
    estimatedDelivery: row.delivery?.estimatedDelivery,
    trackingNumber: row.delivery?.trackingNumber,
    shippedAt: row.delivery?.shippedAt,
    deliveredAt: row.delivery?.deliveredAt,
    updatedAt: row.delivery?.updatedAt ?? row.updated_at,
  },
  escrow: {
    status: row.escrow?.status ?? 'locked',
    lockedUntil: row.escrow?.lockedUntil,
    disputedAt: row.escrow?.disputedAt,
    disputeReason: row.escrow?.disputeReason,
    updatedAt: row.escrow?.updatedAt ?? row.updated_at,
  },
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const orderSupabaseService = {
  async fetchOrdersByUser(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from<OrderRow>('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapOrderRow);
  },

  async fetchOrderById(orderId: string): Promise<Order> {
    const { data, error } = await supabase
      .from<OrderRow>('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return mapOrderRow(data);
  },

  async confirmDelivery(order: Order, proofUrl?: string): Promise<Order> {
    const now = new Date().toISOString();
    const delivery = {
      ...order.delivery,
      status: 'delivered' as const,
      deliveredAt: now,
      updatedAt: now,
    };
    const payment = {
      ...order.payment,
      status: 'released' as const,
      releasedAt: now,
      proofUrl: proofUrl ?? order.payment.proofUrl,
      updatedAt: now,
    };
    const escrow = {
      ...order.escrow,
      status: 'released' as const,
      updatedAt: now,
    };

    const { data, error } = await supabase
      .from<OrderRow>('orders')
      .update({
        delivery,
        payment,
        escrow,
        status: 'completed',
        updated_at: now,
      })
      .eq('id', order.id)
      .select('*')
      .single();

    if (error) throw error;
    return mapOrderRow(data);
  },

  async raiseDispute(
    order: Order,
    payload: { reason: string; description: string; initiatorId: string }
  ): Promise<{ order: Order; disputeId: string }> {
    const now = new Date().toISOString();
    const escrow: EscrowState = {
      ...order.escrow,
      status: 'frozen',
      disputedAt: now,
      disputeReason: payload.reason,
      updatedAt: now,
    };

    const disputePayload: OrderDisputeInsert = {
      order_id: order.id,
      initiator_id: payload.initiatorId,
      reason: payload.reason,
      description: payload.description,
      status: 'open',
    };

    const { data: dispute, error: disputeError } = await supabase
      .from<OrderDisputeRow>('order_disputes')
      .insert(disputePayload)
      .select('id')
      .single();

    if (disputeError) throw disputeError;
    if (!dispute) throw new Error('Failed to create dispute record');

    const { data, error } = await supabase
      .from<OrderRow>('orders')
      .update({
        escrow,
        status: 'disputed',
        updated_at: now,
      })
      .eq('id', order.id)
      .select('*')
      .single();

    if (error) throw error;
    return { order: mapOrderRow(data), disputeId: dispute.id };
  },
};
