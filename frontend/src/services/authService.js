import api from '../config/api';

export const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },
};
