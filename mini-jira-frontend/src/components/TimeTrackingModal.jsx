import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose, IoTime, IoCalendar } from "react-icons/io5";
import LoadingButton from './LoadingButton';
import timeTrackingService from '../services/timeTrackingService';
import { useToast } from '../contexts/ToastContext';
import { format } from 'date-fns';

export default function TimeTrackingModal({ open, onClose, ticket }) {
    const { showToast } = useToast();
    const [duration, setDuration] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        if (open && ticket) {
            fetchLogs();
        }
    }, [open, ticket]);

    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            const data = await timeTrackingService.getTicketLogs(ticket._id);
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await timeTrackingService.logTime({
                ticketId: ticket._id,
                duration: Number(duration),
                description,
                date
            });
            showToast('Time logged successfully', 'success');
            setDuration('');
            setDescription('');
            fetchLogs();
            // onClose(); // Optional: keep open to see log
        } catch (error) {
            showToast('Failed to log time', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-black/30  transition-opacity" />

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white [#1e1e1e] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200 ">
                                <div className="px-6 py-6 border-b border-gray-200  flex items-center justify-between bg-gray-50 [#252526]">
                                    <Dialog.Title className="text-lg font-semibold text-gray-900  flex items-center gap-2">
                                        <IoTime className="text-blue-500" />
                                        Log Time: {ticket?.title}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500 transition-colors"
                                    >
                                        <IoClose size={24} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700  mb-1">
                                                    Duration (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    className="w-full bg-gray-50 [#252526] border border-gray-200  rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 "
                                                    placeholder="e.g. 60"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700  mb-1">
                                                    Date
                                                </label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className="w-full bg-gray-50 [#252526] border border-gray-200  rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 "
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700  mb-1">
                                                Description (Optional)
                                            </label>
                                            <textarea
                                                rows="2"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="w-full bg-gray-50 [#252526] border border-gray-200  rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900  resize-none"
                                                placeholder="What did you work on?"
                                            />
                                        </div>

                                        <LoadingButton
                                            type="submit"
                                            isLoading={isLoading}
                                            loadingText="Logging..."
                                            className="w-full py-2.5"
                                        >
                                            Log Time
                                        </LoadingButton>
                                    </form>

                                    <div className="mt-8">
                                        <h4 className="text-sm font-semibold text-gray-900  mb-4 border-b border-gray-200  pb-2">
                                            Recent Logs
                                        </h4>
                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                            {loadingLogs ? (
                                                <div className="text-center text-gray-500 text-sm py-4">Loading history...</div>
                                            ) : logs.length === 0 ? (
                                                <div className="text-center text-gray-500  text-sm py-4 italic">
                                                    No time logged yet.
                                                </div>
                                            ) : (
                                                logs.map((log) => (
                                                    <div key={log._id} className="flex justify-between items-start text-sm p-3 bg-gray-50 [#252526] rounded-lg">
                                                        <div>
                                                            <div className="font-medium text-gray-900 ">
                                                                {log.userId?.name}
                                                            </div>
                                                            <div className="text-gray-500  text-xs">
                                                                {format(new Date(log.startTime), 'MMM d, yyyy')}
                                                            </div>
                                                            {log.description && (
                                                                <div className="text-gray-600  mt-1">
                                                                    {log.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="font-bold text-blue-600  bg-blue-50  px-2 py-1 rounded">
                                                            {log.duration}m
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
