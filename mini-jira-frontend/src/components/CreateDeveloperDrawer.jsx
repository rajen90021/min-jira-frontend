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

    // Populate form when editing
    useEffect(() => {
        if (userToEdit) {
            setFormData({
                name: userToEdit.name || '',
                email: userToEdit.email || '',
                password: '', // Don't pre-fill password
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
            // Update existing user
            dispatch(updateUserStart());
            try {
                const updatedData = { ...formData };
                // Remove password if empty (don't update password)
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
            // Create new user
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
                sx: { width: { xs: '100%', sm: 400 } }
            }}
        >
            <div className="h-full flex flex-col p-6 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white transition-colors duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEditMode ? 'Edit Developer' : 'New Developer'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                        <IoClose size={24} />
                    </button>
                </div>

                {isError && (
                    <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg mb-6 text-sm dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-white dark:bg-[#2c2c2c] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-white dark:bg-[#2c2c2c] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!isEditMode}
                            className="w-full bg-white dark:bg-[#2c2c2c] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder={isEditMode ? "Leave blank to keep current password" : "••••••••"}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-[#2c2c2c] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        >
                            <option value={USER_ROLES.DEVELOPER}>Developer</option>
                            <option value={USER_ROLES.MANAGER}>Manager</option>
                        </select>
                    </div>

                    <div className="mt-auto pt-6 flex flex-col gap-3">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Developer' : 'Create Developer')}
                        </motion.button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium border border-gray-200 dark:border-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Drawer>
    );
};

export default CreateDeveloperDrawer;
