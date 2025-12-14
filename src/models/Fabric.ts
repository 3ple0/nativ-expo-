export interface Fabric {
  id: string;
  name: string;
  makerId: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  material: string;
  color: string;
  pattern: string;
  inventory: number;
  minimumOrder: number;
  leadTime: number; // in days
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FabricFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  pattern?: string;
  material?: string;
  minRating?: number;
  search?: string;
}

export interface FabricReservation {
  id: string;
  fabricId: string;
  userId: string;
  quantity: number;
  expiresAt: string;
  status: 'active' | 'expired' | 'converted';
  createdAt: string;
}
