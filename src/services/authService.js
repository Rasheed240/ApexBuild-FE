import api from './api';

const SESSION_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  TOKEN_EXPIRES_AT: 'tokenExpiresAt',
};

const clearAuthData = () => {
  Object.values(SESSION_KEYS).forEach((key) => localStorage.removeItem(key));
};

export const authService = {
  // Register
  register: async (data) => {
    const response = await api.post('/authentication/register', data);
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/authentication/login', { email, password });
    const { accessToken, refreshToken, user, expiresAt } = response.data.data;
    
    // Store tokens and user data
    localStorage.setItem(SESSION_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(SESSION_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(SESSION_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(SESSION_KEYS.TOKEN_EXPIRES_AT, expiresAt);
    
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/authentication/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post('/authentication/forgot-password', { email });
    return response.data;
  },

  // Reset Password
  resetPassword: async (email, token, newPassword) => {
    const response = await api.post('/authentication/reset-password', {
      email,
      token,
      newPassword,
    });
    return response.data;
  },

  // Confirm Email
  confirmEmail: async (email, token) => {
    const response = await api.post('/authentication/confirm-email', {
      email,
      token,
    });
    return response.data;
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/authentication/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await api.get('/authentication/me');
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(SESSION_KEYS.ACCESS_TOKEN);
    if (!token) return false;

    const expiresAt = localStorage.getItem(SESSION_KEYS.TOKEN_EXPIRES_AT);
    if (expiresAt && new Date(expiresAt) < new Date()) {
      clearAuthData();
      return false;
    }

    return true;
  },

  // Get stored user data
  getStoredUser: () => {
    const userStr = localStorage.getItem(SESSION_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token expiry date
  getTokenExpiry: () => {
    const expiresAt = localStorage.getItem(SESSION_KEYS.TOKEN_EXPIRES_AT);
    return expiresAt ? new Date(expiresAt) : null;
  },

  // Clear all auth data (for logout or expiry)
  clearAuthData,

  // 2FA - Enable
  enable2FA: async (password) => {
    const response = await api.post('/authentication/2fa/enable', { password });
    return response.data;
  },

  // 2FA - Verify Setup
  verify2FASetup: async (code) => {
    const response = await api.post('/authentication/2fa/verify-setup', { code });
    return response.data;
  },

  // 2FA - Verify Token (during login)
  verify2FAToken: async (email, code, isBackupCode = false) => {
    const response = await api.post('/authentication/2fa/verify-token', {
      email,
      code,
      isBackupCode,
    });
    return response.data;
  },

  // 2FA - Disable
  disable2FA: async (password) => {
    const response = await api.post('/authentication/2fa/disable', { password });
    return response.data;
  },
};

