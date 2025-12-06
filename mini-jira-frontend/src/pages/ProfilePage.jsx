import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { IoMail, IoCalendar } from 'react-icons/io5';
import { format } from 'date-fns';

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a] min-h-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">View your account information</p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    <div className={`w-24 h-24 rounded-full ${user?.role?.toLowerCase() === 'manager'
                                            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                            : 'bg-gradient-to-br from-blue-400 to-blue-600'
                                        } flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white dark:border-[#1e1e1e] ${user?.role?.toLowerCase() === 'manager' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {user?.name || 'User'}
                                </h2>
                                <p className={`text-sm font-semibold px-3 py-1 rounded-full inline-block ${user?.role?.toLowerCase() === 'manager'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                    }`}>
                                    {user?.role || 'Developer'}
                                </p>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#252526]">
                                    <IoMail className="text-gray-400" size={20} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {user?.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#252526]">
                                    <IoCalendar className="text-gray-400" size={20} />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Account Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Information</h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Full Name
                                    </label>
                                    <div className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252526] text-gray-900 dark:text-white">
                                        {user?.name || 'N/A'}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252526] text-gray-900 dark:text-white">
                                        {user?.email || 'N/A'}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Role
                                    </label>
                                    <div className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252526] text-gray-900 dark:text-white">
                                        {user?.role || 'Developer'}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Account Created
                                    </label>
                                    <div className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252526] text-gray-900 dark:text-white">
                                        {user?.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
