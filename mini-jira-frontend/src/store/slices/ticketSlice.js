import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tickets: [],
    // Pagination metadata
    totalTickets: 0, // Using totalTickets to match API response
    currentPage: 1,
    totalPages: 1,

    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
};

const ticketSlice = createSlice({
    name: 'tickets',
    initialState,
    reducers: {
        // Fetch Tickets
        fetchTicketsStart: (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = '';
        },
        fetchTicketsSuccess: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.tickets = action.payload.tickets;
            state.totalTickets = action.payload.totalTickets;
            state.currentPage = action.payload.currentPage;
            state.totalPages = action.payload.totalPages;
            state.isError = false;
            state.message = '';
        },
        fetchTicketsFailure: (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        },

        // Create Ticket
        createTicketStart: (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = '';
            state.isSuccess = false;
        },
        createTicketSuccess: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.message = '';
        },
        createTicketFailure: (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
            state.isSuccess = false;
        },

        // Update Ticket
        updateTicketStart: (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = '';
            state.isSuccess = false;
        },
        updateTicketSuccess: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            // Optimistic update
            const index = state.tickets.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.tickets[index] = action.payload;
            }
            state.isError = false;
            state.message = '';
        },
        updateTicketFailure: (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
            state.isSuccess = false;
        },

        // Delete Ticket
        deleteTicketStart: (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = '';
        },
        deleteTicketSuccess: (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.tickets = state.tickets.filter(t => t._id !== action.payload);
            state.isError = false;
            state.message = '';
        },
        deleteTicketFailure: (state, action) => {
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
    fetchTicketsStart, fetchTicketsSuccess, fetchTicketsFailure,
    createTicketStart, createTicketSuccess, createTicketFailure,
    updateTicketStart, updateTicketSuccess, updateTicketFailure,
    deleteTicketStart, deleteTicketSuccess, deleteTicketFailure,
    reset
} = ticketSlice.actions;

export default ticketSlice.reducer;
