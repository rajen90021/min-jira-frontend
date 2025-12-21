import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Drawer from '@mui/material/Drawer';
import { motion } from 'framer-motion';
import { createUserStart, createUserSuccess, createUserFailure, updateUserStart, updateUserSuccess, updateUserFailure } from '../store/slices/userSlice';
import userService from '../services/userService';
import { IoClose } from "react-icons/io5";
import { USER_ROLES } from '../utils/constants';

const CreateDeveloperDrawer = ({ open, onClose, userToEdit }) => {
    const dispatch = useDispatch();
    const { isLoading, isError, message } = useSelector((state) => state.users);
    const isEditMode = Boolean(userToEdit);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: USER_ROLES.DEVELOPER
    });

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                name: userToEdit.name || '',
                email: userToEdit.email || '',
                password: '',
                role: userToEdit.role || USER_ROLES.DEVELOPER
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                role: USER_ROLES.DEVELOPER
            });
        }
    }, [userToEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditMode) {
            dispatch(updateUserStart());
            try {
                const updatedData = { ...formData };
                if (!updatedData.password) {
                    delete updatedData.password;
                }
                const updatedUser = await userService.updateUser(userToEdit._id, updatedData);
                dispatch(updateUserSuccess(updatedUser));
                onClose();
            } catch (error) {
                const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                dispatch(updateUserFailure(msg));
            }
        } else {
            dispatch(createUserStart());
            try {
                const newUser = await userService.registerUser(formData);
                dispatch(createUserSuccess(newUser));
                onClose();
                setFormData({ name: '', email: '', password: '', role: USER_ROLES.DEVELOPER });
            } catch (error) {
                const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                dispatch(createUserFailure(msg));
            }
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 450 },
                    background: 'transparent',
                    boxShadow: 'none'
                }
            }}
        >
            <div className="h-full flex flex-col bg-white  shadow-2xl border-l border-slate-200  overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-100  flex items-center justify-between bg-slate-50 ">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900  leading-tight">
                            {isEditMode ? 'Modify Entity' : 'New Entity'}
                        </h2>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Personnel registry and access</p>
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
                        <div className="mb-6 p-4 bg-rose-50  border border-rose-100  rounded-2xl text-rose-600  text-sm font-bold flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Biological ID
                            </label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold placeholder:text-slate-400 transition-all"
                                placeholder="Full name of target..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                System Signal (Email)
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold placeholder:text-slate-400 transition-all"
                                placeholder="primary@signal.corp"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Encryption Key (Password)
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!isEditMode}
                                className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold placeholder:text-slate-400 transition-all"
                                placeholder={isEditMode ? "Leave blank to maintain key" : "••••••••"}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Access Clearance
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full bg-slate-50  border border-slate-200  rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800  font-bold appearance-none transition-all"
                            >
                                <option value={USER_ROLES.DEVELOPER} className="">Developer (Standard)</option>
                                <option value={USER_ROLES.MANAGER} className="">Manager (Admin)</option>
                            </select>
                        </div>

                        <div className="mt-auto pt-8 flex flex-col gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/10"
                            >
                                {isLoading ? (isEditMode ? 'Re-syncing...' : 'Initializing...') : (isEditMode ? 'Authorize Changes' : 'Register Entity')}
                            </motion.button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-4 bg-slate-100  border border-slate-200  text-slate-500  font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 :bg-slate-800 rounded-2xl transition-all"
                            >
                                Abort
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Drawer>
    );
};

export default CreateDeveloperDrawer;
