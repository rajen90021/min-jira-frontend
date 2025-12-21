import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { IoTicket, IoCheckmarkCircle, IoTimeOutline, IoAlertCircle, IoTrendingUp, IoPeople, IoBriefcase, IoArrowForward, IoTerminalOutline } from 'react-icons/io5';
import { fetchTicketsStart, fetchTicketsSuccess, fetchTicketsFailure } from '../store/slices/ticketSlice';
import { fetchProjectsStart, fetchProjectsSuccess, fetchProjectsFailure } from '../store/slices/projectSlice';
import ticketService from '../services/ticketService';
import projectService from '../services/projectService';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

const CoreBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #64748b 1px, transparent 0)`,
            backgroundSize: '48px 48px'
        }} />
    </div>
);

const StatCard = ({ title, value, icon: Icon, colorClass, trend, delay = 0, to }) => {
    const navigate = useNavigate();
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            onClick={() => to && navigate(to)}
            className="group relative p-8 bg-white rounded-3xl border border-slate-100 cursor-pointer hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
                <Icon size={80} />
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                        {title}
                    </h4>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">
                            {value}
                        </span>
                        {trend && (
                            <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5 uppercase tracking-widest">
                                <IoTrendingUp size={12} /> {trend}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`p-4 rounded-2xl ${colorClass.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </motion.div>
    );
};

const DashboardPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { tickets, isLoading: ticketsLoading } = useSelector((state) => state.tickets);
    const { projects, isLoading: projectsLoading } = useSelector((state) => state.projects);
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        critical: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            dispatch(fetchTicketsStart());
            try {
                const ticketData = await ticketService.getTickets({ limit: 100 });
                dispatch(fetchTicketsSuccess(ticketData));
            } catch (error) {
                dispatch(fetchTicketsFailure(error.message));
            }

            dispatch(fetchProjectsStart());
            try {
                const projectData = await projectService.getProjects({ limit: 100 });
                dispatch(fetchProjectsSuccess(projectData));
            } catch (error) {
                dispatch(fetchProjectsFailure(error.message));
            }
        };
        fetchData();
    }, [dispatch]);

    useEffect(() => {
        if (tickets && tickets.length > 0) {
            const open = tickets.filter(t => t.status?.toLowerCase() === 'open').length;
            const inProgress = tickets.filter(t => t.status?.toLowerCase() === 'in progress').length;
            const resolved = tickets.filter(t => t.status?.toLowerCase() === 'resolved').length;
            const closed = tickets.filter(t => t.status?.toLowerCase() === 'closed').length;
            const critical = tickets.filter(t => t.priority?.toLowerCase() === 'critical').length;
            setStats({ total: tickets.length, open, inProgress, resolved, closed, critical });
        }
    }, [tickets]);

    const recentTickets = tickets?.slice(0, 5) || [];

    return (
        <div className="h-full relative flex flex-col p-4 md:p-8 bg-white transition-colors duration-500 overflow-hidden">
            <CoreBackground />

            {/* Header Hub */}
            <div className="flex-shrink-0 relative z-10 mb-6 md:mb-8 flex justify-between items-end">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            Project Sync Active
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-black text-slate-900 tracking-tight"
                    >
                        Welcome, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic uppercase">{user?.name?.split(' ')[0]}</span>
                    </motion.h1>
                </div>
                <div className="hidden md:flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    <div className="flex flex-col items-end">
                        <span className="text-blue-500">System Capacity</span>
                        <span className="text-xl text-slate-900 tracking-tighter">{tickets?.length} Active Items</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto scrollbar-hide space-y-6 md:space-y-8 relative z-10 pb-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Tickets"
                        value={stats.total}
                        icon={IoTicket}
                        colorClass={{ bg: 'bg-blue-600', text: 'text-blue-600' }}
                        trend="+12%"
                        to="/app/tickets"
                        delay={0.1}
                    />
                    <StatCard
                        title="Active In-Progress"
                        value={stats.inProgress}
                        icon={IoTimeOutline}
                        colorClass={{ bg: 'bg-indigo-600', text: 'text-indigo-600' }}
                        to="/app/kanban-board"
                        delay={0.2}
                    />
                    <StatCard
                        title="Resolved Items"
                        value={stats.resolved}
                        icon={IoCheckmarkCircle}
                        colorClass={{ bg: 'bg-emerald-600', text: 'text-emerald-600' }}
                        to="/app/timeline"
                        delay={0.3}
                    />
                    <StatCard
                        title="Critical Alerts"
                        value={stats.critical}
                        icon={IoAlertCircle}
                        colorClass={{ bg: 'bg-rose-600', text: 'text-rose-600' }}
                        to="/app/tickets"
                        delay={0.4}
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Activity Section */}
                    <div className="xl:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                                <IoTerminalOutline className="text-blue-600" />
                                Recent Activity Stream
                            </h2>
                            <Link to="/app/timeline" className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">View All history</Link>
                        </div>

                        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                            <div className="divide-y divide-slate-100 ">
                                {ticketsLoading ? (
                                    <div className="p-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Data Store...</div>
                                ) : recentTickets.length === 0 ? (
                                    <div className="p-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50">No recent activity detected.</div>
                                ) : (
                                    recentTickets.map((ticket, i) => (
                                        <div
                                            key={ticket._id}
                                            onClick={() => navigate('/app/tickets')}
                                            className="p-6 hover:bg-slate-50 cursor-pointer transition-all group"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100  flex items-center justify-center text-slate-400  group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                        <IoTicket size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors text-sm">{ticket.title}</h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <StatusBadge status={ticket.status} type="ticket" />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ticket.priority} Priority</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd') : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Hub */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                            <h2 className="text-[10px] font-black text-slate-900 mb-6 uppercase tracking-[0.3em]">Sector Monitoring</h2>
                            <div className="space-y-4">
                                {[
                                    { label: 'Project Hubs', value: projects?.length || 0, icon: IoBriefcase, color: 'text-blue-600', to: '/app/projects' },
                                    { label: 'Engineering Unit', value: '128', icon: IoPeople, color: 'text-emerald-600', to: '/app/developers' },
                                    { label: 'Total Volume', value: stats.total, icon: IoTicket, color: 'text-indigo-600', to: '/app/tickets' }
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => navigate(item.to)}
                                        className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:border-blue-500/30 group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={`${item.color} group-hover:scale-110 transition-transform`} />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                                        </div>
                                        <span className="text-xl font-black text-slate-900 tracking-tighter">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
                            <div className="relative z-10">
                                <h2 className="text-[9px] font-black uppercase tracking-[0.4em] mb-4 opacity-70 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    Rapid Deployment
                                </h2>
                                <p className="font-bold text-lg leading-snug mb-6 italic">Manage your dev collective and initiative hubs.</p>
                                <button
                                    onClick={() => navigate('/app/developers')}
                                    className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                                >
                                    Personnel Registry
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16 blur-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
