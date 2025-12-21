import { useMemo, useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure } from '../store/slices/userSlice';
import userService from '../services/userService';
import { motion } from 'framer-motion';
import { IoAdd, IoSearch, IoPerson, IoPencil, IoChevronDown, IoClose } from "react-icons/io5";
import CreateDeveloperDrawer from '../components/CreateDeveloperDrawer';
import { USER_ROLES } from '../utils/constants';
import { isManager as checkIsManager } from '../utils/userHelpers';

const DevelopersPage = () => {
    const dispatch = useDispatch();
    const { users, isLoading, total, pages } = useSelector((state) => state.users);
    const { user } = useSelector((state) => state.auth);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    const isManagerUser = checkIsManager(user);

    const handleEditClick = (user) => {
        setUserToEdit(user);
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setUserToEdit(null);
    };

    const [globalFilter, setGlobalFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const resetFilters = () => {
        setGlobalFilter('');
        setRoleFilter('');
    };

    const hasActiveFilters = globalFilter !== '' || roleFilter !== '';
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

    const [debouncedSearch, setDebouncedSearch] = useState(globalFilter);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(globalFilter), 500);
        return () => clearTimeout(timer);
    }, [globalFilter]);

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch, roleFilter]);

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
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-md">
                            {info.getValue()?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="font-bold text-slate-800 ">{info.getValue()}</span>
                    </div>
                ),
            },
            {
                header: 'Email',
                accessorKey: 'email',
                cell: (info) => <span className="text-slate-500  font-medium">{info.getValue()}</span>,
            },
            {
                header: 'Role',
                accessorKey: 'role',
                cell: (info) => (
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${info.getValue() === USER_ROLES.MANAGER
                        ? 'bg-purple-50  text-purple-600  border-purple-100 '
                        : 'bg-blue-50  text-blue-600  border-blue-100 '
                        }`}>
                        {info.getValue()}
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
                            className={`p-2 rounded-xl transition-all ${isManagerUser
                                ? 'text-blue-600 hover:bg-blue-50 :bg-blue-900/20 cursor-pointer'
                                : 'text-slate-300  cursor-not-allowed'
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
        <div className="h-full flex flex-col p-2 md:p-8 space-y-2 md:space-y-6 bg-transparent overflow-hidden min-w-0">
            {/* Page Header - Fixed */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-4 flex-shrink-0"
            >
                <div>
                    <h1 className="text-4xl font-black text-slate-900  mb-2 tracking-tight">
                        Engineer Registry
                    </h1>
                    <p className="text-slate-500  font-bold uppercase text-[10px] tracking-[0.2em]">Personnel Management & Permissions</p>
                </div>
                <motion.button
                    whileHover={isManagerUser ? { scale: 1.02 } : {}}
                    whileTap={isManagerUser ? { scale: 0.98 } : {}}
                    onClick={() => setIsDrawerOpen(true)}
                    disabled={!isManagerUser}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl shadow-lg transition-all font-black text-xs uppercase tracking-widest min-w-[200px] justify-center ${isManagerUser
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-slate-200  text-slate-400  cursor-not-allowed opacity-50'
                        }`}
                >
                    <IoAdd size={24} />
                    Add Developer
                </motion.button>
            </motion.div>

            {/* Filter Section - Fixed */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 flex-shrink-0">
                <div className="glass-card relative max-w-md flex-1 rounded-2xl bg-white  border border-slate-200  shadow-sm group">
                    <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search personnel..."
                        className="w-full bg-transparent border-none rounded-2xl pl-12 pr-12 py-4 outline-none text-slate-800  transition-all font-bold"
                    />
                    {globalFilter && (
                        <button
                            onClick={() => setGlobalFilter('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 p-1 rounded-full hover:bg-rose-50 transition-all"
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
                        className="flex items-center gap-2 px-6 py-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest whitespace-nowrap border border-rose-100"
                    >
                        <IoClose size={18} />
                        Clear Filters
                    </motion.button>
                )}

                <div className="bg-white  border border-slate-200  rounded-2xl px-6 flex items-center shadow-sm">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-transparent border-none text-slate-600  py-4 outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer"
                    >
                        <option value="" className="">All Status Codes</option>
                        <option value={USER_ROLES.DEVELOPER} className="">Developers</option>
                        <option value={USER_ROLES.MANAGER} className="">Managers</option>
                    </select>
                </div>
            </div>

            {/* Table Area - Scrollable */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-[32px] overflow-hidden flex-1 min-h-0 min-w-0 flex flex-col bg-white  border border-slate-200  shadow-sm"
            >
                <div className="overflow-x-auto overflow-y-auto flex-1 min-w-0">
                    <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px]">
                        <thead className="bg-slate-50  sticky top-0 z-10 border-b border-slate-200 ">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            className="p-4 md:p-6 text-[10px] font-black text-slate-500  uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors select-none whitespace-nowrap"
                                        >
                                            <div className="flex items-center gap-2">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{
                                                    asc: <span className="text-blue-500">▲</span>,
                                                    desc: <span className="text-blue-500">▼</span>,
                                                }[header.column.getIsSorted()] ?? null}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-100 ">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-16 text-center">
                                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                        <p className="text-slate-400 mt-4 font-black uppercase text-[10px] tracking-widest">Scanning Force...</p>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest italic opacity-50">
                                        No personnel detected in sector.
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="p-6 text-sm font-medium whitespace-nowrap">
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
                    className="p-3 bg-white  border border-slate-200  rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-50 :bg-slate-800 transition-all shadow-sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <IoChevronDown size={20} className="rotate-90 text-slate-500" />
                </button>
                <div className="bg-white  border border-slate-200  px-6 py-3 rounded-2xl text-[10px] font-black text-slate-500 tracking-widest uppercase shadow-sm">
                    Personnel Index <span className="text-blue-600  mx-1">{table.getState().pagination.pageIndex + 1}</span> / {table.getPageCount() || 1}
                </div>
                <button
                    className="p-3 bg-white  border border-slate-200  rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-50 :bg-slate-800 transition-all shadow-sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <IoChevronDown size={20} className="-rotate-90 text-slate-500" />
                </button>
            </div>

            <CreateDeveloperDrawer open={isDrawerOpen} onClose={handleDrawerClose} userToEdit={userToEdit} />
        </div>
    );
};

export default DevelopersPage;
