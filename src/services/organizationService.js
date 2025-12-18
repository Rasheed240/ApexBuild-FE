import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

export const organizationService = {
  // List organizations
  listOrganizations: async (params = {}) => {
    const response = await api.get('/organizations', { params });
    return unwrap(response);
  },

  // Get organization by ID
  getOrganizationById: async (organizationId) => {
    const response = await api.get(`/organizations/${organizationId}`);
    return unwrap(response);
  },

  // Get organization members
  getMembers: async (organizationId, params = {}) => {
    const response = await api.get(`/organizations/${organizationId}/members`, { params });
    return unwrap(response);
  },

  // Get organizations by owner
  getOrganizationsByOwner: async (ownerId = null) => {
    const url = ownerId ? `/organizations/owner/${ownerId}` : '/organizations/owner';
    const response = await api.get(url);
    return unwrap(response);
  },

  // Create organization
  createOrganization: async (data) => {
    const response = await api.post('/organizations', data);
    return unwrap(response);
  },

  // Update organization
  updateOrganization: async (organizationId, data) => {
    const response = await api.put(`/organizations/${organizationId}`, data);
    return unwrap(response);
  },

  // Delete organization
  deleteOrganization: async (organizationId) => {
    const response = await api.delete(`/organizations/${organizationId}`);
    return unwrap(response);
  },

  // Add member to organization
  addMember: async (organizationId, data) => {
    const response = await api.post(`/organizations/${organizationId}/members`, data);
    return unwrap(response);
  },

  // Remove member from organization
  removeMember: async (organizationId, userId) => {
    const response = await api.delete(`/organizations/${organizationId}/members/${userId}`);
    return unwrap(response);
  },

  // Update member role
  updateMemberRole: async (organizationId, userId, role) => {
    const response = await api.put(`/organizations/${organizationId}/members/${userId}/role`, { role });
    return unwrap(response);
  },

  // Get pending invitations for an organization
  getInvitations: async (organizationId, params = {}) => {
    const response = await api.get(`/organizations/${organizationId}/invitations`, { params });
    return unwrap(response);
  },

  // Accept an invitation
  acceptInvitation: async (token) => {
    const response = await api.post('/organizations/invitations/accept', { token });
    return unwrap(response);
  },
};

