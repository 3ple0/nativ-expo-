import { useAuthStore } from '../store/auth.store';

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return useAuthStore.getState().isAuthenticated;
};

/**
 * Check if user is guest (not logged in but browsing)
 */
export const isGuest = (): boolean => {
  return !isAuthenticated();
};

/**
 * Guard for authenticated routes
 */
export const requireAuth = (isAuth: boolean): boolean => {
  return isAuth;
};

/**
 * Guard for role-based access
 */
export const requireRole = (userRoles: string[], requiredRole: string): boolean => {
  return userRoles.includes(requiredRole);
};

/**
 * Guard for any role
 */
export const requireAnyRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  return requiredRoles.some((role) => userRoles.includes(role));
};

/**
 * Guard for all roles
 */
export const requireAllRoles = (userRoles: string[], requiredRoles: string[]): boolean => {
  return requiredRoles.every((role) => userRoles.includes(role));
};
