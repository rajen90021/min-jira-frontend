import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoAdd,
    IoSearch,
    IoFilter,
    IoChevronDown,
    IoTicket,
    IoTimeOutline,
    IoPerson,
    IoCreate,
    IoTrash,
    IoSync,
    IoClose
} from 'react-icons/io5';
import { format } from 'date-fns';
import { useToast } from '../contexts/ToastContext';

import {
    fetchTicketsStart, fetchTicketsSuccess, fetchTicketsFailure,
    deleteTicketStart, deleteTicketSuccess, deleteTicketFailure
} from '../store/slices/ticketSlice';
import ticketService from '../services/ticketService';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import CreateTicketDrawer from '../components/CreateTicketDrawer';
import ConfirmationModal from '../components/ConfirmationModal';
import AssigneesModal from '../components/AssigneesModal';
import TimeTrackingModal from '../components/TimeTrackingModal';
import StatusBadge from '../components/StatusBadge';
import { Listbox, Transition } from '@headlessui/react';

const TicketsPage = () => {
    const dispatch = useDispatch();
    const { tickets, isLoading } = useSelector((state) => state.tickets);
    const { user } = useSelector((state) => state.auth);
    const { showToast } = useToast();

    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [ticketToEdit, setTicketToEdit] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [assigneesModalOpen, setAssigneesModalOpen] = useState(false);
    const [currentAssignees, setCurrentAssignees] = useState([]);
    const [timeModalOpen, setTimeModalOpen] = useState(false);
    const [ticketToLogTime, setTicketToLogTime] = useState(null);

    useEffect(() => {
        const loadTickets = async () => {
            dispatch(fetchTicketsStart());
            try {
                const data = await ticketService.getTickets();
                dispatch(fetchTicketsSuccess(data));
            } catch (error) {
                dispatch(fetchTicketsFailure(error.message));
                showToast(error.message || 'Failed to load tickets', 'error');
            }
        };
        loadTickets();
    }, [dispatch]);

    const handleEditClick = (ticket) => {
        setTicketToEdit(ticket);
        setIsDrawerOpen(true);
    };

    const handleDeleteClick = (ticket) => {
        setTicketToDelete(ticket);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        dispatch(deleteTicketStart());
        try {
            await ticketService.deleteTicket(ticketToDelete._id);
            dispatch(deleteTicketSuccess(ticketToDelete._id));
            showToast('Ticket deleted successfully', 'success');
            setDeleteModalOpen(false);
        } catch (error) {
            dispatch(deleteTicketFailure(error.message));
            showToast(error.message || 'Failed to delete ticket', 'error');
        }
    };

    const handleLogTimeClick = (ticket) => {
        setTicketToLogTime(ticket);
        setTimeModalOpen(true);
    };

    const handleShowAssignees = (assignees) => {
        setCurrentAssignees(assignees);
        setAssigneesModalOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setTicketToEdit(null);
    };

    const resetFilters = () => {
        setGlobalFilter('');
        setStatusFilter('All');
        setPriorityFilter('All');
    };

    const hasActiveFilters = globalFilter !== '' || statusFilter !== 'All' || priorityFilter !== 'All';

    const filteredData = useMemo(() => {
        return tickets.filter(ticket => {
            const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
            const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
            return matchesStatus && matchesPriority;
        });
    }, [tickets, statusFilter, priorityFilter]);

    const columns = useMemo(
        () => [
            {
                header: 'Ticket Details',
                accessorKey: 'title',
                cell: ({ row }) => {
                    const ticket = row.original;
                    return (
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                                <IoSync size={20} className={isLoading ? 'animate-spin' : ''} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight mb-1">{ticket.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{ticket._id.slice(-6).toUpperCase()}</span>
                                    <span className="text-[10px] font-black text-slate-300">•</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.type || 'Task'}</span>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ getValue }) => <StatusBadge status={getValue()} type="ticket" />,
            },
            {
                header: 'Priority',
                accessorKey: 'priority',
                cell: ({ getValue }) => {
                    const priority = getValue();
                    const colors = {
                        High: 'text-rose-600 bg-rose-50 border-rose-100',
                        Medium: 'text-amber-600 bg-amber-50 border-amber-100',
                        Low: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                    };
                    return (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${colors[priority]}`}>
                            {priority}
                        </span>
                    );
                },
            },
            {
                header: 'Squad',
                accessorKey: 'assignees',
                cell: ({ getValue }) => {
                    const assignees = getValue() || [];
                    return (
                        <div
                            className="flex -space-x-2 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => handleShowAssignees(assignees)}
                        >
                            {assignees.slice(0, 3).map((a, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm"
                                    title={a.name}
                                >
                                    {a.name?.charAt(0)}
                                </div>
                            ))}
                            {assignees.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                                    +{assignees.length - 3}
                                </div>
                            )}
                            {assignees.length === 0 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-slate-400">
                                    <IoPerson size={14} />
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                header: 'Timeline',
                accessorKey: 'createdAt',
                cell: ({ getValue }) => (
                    <div className="flex items-center gap-2 text-slate-500">
                        <IoTimeOutline size={16} className="text-blue-500" />
                        <span className="text-[11px] font-bold">{format(new Date(getValue()), 'MMM dd, yyyy')}</span>
                    </div>
                ),
            },
            {
                header: 'Actions',
                id: 'actions',
                cell: ({ row }) => {
                    const ticket = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleLogTimeClick(ticket)}
                                className="p-2.5 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
                                title="Log Time"
                            >
                                <IoTimeOutline size={18} className="group-hover:rotate-12 transition-transform" />
                            </button>
                            <button
                                onClick={() => handleEditClick(ticket)}
                                className="p-2.5 bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                            >
                                <IoCreate size={18} />
                            </button>
                            <button
                                onClick={() => handleDeleteClick(ticket)}
                                className="p-2.5 bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                            >
                                <IoTrash size={18} />
                            </button>
                        </div>
                    );
                },
            },
        ],
        [isLoading]
    );

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="h-full flex flex-col gap-2 md:gap-6 p-2 md:p-8 max-w-[1600px] mx-auto w-full overflow-hidden min-w-0">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0"
            >
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-1 tracking-tight">Issue Command</h1>
                    <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em]">Deployment Archive & Task Matrix</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        setTicketToEdit(null);
                        setIsDrawerOpen(true);
                    }}
                    className="w-full md:w-auto flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest justify-center"
                >
                    <IoAdd size={18} />
                    New Ticket
                </motion.button>
            </motion.div>

            {/* Filter Section */}
            <div className="flex flex-col xl:flex-row gap-2 md:gap-4 items-stretch xl:items-center justify-between flex-shrink-0">
                <div className="relative flex-1 max-w-xl group">
                    <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search ticket matrix..."
                        className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-12 py-3 md:py-4 outline-none text-slate-900 font-bold transition-all shadow-sm focus:border-blue-500/50"
                    />
                    {globalFilter && (
                        <button
                            onClick={() => setGlobalFilter('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 p-1 rounded-full hover:bg-rose-50 transition-all"
                            title="Clear search"
                        >
                            <IoClose size={20} />
                        </button>
                    )}
                </div>

                {hasActiveFilters && (
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-6 py-3 md:py-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest whitespace-nowrap shadow-sm border border-rose-100"
                    >
                        <IoClose size={18} />
                        Clear All
                    </motion.button>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <FilterDropdown
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={['All', 'Open', 'In Progress', 'Resolved', 'Closed']}
                        label="Status"
                    />
                    <FilterDropdown
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                        options={['All', 'High', 'Medium', 'Low']}
                        label="Priority"
                    />
                </div>
            </div>

            {/* Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-[32px] overflow-hidden flex-1 min-h-0 min-w-0 flex flex-col shadow-sm border border-slate-100 bg-white"
            >
                <div className="overflow-x-auto overflow-y-auto flex-1 min-w-0">
                    <table className="w-full text-left min-w-[1000px] border-separate border-spacing-0">
                        <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                            <tr>
                                {table.getHeaderGroups()[0].headers.map((header) => (
                                    <th key={header.id} className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-10">
                                        <div className="flex flex-col items-center gap-4">
                                            <IoSync size={40} className="text-blue-500 animate-spin" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Nodes...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-20">
                                        <EmptyState
                                            title="No tickets found"
                                            description="Try adjusting your filters or create a new ticket."
                                            icon={<IoFilter className="text-slate-300" size={48} />}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="p-4 md:p-6 text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-4 flex-shrink-0">
                <div className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Showing <span className="text-slate-900">{table.getRowModel().rows.length}</span> of {filteredData.length} records
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                        className="flex-1 md:flex-none p-4 bg-white border border-slate-200 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <IoChevronDown size={20} className="rotate-90 mx-auto" />
                    </button>
                    <div className="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 tracking-widest uppercase shadow-sm whitespace-nowrap">
                        Page <span className="text-blue-600 font-black">{table.getState().pagination.pageIndex + 1}</span> of {table.getPageCount() || 1}
                    </div>
                    <button
                        className="flex-1 md:flex-none p-4 bg-white border border-slate-200 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <IoChevronDown size={20} className="-rotate-90 mx-auto" />
                    </button>
                </div>
            </div>

            <CreateTicketDrawer
                open={isDrawerOpen}
                onClose={handleDrawerClose}
                ticketToEdit={ticketToEdit}
            />

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Ticket"
                message="Are you sure you want to delete this ticket? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
                isLoading={isLoading}
            />

            <AssigneesModal
                isOpen={assigneesModalOpen}
                onClose={() => setAssigneesModalOpen(false)}
                assignees={currentAssignees}
            />

            <TimeTrackingModal
                open={timeModalOpen}
                onClose={() => setTimeModalOpen(false)}
                ticket={ticketToLogTime}
            />
        </div>
    );
};

const FilterDropdown = ({ value, onChange, options, label }) => (
    <Listbox value={value} onChange={onChange}>
        <div className="relative min-w-[140px]">
            <Listbox.Button className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</span>
                <div className="flex items-center justify-between">
                    <span className="block truncate text-xs font-bold text-slate-900">{value}</span>
                    <IoChevronDown className="text-slate-400" />
                </div>
            </Listbox.Button>
            <Transition
                as={useMemo(() => (props) => <div {...props} />, [])}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <Listbox.Options className="absolute z-[100] mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 focus:outline-none overflow-hidden">
                    {options.map((option) => (
                        <Listbox.Option
                            key={option}
                            className={({ active }) =>
                                `cursor-pointer select-none py-3 px-5 transition-colors ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                                }`
                            }
                            value={option}
                        >
                            <span className="block truncate text-xs font-bold uppercase tracking-widest">{option}</span>
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Transition>
        </div>
    </Listbox>
);

export default TicketsPage;
