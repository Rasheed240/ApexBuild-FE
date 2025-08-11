import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

export const subscriptionService = {
  // Get subscription for organization
  getSubscription: async (organizationId) => {
    const response = await api.get(`/subscriptions/organization/${organizationId}`);
    return unwrap(response);
  },

  // Get subscription stats for organization
  getSubscriptionStats: async (organizationId) => {
    const response = await api.get(`/subscriptions/organization/${organizationId}/stats`);
    return unwrap(response);
  },

  // Create new subscription
  createSubscription: async (organizationId, data) => {
    const response = await api.post(`/subscriptions`, {
      organizationId,
      ...data,
    });
    return unwrap(response);
  },

  // Upgrade subscription (add more licenses)
  upgradeSubscription: async (subscriptionId, additionalLicenses) => {
    const response = await api.post(`/subscriptions/${subscriptionId}/upgrade`, {
      additionalLicenses,
    });
    return unwrap(response);
  },

  // Downgrade subscription (remove licenses)
  downgradeSubscription: async (subscriptionId, licensesToRemove) => {
    const response = await api.post(`/subscriptions/${subscriptionId}/downgrade`, {
      licensesToRemove,
    });
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
    const response = await api.post(`/subscriptions/${subscriptionId}/cancel`, {
      reason,
    });
    return unwrap(response);
  },

  // Get all licenses for organization
  getOrganizationLicenses: async (organizationId) => {
    const response = await api.get(`/licenses/organization/${organizationId}`);
    return unwrap(response);
  },

  // Get active licenses for organization
  getActiveLicenses: async (organizationId) => {
    const response = await api.get(`/licenses/organization/${organizationId}/active`);
    return unwrap(response);
  },

  // Get users with a specific subscription status in organization
  getUsersWithLicenses: async (organizationId) => {
    const response = await api.get(`/licenses/organization/${organizationId}/users`);
    return unwrap(response);
  },

  // Check license status for user
  checkLicenseStatus: async (organizationId, userId) => {
    const response = await api.get(`/licenses/check/${organizationId}/${userId}`);
    return unwrap(response);
  },

  // Assign license to user (manual)
  assignLicense: async (organizationId, userId) => {
    const response = await api.post(`/licenses/assign`, {
      organizationId,
      userId,
    });
    return unwrap(response);
  },

  // Revoke license from user
  revokeLicense: async (licenseId, reason = '') => {
    const response = await api.post(`/licenses/${licenseId}/revoke`, {
      reason,
    });
    return unwrap(response);
  },

  // Get my licenses
  getMyLicenses: async () => {
    const response = await api.get(`/licenses/my-licenses`);
    return unwrap(response);
  },

  // Get payment history for organization
  getPaymentHistory: async (organizationId) => {
    const response = await api.get(`/payments/organization/${organizationId}`);
    return unwrap(response);
  },

  // Get revenue stats for date range
  getRevenueStats: async (params = {}) => {
    const response = await api.get(`/payments/revenue`, { params });
    return unwrap(response);
  },
};
