/**
 * nativPay Client
 *
 * Frontend wrapper for nativPay escrow service MVP
 * Handles:
 * - Escrow initiation with mode-specific logic
 * - Payment method selection & processing
 * - Delivery confirmation & fulfillment tracking
 * - Dispute resolution
 *
 * Non-negotiable rules:
 * ✔ All payments go through escrow (no direct transfers)
 * ✔ Escrow lifecycle: created → held → released/refunded
 * ✔ Release only after delivery confirmation
 * ✔ Fabric routed to retailer, tailoring to maker
 * ✔ Mode-specific escrow rules (host/guest/mixed)
 */

import { apiClient } from './client';
import {
  Escrow,
  EscrowMode,
  EscrowRelease,
  Payment,
  nativPayInitiatePayload,
  nativPayResponse,
  DeliveryConfirmation,
  DisputePayload,
} from '../models/Escrow';

/**
 * Escrow Rules (Non-Negotiable)
 * =============================
 *
 * Host Pays:
 *   - 1 escrow record
 *   - Host is payer
 *   - Full amount held for delivery confirmation
 *
 * Guest Pays:
 *   - Per-guest escrow record
 *   - Each guest is payer for their portion
 *   - Separate holds for each guest
 *
 * Mixed Mode:
 *   - Host deposit escrow (host pays % as security)
 *   - Per-guest escrows (guests pay balance)
 *   - Separate lifecycle tracking for each
 */

export class nativPayClient {
  /**
   * Initiate escrow (nativPay contract)
   *
   * Frontend call signature:
   * nativPay.initiateEscrow({
   *   orderId,
   *   amount,
   *   payerId,
   *   mode: 'host' | 'guest' | 'mixed',
   * })
   */
  static async initiateEscrow(payload: nativPayInitiatePayload): Promise<nativPayResponse> {
    const { data } = await apiClient.post('/escrows/initiate', {
      order_id: payload.orderId,
      amount: payload.amount,
      payer_id: payload.payerId,
      payee_id: payload.payeeId,
      mode: payload.mode,  // 'host' | 'guest' | 'mixed'
      event_id: payload.eventId,
      fabric: payload.fabric,
      tailoring: payload.tailoring,
    });

    return {
      escrowId: data.id,
      paymentId: data.payment_id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
    };
  }

  /**
   * Get escrow details
   */
  static async getEscrow(escrowId: string): Promise<Escrow> {
    const { data } = await apiClient.get(`/escrows/${escrowId}`);
    return data;
  }

  /**
   * Get all escrows for a user
   */
  static async getUserEscrows(userId: string): Promise<Escrow[]> {
    const { data } = await apiClient.get('/escrows/user', {
      params: { user_id: userId },
    });
    return data;
  }

  /**
   * Get escrows for an order
   */
  static async getOrderEscrows(orderId: string): Promise<Escrow[]> {
    const { data } = await apiClient.get('/escrows/order', {
      params: { order_id: orderId },
    });
    return data;
  }

  /**
   * Confirm delivery (triggers release)
   * Must be called before escrow can be released
   * Only after delivery confirmation
   */
  static async confirmDelivery(payload: DeliveryConfirmation): Promise<Escrow> {
    const { data } = await apiClient.post('/escrows/confirm-delivery', {
      order_id: payload.orderId,
      escrow_id: payload.escrowId,
      proof_url: payload.proofUrl,
      notes: payload.notes,
    });

    return data;
  }

  /**
   * Release escrow (seller gets paid)
   * Can only be called after delivery confirmation
   * Non-negotiable: no payment before delivery
   */
  static async releaseEscrow(escrowId: string, reason = 'delivery_confirmed'): Promise<Escrow> {
    const { data } = await apiClient.post(`/escrows/${escrowId}/release`, {
      reason,
    });

    return data;
  }

  /**
   * Request refund (buyer-initiated)
   */
  static async requestRefund(escrowId: string, reason: string): Promise<Escrow> {
    const { data } = await apiClient.post(`/escrows/${escrowId}/refund`, {
      reason,
    });

    return data;
  }

  /**
   * Initiate dispute
   */
  static async initializeDispute(payload: DisputePayload): Promise<Escrow> {
    const { data } = await apiClient.post(`/escrows/${payload.escrowId}/dispute`, {
      initiated_by: payload.initiatedBy,
      reason: payload.reason,
      evidence: payload.evidence,
    });

    return data;
  }

  /**
   * Resolve dispute (admin/system only)
   */
  static async resolveDispute(
    escrowId: string,
    payerAmount: number,
    payeeAmount: number,
    notes?: string
  ): Promise<Escrow> {
    const { data } = await apiClient.post(`/escrows/${escrowId}/resolve-dispute`, {
      payer_amount: payerAmount,
      payee_amount: payeeAmount,
      notes,
    });

    return data;
  }

