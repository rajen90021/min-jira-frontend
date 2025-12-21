import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { IoMail, IoCalendar } from 'react-icons/io5';
import { format } from 'date-fns';

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="p-8 space-y-8 bg-transparent min-h-full overflow-auto">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    Identity Hub
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Neural Signal & Interface Credentials</p>
            </motion.div>

            <div className="max-w-6xl">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="xl:col-span-1"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />

                            <div className="relative inline-block mb-8 mt-4">
                                <div className={`w-32 h-32 rounded-[2.5rem] ${user?.role?.toLowerCase() === 'manager'
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                                    : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                                    } flex items-center justify-center text-white text-4xl font-black shadow-xl transform rotate-3`}>
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg ${user?.role?.toLowerCase() === 'manager' ? 'bg-amber-500' : 'bg-blue-600'
                                    }`} />
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                {user?.name || 'Architect'}
                            </h2>

                            <div className={`text-[10px] font-black tracking-[0.2em] px-4 py-1.5 rounded-xl inline-block border uppercase ${user?.role?.toLowerCase() === 'manager'
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-100 dark:border-amber-500/20'
                                : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-100 dark:border-blue-500/20'
                                }`}>
                                {user?.role || 'Developer'}
                            </div>

                            <div className="mt-10 space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                                        <IoMail size={20} />
                                    </div>
                                    <div className="text-left min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Signal</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                            {user?.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                                        <IoCalendar size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 text-nowrap">
                                            {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Account Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="xl:col-span-2"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm min-h-full">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                Security Credentials
                                <div className="h-1 w-12 bg-blue-600/20 rounded-full" />
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        Full Name
                                    </label>
                                    <div className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold shadow-sm">
                                        {user?.name || 'N/A'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        Email Address
                                    </label>
                                    <div className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold shadow-sm">
                                        {user?.email || 'N/A'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        Level Access
                                    </label>
                                    <div className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold shadow-sm flex items-center gap-3">
                                        <span className={`w-2 h-2 rounded-full ${user?.role?.toLowerCase() === 'manager' ? 'bg-amber-500' : 'bg-blue-600'}`} />
                                        {user?.role || 'Developer'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        Registry Date
                                    </label>
                                    <div className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold shadow-sm">
                                        {user?.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-3xl">
                                <h4 className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-3">Architect Protocol</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                    Your identity is encrypted within the Nebula network. Changes to your primary credentials require Multi-Factor Authentication (MFA) from your System Administrator.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
