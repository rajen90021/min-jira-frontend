import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSend, IoSparkles, IoTrashOutline } from 'react-icons/io5';
import api from '../api/axios';

const AICopilotSidebar = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm your Xetabots AI Copilot. I can help you manage tickets, analyze developer performance, or refine your project descriptions. How can I assist you today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/ai/chat', {
                message: input,
                context: {
                    url: window.location.href,
                    path: window.location.pathname
                }
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm sorry, I encountered an error while connecting to the data network. Please try again later."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: "Chat history cleared. Ready for your next mission."
            }
        ]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Scrim - No blur, just solid dim */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[9999]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-screen w-[400px] z-[10000] glass-sidebar shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg overflow-hidden flex-shrink-0">
                                    <IoSparkles size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Xetabots AI Assistant</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Engine Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={clearChat}
                                    title="Clear History"
                                    className="p-2 bg-white border border-slate-200 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                >
                                    <IoTrashOutline size={20} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-white border border-slate-200 rounded-xl text-gray-400 hover:text-gray-900 transition-all"
                                >
                                    <IoClose size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/50">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm transition-all ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none ml-auto'
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none shadow-sm">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-.3s]" />
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-.5s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask your copilot..."
                                    className="w-full bg-white border border-slate-200 rounded-2xl pl-5 pr-14 py-4 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 font-bold"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    <IoSend size={18} />
                                </button>
                            </form>
                            <p className="text-[9px] font-black text-gray-500 text-center mt-3 uppercase tracking-[0.2em]">
                                Xetabots AI Core • Enterprise Build
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AICopilotSidebar;
