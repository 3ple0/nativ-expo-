import { create } from 'zustand';
import { Cart, CartItem } from '../models/Order';

/**
 * Pricing breakdown for cart items
 */
interface CartPricing {
  subtotal: number; // Fabric + maker costs
  tailor_cost?: number;
  shipping?: number;
  platform_fee: number; // Percentage-based fee (e.g., 3%)
  tax?: number;
  discount?: number;
  total: number;
  currency: string;
}

interface CartState {
  cart: Cart | null;
  pricing: CartPricing | null;
  isLoading: boolean;
  error: string | null;

  // Actions - Cart Management
  setCart: (cart: Cart | null) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Actions - Pricing
  setPricing: (pricing: CartPricing | null) => void;
  calculatePricing: (subtotal: number, taxRate?: number, feesPercent?: number, shippingCost?: number) => CartPricing;
  applyDiscount: (discountAmount: number) => void;
  
  // Getters
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  getPlatformFee: () => number;

  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  pricing: null,
  isLoading: false,
  error: null,

  // Cart Management
  setCart: (cart) => set({ cart }),

  addItem: (item) => set((state) => {
    if (!state.cart) {
      return {
        cart: {
          id: `cart_${Date.now()}`,
          userId: '',
          items: [item],
          totalPrice: item.totalPrice,
          currency: 'USD',
          updatedAt: new Date().toISOString(),
        },
      };
    }

    const existingItemIndex = state.cart.items.findIndex(
      (i) => i.itemId === item.itemId && i.itemType === item.itemType
    );

    let updatedItems: CartItem[];
    if (existingItemIndex > -1) {
      updatedItems = [...state.cart.items];
      updatedItems[existingItemIndex].quantity += item.quantity;
      updatedItems[existingItemIndex].totalPrice =
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
    } else {
      updatedItems = [...state.cart.items, item];
    }

    const subtotal = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const totalPrice = state.pricing ? state.pricing.total : subtotal;

    return {
      cart: {
        ...state.cart,
        items: updatedItems,
        totalPrice,
        updatedAt: new Date().toISOString(),
      },
    };
  }),

  removeItem: (itemId) => set((state) => {
    if (!state.cart) return state;

    const updatedItems = state.cart.items.filter((i) => i.id !== itemId);
    const subtotal = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const totalPrice = state.pricing ? state.pricing.total : subtotal;

    return {
      cart: {
        ...state.cart,
        items: updatedItems,
        totalPrice,
        updatedAt: new Date().toISOString(),
      },
    };
  }),

  updateItem: (itemId, quantity) => set((state) => {
    if (!state.cart) return state;

    const updatedItems = state.cart.items.map((i) =>
      i.id === itemId
        ? { ...i, quantity, totalPrice: quantity * i.unitPrice }
        : i
    );

    const subtotal = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const totalPrice = state.pricing ? state.pricing.total : subtotal;

    return {
      cart: {
        ...state.cart,
        items: updatedItems,
        totalPrice,
        updatedAt: new Date().toISOString(),
      },
    };
  }),

  clearCart: () => set((state) => {
    if (!state.cart) return state;
    return {
      cart: {
        ...state.cart,
        items: [],
        totalPrice: 0,
        updatedAt: new Date().toISOString(),
      },
      pricing: null,
    };
  }),

  // Pricing Management
  setPricing: (pricing) => set({ pricing }),

  calculatePricing: (subtotal, taxRate = 0, feesPercent = 3, shippingCost = 0) => {
    const platform_fee = subtotal * (feesPercent / 100);
    const tax = (subtotal + platform_fee + (shippingCost || 0)) * (taxRate / 100);
    const total = subtotal + platform_fee + tax + (shippingCost || 0);

    const pricing: CartPricing = {
      subtotal,
      platform_fee,
      shipping: shippingCost || undefined,
      tax: tax || undefined,
      total,
      currency: 'USD',
    };

    set({ pricing });
    return pricing;
  },

  applyDiscount: (discountAmount) => set((state) => {
    if (!state.pricing) return state;
    return {
      pricing: {
        ...state.pricing,
        discount: discountAmount,
        total: state.pricing.total - discountAmount,
      },
    };
  }),

  // Getters
  getTotal: () => {
    const state = get();
    return state.pricing?.total ?? state.cart?.totalPrice ?? 0;
  },

  getSubtotal: () => {
    const state = get();
    return state.pricing?.subtotal ?? state.cart?.totalPrice ?? 0;
  },

  getItemCount: () => {
    const state = get();
    return state.cart?.items.length ?? 0;
  },

  getPlatformFee: () => {
    const state = get();
    return state.pricing?.platform_fee ?? 0;
  },

  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
