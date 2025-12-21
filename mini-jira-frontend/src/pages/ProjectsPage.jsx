import { useMemo, useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import { useDispatch, useSelector } from 'react-redux';
import { IoAdd, IoSearch, IoBriefcase, IoPencil, IoTrash, IoChevronDown } from "react-icons/io5";
import {
    fetchProjectsStart, fetchProjectsSuccess, fetchProjectsFailure,
    deleteProjectStart, deleteProjectSuccess, deleteProjectFailure
} from '../store/slices/projectSlice';
import projectService from '../services/projectService';
import { motion } from 'framer-motion';
import CreateProjectDrawer from '../components/CreateProjectDrawer';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';
import { isManager as checkIsManager } from '../utils/userHelpers';
import { DATE_FORMATS } from '../utils/constants';

const ProjectsPage = () => {
    const dispatch = useDispatch();
    const { projects, isLoading, total, pages } = useSelector((state) => state.projects);
    const { user } = useSelector((state) => state.auth);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);

    const isManagerUser = checkIsManager(user);

    const handleEditClick = (project) => {
        setProjectToEdit(project);
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setProjectToEdit(null);
    };

    const [globalFilter, setGlobalFilter] = useState('');
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
    }, [debouncedSearch]);

    useEffect(() => {
        const fetchProjects = async () => {
            dispatch(fetchProjectsStart());
            try {
                const params = {
                    page: pageIndex + 1,
                    limit: pageSize,
                    search: debouncedSearch,
                    sortBy: sorting[0]?.id || 'createdAt',
                    order: sorting[0]?.desc ? 'desc' : 'asc'
                };
                const data = await projectService.getProjects(params);
                dispatch(fetchProjectsSuccess(data));
            } catch (error) {
                const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                dispatch(fetchProjectsFailure(msg));
            }
        };
        fetchProjects();
    }, [dispatch, pageIndex, pageSize, debouncedSearch, sorting, isDrawerOpen]);

    const columns = useMemo(
        () => [
            {
                header: 'Project Name',
                accessorKey: 'name',
                cell: (info) => (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                            <IoBriefcase />
                        </div>
                        <span className="font-bold text-slate-800">{info.getValue()}</span>
                    </div>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (info) => <StatusBadge status={info.getValue() || 'Planned'} type="project" />,
            },
            {
                header: 'Manager',
                accessorKey: 'managerId',
                cell: (info) => {
                    const manager = info.getValue();
                    return <span className="text-slate-500 font-medium">{manager?.name || 'Unknown'}</span>;
                },
            },
            {
                header: 'Due Date',
                accessorKey: 'endDate',
                cell: (info) => {
                    const date = info.getValue();
                    return <span className="text-slate-500 font-medium">{date ? format(new Date(date), DATE_FORMATS.SHORT) : '-'}</span>;
                },
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
                                ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                                : 'text-slate-300 cursor-not-allowed'
                                }`}
                            title={isManagerUser ? "Edit" : "Only managers can edit projects"}
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
        data: projects || [],
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
        <div className="h-full flex flex-col p-2 md:p-8 space-y-2 md:space-y-6 bg-transparent overflow-hidden">
            {/* Page Header - Fixed */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-6 flex-shrink-0"
            >
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-1 tracking-tight">
                        Initiative Hubs
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em]">Project Architecture Management</p>
                </div>
                <motion.button
                    whileHover={isManagerUser ? { scale: 1.02 } : {}}
                    whileTap={isManagerUser ? { scale: 0.98 } : {}}
                    onClick={() => {
                        setProjectToEdit(null);
                        setIsDrawerOpen(true);
                    }}
                    disabled={!isManagerUser}
                    className={`flex items-center gap-2 px-6 py-3 md:px-8 md:py-3.5 rounded-2xl shadow-lg transition-all font-black text-[10px] md:text-xs uppercase tracking-widest min-w-[160px] md:min-w-[200px] justify-center ${isManagerUser
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    <IoAdd size={20} />
                    New Initiative
                </motion.button>
            </motion.div>

            {/* Search Bar - Fixed */}
            <div className="flex flex-col xl:flex-row gap-2 md:gap-6 justify-between items-start xl:items-center flex-shrink-0">
                <div className="glass-card relative w-full xl:w-96 rounded-2xl bg-white border border-slate-200">
                    <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search projects..."
                        className="w-full bg-transparent border-none rounded-2xl pl-12 pr-4 py-3 md:py-4 outline-none text-slate-800 transition-all font-bold"
                    />
                </div>
            </div>

            {/* Table Area - Scrollable */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-[32px] overflow-hidden flex-1 min-h-0 flex flex-col shadow-sm"
            >
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors select-none"
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
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-16 text-center">
                                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                        <p className="text-slate-400 mt-4 font-black uppercase text-[10px] tracking-widest">Compiling Nodes...</p>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest italic opacity-50">
                                        No active projects in Core.
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

                {/* Mobile Card View */}
                <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 min-h-[60vh]">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse">
                                    <div className="h-4 w-1/2 bg-slate-100 rounded-full mb-3" />
                                    <div className="h-3 w-1/4 bg-slate-50 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : table.getRowModel().rows.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest opacity-50">
                            No active projects.
                        </div>
                    ) : (
                        table.getRowModel().rows.map((row) => {
                            const project = row.original;
                            return (
                                <div
                                    key={row.id}
                                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
                                    onClick={isManagerUser ? () => handleEditClick(project) : undefined}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                                            <IoBriefcase size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{project.name}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Manager: {project.managerId?.name || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timeline</span>
                                            <span className="text-[11px] font-bold text-slate-700">
                                                {project.endDate ? format(new Date(project.endDate), 'MMM dd, yyyy') : 'No Target'}
                                            </span>
                                        </div>
                                        {isManagerUser && (
                                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                                <IoPencil size={18} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </motion.div>

            {/* Pagination Hub - Fixed At Bottom */}
            <div className="flex items-center justify-end gap-3 flex-shrink-0">
                <button
                    className="p-3 bg-white border border-slate-200 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <IoChevronDown size={20} className="rotate-90 text-slate-500" />
                </button>
                <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-500 tracking-widest uppercase shadow-sm">
                    Registry <span className="text-blue-600 mx-1">{table.getState().pagination.pageIndex + 1}</span> / {table.getPageCount() || 1}
                </div>
                <button
                    className="p-3 bg-white border border-slate-100 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-50 transition-all shadow-sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <IoChevronDown size={20} className="-rotate-90 text-slate-500" />
                </button>
            </div>

            <CreateProjectDrawer
                open={isDrawerOpen}
                onClose={handleDrawerClose}
                projectToEdit={projectToEdit}
            />
        </div>
    );
};

export default ProjectsPage;
