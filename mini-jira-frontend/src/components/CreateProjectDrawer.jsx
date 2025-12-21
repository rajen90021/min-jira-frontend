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

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        managerId: '',
        status: PROJECT_STATUS.ACTIVE,
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        if (open) {
            if (projectToEdit) {
                setFormData({
                    name: projectToEdit.name || '',
                    description: projectToEdit.description || '',
                    managerId: projectToEdit.managerId?._id || projectToEdit.managerId || '',
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

    useEffect(() => {
        if (open) {
            const fetchManagers = async () => {
                try {
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
                {/* Backdrop - Solid Dim */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-50 transition-opacity" />
                </Transition.Child>

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
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-lg">
                                    <div className="flex h-full flex-col bg-white  shadow-2xl overflow-hidden border-l border-slate-200 ">
                                        <div className="px-8 py-8 border-b border-slate-100  flex items-center justify-between bg-slate-50 ">
                                            <div>
                                                <Dialog.Title className="text-2xl font-black text-slate-900  leading-tight">
                                                    {isEditMode ? 'Modify Initiative' : 'New Initiative'}
                                                </Dialog.Title>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Project parameters and authority</p>
                                            </div>
                                            <button
                                                onClick={onClose}
                                                className="p-2 bg-white  border border-slate-200  rounded-xl text-slate-400 hover:text-rose-500 transition-all"
                                            >
                                                <IoClose size={24} />
                                            </button>
                                        </div>

                                        <div className="relative flex-1 px-8 py-8 overflow-y-auto scrollbar-hide">
                                            {isError && (
                                                <div className="mb-4 p-3 bg-red-50  border border-red-100  rounded-lg text-red-600  text-sm font-bold">
                                                    {message}
                                                </div>
                                            )}

                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                        Initiative Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        required
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold placeholder:text-slate-400 transition-all"
                                                        placeholder="e.g. Phoenix Protocol"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                        Designated Architect
                                                    </label>
                                                    <select
                                                        name="managerId"
                                                        required
                                                        value={formData.managerId}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold appearance-none transition-all"
                                                    >
                                                        <option value="" className="">Assign Authority...</option>
                                                        {managerOptions.map((manager) => (
                                                            <option key={manager._id} value={manager._id} className="">
                                                                {manager.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                        Operational Status
                                                    </label>
                                                    <select
                                                        name="status"
                                                        value={formData.status}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold appearance-none transition-all"
                                                    >
                                                        {Object.values(PROJECT_STATUS).map((status) => (
                                                            <option key={status} value={status} className="">{status}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                            Activation Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="startDate"
                                                            value={formData.startDate}
                                                            onChange={handleChange}
                                                            className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                            Target Completion
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="endDate"
                                                            value={formData.endDate}
                                                            onChange={handleChange}
                                                            className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                        Mission Objectives
                                                    </label>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        rows={8}
                                                        className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold resize-none placeholder:text-slate-400 transition-all"
                                                        placeholder="Define the scope and success criteria..."
                                                    />
                                                </div>

                                                <div className="pt-6 flex gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={onClose}
                                                        className="flex-1 px-6 py-4 bg-slate-100  border border-slate-200  text-slate-500  rounded-2xl hover:bg-slate-200 :bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest"
                                                    >
                                                        Abort
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/10 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isLoading ? (isEditMode ? 'Syncing...' : 'Deploying...') : (isEditMode ? 'Synchronize Initiative' : 'Activate Initiative')}
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
