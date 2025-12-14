import { UserRole } from '../models/User';

/**
 * Check if user has a specific role
 */
export const hasRole = (userRoles: UserRole[], role: UserRole): boolean => {
  return userRoles.includes(role);
};

/**
 * Check if user is a host
 */
export const isHost = (userRoles: UserRole[]): boolean => {
  return hasRole(userRoles, 'host');
};

/**
 * Check if user is a maker
 */
export const isMaker = (userRoles: UserRole[]): boolean => {
  return hasRole(userRoles, 'maker');
};

/**
 * Check if user is a guest
 */
export const isGuest = (userRoles: UserRole[]): boolean => {
  return hasRole(userRoles, 'guest');
};

/**
 * Get display name for role
 */
export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    guest: 'Guest',
    maker: 'Maker / Tailor',
    host: 'Event Host',
  };
  return labels[role];
};
