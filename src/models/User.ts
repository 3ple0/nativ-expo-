export type UserRole = 'guest' | 'maker' | 'host';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  roles: UserRole[];
  phone?: string;
  location?: string;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  rating: number;
  reviewCount: number;
  followersCount: number;
  followingCount: number;
}

export interface MakerProfile extends UserProfile {
  specializations: string[];
  yearsOfExperience: number;
  portfolio: string[];
  businessName?: string;
  businessRegistration?: string;
}
