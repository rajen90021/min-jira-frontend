import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { IoClose, IoCheckmark, IoChevronDown, IoSparkles } from "react-icons/io5";
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
    createTicketStart, createTicketSuccess, createTicketFailure,
    updateTicketStart, updateTicketSuccess, updateTicketFailure
} from '../store/slices/ticketSlice';
import ticketService from '../services/ticketService';
import projectService from '../services/projectService';
import userService from '../services/userService';
import suggestionService from '../services/suggestionService';
import api from '../api/axios';
import LoadingButton from './LoadingButton';
import SmartSuggestions from './SmartSuggestions';



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

const initialState = {
    projectId: '',
    title: '',
    description: '',
    assignees: [],
    status: TICKET_STATUS.OPEN,
    priority: TICKET_PRIORITY.MEDIUM,
    spendTime: 0,
    duration: 0,
    remark: '',
};

export default function CreateTicketDrawer({ open, onClose, ticketToEdit }) {
    const dispatch = useDispatch();
    const { isLoading, isError, message } = useSelector((state) => state.tickets);
    const isEditMode = !!ticketToEdit;

    const [projectOptions, setProjectOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [formData, setFormData] = useState(initialState);
    const [isRefining, setIsRefining] = useState(false);
    const [suggestions, setSuggestions] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

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
                setFormData(initialState);
            }
        }
    }, [open, ticketToEdit]);

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    const projData = await projectService.getProjects({ limit: 100 });
                    setProjectOptions(projData.projects || []);
                    const userData = await userService.getUsers({ limit: 100 });
                    setUserOptions(userData.users || []);
                } catch (err) {
                    console.error("Failed to fetch options", err);
                }
            };
            fetchData();
        }
    }, [open]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.title.length > 5 && !isEditMode) {
                setAnalyzing(true);
                try {
                    const result = await suggestionService.analyzeTicket({
                        title: formData.title,
                        description: formData.description,
                        projectId: formData.projectId
                    });
                    setSuggestions(result);
                } catch (error) {
                    console.error("Analysis failed", error);
                } finally {
                    setAnalyzing(false);
                }
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [formData.title, formData.projectId]);

    const handleApplyAssignee = (userId) => {
        if (!formData.assignees.includes(userId)) {
            setFormData(prev => ({ ...prev, assignees: [...prev.assignees, userId] }));
        }
    };

    const handleApplyPriority = (priority) => {
        setFormData(prev => ({ ...prev, priority }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRefineDescription = async () => {
        if (!formData.description.trim() || isRefining) return;
        setIsRefining(true);
        try {
            const response = await api.post('/ai/refine-description', {
                description: formData.description
            });
            setFormData(prev => ({ ...prev, description: response.data.refinedDescription }));
        } catch (error) {
            console.error("Refinement error:", error);
        } finally {
            setIsRefining(false);
        }
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
                                                    {isEditMode ? 'Edit System Node' : 'Draft New Ticket'}
                                                </Dialog.Title>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Classification and assignment</p>
                                            </div>
                                            <button onClick={onClose} className="p-2 bg-white  border border-slate-200  rounded-xl text-slate-400 hover:text-rose-500 transition-all">
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
                                                        Architecture Hub
                                                    </label>
                                                    <select
                                                        name="projectId"
                                                        required
                                                        value={formData.projectId}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold appearance-none transition-all"
                                                    >
                                                        <option value="" className="">Select Project Hub...</option>
                                                        {projectOptions.map((p) => (
                                                            <option key={p._id} value={p._id} className="">{p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                        Ticket Blueprint
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        required
                                                        value={formData.title}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold placeholder:text-slate-400 transition-all"
                                                        placeholder="What needs to be built?"
                                                    />
                                                    <SmartSuggestions
                                                        loading={analyzing}
                                                        suggestions={suggestions}
                                                        onApplyAssignee={handleApplyAssignee}
                                                        onApplyPriority={handleApplyPriority}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                            Workflow Status
                                                        </label>
                                                        <select
                                                            name="status"
                                                            value={formData.status}
                                                            onChange={handleChange}
                                                            className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold appearance-none transition-all"
                                                        >
                                                            {Object.values(TICKET_STATUS).map((s) => (
                                                                <option key={s} value={s} className="">{s}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                            Priority Level
                                                        </label>
                                                        <select
                                                            name="priority"
                                                            value={formData.priority}
                                                            onChange={handleChange}
                                                            className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold appearance-none transition-all"
                                                        >
                                                            {Object.values(TICKET_PRIORITY).map((p) => (
                                                                <option key={p} value={p} className="">{p}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                        Assigned System Nodes
                                                    </label>
                                                    <Listbox
                                                        value={formData.assignees}
                                                        onChange={(selectedUsers) => setFormData({ ...formData, assignees: selectedUsers })}
                                                        multiple
                                                    >
                                                        <div className="relative">
                                                            <Listbox.Button className="relative w-full cursor-default rounded-2xl bg-slate-50  border border-slate-200  py-3.5 pl-5 pr-12 text-left outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold min-h-[50px] transition-all">
                                                                <span className="block truncate">
                                                                    {formData.assignees.length === 0
                                                                        ? 'Connect Developers...'
                                                                        : userOptions
                                                                            .filter((u) => formData.assignees.includes(u._id))
                                                                            .map((u) => u.name)
                                                                            .join(', ')}
                                                                </span>
                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                                    <IoChevronDown className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                                                </span>
                                                            </Listbox.Button>
                                                            <Transition
                                                                as={Fragment}
                                                                leave="transition ease-in duration-100"
                                                                leaveFrom="opacity-100"
                                                                leaveTo="opacity-0"
                                                            >
                                                                <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white  border border-slate-200  py-2 text-base shadow-2xl ring-1 ring-black/5 outline-none sm:text-sm z-50">
                                                                    {userOptions.map((user) => (
                                                                        <Listbox.Option
                                                                            key={user._id}
                                                                            className={({ active }) =>
                                                                                `relative cursor-default select-none py-3 pl-12 pr-4 transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-800 '
                                                                                }`
                                                                            }
                                                                            value={user._id}
                                                                        >
                                                                            {({ selected }) => (
                                                                                <>
                                                                                    <span className={`block truncate ${selected ? 'font-black' : 'font-medium'}`}>
                                                                                        {user.name}
                                                                                    </span>
                                                                                    {selected ? (
                                                                                        <span className={`absolute inset-y-0 left-0 flex items-center pl-4 ${selected ? 'text-white' : 'text-blue-600'}`}>
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

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center ml-1">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                            Operation Details
                                                        </label>
                                                        <motion.button
                                                            type="button"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleRefineDescription}
                                                            disabled={!formData.description.trim() || isRefining}
                                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${isRefining
                                                                ? 'bg-blue-600 text-white animate-pulse'
                                                                : 'bg-indigo-50  text-indigo-600  border border-indigo-100 '
                                                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                                                        >
                                                            {isRefining ? 'Re-coding...' : (
                                                                <>
                                                                    <IoSparkles className="text-sm" />
                                                                    Refine with AI
                                                                </>
                                                            )}
                                                        </motion.button>
                                                    </div>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        rows={5}
                                                        className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold resize-none placeholder:text-slate-400 transition-all"
                                                        placeholder="Technical description of the requirement..."
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                            System Hours
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="spendTime"
                                                            value={formData.spendTime}
                                                            onChange={handleChange}
                                                            className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold appearance-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                            Cycle Duration
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="duration"
                                                            value={formData.duration}
                                                            onChange={handleChange}
                                                            className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold appearance-none transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                        Technical Remark
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="remark"
                                                        value={formData.remark}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold placeholder:text-slate-400 transition-all"
                                                        placeholder="Internal system notes..."
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
                                                    <LoadingButton
                                                        type="submit"
                                                        isLoading={isLoading}
                                                        loadingText={isEditMode ? 'Syncing...' : 'Deploying...'}
                                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/10 font-black text-[10px] uppercase tracking-widest transition-all"
                                                    >
                                                        {isEditMode ? 'Update System Node' : 'Initialize Ticket'}
                                                    </LoadingButton>
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
