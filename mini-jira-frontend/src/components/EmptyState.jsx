import { motion } from 'framer-motion';

const EmptyState = ({
    title = 'No items found',
    description = 'Try adjusting your filters or create a new item.',
    icon,
    action,
    className = ''
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col items-center justify-center p-8 text-center min-h-[300px] bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 dashed border-gray-200 dark:border-gray-800 ${className}`}
        >
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 shadow-inner">
                {icon ? (
                    <div className="text-gray-400 dark:text-gray-500 text-3xl">
                        {icon}
                    </div>
                ) : (
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                {description}
            </p>
            {action && (
                <div className="mt-2 text-center">
                    {action}
                </div>
            )}
        </motion.div>
    );
};

export default EmptyState;
