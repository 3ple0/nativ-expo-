import { apiClient } from './client';
import { Escrow, Payment } from '../models/Escrow';

/**
 * Payments API
 *
 * All payments go through nativPay escrow service
 * See nativpay.client.ts for detailed implementation
 *
 * Non-negotiable:
 * - All payments routed through escrow
 * - Lifecycle: created → held → released/refunded
 * - Release only after delivery confirmation
 */

export interface InitiatePaymentPayload {
  amount: number;
  currency: string;
  method: 'card' | 'transfer' | 'wallet';
  orderId?: string;
}

export interface InitiateEscrowPayload {
  amount: number;
  currency: string;
  sellerId: string;
  orderId: string;
}

export const paymentsApi = {
  // Payments
  initiatePayment: async (payload: InitiatePaymentPayload): Promise<Payment> => {
    const { data } = await apiClient.post('/payments/initiate', payload);
    return data;
  },

  getPayment: async (paymentId: string): Promise<Payment> => {
    const { data } = await apiClient.get(`/payments/${paymentId}`);
    return data;
  },

  getPayments: async (userId: string): Promise<Payment[]> => {
    const { data } = await apiClient.get('/payments', { params: { userId } });
    return data;
  },

  confirmPayment: async (paymentId: string, token: string): Promise<Payment> => {
    const { data } = await apiClient.post(`/payments/${paymentId}/confirm`, { token });
    return data;
  },

  // Escrow
  initiateEscrow: async (payload: InitiateEscrowPayload): Promise<Escrow> => {
    const { data } = await apiClient.post('/escrow/initiate', payload);
    return data;
  },

  getEscrow: async (escrowId: string): Promise<Escrow> => {
    const { data } = await apiClient.get(`/escrow/${escrowId}`);
    return data;
  },

  releaseEscrow: async (escrowId: string): Promise<Escrow> => {
    const { data } = await apiClient.post(`/escrow/${escrowId}/release`);
    return data;
  },

  refundEscrow: async (escrowId: string): Promise<Escrow> => {
    const { data } = await apiClient.post(`/escrow/${escrowId}/refund`);
    return data;
  },

  disputeEscrow: async (escrowId: string, reason: string): Promise<Escrow> => {
    const { data } = await apiClient.post(`/escrow/${escrowId}/dispute`, { reason });
    return data;
  },

  // Wallet
  getWalletBalance: async (userId: string): Promise<{ balance: number; currency: string }> => {
    const { data } = await apiClient.get('/wallet/balance', { params: { userId } });
    return data;
  },

  addToWallet: async (amount: number): Promise<Payment> => {
    const { data } = await apiClient.post('/wallet/add-funds', { amount });
    return data;
  },
};
