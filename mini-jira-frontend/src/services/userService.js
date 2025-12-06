import api from '../api/axios';

const getUsers = async (params) => {
    const response = await api.get('/users/all', { params });
    return response.data;
};

const registerUser = async (userData) => {
    const response = await api.post('/users/create', userData);
    return response.data;
};

const updateUser = async (userId, userData) => {
    const response = await api.put(`/users/update?userId=${userId}`, userData);
    return response.data;
};

const userService = {
    getUsers,
    registerUser,
    updateUser,
};

export default userService;
