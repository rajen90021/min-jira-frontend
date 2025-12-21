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
        Low: { bg: 'bg-emerald-50 ', text: 'text-emerald-600 ', dot: 'bg-emerald-500', border: 'border-emerald-100 ' },
        Medium: { bg: 'bg-amber-50 ', text: 'text-amber-600 ', dot: 'bg-amber-500', border: 'border-amber-100 ' },
        High: { bg: 'bg-orange-50 ', text: 'text-orange-600 ', dot: 'bg-orange-500', border: 'border-orange-100 ' },
        Critical: { bg: 'bg-rose-50 ', text: 'text-rose-600 ', dot: 'bg-rose-500', border: 'border-rose-100 ' },
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
            className={`group relative bg-white border border-slate-100 rounded-[2rem] p-6 cursor-grab active:cursor-grabbing transition-all hover:border-blue-500/50 hover:shadow-xl shadow-sm ${isDragging ? 'opacity-50 ring-2 ring-blue-500/20' : 'opacity-100'
                }`}
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

            <h4 className="font-black text-slate-800 group-hover:text-blue-600 transition-colors text-sm line-clamp-2 leading-tight mb-4">
                {ticket.title}
            </h4>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                <div className="flex -space-x-3">
                    {ticket.assignees && ticket.assignees.length > 0 ? (
                        <>
                            {ticket.assignees.slice(0, 3).map((assignee, index) => (
                                <div
                                    key={assignee._id || index}
                                    className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-[10px] font-black text-blue-700 shadow-sm"
                                    title={assignee.name || 'Unknown'}
                                >
                                    {assignee.name ? assignee.name.charAt(0) : '?'}
                                </div>
                            ))}
                            {ticket.assignees.length > 3 && (
                                <div className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                                    +{ticket.assignees.length - 3}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-8 h-8 rounded-2xl bg-slate-100 border-2 border-white flex items-center justify-center">
                            <IoPerson className="text-slate-400 text-xs" />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 tracking-widest">
                    <IoTimeOutline size={14} className="text-blue-600" />
                    <span>{new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default KanbanCard;
