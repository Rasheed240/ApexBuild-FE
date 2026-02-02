import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

export const subscriptionService = {
  // Get subscription for organization
  getSubscription: async (organizationId) => {
    const response = await api.get(`/subscriptions/organization/${organizationId}`);
    return unwrap(response);
  },

  // Get subscription stats for organization (active user count, monthly cost, etc.)
  getSubscriptionStats: async (organizationId) => {
    const response = await api.get(`/subscriptions/organization/${organizationId}/stats`);
    return unwrap(response);
  },

  // Get active seat usage (active users in active projects, monthly billing estimate)
  getSeatUsage: async (organizationId) => {
    const response = await api.get(`/licenses/organization/${organizationId}/seats`);
    return unwrap(response);
  },

  // Create new subscription (trial or paid)
  createSubscription: async (organizationId, data = {}) => {
    const response = await api.post('/subscriptions', { organizationId, ...data });
    return unwrap(response);
  },

  // Renew subscription manually
  renewSubscription: async (subscriptionId) => {
    const response = await api.post(`/subscriptions/${subscriptionId}/renew`);
    return unwrap(response);
  },

  // Reactivate cancelled subscription
  reactivateSubscription: async (subscriptionId) => {
    const response = await api.post(`/subscriptions/${subscriptionId}/reactivate`);
    return unwrap(response);
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId, reason = '') => {
    const response = await api.post(`/subscriptions/${subscriptionId}/cancel`, { reason });
    return unwrap(response);
  },

  // Get payment/invoice history for organization
  getPaymentHistory: async (organizationId) => {
    const response = await api.get(`/payments/organization/${organizationId}`);
    return unwrap(response);
  },

  // Get revenue stats for date range (SuperAdmin)
  getRevenueStats: async (params = {}) => {
    const response = await api.get('/payments/revenue', { params });
    return unwrap(response);
  },
};
