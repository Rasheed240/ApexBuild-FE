import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { organizationService } from '../services/organizationService';
import { useAuth } from './AuthContext';

const OrganizationContext = createContext(null);

export const useOrganizations = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizations must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrganizations = useCallback(async () => {
    if (!isAuthenticated) {
      setOrganizations([]);
      setSelectedOrganization(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Use listOrganizations endpoint which includes memberCount and applies role-based access control
      const data = await organizationService.listOrganizations({ pageSize: 1000 });
      const orgs = data?.organizations ?? data?.Organizations ?? [];
      setOrganizations(orgs);

      const savedOrgId = localStorage.getItem('selectedOrganizationId');
      const fallbackOrg = orgs[0] ?? null;
      const matchedOrg = orgs.find((org) => org.id === savedOrgId) ?? fallbackOrg;
      setSelectedOrganization(matchedOrg ?? null);
      if (matchedOrg) {
        localStorage.setItem('selectedOrganizationId', matchedOrg.id);
      } else {
        localStorage.removeItem('selectedOrganizationId');
      }
    } catch (err) {
      console.error('Failed to load organizations', err);
      setError('Failed to load organizations');
      setOrganizations([]);
      setSelectedOrganization(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchOrganizations();
    }
  }, [authLoading, fetchOrganizations]);

  const selectOrganization = (organization) => {
    setSelectedOrganization(organization);
    if (organization) {
      localStorage.setItem('selectedOrganizationId', organization.id);
    } else {
      localStorage.removeItem('selectedOrganizationId');
    }
  };

  const createOrganization = async (data) => {
    try {
      const response = await organizationService.createOrganization(data);
      // Refresh organizations list to include the new one
      await fetchOrganizations();
      // Auto-select the newly created organization
      const newOrg = response.organization || response;
      if (newOrg && newOrg.id) {
        const fullOrg = organizations.find(o => o.id === newOrg.id) || newOrg;
        selectOrganization(fullOrg);
      }
      return response;
    } catch (error) {
      console.error('Failed to create organization:', error);
      throw error;
    }
  };

  const value = {
    organizations,
    selectedOrganization,
    selectOrganization,
    createOrganization,
    refreshOrganizations: fetchOrganizations,
    loading,
    error,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

