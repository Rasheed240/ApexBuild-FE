import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

export const milestoneService = {
  // List milestones for a project (ordered by OrderIndex)
  getByProject: async (projectId) => {
    const response = await api.get(`/milestones/project/${projectId}`);
    return unwrap(response);
  },

  // Create a new milestone
  create: async (data) => {
    const response = await api.post('/milestones', data);
    return unwrap(response);
  },

  // Mark a milestone as complete
  complete: async (milestoneId) => {
    const response = await api.post(`/milestones/${milestoneId}/complete`);
    return unwrap(response);
  },
};

export const MILESTONE_STATUS = {
  Upcoming: 'Upcoming',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Delayed: 'Delayed',
  Cancelled: 'Cancelled',
};

export const MILESTONE_STATUS_LABELS = {
  Upcoming: 'Upcoming',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Delayed: 'Delayed',
  Cancelled: 'Cancelled',
};

export const MILESTONE_STATUS_COLORS = {
  Upcoming: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  InProgress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  Completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  Delayed: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
};
