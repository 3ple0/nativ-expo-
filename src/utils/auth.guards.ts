import { useAuthStore } from '@/src/store/auth.store';
import { UserRole } from '@/src/models/User';

/**
 * AUTH GUARDS
 *
 * Helper hooks for role-based access control.
 * Used to enforce feature restrictions based on user authentication and roles.
 */

/**
 * Check if user has required role(s).
 * Returns false if user is guest (unauthenticated).
 *
 * Usage:
 *   if (!useHasRole('host')) {
 *     router.push('/modal/auth-gate');
 *   }
 */
export function useHasRole(requiredRole: UserRole | UserRole[]): boolean {
  const { roles, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return false;
  }

  const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return rolesArray.some((role) => roles.includes(role));
}

/**
 * Check if user is authenticated.
 * Returns false for guest users.
 *
 * Usage:
 *   if (!useIsAuthenticated()) {
 *     showAuthGateModal();
 *   }
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated;
}

/**
 * Check if user is guest (not authenticated).
 *
 * Usage:
 *   if (useIsGuest()) {
 *     showAuthRequired();
 *   }
 */
export function useIsGuest(): boolean {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated;
}

/**
 * Check if user is loading (hydrating from session).
 * Use to prevent navigation race conditions.
 *
 * Usage:
 *   if (useIsLoading()) {
 *     return <LoadingScreen />;
 *   }
 */
export function useIsLoading(): boolean {
  const { isLoading } = useAuthStore();
  return isLoading;
}

/**
 * Get current user's role list.
 * Returns empty array if user is guest.
 *
 * Usage:
 *   const roles = useUserRoles();
 *   console.log(roles); // ['guest', 'buyer']
 */
export function useUserRoles(): UserRole[] {
  const { roles } = useAuthStore();
  return roles;
}

/**
 * Check if user is a host (can create events).
 *
 * Usage:
 *   if (!useIsHost()) {
 *     return <NotAuthorizedScreen />;
 *   }
 */
export function useIsHost(): boolean {
  return useHasRole('host');
}

/**
 * Check if user is a maker (can sell fabrics).
 *
 * Usage:
 *   if (!useIsMaker()) {
 *     return <NotAuthorizedScreen />;
 *   }
 */
export function useIsMaker(): boolean {
  return useHasRole('maker');
}

/**
 * Check if user can make payments.
 * Buyers and hosts can both make payments.
 *
 * Usage:
 *   if (!useCanPay()) {
 *     showSignInModal();
 *   }
 */
export function useCanPay(): boolean {
  const { roles, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return false;
  }

  // Anyone authenticated (any role except guest) can pay
  return roles.length > 0;
}

/**
 * Enforce authentication gate for a feature.
 * Shows auth-gate modal if user is not authenticated.
 *
 * Usage:
 *   useEnforceAuth(() => {
 *     // Code that requires authentication
 *     makePayment();
 *   });
 */
export function useEnforceAuth(callback: () => void): () => void {
  const { isAuthenticated } = useAuthStore();

  return () => {
    if (!isAuthenticated) {
      // In a screen context, use router to navigate to auth-gate modal
      // In a component context, dispatch a store action or call a callback
      // This is designed to be used with router or auth context
      throw new Error('Authentication required. Use router.push("/modal/auth-gate")');
    }
    callback();
  };
}

/**
 * Enforce role-based access for a feature.
 * Returns true if user has required role, false otherwise.
 *
 * Usage:
 *   if (!useEnforceRole('host', () => setShowModal(true))) {
 *     return null;
 *   }
 */
export function useEnforceRole(
  requiredRole: UserRole | UserRole[],
  onUnauthorized?: () => void
): boolean {
  const hasRole = useHasRole(requiredRole);

  if (!hasRole && onUnauthorized) {
    onUnauthorized();
  }

  return hasRole;
}
