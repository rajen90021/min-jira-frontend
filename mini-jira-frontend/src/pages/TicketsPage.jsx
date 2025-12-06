import { useMemo, useState, useEffect, Fragment } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import { useDispatch, useSelector } from 'react-redux';
import ticketService from '../services/ticketService';
import { motion } from 'framer-motion';
import { IoAdd, IoSearch, IoTicket, IoPencil, IoTrash, IoChevronDown, IoFilter } from "react-icons/io5";
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
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-[#1e1e1e] py-2.5 pl-3 pr-10 text-left border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-600">
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
                <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full min-w-[160px] overflow-auto rounded-xl bg-white dark:bg-[#1e1e1e] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-100 dark:border-gray-800">
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
        <div className="p-6 max-h-screen overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Tickets</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage and track issues</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setTicketToEdit(null);
                        setIsDrawerOpen(true);
                    }}
                    className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all font-medium"
                >
                    <IoAdd size={20} />
                    New Ticket
                </motion.button>
            </div>

            <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search tickets by title..."
                        className="w-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700 dark:text-gray-200 transition-all shadow-sm focus:border-blue-500"
                    />
                </div>

                <div className="flex w-full sm:w-auto gap-3 items-center">
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
                    <div className="w-40">
                        <FilterDropdown
                            title="Status"
                            value={statusFilter}
                            options={STATUS_OPTIONS}
                            onChange={setStatusFilter}
                            clearable
                        />
                    </div>
                    <div className="w-40">
                        <FilterDropdown
                            title="Priority"
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

            <div className="flex-1 overflow-auto bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-[#252526] sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                                    Loading tickets...
                                </td>
                            </tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                                    No tickets found.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2d2e] transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="p-4 text-sm whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
                <button
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<'}
                </button>
                <span className="text-sm text-gray-500">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    {'>'}
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
        </div>
    );
};

export default TicketsPage;
