import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoSunny, IoMoon } from 'react-icons/io5';

const ThemeToggle = () => {
    // Basic detection of theme
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') ||
                localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="relative p-2 rounded-xl overflow-hidden w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
            aria-label="Toggle Dark Mode"
        >
            <motion.div
                initial={false}
                animate={{
                    y: isDark ? -30 : 0,
                    opacity: isDark ? 0 : 1
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <IoSunny size={20} className="text-orange-500" />
            </motion.div>

            <motion.div
                initial={false}
                animate={{
                    y: isDark ? 0 : 30,
                    opacity: isDark ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <IoMoon size={20} className="text-blue-400" />
            </motion.div>
        </button>
    );
};

export default ThemeToggle;
