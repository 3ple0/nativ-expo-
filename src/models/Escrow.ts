/**
 * Escrow lifecycle states (non-negotiable)
 * created → held → released OR refunded
 */
export type EscrowPhase = 'created' | 'held' | 'released' | 'refunded' | 'disputed';

/**
 * Escrow distribution mode for event-based payments
 */
export type EscrowMode = 'host' | 'guest' | 'mixed';

/**
 * Escrow record with complete lifecycle tracking
 */
export interface Escrow {
  id: string;
  orderId: string;              // Associated order
  eventId?: string;             // Event if event-based
  
  // Parties involved
  payerId: string;              // Who initiated payment
  payeeId: string;              // Who receives funds
  
  // Amount & currency
  amount: number;
  currency: string;
  
  // Distribution mode (non-negotiable)
  mode: EscrowMode;             // 'host' | 'guest' | 'mixed'
  
  // Lifecycle (non-negotiable)
  status: EscrowPhase;          // created → held → released/refunded
  
  // Routing (non-negotiable)
  fabric?: {
    to: 'retailer_payout';      // Fabric routed to retailer
    amount: number;
  };
  tailoring?: {
    to: 'maker_payout';         // Tailoring routed to maker
    amount: number;
    makerId?: string;
  };
  
  // Hold details
  heldAt: string;
  heldReason?: string;
  
  // Release details (only after delivery confirmation)
  releasedAt?: string;
  releaseReason?: 'delivery_confirmed' | 'manual_release' | 'refund_requested' | 'dispute_resolution';
  releaseNotes?: string;
  
  // Refund details
  refundedAt?: string;
  refundReason?: 'buyer_request' | 'seller_unable' | 'timeout' | 'dispute_resolved';
  refundNotes?: string;
  
  // Dispute tracking
  disputedAt?: string;
  disputeReason?: string;
  disputeResolution?: {
    payerAmount: number;        // Amount returned to payer
    payeeAmount: number;        // Amount sent to payee
    resolvedAt: string;
  };

  createdAt: string;
  updatedAt: string;
}

/**
 * Escrow release record (audit trail)
 */
export interface EscrowRelease {
  id: string;
  escrowId: string;
  reason: 'completion' | 'refund' | 'dispute_resolution';
  amount: number;
  recipientId: string;          // Who receives funds
  recipientType: 'buyer' | 'seller' | 'platform';
  releasedAt: string;
  notes?: string;
  transactionId?: string;       // Reference to actual payout
}

/**
 * Payment transaction record
 */
export interface Payment {
  id: string;
  userId: string;               // Payer
  escrowId: string;             // Associated escrow
  amount: number;
  currency: string;
  method: 'card' | 'transfer' | 'wallet';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  orderId?: string;
  reference?: string;           // External transaction reference
  
  failureReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * nativPay initiation payload (frontend contract)
 */
export interface nativPayInitiatePayload {
  orderId: string;
  amount: number;
  payerId: string;
  payeeId: string;
  mode: EscrowMode;             // 'host' | 'guest' | 'mixed'
  eventId?: string;             // For event-based orders
  fabric?: {
    amount: number;
  };
  tailoring?: {
    amount: number;
    makerId?: string;
  };
}

/**
 * nativPay response
 */
export interface nativPayResponse {
  escrowId: string;
  paymentId: string;
  status: EscrowPhase;
  amount: number;
  currency: string;
}

/**
 * Delivery confirmation payload
 */
export interface DeliveryConfirmation {
  orderId: string;
  escrowId: string;
  proofUrl?: string;            // Photo/signature proof
  notes?: string;
}

/**
 * Dispute initiation payload
 */
export interface DisputePayload {
  escrowId: string;
  initiatedBy: 'buyer' | 'seller';
  reason: string;
  evidence?: string[];          // File URLs
}
