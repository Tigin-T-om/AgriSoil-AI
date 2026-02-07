import api from '../config/api';

export const userService = {
    // Get all users
    getAllUsers: async () => {
        const response = await api.get('/api/v1/users/');
        return response.data;
    },

    // Get user by ID
    getUserById: async (id) => {
        const response = await api.get(`/api/v1/users/${id}`);
        return response.data;
    },

    // Delete user
    deleteUser: async (id) => {
        const response = await api.delete(`/api/v1/users/${id}`);
        return response.data;
    },

    // Toggle admin status
    toggleAdminStatus: async (id) => {
        const response = await api.patch(`/api/v1/users/${id}/toggle-admin`);
        return response.data;
    }
};
