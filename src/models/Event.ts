export type DistributionMode = 'host_purchase' | 'guest_self_purchase' | 'mixed_deposit';
export type EventStatus = 'draft' | 'live' | 'closed';

export interface Event {
  id: string;
  userId?: string;
  hostId?: string; // Host mode
  title: string;
  description?: string;
  eventDate?: string;
  location?: string;
  budget?: number;
  currency?: string;
  distributionMode?: DistributionMode;
  fabricId?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Host mode fields
  price_per_person?: number;
  target_participants?: number;
  status?: EventStatus;
}

export interface EventGuest {
  id: string;
  eventId: string;
  guestId: string;
  email: string;
  status: 'invited' | 'accepted' | 'declined' | 'completed';
  measurements?: Record<string, number>;
  addedAt: string;
}

export interface EventOrder {
  id: string;
  eventId: string;
  guestId: string;
  fabricId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
