import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

export const departmentService = {
  // List departments for a project
  getByProject: async (projectId) => {
    const response = await api.get(`/departments/project/${projectId}`);
    return unwrap(response);
  },

  // Create a new department
  create: async (data) => {
    const response = await api.post('/departments', data);
    return unwrap(response);
  },
};

export const DEPARTMENT_STATUS_LABELS = {
  Active: 'Active',
  OnHold: 'On Hold',
  Completed: 'Completed',
  Archived: 'Archived',
};

export const DEPARTMENT_STATUS_COLORS = {
  Active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  OnHold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  Completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  Archived: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
};
