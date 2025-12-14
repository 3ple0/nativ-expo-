/**
 * Payment Context
 *
 * Manages escrow and payment state
 * Used across:
 * - Payment processing
 * - Escrow lifecycle
 * - Order fulfillment tracking
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useEscrowStore } from '../store/escrow.store';
import { Escrow, Payment } from '../models/Escrow';

type EscrowPhase = 'initiated' | 'funded' | 'held' | 'in_completion' | 'released' | 'refunded' | 'disputed';

interface PaymentContextType {
  // Escrow records
  escrows: Escrow[];
  currentEscrow: Escrow | null;
  currentPhase: EscrowPhase | null;
  
  // Payment records
  payments: Payment[];
  currentPayment: Payment | null;
  
  // Loading & error
  isLoading: boolean;
  error: string | null;
  
  // Lifecycle actions
  initiateEscrow: (buyerId: string, sellerId: string, amount: number, currency: string, orderId?: string) => Escrow;
  fundEscrow: (escrowId: string, paymentMethod: 'card' | 'transfer' | 'wallet') => void;
  holdEscrow: (escrowId: string, reason: string) => void;
  releaseEscrow: (escrowId: string, reason: 'completion' | 'refund') => void;
  refundEscrow: (escrowId: string, reason: 'buyer_request' | 'seller_unable' | 'timeout') => void;
  disputeEscrow: (escrowId: string, reason: string) => void;
  resolveDispute: (escrowId: string, releasePercent: number) => void;
  
  // State actions
  setCurrentEscrow: (escrow: Escrow | null) => void;
  setCurrentPayment: (payment: Payment | null) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const escrowStore = useEscrowStore();

  const value: PaymentContextType = {
    escrows: escrowStore.escrows,
    currentEscrow: escrowStore.currentEscrow,
    currentPhase: escrowStore.currentPhase,
    
    payments: escrowStore.payments,
    currentPayment: escrowStore.currentPayment,
    
    isLoading: escrowStore.isLoading,
    error: escrowStore.error,
    
    initiateEscrow: escrowStore.initiateEscrow,
    fundEscrow: escrowStore.fundEscrow,
    holdEscrow: escrowStore.holdEscrow,
    releaseEscrow: escrowStore.releaseEscrow,
    refundEscrow: escrowStore.refundEscrow,
    disputeEscrow: escrowStore.disputeEscrow,
    resolveDispute: escrowStore.resolveDispute,
    
    setCurrentEscrow: escrowStore.setCurrentEscrow,
    setCurrentPayment: escrowStore.setCurrentPayment,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
