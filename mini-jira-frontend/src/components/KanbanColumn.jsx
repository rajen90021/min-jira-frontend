import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import { IoAdd } from 'react-icons/io5';

const KanbanColumn = ({ id, title, tickets, count, onAddTicket, onTicketClick }) => {
    const { setNodeRef } = useDroppable({ id });

    const statusConfig = {
        'Open': { color: 'bg-blue-600', glow: 'shadow-blue-500/20' },
        'In Progress': { color: 'bg-amber-600', glow: 'shadow-amber-500/20' },
        'Resolved': { color: 'bg-emerald-600', glow: 'shadow-emerald-500/20' },
        'Closed': { color: 'bg-slate-600', glow: 'shadow-slate-500/20' }
    };

    const config = statusConfig[title] || { color: 'bg-slate-400', glow: '' };

    return (
        <div className="flex flex-col h-full min-w-[320px] w-[320px] xl:w-[380px] group">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${config.color} ${config.glow} shadow-lg`} />
                    <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight text-lg uppercase">{title}</h3>
                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 border border-slate-200 dark:border-slate-700">
                        {count}
                    </div>
                </div>
                {title === 'Open' && (
                    <button
                        onClick={onAddTicket}
                        className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm"
                    >
                        <IoAdd size={20} />
                    </button>
                )}
            </div>

            {/* Droppable Area - Pure Solid Card */}
            <div
                ref={setNodeRef}
                className="flex-1 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] p-4 border border-slate-100 dark:border-slate-800 shadow-inner overflow-y-auto scrollbar-hide min-h-[500px]"
            >
                <SortableContext items={tickets.map(t => t._id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4 min-h-[400px]">
                        {tickets.map((ticket) => (
                            <KanbanCard
                                key={ticket._id}
                                ticket={ticket}
                                onClick={onTicketClick}
                            />
                        ))}
                    </div>
                </SortableContext>

                {tickets.length === 0 && (
                    <div className="h-60 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-sm border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] m-2 transition-all group-hover:border-blue-500/30">
                        <div className="text-[10px] font-black tracking-[0.3em] uppercase opacity-30">Drop Zone</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
