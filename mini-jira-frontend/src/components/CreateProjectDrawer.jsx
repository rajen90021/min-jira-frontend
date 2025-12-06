import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import {
    createProjectStart, createProjectSuccess, createProjectFailure,
    updateProjectStart, updateProjectSuccess, updateProjectFailure
} from '../store/slices/projectSlice';
import projectService from '../services/projectService';
import userService from '../services/userService';

// Status options for projects
const PROJECT_STATUS = {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    ON_HOLD: 'On Hold',
    ARCHIVED: 'Archived',
};

export default function CreateProjectDrawer({ open, onClose, projectToEdit }) {
    const dispatch = useDispatch();
    const { isLoading, isError, message } = useSelector((state) => state.projects);
    const [managerOptions, setManagerOptions] = useState([]);
    const isEditMode = !!projectToEdit;

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        managerId: '',
        status: PROJECT_STATUS.ACTIVE,
        startDate: '',
        endDate: '',
    });

    // Reset form when drawer opens/closes or projectToEdit changes
    useEffect(() => {
        if (open) {
            if (projectToEdit) {
                setFormData({
                    name: projectToEdit.name || '',
                    description: projectToEdit.description || '',
                    managerId: projectToEdit.managerId?._id || projectToEdit.managerId || '', // Handle populated or ID
                    status: projectToEdit.status || PROJECT_STATUS.ACTIVE,
                    startDate: projectToEdit.startDate ? projectToEdit.startDate.split('T')[0] : '',
                    endDate: projectToEdit.endDate ? projectToEdit.endDate.split('T')[0] : '',
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    managerId: '',
                    status: PROJECT_STATUS.ACTIVE,
                    startDate: '',
                    endDate: '',
                });
            }
        }
    }, [open, projectToEdit]);

    // Fetch Managers for the dropdown
    useEffect(() => {
        if (open) {
            const fetchManagers = async () => {
                try {
                    // Fetch all users to populate the manager dropdown
                    const data = await userService.getUsers({ limit: 100 });
                    setManagerOptions(data.users || []);
                } catch (err) {
                    console.error("Failed to fetch managers", err);
                }
            };
            fetchManagers();
        }
    }, [open]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditMode) {
            // Update existing project
            dispatch(updateProjectStart());
            try {
                const updatedProject = await projectService.updateProject(projectToEdit._id, formData);
                dispatch(updateProjectSuccess(updatedProject));
                onClose();
            } catch (error) {
                const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                dispatch(updateProjectFailure(msg));
            }
        } else {
            // Create new project
            dispatch(createProjectStart());
            try {
                await projectService.createProject(formData);
                dispatch(createProjectSuccess());
                onClose();
            } catch (error) {
                const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                dispatch(createProjectFailure(msg));
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
                                                {isEditMode ? 'Edit Project' : 'New Project'}
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
                                                        Project Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        required
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
                                                        placeholder="e.g. Website Redesign"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Project Manager
                                                    </label>
                                                    <select
                                                        name="managerId"
                                                        required
                                                        value={formData.managerId}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
                                                    >
                                                        <option value="">Select a Manager</option>
                                                        {managerOptions.map((manager) => (
                                                            <option key={manager._id} value={manager._id}>
                                                                {manager.name} ({manager.email})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

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
                                                        {Object.values(PROJECT_STATUS).map((status) => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Start Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="startDate"
                                                            value={formData.startDate}
                                                            onChange={handleChange}
                                                            className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            End Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="endDate"
                                                            value={formData.endDate}
                                                            onChange={handleChange}
                                                            className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        rows={4}
                                                        className="w-full bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white resize-none"
                                                        placeholder="Project details..."
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
                                                        {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Project' : 'Create Project')}
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
