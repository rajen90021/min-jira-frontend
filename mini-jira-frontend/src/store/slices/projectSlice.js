import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    projects: [],
    // Pagination metadata
    total: 0,
    page: 1,
    pages: 1,

    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
};

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        // Fetch Projects
        fetchProjectsStart: (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = '';
        },
        fetchProjectsSuccess: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.projects = action.payload.projects;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.pages = action.payload.pages;
            state.isError = false;
            state.message = '';
        },
        fetchProjectsFailure: (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        },

        // Create Project
        createProjectStart: (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = '';
            state.isSuccess = false;
        },
        createProjectSuccess: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            // Optimistic update or refresh could happen here
            // We usually refetch for sorted lists, but pushing works for simple cases
            // state.projects.push(action.payload); 
            state.isError = false;
            state.message = '';
        },
        createProjectFailure: (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
            state.isSuccess = false;
        },

        // Update Project
        updateProjectStart: (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = '';
            state.isSuccess = false;
        },
        updateProjectSuccess: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            // Optimistically update the project in the list
            const index = state.projects.findIndex(p => p._id === action.payload._id);
            if (index !== -1) {
                state.projects[index] = action.payload;
            }
            state.isError = false;
            state.message = '';
        },
        updateProjectFailure: (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
            state.isSuccess = false;
        },

        // Delete Project
        deleteProjectStart: (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = '';
        },
        deleteProjectSuccess: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            // Remove from list
            state.projects = state.projects.filter(p => p._id !== action.payload);
            state.isError = false;
            state.message = '';
        },
        deleteProjectFailure: (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
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
    fetchProjectsStart, fetchProjectsSuccess, fetchProjectsFailure,
    createProjectStart, createProjectSuccess, createProjectFailure,
    updateProjectStart, updateProjectSuccess, updateProjectFailure,
    deleteProjectStart, deleteProjectSuccess, deleteProjectFailure,
    reset
} = projectSlice.actions;

export default projectSlice.reducer;
