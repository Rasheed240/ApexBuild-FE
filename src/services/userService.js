import api from './api';

export const userService = {
  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    const userData = response.data.data;
    localStorage.setItem('user', JSON.stringify(userData));
    return response.data;
  },

  // Get profile completion
  getProfileCompletion: async () => {
    const response = await api.get('/users/profile/completion');
    return response.data;
  },

  // Invite user
  inviteUser: async (data) => {
    const response = await api.post('/users/invite', data);
    return response.data;
  },

  // Accept invite
  acceptInvite: async (data) => {
    const response = await api.post('/users/accept-invite', data);
    return response.data;
  },

  // Get pending invitations
  getPendingInvitations: async () => {
    const response = await api.get('/users/invitations/pending');
    return response.data;
  },

  // Get users by project
  getUsersByProject: async (projectId) => {
    const response = await api.get(`/users/project/${projectId}`);
    return response.data;
  },
};

