import { motion, AnimatePresence } from 'framer-motion';
import { IoCheckmarkCircle, IoAlertCircle, IoWarning, IoInformationCircle, IoClose } from 'react-icons/io5';
import { useEffect } from 'react';

const icons = {
    success: <IoCheckmarkCircle className="w-6 h-6 text-green-500" />,
    error: <IoAlertCircle className="w-6 h-6 text-red-500" />,
    warning: <IoWarning className="w-6 h-6 text-yellow-500" />,
    info: <IoInformationCircle className="w-6 h-6 text-blue-500" />
};

const bgColors = {
    success: 'bg-white [#252526] border-green-500',
    error: 'bg-white [#252526] border-red-500',
    warning: 'bg-white [#252526] border-yellow-500',
    info: 'bg-white [#252526] border-blue-500'
};

const Toast = ({ id, type = 'info', message, duration = 4000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border-l-4 ${bgColors[type]} min-w-[320px] max-w-md pointer-events-auto  relative overflow-hidden group`}
        >
            <div className="shrink-0">{icons[type]}</div>
            <div className="flex-1 text-sm font-medium text-gray-800 ">
                {message}
            </div>
            <button
                onClick={() => onClose(id)}
                className="p-1 rounded-full hover:bg-gray-100 :bg-gray-700 text-gray-400 hover:text-gray-600 :text-gray-200 transition-colors"
            >
                <IoClose size={18} />
            </button>

            {/* Progress bar */}
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: 0 }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 ${type === 'success' ? 'bg-green-500/30' :
                        type === 'error' ? 'bg-red-500/30' :
                            type === 'warning' ? 'bg-yellow-500/30' :
                                'bg-blue-500/30'
                    }`}
            />
        </motion.div>
    );
};

export default Toast;
