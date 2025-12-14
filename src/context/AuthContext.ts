/**
 * Auth Context
 *
 * Session listener that bridges Supabase to Zustand.
 * Listens for auth state changes and populates auth store.
 */

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { User } from '../models/User';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AUTH PROVIDER
 *
 * Wraps app with Supabase auth listener.
 * On mount, checks existing session and hydrates auth store.
 * Listens for auth state changes throughout app lifecycle.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authStore = useAuthStore();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setRoles = useAuthStore((s) => s.setRoles);
  const setIsLoading = useAuthStore((s) => s.setIsLoading);
  const setError = useAuthStore((s) => s.setError);
  const logout = useAuthStore((s) => s.logout);

  /**
   * HYDRATE USER FROM SESSION
   *
   * When Supabase session is available:
   * 1. Fetch user profile from public.users table
   * 2. Fetch user roles
   * 3. Populate Zustand store
   */
  async function hydrateUser(session: any) {
    try {
      setIsLoading(true);

      if (!session?.user?.id) {
        logout();
        return;
      }

      // Fetch user profile with roles
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(
          `
          *,
          user_roles (
            role_name
          )
        `
        )
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        setError(userError.message);
        return;
      }

      // Extract roles
      const roles = userData?.user_roles?.map((ur: any) => ur.role_name) || [];

      // Update stores
      setUser(userData);
      setRoles(roles);
      setToken(session.access_token, session.expires_in);
      setError(null);
    } catch (error: any) {
      console.error('Error hydrating user:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * SETUP AUTH LISTENER
   *
   * On mount:
   * 1. Check for existing session
   * 2. Subscribe to auth state changes
   * 3. Cleanup on unmount
   */
  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        hydrateUser(session);
      } else {
        setIsLoading(false);
      }
    });

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          logout();
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await hydrateUser(session);
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    token: authStore.token,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
