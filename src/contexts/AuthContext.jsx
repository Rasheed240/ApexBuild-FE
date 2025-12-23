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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Try to fetch current user from API
            try {
              const response = await authService.getCurrentUser();
              const userData = response.data;
              setUser(userData);
              setIsAuthenticated(true);
            } catch (error) {
              // Token might be invalid
              await authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        await authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const userData = response.data.user;
      setUser(userData);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpired(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  const markSessionExpired = () => {
    setSessionExpired(true);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    sessionExpired,
    login,
    logout,
    updateUser,
    refreshUser,
    markSessionExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

