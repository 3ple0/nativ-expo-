import { create } from 'zustand';
import { Escrow, Payment, EscrowRelease, EscrowMode } from '../models/Escrow';
import { nativPayClient } from '../api/nativpay.client';

/**
 * Escrow lifecycle states (non-negotiable)
 * created → held → released OR refunded
 */
type EscrowPhase = 'created' | 'held' | 'released' | 'refunded' | 'disputed';

interface EscrowState {
  // Escrow records
  escrows: Escrow[];
  currentEscrow: Escrow | null;
  currentPhase: EscrowPhase | null;
  
  // Payment records
  payments: Payment[];
  currentPayment: Payment | null;
  
  // Release records (audit trail)
  releases: EscrowRelease[];
  
  // Loading & error
  isLoading: boolean;
  error: string | null;

  // ========================================================
  // ESCROW LIFECYCLE ACTIONS (Non-Negotiable)
  // ========================================================

  // State setters
  setEscrows: (escrows: Escrow[]) => void;
  setCurrentEscrow: (escrow: Escrow | null) => void;
  addEscrow: (escrow: Escrow) => void;
  updateEscrow: (escrow: Escrow) => void;
  
  // Phase transitions
  transitionPhase: (escrowId: string, newPhase: EscrowPhase) => void;
  
  // Core lifecycle actions
  /**
   * Initiate escrow with nativPay
   *
   * Non-negotiable rules:
   * - Host mode: 1 escrow, host pays all
   * - Guest mode: per-guest escrow
   * - Mixed mode: host deposit + per-guest escrows
   */
  initiateEscrow: (
    orderId: string,
    amount: number,
    payerId: string,
    payeeId: string,
    mode: EscrowMode,
    eventId?: string
  ) => Escrow;
  
  /**
   * Mark escrow as held (after payment received)
   * Status: created → held
   */
  holdEscrow: (escrowId: string, reason?: string) => void;
  
  /**
   * Release escrow to payee (after delivery confirmed)
   * Non-negotiable: release ONLY after delivery confirmation
   * Status: held → released
   */
  releaseEscrow: (escrowId: string, reason?: string) => void;
  
  /**
   * Refund escrow to payer
   * Status: created/held → refunded
   */
  refundEscrow: (escrowId: string, reason?: string) => void;
  
  /**
   * Initiate dispute (buyer or seller)
   * Status: held/released → disputed
   */
  disputeEscrow: (escrowId: string, reason: string) => void;
  
  /**
   * Resolve dispute with split
   * Example: 70% to seller, 30% to buyer
   * Status: disputed → released
   */
  resolveDispute: (escrowId: string, payerAmount: number, payeeAmount: number) => void;
  
  // Payment tracking
  setPayments: (payments: Payment[]) => void;
  setCurrentPayment: (payment: Payment | null) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (payment: Payment) => void;
  
  // Release tracking (audit trail)
  setReleases: (releases: EscrowRelease[]) => void;
  addRelease: (release: EscrowRelease) => void;

  // State management
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
  resetCurrentEscrow: () => void;
}

