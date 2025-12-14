/**
 * Cart Context
 *
 * Manages shopping cart and pricing state
 * Used across:
 * - Cart screens
 * - Checkout flow
 * - Payment processing
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useCartStore } from '../store/cart.store';
import { Cart } from '../models/Order';

interface CartPricing {
  subtotal: number;
  tailor_cost?: number;
  shipping?: number;
  platform_fee: number;
  tax?: number;
  discount?: number;
  total: number;
  currency: string;
}

interface CartContextType {
  // Cart data
  cart: Cart | null;
  
  // Pricing breakdown
  pricing: CartPricing | null;
  
  // Loading & error
  isLoading: boolean;
  error: string | null;
  
  // Pricing actions
  calculatePricing: (subtotal: number, taxRate?: number, feesPercent?: number, shippingCost?: number) => CartPricing;
  applyDiscount: (discountAmount: number) => void;
  
  // Cart info getters
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  getPlatformFee: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const cartStore = useCartStore();

  const value: CartContextType = {
    cart: cartStore.cart,
    pricing: cartStore.pricing,
    isLoading: cartStore.isLoading,
    error: cartStore.error,
    
    calculatePricing: cartStore.calculatePricing,
    applyDiscount: cartStore.applyDiscount,
    
    getTotal: cartStore.getTotal,
    getSubtotal: cartStore.getSubtotal,
    getItemCount: cartStore.getItemCount,
    getPlatformFee: cartStore.getPlatformFee,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
