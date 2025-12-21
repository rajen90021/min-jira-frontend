import { useMemo, useState, useEffect, Fragment } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import { useDispatch, useSelector } from 'react-redux';
import ticketService from '../services/ticketService';

import { motion } from 'framer-motion';
import { Listbox, Transition } from '@headlessui/react';
import {
    fetchTicketsStart, fetchTicketsSuccess, fetchTicketsFailure,
    deleteTicketStart, deleteTicketSuccess, deleteTicketFailure
} from '../store/slices/ticketSlice';
import CreateTicketDrawer from '../components/CreateTicketDrawer';
import ConfirmationModal from '../components/ConfirmationModal';
import AssigneesModal from '../components/AssigneesModal';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import TimeTrackingModal from '../components/TimeTrackingModal';
import { IoAdd, IoSearch, IoTicket, IoPencil, IoTrash, IoChevronDown, IoFilter, IoTime } from "react-icons/io5";

const SORT_OPTIONS = [
    { name: 'Newest First', value: 'createdAt', order: 'desc' },
    { name: 'Oldest First', value: 'createdAt', order: 'asc' },
    { name: 'Title (A-Z)', value: 'title', order: 'asc' },
];

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

const FilterDropdown = ({ title, value, options, onChange, clearable }) => (
    <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-2xl bg-white dark:bg-slate-800 py-3 pl-4 pr-10 text-left border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700">
                <span className={`block truncate ${!value ? 'text-gray-500' : 'text-gray-900 dark:text-gray-200'}`}>
                    {value?.name || value || title}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <IoChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </span>
            </Listbox.Button>
            <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <Listbox.Options className="absolute z-20 mt-2 max-h-60 w-full min-w-[200px] overflow-auto rounded-2xl bg-white dark:bg-slate-800 py-2 text-xs shadow-2xl focus:outline-none border border-slate-200 dark:border-white/5">
                    {clearable && (
                        <Listbox.Option
                            className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500'
                                }`
                            }
                            value={null}
                        >
                            <span className="block truncate italic">All {title}</span>
                        </Listbox.Option>
                    )}
                    {options.map((option, idx) => (
                        <Listbox.Option
                            key={idx}
                            className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-200'
                                }`
                            }
                            value={option.value || option}
                        >
                            {({ selected }) => (
                                <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {option.name || option}
                                    </span>
                                    {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                            <IoFilter className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                    ) : null}
                                </>
                            )}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Transition>
        </div>
    </Listbox>
);

