import api from '../api/axios';

const analyzeTicket = async (data) => {
    const response = await api.post('/suggestions/analyze', data);
    return response.data;
};

const suggestionService = {
    analyzeTicket
};

export default suggestionService;
