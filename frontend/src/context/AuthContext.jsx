import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Optionally verify token is still valid
        authService.getCurrentUser().catch(() => {
          logout();
        });
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem('access_token', response.access_token);

    const userData = await authService.getCurrentUser();
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    return { ...response, user: userData };
  };

  const googleLogin = async (credential) => {
    const response = await authService.googleLogin(credential);
    localStorage.setItem('access_token', response.access_token);

    const userData = await authService.getCurrentUser();
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    return { ...response, user: userData };
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      // Auto-login after registration
      try {
        return await login({
          username: userData.username,
          password: userData.password,
        });
      } catch (loginError) {
        // If login fails but registration succeeded, throw a more specific error
        console.error('Login after registration failed:', loginError);
        throw new Error('Account created successfully, but auto-login failed. Please try logging in manually.');
      }
    } catch (error) {
      // Re-throw registration errors as-is so they can be caught by the Register component
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    // Remove legacy shared cart key (user-specific carts are preserved for re-login)
    localStorage.removeItem('cart');
    setUser(null);
  };

  const value = {
    user,
    login,
    googleLogin,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
