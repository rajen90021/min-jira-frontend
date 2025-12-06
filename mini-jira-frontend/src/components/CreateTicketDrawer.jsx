import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { IoClose, IoCheckmark, IoChevronDown } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import {
    createTicketStart, createTicketSuccess, createTicketFailure,
    updateTicketStart, updateTicketSuccess, updateTicketFailure
} from '../store/slices/ticketSlice';
import ticketService from '../services/ticketService';
import projectService from '../services/projectService';
import userService from '../services/userService';

// Options
const TICKET_PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
};

const TICKET_STATUS = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
};

export default function CreateTicketDrawer({ open, onClose, ticketToEdit }) {
    const dispatch = useDispatch();
    const { isLoading, isError, message } = useSelector((state) => state.tickets);
    const isEditMode = !!ticketToEdit;

    // Dropdown Data
    const [projectOptions, setProjectOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        projectId: '',
        title: '',
        description: '',
        assignees: [], // Array of User IDs
        status: TICKET_STATUS.OPEN,
        priority: TICKET_PRIORITY.MEDIUM,
        spendTime: 0,
        duration: 0,
        remark: '',
    });

    // Reset loop
    useEffect(() => {
        if (open) {
            if (ticketToEdit) {
                setFormData({
                    projectId: ticketToEdit.projectId || '',
                    title: ticketToEdit.title || '',
                    description: ticketToEdit.description || '',
                    assignees: ticketToEdit.assignees ? ticketToEdit.assignees.map(a => typeof a === 'object' ? a._id : a) : [],
                    status: ticketToEdit.status || TICKET_STATUS.OPEN,
                    priority: ticketToEdit.priority || TICKET_PRIORITY.MEDIUM,
                    spendTime: ticketToEdit.spendTime || 0,
                    duration: ticketToEdit.duration || 0,
                    remark: ticketToEdit.remark || '',
                });
            } else {
                setFormData({
                    projectId: '',
                    title: '',
                    description: '',
                    assignees: [],
                    status: TICKET_STATUS.OPEN,
                    priority: TICKET_PRIORITY.MEDIUM,
                    spendTime: 0,
                    duration: 0,
                    remark: '',
                });
            }
        }
    }, [open, ticketToEdit]);

    // Fetch Options
    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    // Fetch Projects (limit 100 for dropdown)
                    const projData = await projectService.getProjects({ limit: 100 });
                    setProjectOptions(projData.projects || []);

                    // Fetch Developers (limit 100) - Assuming tickets assigned to devs
                    const userData = await userService.getUsers({ limit: 100 });
                    setUserOptions(userData.users || []);
                } catch (err) {
                    console.error("Failed to fetch options", err);
                }
            };
            fetchData();
        }
    }, [open]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditMode) {
            dispatch(updateTicketStart());
        } else {
            dispatch(createTicketStart());
        }

        try {
            if (isEditMode) {
                const data = await ticketService.updateTicket(ticketToEdit._id, formData);
                dispatch(updateTicketSuccess(data));
            } else {
                await ticketService.createTicket(formData);
                dispatch(createTicketSuccess());
            }
            onClose();
        } catch (error) {
            const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            if (isEditMode) {
                dispatch(updateTicketFailure(msg));
            } else {
                dispatch(createTicketFailure(msg));
            }
        }
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300 sm:duration-500"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300 sm:duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-[#1e1e1e] shadow-xl">
                                        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {isEditMode ? 'Edit Ticket' : 'New Ticket'}
                                            </Dialog.Title>
                                            <button
                                                onClick={onClose}
                                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                            >
                                                <IoClose size={24} />
                                            </button>
                                        </div>

                                        <div className="relative flex-1 px-6 py-6">
                                            {isError && (
                                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                                    {message}
                                                </div>
                                            )}

                                            <form onSubmit={handleSubmit} className="space-y-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Project
                                                    </label>
                                                    <select
                                                        name="projectId"
                                                        required
                                                        value={formData.projectId}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
                                                    >
                                                        <option value="">Select a Project</option>
                                                        {projectOptions.map((p) => (
                                                            <option key={p._id} value={p._id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        required
                                                        value={formData.title}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
                                                        placeholder="Ticket summary..."
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Status
                                                        </label>
                                                        <select
                                                            name="status"
                                                            value={formData.status}
                                                            onChange={handleChange}
                                                            className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
                                                        >
                                                            {Object.values(TICKET_STATUS).map((s) => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Priority
                                                        </label>
                                                        <select
                                                            name="priority"
                                                            value={formData.priority}
                                                            onChange={handleChange}
                                                            className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
                                                        >
                                                            {Object.values(TICKET_PRIORITY).map((p) => (
                                                                <option key={p} value={p}>{p}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Assign To
                                                    </label>
                                                    <Listbox
                                                        value={formData.assignees}
                                                        onChange={(selectedUsers) => setFormData({ ...formData, assignees: selectedUsers })}
                                                        multiple
                                                    >
                                                        <div className="relative mt-1">
                                                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-50 dark:bg-[#252526] py-2.5 pl-4 pr-10 text-left border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm text-gray-900 dark:text-white min-h-[42px]">
                                                                <span className="block truncate">
                                                                    {formData.assignees.length === 0
                                                                        ? 'Select Developers'
                                                                        : userOptions
                                                                            .filter((u) => formData.assignees.includes(u._id))
                                                                            .map((u) => u.name)
                                                                            .join(', ')}
                                                                </span>
                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                    <IoChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                </span>
                                                            </Listbox.Button>
                                                            <Transition
                                                                as={Fragment}
                                                                leave="transition ease-in duration-100"
                                                                leaveFrom="opacity-100"
                                                                leaveTo="opacity-0"
                                                            >
                                                                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-[#1e1e1e] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                                                    {userOptions.map((user) => (
                                                                        <Listbox.Option
                                                                            key={user._id}
                                                                            className={({ active }) =>
                                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                                                                                }`
                                                                            }
                                                                            value={user._id}
                                                                        >
                                                                            {({ selected }) => (
                                                                                <>
                                                                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                                        {user.name}
                                                                                    </span>
                                                                                    {selected ? (
                                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                                                                            <IoCheckmark className="h-5 w-5" aria-hidden="true" />
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
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        rows={3}
                                                        className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white resize-none"
                                                        placeholder="Details..."
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Spend Time (hrs)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="spendTime"
                                                            value={formData.spendTime}
                                                            onChange={handleChange}
                                                            className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Duration (days)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="duration"
                                                            value={formData.duration}
                                                            onChange={handleChange}
                                                            className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Remark
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="remark"
                                                        value={formData.remark}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
                                                        placeholder="Any remarks..."
                                                    />
                                                </div>

                                                <div className="pt-4 flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={onClose}
                                                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252526] transition-colors font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Ticket' : 'Create Ticket')}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