const TicketsPage = () => {
    const dispatch = useDispatch();
    const { tickets, isLoading, totalTickets, totalPages } = useSelector((state) => state.tickets);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [ticketToEdit, setTicketToEdit] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [assigneesModalOpen, setAssigneesModalOpen] = useState(false);
    const [currentAssignees, setCurrentAssignees] = useState([]);
    const [timeModalOpen, setTimeModalOpen] = useState(false);
    const [ticketToLogTime, setTicketToLogTime] = useState(null);

    const handleEditClick = (ticket) => {
        setTicketToEdit(ticket);
        setIsDrawerOpen(true);
    };

    const handleDeleteClick = (ticketId) => {
        setTicketToDelete(ticketId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!ticketToDelete) return;

        dispatch(deleteTicketStart());
        try {
            await ticketService.deleteTicket(ticketToDelete);
            dispatch(deleteTicketSuccess(ticketToDelete));
            setDeleteModalOpen(false);
            setTicketToDelete(null);
        } catch (error) {
            const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            dispatch(deleteTicketFailure(msg));
            setDeleteModalOpen(false);
        }
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setTicketToEdit(null);
    };

    // Table State
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [priorityFilter, setPriorityFilter] = useState(null);
    const [sortConfig, setSortConfig] = useState(SORT_OPTIONS[0]);

    const [{ pageIndex, pageSize }, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const pagination = useMemo(
        () => ({
            pageIndex,
            pageSize,
        }),
        [pageIndex, pageSize]
    );

    // Debounce search term
    const [debouncedSearch, setDebouncedSearch] = useState(globalFilter);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(globalFilter), 500);
        return () => clearTimeout(timer);
    }, [globalFilter]);

    // Reset loop
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch, statusFilter, priorityFilter]);

    // Fetch tickets
    useEffect(() => {
        const fetchTickets = async () => {
            dispatch(fetchTicketsStart());
            try {
                const params = {
                    page: pageIndex + 1,
                    limit: pageSize,
                    search: debouncedSearch,
                    status: statusFilter,
                    priority: priorityFilter,
                    sortBy: sortConfig.value,
                    order: sortConfig.order,
                };
                const data = await ticketService.getTickets(params);
                dispatch(fetchTicketsSuccess(data));
            } catch (error) {
                const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                dispatch(fetchTicketsFailure(msg));
            }
        };
        fetchTickets();
    }, [dispatch, pageIndex, pageSize, debouncedSearch, statusFilter, priorityFilter, sortConfig, isDrawerOpen]);

    const columns = useMemo(
        () => [
            {
                header: 'Ticket',
                accessorKey: 'title',
                cell: (info) => (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold">
                            <IoTicket />
                        </div>
                        <div>
                            <div className="font-medium text-gray-900 dark:text-gray-200">{info.getValue()}</div>
                            <div className="text-xs text-gray-500">#{info.row.original._id.slice(-6).toUpperCase()}</div>
                        </div>
                    </div>
                ),
            },
            {
                header: 'Assignees',
                accessorKey: 'assignees',
                cell: (info) => {
                    const assignees = info.getValue() || [];
                    if (assignees.length === 0) return <span className="text-gray-400 text-sm">Unassigned</span>;

                    return (
                        <div
                            className="flex -space-x-1.5 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer p-1 rounded-md hover:bg-gray-50 dark:hover:bg-[#2a2d2e]"
                            onClick={() => {
                                setCurrentAssignees(assignees);
                                setAssigneesModalOpen(true);
                            }}
                        >
                            {assignees.slice(0, 4).map((assignee, index) => (
                                <div
                                    key={assignee._id || index}
                                    className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1e1e1e] bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-200 shadow-sm"
                                >
                                    {assignee.name ? assignee.name.charAt(0).toUpperCase() : '?'}
                                </div>
                            ))}
                            {assignees.length > 4 && (
                                <div className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1e1e1e] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                    +{assignees.length - 4}
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (info) => <StatusBadge status={info.getValue() || 'Open'} type="ticket" />,
            },
            {
                header: 'Priority',
                accessorKey: 'priority',
                cell: (info) => {
                    const low = info.getValue()?.toLowerCase() || 'low';
                    let color = 'text-gray-500';
                    if (low === 'medium') color = 'text-yellow-500';
                    if (low === 'high') color = 'text-orange-500';
                    if (low === 'critical') color = 'text-red-500';
                    return <span className={`font-medium ${color}`}>{info.getValue()}</span>
                }
            },
            {
                header: 'Created',
                accessorKey: 'createdAt',
                cell: (info) => {
                    const date = info.getValue();
                    return <span className="text-gray-500 text-sm">{date ? format(new Date(date), 'MMM dd, yyyy') : '-'}</span>;
                },
            },
            {
                header: 'Actions',
                id: 'actions',
                cell: (info) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setTicketToLogTime(info.row.original);
                                setTimeModalOpen(true);
                            }}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-md transition-colors"
                            title="Log Time"
                        >
                            <IoTime size={18} />
                        </button>
                        <button
                            onClick={() => handleEditClick(info.row.original)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                        >
                            <IoPencil size={18} />
                        </button>
                        <button
                            onClick={() => handleDeleteClick(info.row.original._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                        >
                            <IoTrash size={18} />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data: tickets || [],
        columns,
        pageCount: totalPages,
        state: {
            pagination,
            globalFilter,
        },
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        manualPagination: true,
        manualFiltering: true,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="h-full flex flex-col p-8 space-y-6 bg-transparent overflow-hidden">
            {/* Page Header - Fixed */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 flex-shrink-0"
            >
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Tickets
                    </h1>
                    <p className="text-gray-500 dark:text-neutral-400 font-medium">Manage and track your project issues with AI precision.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setTicketToEdit(null);
                        setIsDrawerOpen(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-2xl shadow-xl transition-all font-bold text-sm min-w-[160px] justify-center"
                >
                    <IoAdd size={24} />
                    New Ticket
                </motion.button>
            </motion.div>

            {/* Filter Section - Fixed */}
            <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center flex-shrink-0">
                <div className="glass-card relative w-full xl:w-96 rounded-2xl">
                    <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search tickets by title..."
                        className="w-full bg-transparent border-none rounded-2xl pl-12 pr-4 py-3.5 outline-none text-gray-700 dark:text-gray-200 transition-all placeholder:text-gray-400 font-medium"
                    />
                </div>

                <div className="flex w-full xl:w-auto gap-3 items-center flex-wrap">
                    {(statusFilter || priorityFilter || globalFilter || sortConfig.value !== 'createdAt') && (
                        <button
                            onClick={() => {
                                setGlobalFilter('');
                                setStatusFilter(null);
                                setPriorityFilter(null);
                                setSortConfig(SORT_OPTIONS[0]);
                            }}
                            className="text-sm text-red-500 hover:text-red-700 font-medium px-2 transition-colors whitespace-nowrap"
                        >
                            Clear All
                        </button>
                    )}
                    <div className="w-48">
                        <FilterDropdown
                            title="Operation Status"
                            value={statusFilter}
                            options={STATUS_OPTIONS}
                            onChange={setStatusFilter}
                            clearable
                        />
                    </div>
                    <div className="w-48">
                        <FilterDropdown
                            title="Node Priority"
                            value={priorityFilter}
                            options={PRIORITY_OPTIONS}
                            onChange={setPriorityFilter}
                            clearable
                        />
                    </div>
                    <div className="w-48">
                        <FilterDropdown
                            title="Sort By"
                            value={sortConfig}
                            options={SORT_OPTIONS}
                            onChange={setSortConfig}
                        />
                    </div>
                </div>
            </div>

            {/* Table Area - Scrollable */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex-1 min-h-0 flex flex-col"
            >
                <div className="overflow-auto scrollbar-hide flex-1">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-white/5 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md">
                                {table.getHeaderGroups()[0].headers.map((header) => (
                                    <th key={header.id} className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-4">
                                        <SkeletonLoader.Table rows={10} cols={6} />
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-8">
                                        <EmptyState
                                            title="No tickets found"
                                            description="Try adjusting your filters or create a new ticket to get started."
                                            icon={<IoTicket className="text-gray-400" />}
                                            action={
                                                <button
                                                    onClick={() => {
                                                        setTicketToEdit(null);
                                                        setIsDrawerOpen(true);
                                                    }}
                                                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Create Ticket
                                                </button>
                                            }
                                        />
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2d2e] transition-colors">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="p-6 text-sm whitespace-nowrap">
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

            {/* Pagination Hub - Fixed At Bottom */}
            <div className="flex items-center justify-end gap-3 flex-shrink-0">
                <button
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <IoChevronDown size={20} className="rotate-90 text-slate-500" />
                </button>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-500 tracking-widest uppercase shadow-sm">
                    Registry <span className="text-blue-600 dark:text-blue-500 mx-1">{table.getState().pagination.pageIndex + 1}</span> / {table.getPageCount() || 1}
                </div>
                <button
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <IoChevronDown size={20} className="-rotate-90 text-slate-500" />
                </button>
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

export default TicketsPage;