export const useEscrowStore = create<EscrowState>((set, get) => ({
  // Initial state
  escrows: [],
  currentEscrow: null,
  currentPhase: null,
  payments: [],
  currentPayment: null,
  releases: [],
  isLoading: false,
  error: null,

  // State setters
  setEscrows: (escrows) => set({ escrows }),
  
  setCurrentEscrow: (currentEscrow) => set({ 
    currentEscrow,
    currentPhase: currentEscrow?.status as EscrowPhase,
  }),

  addEscrow: (escrow) => set((state) => ({
    escrows: [...state.escrows, escrow],
  })),

  updateEscrow: (escrow) => set((state) => ({
    escrows: state.escrows.map((e) => e.id === escrow.id ? escrow : e),
    currentEscrow: state.currentEscrow?.id === escrow.id ? escrow : state.currentEscrow,
    currentPhase: state.currentEscrow?.id === escrow.id ? (escrow.status as EscrowPhase) : state.currentPhase,
  })),

  // Phase transitions
  transitionPhase: (escrowId, newPhase) => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const updated = { ...escrow, status: newPhase };
    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? newPhase : state.currentPhase,
    };
  }),

  // ========================================================
  // LIFECYCLE ACTIONS (Non-Negotiable)
  // ========================================================

  initiateEscrow: (orderId, amount, payerId, payeeId, mode, eventId) => {
    const escrow: Escrow = {
      id: `escrow_${Date.now()}`,
      orderId,
      eventId,
      payerId,
      payeeId,
      amount,
      currency: 'USD',
      mode,
      status: 'created',
      heldAt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      escrows: [...state.escrows, escrow],
      currentEscrow: escrow,
      currentPhase: 'created',
    }));

    return escrow;
  },

  holdEscrow: (escrowId, reason = 'Payment received') => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const updated: Escrow = { 
      ...escrow, 
      status: 'held',
      heldAt: new Date().toISOString(),
      heldReason: reason,
      updatedAt: new Date().toISOString(),
    };
    
    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? 'held' : state.currentPhase,
    };
  }),

  releaseEscrow: (escrowId, reason = 'delivery_confirmed') => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const release: EscrowRelease = {
      id: `release_${Date.now()}`,
      escrowId,
      reason: 'completion',
      amount: escrow.amount,
      recipientId: escrow.payeeId,
      recipientType: 'seller',
      releasedAt: new Date().toISOString(),
    };

    const updated: Escrow = { 
      ...escrow, 
      status: 'released',
      releaseReason: reason as any,
      releasedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? 'released' : state.currentPhase,
      releases: [...state.releases, release],
    };
  }),

  refundEscrow: (escrowId, reason = 'buyer_request') => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const release: EscrowRelease = {
      id: `release_${Date.now()}`,
      escrowId,
      reason: 'refund',
      amount: escrow.amount,
      recipientId: escrow.payerId,
      recipientType: 'buyer',
      releasedAt: new Date().toISOString(),
      notes: `Refund reason: ${reason}`,
    };

    const updated: Escrow = { 
      ...escrow, 
      status: 'refunded',
      refundReason: reason as any,
      refundedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? 'refunded' : state.currentPhase,
      releases: [...state.releases, release],
    };
  }),

  disputeEscrow: (escrowId, reason) => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const updated: Escrow = { 
      ...escrow, 
      status: 'disputed',
      disputedAt: new Date().toISOString(),
      disputeReason: reason,
      updatedAt: new Date().toISOString(),
    };

    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? 'disputed' : state.currentPhase,
    };
  }),

  resolveDispute: (escrowId, payerAmount, payeeAmount) => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const payerRelease: EscrowRelease = {
      id: `release_${Date.now()}_payer`,
      escrowId,
      reason: 'dispute_resolution',
      amount: payerAmount,
      recipientId: escrow.payerId,
      recipientType: 'buyer',
      releasedAt: new Date().toISOString(),
      notes: `Dispute resolved: ${payerAmount} to buyer`,
    };

    const payeeRelease: EscrowRelease = {
      id: `release_${Date.now()}_payee`,
      escrowId,
      reason: 'dispute_resolution',
      amount: payeeAmount,
      recipientId: escrow.payeeId,
      recipientType: 'seller',
      releasedAt: new Date().toISOString(),
      notes: `Dispute resolved: ${payeeAmount} to seller`,
    };

    const updated: Escrow = { 
      ...escrow, 
      status: 'released',
      disputeResolution: {
        payerAmount,
        payeeAmount,
        resolvedAt: new Date().toISOString(),
      },
      releasedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? 'released' : state.currentPhase,
      releases: [...state.releases, payerRelease, payeeRelease],
    };
  }),

  // Payment management
  setPayments: (payments) => set({ payments }),
  
  setCurrentPayment: (currentPayment) => set({ currentPayment }),

  addPayment: (payment) => set((state) => ({
    payments: [...state.payments, payment],
  })),

  updatePayment: (payment) => set((state) => ({
    payments: state.payments.map((p) => p.id === payment.id ? payment : p),
    currentPayment: state.currentPayment?.id === payment.id ? payment : state.currentPayment,
  })),

  // Release management
  setReleases: (releases) => set({ releases }),

  addRelease: (release) => set((state) => ({
    releases: [...state.releases, release],
  })),

  // State management
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  reset: () => set({
    escrows: [],
    currentEscrow: null,
    currentPhase: null,
    payments: [],
    currentPayment: null,
    releases: [],
    error: null,
  }),

  resetCurrentEscrow: () => set({
    currentEscrow: null,
    currentPhase: null,
    currentPayment: null,
  }),
}));

