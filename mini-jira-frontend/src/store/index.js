import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import projectReducer from './slices/projectSlice';
import ticketReducer from './slices/ticketSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        projects: projectReducer,
        tickets: ticketReducer,
    },
});

export default store;
