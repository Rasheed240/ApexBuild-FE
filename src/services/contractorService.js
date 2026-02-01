import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

export const contractorService = {
  // List all contractors for a project
  getByProject: async (projectId) => {
    const response = await api.get(`/contractors/project/${projectId}`);
    return unwrap(response);
  },

  // Get a single contractor with full details (members, tasks)
  getById: async (contractorId) => {
    const response = await api.get(`/contractors/${contractorId}`);
    return unwrap(response);
  },

  // Create a new contractor on a project
  create: async (data) => {
    const response = await api.post('/contractors', data);
    return unwrap(response);
  },

  // Update contractor details
  update: async (contractorId, data) => {
    const response = await api.put(`/contractors/${contractorId}`, data);
    return unwrap(response);
  },

  // Soft-delete a contractor
  delete: async (contractorId) => {
    const response = await api.delete(`/contractors/${contractorId}`);
    return unwrap(response);
  },
};

export const CONTRACTOR_STATUS_LABELS = {
  Active: 'Active',
  OnHold: 'On Hold',
  Completed: 'Completed',
  Terminated: 'Terminated',
  Suspended: 'Suspended',
  PendingStart: 'Pending Start',
};

export const CONTRACTOR_STATUS_COLORS = {
  Active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  OnHold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  Completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  Terminated: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  Suspended: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  PendingStart: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
};
