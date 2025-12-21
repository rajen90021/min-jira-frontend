import api from '../api/axios';

const logTime = async (data) => {
    const response = await api.post('/time-logs/log', data);
    return response.data;
};

const getTicketLogs = async (ticketId) => {
    const response = await api.get(`/time-logs/${ticketId}`);
    return response.data;
};

const timeTrackingService = {
    logTime,
    getTicketLogs
};

export default timeTrackingService;
