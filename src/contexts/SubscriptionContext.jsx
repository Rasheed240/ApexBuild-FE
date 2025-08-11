import React, { createContext, useContext, useState, useCallback } from 'react';
import { useOrganizations } from './OrganizationContext';
import { subscriptionService } from '../services/subscriptionService';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { selectedOrganization } = useOrganizations();
  const [subscription, setSubscription] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [usersWithLicenses, setUsersWithLicenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load subscription data
  const loadSubscription = useCallback(async (orgId = null) => {
    if (!orgId && !selectedOrganization?.id) return;

    const organizationId = orgId || selectedOrganization.id;
    setLoading(true);
    setError('');

    try {
      const [subData, statsData, licensesData, usersData] = await Promise.all([
        subscriptionService.getSubscription(organizationId),
        subscriptionService.getSubscriptionStats(organizationId),
        subscriptionService.getOrganizationLicenses(organizationId),
        subscriptionService.getUsersWithLicenses(organizationId),
      ]);

      setSubscription(subData);
      setStats(statsData);
      setLicenses(licensesData || []);
      setUsersWithLicenses(usersData || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscription data');
      console.error('Subscription load error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization]);

  // Create subscription
  const createSubscription = useCallback(async (data) => {
    if (!selectedOrganization?.id) return;

    setLoading(true);
    setError('');

    try {
      const result = await subscriptionService.createSubscription(
        selectedOrganization.id,
        data
      );
      setSubscription(result);
      await loadSubscription();
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create subscription';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization, loadSubscription]);

  // Upgrade subscription
  const upgradeSubscription = useCallback(async (subscriptionId, additionalLicenses) => {
    setLoading(true);
    setError('');

    try {
      const result = await subscriptionService.upgradeSubscription(
        subscriptionId,
        additionalLicenses
      );
      setSubscription(result);
      await loadSubscription();
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upgrade subscription';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [loadSubscription]);

  // Downgrade subscription
  const downgradeSubscription = useCallback(async (subscriptionId, licensesToRemove) => {
    setLoading(true);
    setError('');

    try {
      const result = await subscriptionService.downgradeSubscription(
        subscriptionId,
        licensesToRemove
      );
      setSubscription(result);
      await loadSubscription();
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to downgrade subscription';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [loadSubscription]);

  // Renew subscription
  const renewSubscription = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError('');

    try {
      const result = await subscriptionService.renewSubscription(subscriptionId);
      setSubscription(result);
      await loadSubscription();
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to renew subscription';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [loadSubscription]);

  // Reactivate subscription
  const reactivateSubscription = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError('');

    try {
      const result = await subscriptionService.reactivateSubscription(subscriptionId);
      setSubscription(result);
      await loadSubscription();
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reactivate subscription';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [loadSubscription]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (subscriptionId, reason = '') => {
    setLoading(true);
    setError('');

    try {
      const result = await subscriptionService.cancelSubscription(subscriptionId, reason);
      setSubscription(result);
      await loadSubscription();
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to cancel subscription';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [loadSubscription]);

  // Assign license to user
  const assignLicense = useCallback(async (userId) => {
    if (!selectedOrganization?.id) return;

    setLoading(true);
    setError('');

    try {
      const result = await subscriptionService.assignLicense(
        selectedOrganization.id,
        userId
      );
      await loadSubscription();
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to assign license';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization, loadSubscription]);

  // Revoke license from user
  const revokeLicense = useCallback(async (licenseId, reason = '') => {
    setLoading(true);
    setError('');

    try {
      await subscriptionService.revokeLicense(licenseId, reason);
      await loadSubscription();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to revoke license';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [loadSubscription]);

  // Get payment history
  const getPaymentHistory = useCallback(async () => {
    if (!selectedOrganization?.id) return [];

    try {
      return await subscriptionService.getPaymentHistory(selectedOrganization.id);
    } catch (err) {
      console.error('Failed to get payment history:', err);
      return [];
    }
  }, [selectedOrganization]);

  const value = {
    subscription,
    licenses,
    usersWithLicenses,
    stats,
    loading,
    error,
    loadSubscription,
    createSubscription,
    upgradeSubscription,
    downgradeSubscription,
    renewSubscription,
    reactivateSubscription,
    cancelSubscription,
    assignLicense,
    revokeLicense,
    getPaymentHistory,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within SubscriptionProvider');
  }
  return context;
};
