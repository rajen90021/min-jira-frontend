// User Roles
export const USER_ROLES = {
    DEVELOPER: 'Developer',
    MANAGER: 'Manager',
};

// Role Colors - Used across the application for consistent theming
export const ROLE_COLORS = {
    MANAGER: {
        primary: '#f59e0b',      // Orange for avatar background
        secondary: '#fbbf24',    // Amber for text
        light: '#fef3c7',        // Light amber for backgrounds
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    },
    DEVELOPER: {
        primary: '#3b82f6',      // Blue for avatar background
        secondary: '#22d3ee',    // Cyan for text
        light: '#dbeafe',        // Light blue for backgrounds
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    },
};

// Project Status
export const PROJECT_STATUS = {
    PLANNED: 'Planned',
    ACTIVE: 'Active',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

// Ticket Status
export const TICKET_STATUS = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
    BLOCKED: 'Blocked',
};

// Ticket Priority
export const TICKET_PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// Date Formats
export const DATE_FORMATS = {
    SHORT: 'MMM dd, yyyy',
    LONG: 'MMMM dd, yyyy',
    WITH_TIME: 'MMM dd, yyyy HH:mm',
};
