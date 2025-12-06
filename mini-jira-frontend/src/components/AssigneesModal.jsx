import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoPerson, IoClose } from "react-icons/io5";

export default function AssigneesModal({ isOpen, onClose, assignees = [] }) {
    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-[#1e1e1e] text-left shadow-2xl transition-all sm:w-full sm:max-w-md border border-gray-100 dark:border-gray-800">
                                <div className="absolute right-4 top-4 z-10">
                                    <button
                                        type="button"
                                        className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a2d2e] transition-all focus:outline-none"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Close</span>
                                        <IoClose size={20} />
                                    </button>
                                </div>

                                <div className="px-6 pt-6 pb-4">
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                                        Assigned Developers
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                                            {assignees.length}
                                        </span>
                                    </Dialog.Title>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        List of developers actively working on this ticket.
                                    </p>
                                </div>

                                <div className="px-6 py-2 max-h-[24rem] overflow-y-auto custom-scrollbar">
                                    {assignees.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-[#252526] rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-[#2a2d2e] flex items-center justify-center mb-3">
                                                <IoPerson className="text-gray-400 text-xl" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Unassigned</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This ticket has no developers assigned yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {assignees.map((assignee, index) => (
                                                <div
                                                    key={assignee._id || index}
                                                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#252526] border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all duration-200"
                                                >
                                                    <div className="h-12 w-12 rounded-full ring-2 ring-white dark:ring-[#1e1e1e] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                                                        {assignee.name ? assignee.name.charAt(0).toUpperCase() : <IoPerson />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                                            {assignee.name || 'Unknown User'}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                                            {assignee.email || 'No email available'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="px-6 py-4 bg-gray-50 dark:bg-[#252526]/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-lg bg-gray-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-all sm:w-auto"
                                        onClick={onClose}
                                    >
                                        Done
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
