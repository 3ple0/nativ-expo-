import { create } from 'zustand';
import { User, UserRole } from '../models/User';

/**
 * Supabase Session type (minimal)
 */
interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
  user: any;
}

interface AuthState {
  // User data
  user: User | null;
  roles: UserRole[];
  isAuthenticated: boolean;
  
  // Tokens
  token: string | null;
  refreshToken: string | null;
  supabaseSession: SupabaseSession | null;
  tokenExpiresAt: number | null;
  
  // Loading & error
  isLoading: boolean;
  error: string | null;
  
  // Actions - User Management
  setUser: (user: User | null) => void;
  setRoles: (roles: UserRole[]) => void;
  addRole: (role: UserRole) => void;
  removeRole: (role: UserRole) => void;
  hasRole: (role: UserRole) => boolean;
  
  // Actions - Token Management
  setToken: (token: string | null, expiresIn?: number) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setSupabaseSession: (session: SupabaseSession | null) => void;
  isTokenExpired: () => boolean;
  
  // Actions - Session
  logout: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  roles: [],
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  supabaseSession: null,
  tokenExpiresAt: null,
  isLoading: false,
  error: null,

  // User Management
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    roles: user?.roles ?? [],
  }),

  setRoles: (roles) => set({ roles }),

  addRole: (role) => set((state) => {
    if (state.roles.includes(role)) return state;
    return { roles: [...state.roles, role] };
  }),

  removeRole: (role) => set((state) => ({
    roles: state.roles.filter((r) => r !== role),
  })),

  hasRole: (role) => {
    const state = get();
    return state.roles.includes(role);
  },

  // Token Management
  setToken: (token, expiresIn = 3600) => set({
    token,
    tokenExpiresAt: token ? Date.now() + expiresIn * 1000 : null,
  }),

  setRefreshToken: (refreshToken) => set({ refreshToken }),

  setSupabaseSession: (supabaseSession) => set({ supabaseSession }),

  isTokenExpired: () => {
    const state = get();
    if (!state.tokenExpiresAt) return false;
    return Date.now() >= state.tokenExpiresAt - 300000; // 5 min buffer
  },

  // Session Management
  logout: () => set({
    user: null,
    roles: [],
    isAuthenticated: false,
    token: null,
    refreshToken: null,
    supabaseSession: null,
    tokenExpiresAt: null,
    error: null,
  }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));
