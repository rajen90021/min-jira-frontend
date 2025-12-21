import { motion } from 'framer-motion';

const SkeletonBase = ({ className, ...props }) => (
    <div
        className={`bg-gray-200  relative overflow-hidden ${className}`}
        {...props}
    >
        <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20  to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "linear"
            }}
        />
    </div>
);

export const SkeletonText = ({ lines = 1, className = "h-4 w-full rounded mb-2" }) => (
    <>
        {Array.from({ length: lines }).map((_, i) => (
            <SkeletonBase key={i} className={className} />
        ))}
    </>
);

export const SkeletonCircle = ({ size = "10", className = "" }) => (
    <SkeletonBase className={`rounded-full h-${size} w-${size} ${className}`} style={{ height: size, width: size }} />
);

export const SkeletonCard = () => (
    <div className="p-4 rounded-xl border border-gray-200  bg-white [#1e1e1e] space-y-4">
        <div className="flex items-center gap-3">
            <SkeletonCircle size="3rem" />
            <div className="space-y-2 flex-1">
                <SkeletonText className="h-4 w-1/3 rounded" />
                <SkeletonText className="h-3 w-1/4 rounded" />
            </div>
        </div>
        <SkeletonText lines={3} />
        <div className="flex justify-between items-center pt-2">
            <SkeletonText className="h-6 w-16 rounded-full" />
            <SkeletonText className="h-6 w-16 rounded-full" />
        </div>
    </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div className="w-full">
        <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100 ">
            {Array.from({ length: cols }).map((_, i) => (
                <SkeletonText key={i} className="h-4 flex-1 rounded" />
            ))}
        </div>
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    {Array.from({ length: cols }).map((_, j) => (
                        <SkeletonText key={j} className="h-12 flex-1 rounded-lg" />
                    ))}
                </div>
            ))}
        </div>
    </div>
);

const SkeletonLoader = {
    Text: SkeletonText,
    Circle: SkeletonCircle,
    Card: SkeletonCard,
    Table: SkeletonTable
};

export default SkeletonLoader;
