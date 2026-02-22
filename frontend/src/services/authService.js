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

  // Google OAuth login
  googleLogin: async (credential) => {
    const response = await api.post('/api/v1/auth/google', { credential });
    return response.data;
  },

  // Twitter / X OAuth login
  twitterLogin: async (code, codeVerifier) => {
    const response = await api.post('/api/v1/auth/twitter', {
      code,
      code_verifier: codeVerifier,
    });
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  // --- Forgot Password (OTP) flow ---

  // Step 1: Request OTP
  forgotPassword: async (email) => {
    const response = await api.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  },

  // Step 2: Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await api.post('/api/v1/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Step 3: Reset password
  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/api/v1/auth/reset-password', {
      email,
      otp,
      new_password: newPassword,
    });
    return response.data;
  },
};
