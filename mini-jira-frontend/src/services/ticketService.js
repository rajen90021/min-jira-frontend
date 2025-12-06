import api from '../api/axios';

const getTickets = async (params) => {
    const response = await api.get('/tickets/all', { params });
    return response.data;
};

const createTicket = async (ticketData) => {
    const response = await api.post('/tickets/create', ticketData);
    return response.data;
};

const updateTicket = async (ticketId, ticketData) => {
    const response = await api.put(`/tickets/update?ticketId=${ticketId}`, ticketData);
    return response.data;
};

const deleteTicket = async (ticketId) => {
    const response = await api.delete(`/tickets/delete?ticketId=${ticketId}`);
    return response.data;
};

const ticketService = {
    getTickets,
    createTicket,
    updateTicket,
    deleteTicket,
};

export default ticketService;
