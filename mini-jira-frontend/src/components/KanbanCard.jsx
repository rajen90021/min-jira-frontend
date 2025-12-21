import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { IoTicket, IoTimeOutline, IoFlag, IoPerson } from 'react-icons/io5';
import StatusBadge from './StatusBadge';

const KanbanCard = ({ ticket, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: ticket._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const priorityConfig = {
        Low: { bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-100 dark:border-emerald-500/20' },
        Medium: { bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-amber-100 dark:border-amber-500/20' },
        High: { bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500', border: 'border-orange-100 dark:border-orange-500/20' },
        Critical: { bg: 'bg-rose-50 dark:bg-rose-900/10', text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500', border: 'border-rose-100 dark:border-rose-500/20' },
    };

    const config = priorityConfig[ticket.priority] || priorityConfig.Medium;

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(ticket)}
            whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
            className={`
                bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700
                cursor-grab active:cursor-grabbing group select-none shadow-sm
                ${isDragging ? 'shadow-2xl ring-2 ring-blue-500/50 z-50' : 'hover:shadow-lg'}
            `}
        >
            <div className="flex justify-between items-center mb-5">
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 border ${config.bg} ${config.text} ${config.border}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${config.dot} shadow-sm`} />
                    {ticket.priority.toUpperCase()}
                </div>
                <div className="text-[10px] font-black text-slate-400 font-mono tracking-tighter">
                    #{ticket._id.slice(-4).toUpperCase()}
                </div>
            </div>

            <h4 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-5 line-clamp-2 leading-relaxed tracking-tight group-hover:text-blue-600 transition-colors">
                {ticket.title}
            </h4>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                <div className="flex -space-x-3">
                    {ticket.assignees && ticket.assignees.length > 0 ? (
                        ticket.assignees.map((assignee, i) => (
                            <div
                                key={assignee._id || i}
                                className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-white font-black shadow-md ring-1 ring-slate-100 dark:ring-slate-900"
                                title={assignee.name || 'Unknown'}
                            >
                                {assignee.name ? assignee.name.charAt(0) : '?'}
                            </div>
                        ))
                    ) : (
                        <div className="w-8 h-8 rounded-2xl bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                            <IoPerson className="text-slate-400 text-xs" />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-500 tracking-widest">
                    <IoTimeOutline size={14} className="text-blue-600 dark:text-blue-500" />
                    <span>{new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default KanbanCard;
