/**
 * Fulfillment tracking states for orders
 */
export type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded' | 'failed';
export type ProductionStatus = 'in_progress' | 'completed' | 'on_hold';
export type DeliveryStatus = 'pending' | 'shipped' | 'delivered' | 'returned';
export type EscrowStatus = 'locked' | 'released' | 'frozen';
export type OrderStatus = 'pending' | 'in_progress' | 'in_delivery' | 'delivered' | 'completed' | 'cancelled' | 'disputed';

export interface OrderItem {
  id: string;
  type: 'fabric' | 'tailoring' | 'accessory' | 'design' | 'service';
  name: string;
  provider: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PaymentState {
  status: PaymentStatus;
  escrowId?: string;
  method?: 'card' | 'transfer' | 'wallet';
  releasedAt?: string;
  proofUrl?: string;
  updatedAt?: string;
}

export interface ProductionState {
  status: ProductionStatus;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  updatedAt?: string;
}

export interface DeliveryState {
  status: DeliveryStatus;
  shippingAddress?: Address;
  estimatedDelivery?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  updatedAt?: string;
}

export interface EscrowState {
  status: EscrowStatus;
  lockedUntil?: string;
  disputedAt?: string;
  disputeReason?: string;
  updatedAt?: string;
}

/**
 * Order with detailed fulfillment tracking
 */
export interface Order {
  id: string;
  userId: string;
  buyerId?: string;
  makerId?: string;
  eventId?: string;
  guestId?: string;
  fabricId?: string;
  escrowId?: string;
  status: OrderStatus;
  currency: string;
  total: number;
  items?: OrderItem[];
  metadata?: Record<string, any>;

  payment: PaymentState;
  production: ProductionState;
  delivery: DeliveryState;
  escrow: EscrowState;

  createdAt: string;
  updatedAt: string;
}

/**
 * Event-based order (special handling for ASO-EBI)
 */
export interface EventOrder extends Order {
  eventId: string;                // Required for event orders
  guestId?: string;               // Participating guest
  fabricId: string;               // Event fabric
  makerId?: string;               // Tailor/maker
}

/**
 * Shopping cart
 */
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  currency: string;
  updatedAt: string;
}

/**
 * Cart item
 */
export interface CartItem {
  id: string;
  itemType: 'fabric' | 'design';
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Shipping address
 */
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}
