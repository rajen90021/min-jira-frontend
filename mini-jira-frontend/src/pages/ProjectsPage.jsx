import { useMemo, useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';
import { useDispatch, useSelector } from 'react-redux';
import { IoAdd, IoSearch, IoBriefcase, IoPencil, IoTrash } from "react-icons/io5";
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

    // Check if user is a manager using utility function
    const isManagerUser = checkIsManager(user);

    const handleEditClick = (project) => {
        setProjectToEdit(project);
        setIsDrawerOpen(true);
    };

    const handleDeleteClick = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            dispatch(deleteProjectStart());
            try {
                await projectService.deleteProject(projectId);
                dispatch(deleteProjectSuccess(projectId));
            } catch (error) {
                const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                dispatch(deleteProjectFailure(msg));
            }
        }
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setProjectToEdit(null);
    };

    // Table State
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

    // Debounce search term
    const [debouncedSearch, setDebouncedSearch] = useState(globalFilter);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(globalFilter), 500);
        return () => clearTimeout(timer);
    }, [globalFilter]);

    // Reset pagination when search changes
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch]);

    // Fetch projects
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
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                            <IoBriefcase />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{info.getValue()}</span>
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
                    return <span className="text-gray-500 text-sm">{manager?.name || 'Unknown'}</span>;
                },
            },
            {
                header: 'Due Date',
                accessorKey: 'endDate',
                cell: (info) => {
                    const date = info.getValue();
                    return <span className="text-gray-500 text-sm">{date ? format(new Date(date), DATE_FORMATS.SHORT) : '-'}</span>;
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
                            className={`p-1.5 rounded-md transition-colors ${isManagerUser
                                    ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                                    : 'text-gray-400 cursor-not-allowed'
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
        <div className="p-6 max-h-screen overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Projects</h1>
                    <p className="text-gray-500 dark:text-gray-400">Overview of all active projects</p>
                </div>
                <motion.button
                    whileHover={isManagerUser ? { scale: 1.05 } : {}}
                    whileTap={isManagerUser ? { scale: 0.95 } : {}}
                    onClick={() => {
                        setProjectToEdit(null);
                        setIsDrawerOpen(true);
                    }}
                    disabled={!isManagerUser}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-lg transition-all font-medium ${isManagerUser
                            ? 'bg-[#007bff] hover:bg-[#0069d9] text-white shadow-blue-500/20 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                    title={isManagerUser ? "Create new project" : "Only managers can create projects"}
                >
                    <IoAdd size={20} />
                    New Project
                </motion.button>
            </div>

            <div className="mb-6">
                <div className="relative max-w-md">
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search projects..."
                        className="w-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                    />
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
                                    Loading projects...
                                </td>
                            </tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                                    No projects found.
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

            <CreateProjectDrawer
                open={isDrawerOpen}
                onClose={handleDrawerClose}
                projectToEdit={projectToEdit}
            />
        </div>
    );
};

export default ProjectsPage;
