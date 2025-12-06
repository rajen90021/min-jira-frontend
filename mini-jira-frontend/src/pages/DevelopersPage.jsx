import { useMemo, useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from '@tanstack/react-table';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure } from '../store/slices/userSlice';
import userService from '../services/userService';
import { motion } from 'framer-motion';
import { IoAdd, IoSearch, IoPerson, IoPencil } from "react-icons/io5";
import CreateDeveloperDrawer from '../components/CreateDeveloperDrawer';
import { USER_ROLES } from '../utils/constants';
import { isManager as checkIsManager } from '../utils/userHelpers';

const DevelopersPage = () => {
    const dispatch = useDispatch();
    const { users, isLoading, total, pages } = useSelector((state) => state.users);
    const { user } = useSelector((state) => state.auth);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    // Check if user is a manager using utility function
    const isManagerUser = checkIsManager(user);

    const handleEditClick = (user) => {
        setUserToEdit(user);
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setUserToEdit(null);
    };

    // Table State
    const [globalFilter, setGlobalFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [{ pageIndex, pageSize }, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);

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

    // Reset pagination when filter/search changes
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch, roleFilter]);

    // Fetch users when pagination, search, sorting or filters change
    useEffect(() => {
        const fetchUsers = async () => {
            dispatch(fetchUsersStart());
            try {
                const params = {
                    page: pageIndex + 1,
                    limit: pageSize,
                    search: debouncedSearch,
                    role: roleFilter || undefined,
                    sortBy: sorting[0]?.id || 'createdAt',
                    order: sorting[0]?.desc ? 'desc' : 'asc'
                };
                const data = await userService.getUsers(params);
                dispatch(fetchUsersSuccess(data));
            } catch (error) {
                const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                dispatch(fetchUsersFailure(msg));
            }
        };
        fetchUsers();
    }, [dispatch, pageIndex, pageSize, debouncedSearch, roleFilter, sorting]);

    const columns = useMemo(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
                cell: (info) => (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00c6ff] to-[#0072ff] flex items-center justify-center text-white font-bold text-xs">
                            {info.getValue()?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{info.getValue()}</span>
                    </div>
                ),
            },
            {
                header: 'Email',
                accessorKey: 'email',
                cell: (info) => <span className="text-gray-400">{info.getValue()}</span>,
            },
            {
                header: 'Role',
                accessorKey: 'role',
                cell: (info) => (
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${info.getValue() === USER_ROLES.MANAGER
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                        {info.getValue().toUpperCase()}
                    </span>
                ),
            },
            {
                header: 'Actions',
                id: 'actions',
                cell: (info) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={isManagerUser ? () => handleEditClick(info.row.original) : undefined}
                            disabled={!isManagerUser}
                            className={`p-1.5 rounded-md transition-colors ${isManagerUser
                                    ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                            title={isManagerUser ? "Edit" : "Only managers can edit developers"}
                        >
                            <IoPencil size={18} />
                        </button>
                    </div>
                ),
            },
        ],
        [isManagerUser]
    );

    const table = useReactTable({
        data: users || [],
        columns,
        pageCount: pages,
        state: {
            pagination,
            globalFilter,
            sorting,
        },
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="p-6 max-h-screen overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Developers</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your team members and permissions</p>
                </div>
                <motion.button
                    whileHover={isManagerUser ? { scale: 1.05 } : {}}
                    whileTap={isManagerUser ? { scale: 0.95 } : {}}
                    onClick={() => setIsDrawerOpen(true)}
                    disabled={!isManagerUser}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-lg transition-all font-medium ${isManagerUser
                            ? 'bg-[#007bff] hover:bg-[#0069d9] text-white shadow-blue-500/20 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                    title={isManagerUser ? "Add new developer" : "Only managers can add developers"}
                >
                    <IoAdd size={20} />
                    Add Developer
                </motion.button>
            </div>

            {/* Search, Filter & Actions Bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative max-w-md flex-1">
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search developers..."
                        className="w-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                    />
                </div>

                {/* Role Filter Dropdown */}
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm cursor-pointer"
                >
                    <option value="">All Roles</option>
                    <option value={USER_ROLES.DEVELOPER}>Developers</option>
                    <option value={USER_ROLES.MANAGER}>Managers</option>
                </select>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-[#252526] sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-white/5 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-2">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{
                                                asc: <span className="text-[#00c6ff]">▲</span>,
                                                desc: <span className="text-[#00c6ff]">▼</span>,
                                            }[header.column.getIsSorted()] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                                    Loading team members...
                                </td>
                            </tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                                    No developers found.
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

            {/* Simple Pagination */}
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

            <CreateDeveloperDrawer open={isDrawerOpen} onClose={handleDrawerClose} userToEdit={userToEdit} />
        </div>
    );
};

export default DevelopersPage;
