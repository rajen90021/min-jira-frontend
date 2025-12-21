import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
    IoTimeOutline,
    IoCheckmarkCircle,
    IoCreate,
    IoTrash,
    IoSync,
    IoChevronDown,
    IoArrowForward,
    IoTerminalOutline
} from "react-icons/io5";
import activityService from '../services/activityService';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const ActivityTimelinePage = () => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchActivities();
    }, [page]);

    const navigate = useNavigate();

    const fetchActivities = async () => {
        setIsLoading(true);
        try {
            const data = await activityService.getActivities({ page, limit: 20 });
            setActivities(data.activities);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJump = (type) => {
        if (type?.toLowerCase() === 'project') navigate('/app/projects');
        if (type?.toLowerCase() === 'ticket') navigate('/app/tickets');
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'created':
                return <IoCreate className="h-5 w-5 text-emerald-600" />;
            case 'deleted':
                return <IoTrash className="h-5 w-5 text-rose-600" />;
            case 'updated':
            case 'status_changed':
                return <IoSync className="h-5 w-5 text-indigo-600 animate-spin-slow" />;
            default:
                return <IoCheckmarkCircle className="h-5 w-5 text-slate-500" />;
        }
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-8 space-y-4 md:space-y-6 bg-transparent overflow-hidden relative">
            {/* Header - Fixed */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0"
            >
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
                        Activity Stream
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Real-time log of project updates</p>
                </div>
            </motion.div>

            {/* Timeline - Scrollable */}
            <div className="flex-1 min-h-[60vh] overflow-auto scrollbar-hide">
                <div className="max-w-5xl">
                    {isLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 w-1/4 bg-slate-100 rounded-full animate-pulse" />
                                        <div className="h-24 w-full bg-slate-50/50 border border-slate-100 rounded-3xl animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="mt-20">
                            <EmptyState
                                title="No Activity Records"
                                description="No activity logs detected. Start building to see the timeline populate."
                                icon={<IoTimeOutline className="text-slate-400/50" />}
                            />
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-slate-100 ml-6 space-y-10 pb-12">
                            {activities.map((activity, index) => (
                                <motion.div
                                    key={activity._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative pl-10"
                                >
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[18px] top-1 bg-white border border-slate-200 p-2 rounded-xl shadow-md z-10 scale-110">
                                        {getActionIcon(activity.action)}
                                    </div>

                                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-blue-500/50 hover:shadow-xl transition-all group shadow-sm">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-black shadow-lg">
                                                    {activity.userId?.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 flex items-center gap-2 text-lg">
                                                        {activity.userId?.name || 'Unknown Contributor'}
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                                    </h4>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                        {format(new Date(activity.createdAt), 'MMM d, yyyy • h:mm a')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`text-[10px] px-4 py-2 rounded-2xl font-black tracking-widest border capitalize shadow-sm ${activity.action === 'created' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                activity.action === 'deleted' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                }`}>
                                                {activity.action.replace('_', ' ')}
                                            </div>
                                        </div>

                                        <p className="text-slate-600 leading-relaxed font-semibold mb-6">
                                            {activity.details}
                                        </p>

                                        {activity.entityName && (
                                            <div
                                                onClick={() => handleJump(activity.entityType)}
                                                className="inline-flex mt-2 items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl text-[10px] font-black border border-slate-100 cursor-pointer hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm group/badge"
                                            >
                                                <span className="text-blue-600 group-hover/badge:text-white uppercase tracking-tighter opacity-70">{activity.entityType}:</span>
                                                <span className="text-slate-800 group-hover/badge:text-white">{activity.entityName}</span>
                                                <IoArrowForward className="opacity-0 group-hover/badge:opacity-100 group-hover/badge:translate-x-1 transition-all" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination - Fixed */}
            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4 flex-shrink-0">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-3 bg-white border border-slate-200 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <IoChevronDown size={20} className="rotate-90 text-slate-500" />
                    </button>
                    <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-400 tracking-widest uppercase shadow-sm">
                        LOG PAGE <span className="text-blue-600">{page}</span> / {totalPages}
                    </div>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-3 bg-white border border-slate-100 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <IoChevronDown size={20} className="-rotate-90 text-slate-500" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityTimelinePage;
