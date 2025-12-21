import api from '../api/axios';

const getActivities = async ({ page = 1, limit = 20 }) => {
    const response = await api.get('/activities', {
        params: {
            page,
            limit
        }
    });
    return response.data;
};

const activityService = {
    getActivities,
};

export default activityService;
