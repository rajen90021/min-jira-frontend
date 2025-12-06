import { USER_ROLES } from './constants';

/**
 * Check if a user has a specific role
 * @param {Object} user - User object with role property
 * @param {string} role - Role to check (use USER_ROLES constants)
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
    return user?.role?.toLowerCase() === role.toLowerCase();
};

/**
 * Check if user is a manager
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const isManager = (user) => {
    return hasRole(user, USER_ROLES.MANAGER);
};

/**
 * Check if user is a developer
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const isDeveloper = (user) => {
    return hasRole(user, USER_ROLES.DEVELOPER);
};

/**
 * Get role-specific color
 * @param {Object} user - User object with role property
 * @param {string} colorType - Type of color (primary, secondary, light, badge)
 * @returns {string} Color value
 */
export const getRoleColor = (user, colorType = 'primary') => {
    const { ROLE_COLORS, USER_ROLES } = require('./constants');
    const role = hasRole(user, USER_ROLES.MANAGER) ? 'MANAGER' : 'DEVELOPER';
    return ROLE_COLORS[role][colorType];
};

/**
 * Get avatar background gradient based on role
 * @param {Object} user - User object with role property
 * @returns {string} CSS class for gradient
 */
export const getAvatarGradient = (user) => {
    return isManager(user)
        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
        : 'bg-gradient-to-br from-blue-400 to-blue-600';
};

/**
 * Get role badge classes
 * @param {Object} user - User object with role property
 * @returns {string} CSS classes for badge
 */
export const getRoleBadgeClasses = (user) => {
    const { ROLE_COLORS } = require('./constants');
    const role = isManager(user) ? 'MANAGER' : 'DEVELOPER';
    return ROLE_COLORS[role].badge;
};

/**
 * Format user initials from name
 * @param {string} name - User's full name
 * @returns {string} Initials (first letter of first and last name)
 */
export const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get user's first letter for avatar
 * @param {string} name - User's name
 * @returns {string} First letter uppercase
 */
export const getAvatarLetter = (name) => {
    return name?.charAt(0).toUpperCase() || 'U';
};
