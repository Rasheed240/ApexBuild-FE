import React, { createContext, useContext, useState, useCallback } from 'react';
import { useOrganizations } from './OrganizationContext';
import { subscriptionService } from '../services/subscriptionService';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { selectedOrganization } = useOrganizations();
  const [subscription, setSubscription] = useState(null);
  const [stats,        setStats]        = useState(null);
  const [seatUsage,    setSeatUsage]    = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  // Load subscription data for the selected organization
  const loadSubscription = useCallback(async (orgId = null) => {
    const organizationId = orgId || selectedOrganization?.id;
    if (!organizationId) return;

    setLoading(true);
    setError('');
    try {
      const [subData, statsData, seatsData] = await Promise.all([
        subscriptionService.getSubscription(organizationId).catch(() => null),
        subscriptionService.getSubscriptionStats(organizationId).catch(() => null),
        subscriptionService.getSeatUsage(organizationId).catch(() => null),
      ]);
      setSubscription(subData);
      setStats(statsData);
      setSeatUsage(seatsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization]);

  const createSubscription = useCallback(async (data) => {
    if (!selectedOrganization?.id) return { success: false, error: 'No organization selected' };
    setLoading(true); setError('');
    try {
      const result = await subscriptionService.createSubscription(selectedOrganization.id, data);
      setSubscription(result);
      await loadSubscription();
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create subscription';
      setError(message);
      return { success: false, error: message };
    } finally { setLoading(false); }
  }, [selectedOrganization, loadSubscription]);

  const renewSubscription = useCallback(async (subscriptionId) => {
    setLoading(true); setError('');
    try {
      const result = await subscriptionService.renewSubscription(subscriptionId);
      await loadSubscription();
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to renew subscription';
      setError(message);
      return { success: false, error: message };
    } finally { setLoading(false); }
  }, [loadSubscription]);

  const reactivateSubscription = useCallback(async (subscriptionId) => {
    setLoading(true); setError('');
    try {
      const result = await subscriptionService.reactivateSubscription(subscriptionId);
      await loadSubscription();
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reactivate subscription';
      setError(message);
      return { success: false, error: message };
    } finally { setLoading(false); }
  }, [loadSubscription]);

  const cancelSubscription = useCallback(async (subscriptionId, reason = '') => {
    setLoading(true); setError('');
    try {
      const result = await subscriptionService.cancelSubscription(subscriptionId, reason);
      await loadSubscription();
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to cancel subscription';
      setError(message);
      return { success: false, error: message };
    } finally { setLoading(false); }
  }, [loadSubscription]);

  const getPaymentHistory = useCallback(async () => {
    if (!selectedOrganization?.id) return [];
    try {
      return await subscriptionService.getPaymentHistory(selectedOrganization.id);
    } catch { return []; }
  }, [selectedOrganization]);

  const value = {
    subscription,
    stats,
    seatUsage,
    loading,
    error,
    loadSubscription,
    createSubscription,
    renewSubscription,
    reactivateSubscription,
    cancelSubscription,
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
  if (!context) throw new Error('useSubscriptions must be used within SubscriptionProvider');
  return context;
};