export const useEscrowStore = create<EscrowState>((set, get) => ({
  // Initial state
  escrows: [],
  currentEscrow: null,
  currentPhase: null,
  payments: [],
  currentPayment: null,
  releases: [],
  isLoading: false,
  error: null,

  // Escrow Management
  setEscrows: (escrows) => set({ escrows }),
  
  setCurrentEscrow: (currentEscrow) => set({ 
    currentEscrow,
    currentPhase: currentEscrow?.status as EscrowPhase,
  }),

  addEscrow: (escrow) => set((state) => ({
    escrows: [...state.escrows, escrow],
  })),

  updateEscrow: (escrow) => set((state) => ({
    escrows: state.escrows.map((e) => e.id === escrow.id ? escrow : e),
    currentEscrow: state.currentEscrow?.id === escrow.id ? escrow : state.currentEscrow,
    currentPhase: state.currentEscrow?.id === escrow.id ? (escrow.status as EscrowPhase) : state.currentPhase,
  })),

  // Phase Transitions
  transitionPhase: (escrowId, newPhase) => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const updated = { ...escrow, status: newPhase };
    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? newPhase : state.currentPhase,
    };
  }),

  // Lifecycle Actions
  initiateEscrow: (buyerId, sellerId, amount, currency, orderId) => {
    const escrow: Escrow = {
      id: `escrow_${Date.now()}`,
      paymentId: `payment_${Date.now()}`,
      buyerId,
      sellerId,
      amount,
      currency,
      status: 'initiated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      escrows: [...state.escrows, escrow],
      currentEscrow: escrow,
      currentPhase: 'initiated',
    }));

    return escrow;
  },

  fundEscrow: (escrowId) => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const updated = { ...escrow, status: 'funded' as const };
    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? 'funded' : state.currentPhase,
    };
  }),

  holdEscrow: (escrowId, reason) => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const updated = { 
      ...escrow, 
      status: 'held' as const,
      holdReason: reason,
    };
    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? 'held' : state.currentPhase,
    };
  }),

  releaseEscrow: (escrowId, reason) => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const release: EscrowRelease = {
      id: `release_${Date.now()}`,
      escrowId,
      reason,
      amount: escrow.amount,
      releasedAt: new Date().toISOString(),
    };

    const updated = { 
      ...escrow, 
      status: 'released' as const,
      releasedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? 'released' : state.currentPhase,
      releases: [...state.releases, release],
    };
  }),

  refundEscrow: (escrowId, reason) => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const release: EscrowRelease = {
      id: `release_${Date.now()}`,
      escrowId,
      reason: 'refund',
      amount: escrow.amount,
      releasedAt: new Date().toISOString(),
      notes: `Refund reason: ${reason}`,
    };

    const updated = { 
      ...escrow, 
      status: 'refunded' as const,
      updatedAt: new Date().toISOString(),
    };

    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? 'refunded' : state.currentPhase,
      releases: [...state.releases, release],
    };
  }),

  disputeEscrow: (escrowId, reason) => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const updated = { 
      ...escrow, 
      status: 'disputed' as const,
      holdReason: reason,
      updatedAt: new Date().toISOString(),
    };

    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? 'disputed' : state.currentPhase,
    };
  }),

  resolveDispute: (escrowId, releasePercent) => set((state) => {
    const escrow = state.escrows.find((e) => e.id === escrowId);
    if (!escrow) return state;

    const releaseAmount = escrow.amount * (releasePercent / 100);
    const refundAmount = escrow.amount - releaseAmount;

    const sellerRelease: EscrowRelease = {
      id: `release_${Date.now()}_seller`,
      escrowId,
      reason: 'dispute_resolution',
      amount: releaseAmount,
      releasedAt: new Date().toISOString(),
      notes: `Dispute resolved: ${releasePercent}% to seller`,
    };

    const buyerRefund: EscrowRelease = {
      id: `release_${Date.now()}_buyer`,
      escrowId,
      reason: 'dispute_resolution',
      amount: refundAmount,
      releasedAt: new Date().toISOString(),
      notes: `Dispute resolved: ${100 - releasePercent}% to buyer`,
    };

    const updated = { 
      ...escrow, 
      status: 'released' as const,
      releasedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      escrows: state.escrows.map((e) => e.id === escrowId ? updated : e),
      currentEscrow: state.currentEscrow?.id === escrowId ? updated : state.currentEscrow,
      currentPhase: state.currentEscrow?.id === escrowId ? 'released' : state.currentPhase,
      releases: [...state.releases, sellerRelease, buyerRefund],
    };
  }),

  // Payment Management
  setPayments: (payments) => set({ payments }),
  
  setCurrentPayment: (currentPayment) => set({ currentPayment }),

  addPayment: (payment) => set((state) => ({
    payments: [...state.payments, payment],
  })),

  updatePayment: (payment) => set((state) => ({
    payments: state.payments.map((p) => p.id === payment.id ? payment : p),
    currentPayment: state.currentPayment?.id === payment.id ? payment : state.currentPayment,
  })),

  // Release Management
  setReleases: (releases) => set({ releases }),

  addRelease: (release) => set((state) => ({
    releases: [...state.releases, release],
  })),

  // State Management
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  reset: () => set({
    escrows: [],
    currentEscrow: null,
    currentPhase: null,
    payments: [],
    currentPayment: null,
    releases: [],
    error: null,
  }),

  resetCurrentEscrow: () => set({
    currentEscrow: null,
    currentPhase: null,
    currentPayment: null,
  }),
}));
