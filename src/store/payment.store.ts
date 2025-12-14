import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { DistributionMode } from '@/src/models/Event';

/**
 * Payment Store
 *
 * Manages payment flows for ASO-EBI events.
 * All payments go through escrow (no direct transfers).
 *
 * Payment Scenarios:
 * 1. Host Purchase: Host pays upfront for all guests → escrow held
 * 2. Guest Self: Each guest pays individually → per-guest escrow held
 * 3. Mixed: Host pays deposit, guests pay balance → multi-escrow
 *
 * Payment Status Flow:
 * pending → held (escrow) → processing → released (after delivery)
 */

export interface PaymentRecord {
  id: string;
  event_id: string;
  order_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'held' | 'completed' | 'failed' | 'refunded';
  payment_method: 'nativpay' | 'bank_transfer' | 'card';
  escrow_id?: string;
  reference_id?: string;
  paid_at?: string;
  created_at?: string;
}

export interface PaymentSplit {
  participant_id: string;
  amount: number;
  status: 'pending' | 'completed';
}

interface PaymentState {
  payments: PaymentRecord[];
  splits: PaymentSplit[];
  isLoading: boolean;
  error: string | null;

  // Record a new payment (initiate escrow)
  recordPayment: (payload: Partial<PaymentRecord>) => Promise<void>;

  // Get payments for an event
  fetchEventPayments: (eventId: string) => Promise<void>;

  // Get payments for a specific order
  fetchOrderPayments: (orderId: string) => Promise<void>;

  // Calculate total collected for event
  getEventRevenue: (eventId: string) => Promise<number>;

  // Calculate remaining balance by distribution mode
  calculateBalance: (
    eventId: string,
    mode: DistributionMode
  ) => Promise<{ collected: number; required: number; remaining: number }>;

  // Verify escrow is complete before allowing delivery
  verifyPaymentComplete: (orderId: string) => Promise<boolean>;

  // Process refund (if cancellation)
  refundPayment: (paymentId: string, reason: string) => Promise<void>;

  // Clear local state
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  splits: [],
  isLoading: false,
  error: null,

  recordPayment: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        payments: [...state.payments, data],
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record payment';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEventPayments: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ payments: data || [] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch payments';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrderPayments: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ payments: data || [] });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch order payments';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  getEventRevenue: async (eventId) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('event_id', eventId)
        .in('status', ['held', 'completed']);

      if (error) throw error;

      const total = (data || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      return total;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate revenue';
      set({ error: message });
      return 0;
    }
  },

  calculateBalance: async (eventId, mode) => {
    try {
      // Fetch event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('price_per_person, target_participants')
        .eq('id', eventId)
        .single();

      if (eventError || !event) throw eventError || new Error('Event not found');

      const totalRequired = event.price_per_person * event.target_participants;

      // Get current revenue
      const { data: payments, error: paymentError } = await supabase
        .from('payments')
        .select('amount')
        .eq('event_id', eventId)
        .in('status', ['held', 'completed']);

      if (paymentError) throw paymentError;

      const collected = (payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      return {
        collected,
        required: totalRequired,
        remaining: Math.max(0, totalRequired - collected),
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to calculate balance';
      set({ error: message });
      return { collected: 0, required: 0, remaining: 0 };
    }
  },

  verifyPaymentComplete: async (orderId) => {
    try {
      // Check if order has completed escrow
      const { data: payment, error } = await supabase
        .from('payments')
        .select('status, escrow_id')
        .eq('order_id', orderId)
        .in('status', ['held', 'completed'])
        .single();

      if (error && error.code !== 'PGRST116') throw error; // 'not found' is ok

      if (!payment || payment.status !== 'held') {
        return false;
      }

      // Verify escrow is actually held in escrow service
      if (payment.escrow_id) {
        const { data: escrow, error: escrowError } = await supabase
          .from('escrows')
          .select('status')
          .eq('id', payment.escrow_id)
          .single();

        if (escrowError) throw escrowError;
        return escrow?.status === 'held';
      }

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to verify payment';
      set({ error: message });
      return false;
    }
  },

  refundPayment: async (paymentId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', paymentId);

      if (error) throw error;

      set((state) => ({
        payments: state.payments.map((p) =>
          p.id === paymentId ? { ...p, status: 'refunded' } : p
        ),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refund payment';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({ payments: [], splits: [], isLoading: false, error: null });
  },
}));
