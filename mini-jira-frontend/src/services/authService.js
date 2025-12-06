import api from '../api/axios';

const login = async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
};

const logout = () => {
    localStorage.removeItem('token');
};

const authService = {
    login,
    logout,
};

export default authService;
