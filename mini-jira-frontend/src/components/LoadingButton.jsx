import { motion } from 'framer-motion';

const LoadingButton = ({
    isLoading,
    loadingText,
    children,
    className = "",
    variant = "primary",
    type = "button",
    disabled,
    ...props
}) => {
    const baseStyles = "relative flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 focus:ring-blue-500",
        secondary: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white focus:ring-gray-500",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 focus:ring-red-500",
        outline: "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252526] focus:ring-gray-500"
    };

    return (
        <motion.button
            whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
            type={type}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            <div className={`flex items-center gap-2 ${isLoading ? 'invisible' : 'visible'}`}>
                {children}
            </div>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    {loadingText && <span className="ml-2 text-sm">{loadingText}</span>}
                </div>
            )}
        </motion.button>
    );
};

export default LoadingButton;
