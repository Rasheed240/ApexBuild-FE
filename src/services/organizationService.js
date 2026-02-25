import api from './api';
import cachedApi from './cachedApi';

// TTL constants
const TTL_15M = 15 * 60 * 1000;
const TTL_10M = 10 * 60 * 1000;
const TTL_5M = 5 * 60 * 1000;

const unwrap = (data) => data?.data ?? data;

export const organizationService = {
  // List organizations (cached 15 min — orgs rarely change)
  listOrganizations: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const data = await cachedApi.get('/organizations', params, {
      cacheKey: `orgs:list:${qs}`,
      ttlMs: TTL_15M,
    });
    return unwrap(data);
  },

  // Get organization by ID (cached 10 min)
  getOrganizationById: async (organizationId) => {
    const data = await cachedApi.get(`/organizations/${organizationId}`, {}, {
      cacheKey: `orgs:${organizationId}`,
      ttlMs: TTL_10M,
    });
    return unwrap(data);
  },

  // Get organization members (cached 5 min)
  getMembers: async (organizationId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const data = await cachedApi.get(`/organizations/${organizationId}/members`, params, {
      cacheKey: `orgs:${organizationId}:members:${qs}`,
      ttlMs: TTL_5M,
    });
    return unwrap(data);
  },

  // Get organizations by owner (cached 10 min)
  getOrganizationsByOwner: async (ownerId = null) => {
    const url = ownerId ? `/organizations/owner/${ownerId}` : '/organizations/owner';
    const data = await cachedApi.get(url, {}, {
      cacheKey: `orgs:owner:${ownerId ?? 'me'}`,
      ttlMs: TTL_10M,
    });
    return unwrap(data);
  },

  // ── Mutations (all invalidate org cache) ──────────────────────────────────

  createOrganization: async (data) => {
    const result = await cachedApi.post('/organizations', data, {
      invalidatePrefixes: ['orgs:list:', 'orgs:owner:'],
    });
    return unwrap(result);
  },

  updateOrganization: async (organizationId, data) => {
    const result = await cachedApi.put(`/organizations/${organizationId}`, data, {
      invalidatePrefixes: ['orgs:list:', 'orgs:owner:'],
      invalidateKeys: [`orgs:${organizationId}`],
    });
    return unwrap(result);
  },

  deleteOrganization: async (organizationId) => {
    const result = await cachedApi.delete(`/organizations/${organizationId}`, {
      invalidatePrefixes: ['orgs:list:', 'orgs:owner:'],
      invalidateKeys: [`orgs:${organizationId}`],
    });
    return unwrap(result);
  },

  addMember: async (organizationId, data) => {
    const result = await cachedApi.post(`/organizations/${organizationId}/members`, data, {
      invalidatePrefixes: [`orgs:${organizationId}:members:`],
    });
    return unwrap(result);
  },

  removeMember: async (organizationId, userId) => {
    const result = await cachedApi.delete(`/organizations/${organizationId}/members/${userId}`, {
      invalidatePrefixes: [`orgs:${organizationId}:members:`],
    });
    return unwrap(result);
  },

  updateMemberRole: async (organizationId, userId, role) => {
    const response = await api.put(`/organizations/${organizationId}/members/${userId}/role`, { role });
    return unwrap(response.data);
  },

  // Invitations — not cached (dynamic, low read volume)
  getInvitations: async (organizationId, params = {}) => {
    const response = await api.get(`/organizations/${organizationId}/invitations`, { params });
    return unwrap(response.data);
  },

  acceptInvitation: async (token) => {
    const response = await api.post('/organizations/invitations/accept', { token });
    return unwrap(response.data);
  },
};
