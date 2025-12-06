import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    users: [],
    // Pagination metadata
    total: 0,
    page: 1,
    pages: 1,
    // Loading/Error states
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
};

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        // Fetch Users Actions
        fetchUsersStart: (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = '';
        },
        fetchUsersSuccess: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            // Handle new response structure { users, total, page, pages }
            state.users = action.payload.users;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pages = action.payload.pages;

            state.isError = false;
            state.message = '';
        },
        fetchUsersFailure: (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        },

        // Create User Actions
        createUserStart: (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = '';
            state.isSuccess = false;
        },
        createUserSuccess: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.users.push(action.payload);
            state.isError = false;
            state.message = '';
        },
        createUserFailure: (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
            state.isSuccess = false;
        },

        // Update User Actions
        updateUserStart: (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = '';
            state.isSuccess = false;
        },
        updateUserSuccess: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            // Update user in the array
            const index = state.users.findIndex(user => user._id === action.payload._id);
            if (index !== -1) {
                state.users[index] = action.payload;
            }
            state.isError = false;
            state.message = '';
        },
        updateUserFailure: (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
            state.isSuccess = false;
        },

        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        }
    },
});

export const {
    fetchUsersStart, fetchUsersSuccess, fetchUsersFailure,
    createUserStart, createUserSuccess, createUserFailure,
    updateUserStart, updateUserSuccess, updateUserFailure,
    reset
} = userSlice.actions;

export default userSlice.reducer;
