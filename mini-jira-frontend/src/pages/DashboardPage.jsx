import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { IoTicket, IoCheckmarkCircle, IoTimeOutline, IoAlertCircle, IoTrendingUp, IoPeople, IoBriefcase, IoArrowForward } from 'react-icons/io5';
import { fetchTicketsStart, fetchTicketsSuccess, fetchTicketsFailure } from '../store/slices/ticketSlice';
import { fetchProjectsStart, fetchProjectsSuccess, fetchProjectsFailure } from '../store/slices/projectSlice';
import ticketService from '../services/ticketService';
import projectService from '../services/projectService';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, gradient, trend, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
    >
        {/* Background Gradient Overlay */}
        <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        <div className="relative flex items-center justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</p>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{value}</h3>
                {trend && (
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay + 0.2 }}
                        className="text-xs text-green-500 font-semibold flex items-center gap-1"
                    >
                        <IoTrendingUp size={14} />
                        {trend}
                    </motion.p>
                )}
            </div>
            <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center shadow-lg`}
            >
                <Icon size={32} className="text-white" />
            </motion.div>
        </div>
    </motion.div>
);

const DashboardPage = () => {
    const dispatch = useDispatch();
    const { tickets, isLoading: ticketsLoading } = useSelector((state) => state.tickets);
    const { projects, isLoading: projectsLoading } = useSelector((state) => state.projects);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        critical: 0,
    });

    // Fetch tickets and projects
    useEffect(() => {
        const fetchData = async () => {
            // Fetch tickets
            dispatch(fetchTicketsStart());
            try {
                const ticketData = await ticketService.getTickets({ limit: 100 });
                dispatch(fetchTicketsSuccess(ticketData));
            } catch (error) {
                const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                dispatch(fetchTicketsFailure(msg));
            }

            // Fetch projects
            dispatch(fetchProjectsStart());
            try {
                const projectData = await projectService.getProjects({ limit: 100 });
                dispatch(fetchProjectsSuccess(projectData));
            } catch (error) {
                const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                dispatch(fetchProjectsFailure(msg));
            }
        };
        fetchData();
    }, [dispatch]);

    // Calculate statistics
    useEffect(() => {
        if (tickets && tickets.length > 0) {
            const open = tickets.filter(t => t.status?.toLowerCase() === 'open').length;
            const inProgress = tickets.filter(t => t.status?.toLowerCase() === 'in progress').length;
            const resolved = tickets.filter(t => t.status?.toLowerCase() === 'resolved').length;
            const critical = tickets.filter(t => t.priority?.toLowerCase() === 'critical').length;

            setStats({
                total: tickets.length,
                open,
                inProgress,
                resolved,
                critical,
            });
        }
    }, [tickets]);

    const recentTickets = tickets?.slice(0, 5) || [];

    return (
        <div className="p-6 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a] min-h-full overflow-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Welcome back! Here's what's happening with your projects.</p>
            </motion.div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Tickets"
                    value={stats.total}
                    icon={IoTicket}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                    delay={0}
                />
                <StatCard
                    title="Open Tickets"
                    value={stats.open}
                    icon={IoAlertCircle}
                    gradient="bg-gradient-to-br from-red-500 to-pink-600"
                    delay={0.1}
                />
                <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={IoTimeOutline}
                    gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                    delay={0.2}
                />
                <StatCard
                    title="Resolved"
                    value={stats.resolved}
                    icon={IoCheckmarkCircle}
                    gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                    trend="+12% this week"
                    delay={0.3}
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tickets */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Tickets</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest activity on your tickets</p>
                            </div>
                            <Link
                                to="/app/tickets"
                                className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-semibold group"
                            >
                                View All
                                <IoArrowForward className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {ticketsLoading ? (
                                <div className="p-12 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <p className="text-gray-500 mt-4">Loading tickets...</p>
                                </div>
                            ) : recentTickets.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <IoTicket size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>No tickets found</p>
                                </div>
                            ) : (
                                recentTickets.map((ticket, index) => (
                                    <motion.div
                                        key={ticket._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {ticket.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm flex-wrap">
                                                    <StatusBadge status={ticket.status} type="ticket" />
                                                    <span className={`px-2 py-1 rounded-lg font-semibold text-xs ${ticket.priority?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                        ticket.priority?.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                                                            ticket.priority?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>
                                                        {ticket.priority}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd, yyyy') : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats & Actions */}
                <div className="space-y-6">
                    {/* Priority Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1e1e1e] dark:to-[#252526] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow p-6"
                    >
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Quick Stats
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Critical Tickets</span>
                                <span className="text-lg font-bold text-red-600 dark:text-red-400">{stats.critical}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Projects</span>
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {projects?.filter(p => p.status?.toLowerCase() === 'active').length || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Projects</span>
                                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    {projects?.length || 0}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1e1e1e] dark:to-[#252526] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow p-6"
                    >
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <Link
                                to="/app/tickets"
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all group border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                    <IoTicket className="text-white" size={24} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block">View All Tickets</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Manage your tickets</span>
                                </div>
                                <IoArrowForward className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                            <Link
                                to="/app/projects"
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900/20 dark:hover:to-orange-800/20 transition-all group border border-transparent hover:border-orange-200 dark:hover:border-orange-800"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                    <IoBriefcase className="text-white" size={24} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block">Manage Projects</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">View all projects</span>
                                </div>
                                <IoArrowForward className="text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                            <Link
                                to="/app/developers"
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/20 dark:hover:to-green-800/20 transition-all group border border-transparent hover:border-green-200 dark:hover:border-green-800"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                    <IoPeople className="text-white" size={24} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block">Team Members</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Manage your team</span>
                                </div>
                                <IoArrowForward className="text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