  /**
   * Get release history for escrow
   */
  static async getReleaseHistory(escrowId: string): Promise<EscrowRelease[]> {
    const { data } = await apiClient.get(`/escrows/${escrowId}/releases`);
    return data;
  }

  /**
   * Get payment record
   */
  static async getPayment(paymentId: string): Promise<Payment> {
    const { data } = await apiClient.get(`/payments/${paymentId}`);
    return data;
  }

  /**
   * Create payment (initiate payment processing)
   */
  static async createPayment(escrowId: string, method: 'card' | 'transfer' | 'wallet'): Promise<Payment> {
    const { data } = await apiClient.post('/payments/create', {
      escrow_id: escrowId,
      method,
    });

    return data;
  }

  /**
   * Complete payment (after user completes payment flow)
   */
  static async completePayment(paymentId: string, token?: string): Promise<Payment> {
    const { data } = await apiClient.post(`/payments/${paymentId}/complete`, {
      token,
    });

    return data;
  }

  /**
   * Get wallet balance
   */
  static async getWalletBalance(userId: string): Promise<{ balance: number; currency: string }> {
    const { data } = await apiClient.get('/wallet/balance', {
      params: { user_id: userId },
    });

    return data;
  }

  /**
   * Withdraw from wallet
   */
  static async withdrawFromWallet(
    userId: string,
    amount: number,
    bankAccount: {
      accountNumber: string;
      bankCode: string;
    }
  ): Promise<{ transactionId: string; status: string }> {
    const { data } = await apiClient.post('/wallet/withdraw', {
      user_id: userId,
      amount,
      bank_account: bankAccount,
    });

    return data;
  }
}

/**
 * Usage Examples
 * ==============
 *
 * 1. INITIATE ESCROW (Host Pays Mode)
 * ===================================
 * const response = await nativPayClient.initiateEscrow({
 *   orderId: 'order_123',
 *   amount: 50000,           // ₦50,000 or $50
 *   payerId: hostId,         // Host paying
 *   payeeId: sellerId,       // Seller receiving
 *   mode: 'host',            // Host pays all
 * });
 * // escrow.status = 'created'
 *
 *
 * 2. INITIATE ESCROW (Mixed Mode)
 * ================================
 * // Step 1: Host deposits 30%
 * const hostEscrow = await nativPayClient.initiateEscrow({
 *   orderId: 'order_456',
 *   amount: 15000,           // 30% of ₦50,000
 *   payerId: hostId,
 *   payeeId: sellerId,
 *   mode: 'mixed',
 *   fabric: { amount: 10000 },
 *   tailoring: { amount: 5000, makerId: 'maker_1' },
 * });
 *
 * // Step 2: Each guest pays their portion
 * const guestEscrow = await nativPayClient.initiateEscrow({
 *   orderId: 'order_456',
 *   amount: 35000,           // Guest's 70% share
 *   payerId: guestId,
 *   payeeId: sellerId,
 *   mode: 'guest',
 *   eventId: 'event_789',
 * });
 *
 *
 * 3. PAYMENT FLOW
 * ===============
 * // Step 1: Create escrow
 * const escrow = await nativPayClient.initiateEscrow({...})
 * // escrow.status = 'created'
 *
 * // Step 2: Create payment record
 * const payment = await nativPayClient.createPayment(escrow.id, 'card')
 *
 * // Step 3: User goes through payment UI
 * // (Stripe, PayPal, or local gateway)
 *
 * // Step 4: Complete payment after user confirms
 * const completed = await nativPayClient.completePayment(payment.id, paymentToken)
 * // escrow.status = 'held'
 *
 * // Step 5: Order fulfillment...
 * // (Seller makes item, ships it)
 *
 * // Step 6: Confirm delivery (buyer-initiated)
 * await nativPayClient.confirmDelivery({
 *   orderId: order.id,
 *   escrowId: escrow.id,
 *   proofUrl: 'photo_of_delivery',
 * })
 *
 * // Step 7: Release escrow (automatic or manual)
 * const released = await nativPayClient.releaseEscrow(escrow.id)
 * // escrow.status = 'released'
 * // Seller gets paid
 * // Buyer has 30 days to dispute
 *
 *
 * 4. DISPUTE FLOW
 * ===============
 * // Buyer disputes within 30 days
 * const dispute = await nativPayClient.initializeDispute({
 *   escrowId: escrow.id,
 *   initiatedBy: 'buyer',
 *   reason: 'Item not as described',
 *   evidence: ['photo_url', 'video_url'],
 * })
 * // escrow.status = 'disputed'
 *
 * // Admin resolves (70% seller, 30% buyer)
 * const resolved = await nativPayClient.resolveDispute(
 *   escrow.id,
 *   21000,  // 70% to seller
 *   9000,   // 30% to buyer
 *   'Item quality issue'
 * )
 * // escrow.status = 'released'
 * // Both parties get their portions
 */
