import { motion, AnimatePresence } from 'framer-motion';
import { IoSparkles, IoPersonAdd, IoWarning, IoTime } from "react-icons/io5";

const SmartSuggestions = ({ loading, suggestions, onApplyAssignee, onApplyPriority, onApplyTime }) => {
    if (loading) {
        return (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50   rounded-xl border border-purple-100  flex items-center gap-3">
                <IoSparkles className="text-purple-500 animate-pulse text-xl" />
                <span className="text-sm text-purple-700  font-medium">AI is analyzing your ticket...</span>
            </div>
        );
    }

    if (!suggestions) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
            >
                <div className="flex items-center gap-2 mb-2">
                    <IoSparkles className="text-purple-500" />
                    <span className="text-sm font-bold text-gray-700  uppercase tracking-wide">Smart Suggestions</span>
                </div>

                {/* Priority Suggestion */}
                {suggestions.priority && suggestions.priority.confidence > 70 && (
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="p-3 bg-red-50  border border-red-100  rounded-lg flex justify-between items-center"
                    >
                        <div className="flex gap-3">
                            <div className="p-2 bg-red-100  rounded-full h-fit text-red-600 ">
                                <IoWarning />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800 ">
                                    Suggested Priority: <span className="text-red-600 ">{suggestions.priority.level}</span>
                                </p>
                                <p className="text-xs text-gray-500 ">
                                    {suggestions.priority.reason} ({suggestions.priority.confidence}% confidence)
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onApplyPriority(suggestions.priority.level)}
                            className="text-xs font-medium bg-white  text-red-600 border border-red-200  px-3 py-1.5 rounded hover:bg-red-50 :bg-red-900/40 transition-colors"
                        >
                            Apply
                        </button>
                    </motion.div>
                )}

                {/* Assignee Suggestions */}
                {suggestions.assignees && suggestions.assignees.length > 0 && (
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-3 bg-blue-50  border border-blue-100  rounded-lg"
                    >
                        <div className="flex gap-2 mb-2">
                            <IoPersonAdd className="text-blue-500" />
                            <span className="text-xs font-semibold text-blue-700 ">Suggested Assignees</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {suggestions.assignees.map((item) => (
                                <button
                                    key={item.user._id}
                                    type="button"
                                    onClick={() => onApplyAssignee(item.user._id)}
                                    className="flex items-center gap-2 bg-white  border border-blue-200  rounded-full px-3 py-1 hover:border-blue-400 transition-colors group"
                                    title={item.reason}
                                >
                                    <div className="w-5 h-5 rounded-full bg-blue-100  flex items-center justify-center text-[10px] font-bold text-blue-700 ">
                                        {item.user.name.charAt(0)}
                                    </div>
                                    <span className="text-xs text-gray-700  group-hover:text-blue-600 :text-blue-300">
                                        {item.user.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default SmartSuggestions;
