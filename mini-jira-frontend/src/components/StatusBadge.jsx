import React from 'react';

/**
 * Utility function to get status styles based on status value and type
 * @param {string} status - The status value
 * @param {string} type - The type of status ('project' or 'ticket')
 * @returns {string} - Tailwind CSS classes for the status badge
 */
export const getStatusStyles = (status, type = 'ticket') => {
    const normalizedStatus = status?.toLowerCase() || '';

    if (type === 'project') {
        // Project status styles
        if (normalizedStatus === 'active') return 'bg-green-500/10 text-green-500 border border-green-500/20';
        if (normalizedStatus === 'on hold') return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
        if (normalizedStatus === 'completed') return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
        if (normalizedStatus === 'cancelled') return 'bg-red-500/10 text-red-500 border border-red-500/20';
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }

    // Ticket status styles (default)
    if (normalizedStatus === 'in progress') return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    if (normalizedStatus === 'resolved') return 'bg-green-500/10 text-green-500 border border-green-500/20';
    if (normalizedStatus === 'closed') return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    if (normalizedStatus === 'open') return 'bg-red-500/10 text-red-500 border border-red-500/20';
    return 'bg-gray-100 text-gray-600 border border-gray-200';
};

/**
 * Reusable StatusBadge component for displaying status with consistent styling
 * @param {Object} props
 * @param {string} props.status - The status text to display
 * @param {string} props.type - The type of status ('project' or 'ticket')
 * @param {string} props.className - Additional CSS classes
 */
const StatusBadge = ({ status, type = 'ticket', className = '' }) => {
    const styles = getStatusStyles(status, type);

    return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles} ${className}`}>
            {status || 'Unknown'}
        </span>
    );
};

export default StatusBadge;
