import api from '../utils/api';

export const getAdminUsers = async (params = {}) => {
    return api.get('/users', { params });
};

export const getUserStats = async () => {
    return api.get('/users/stats');
};
