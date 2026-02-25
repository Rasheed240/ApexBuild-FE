import api from './api';
import cachedApi from './cachedApi';

// TTL constants
const TTL_5M = 5 * 60 * 1000;   // task lists — updated frequently
const TTL_2M = 2 * 60 * 1000;   // "my tasks" — primary work surface

const unwrap = (data) => data?.data ?? data;

export const taskService = {
  // Get my tasks filtered by organization (cached 2 min — primary work surface)
  getMyTasks: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const data = await cachedApi.get('/tasks/my-tasks', params, {
      cacheKey: `tasks:my:${qs}`,
      ttlMs: TTL_2M,
    });
    return unwrap(data);
  },

  // Get task by ID (not cached — detail view, always fetch fresh)
  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return unwrap(response.data);
  },

  // Get tasks for a project (cached 5 min)
  getProjectTasks: async (projectId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const data = await cachedApi.get(`/projects/${projectId}/tasks`, params, {
      cacheKey: `tasks:project:${projectId}:${qs}`,
      ttlMs: TTL_5M,
    });
    return unwrap(data);
  },

  // ── Mutations ─────────────────────────────────────────────────────────────

  createTask: async (data) => {
    const result = await cachedApi.post('/tasks', data, {
      invalidatePrefixes: ['tasks:project:', 'tasks:my:'],
    });
    return unwrap(result);
  },

  updateTask: async (taskId, data) => {
    const result = await cachedApi.put(`/tasks/${taskId}`, data, {
      invalidatePrefixes: ['tasks:project:', 'tasks:my:'],
    });
    return unwrap(result);
  },

  deleteTask: async (taskId) => {
    const result = await cachedApi.delete(`/tasks/${taskId}`, {
      invalidatePrefixes: ['tasks:project:', 'tasks:my:'],
    });
    return unwrap(result);
  },

  // ── Task Updates / Review Chain ───────────────────────────────────────────

  submitTaskUpdate: async (taskId, data) => {
    const response = await api.post(`/tasks/${taskId}/updates`, data);
    return unwrap(response.data);
  },

  reviewByContractorAdmin: async (updateId, approved, feedback) => {
    const response = await api.post(`/tasks/updates/${updateId}/approve-contractor-admin`, { approved, feedback });
    return unwrap(response.data);
  },

  reviewBySupervisor: async (updateId, approved, feedback) => {
    const response = await api.post(`/tasks/updates/${updateId}/approve-supervisor`, { approved, feedback });
    return unwrap(response.data);
  },

  reviewByAdmin: async (updateId, approved, feedback) => {
    const response = await api.post(`/tasks/updates/${updateId}/approve-admin`, { approved, feedback });
    return unwrap(response.data);
  },

  markTaskComplete: async (taskId) => {
    const result = await cachedApi.post(`/tasks/${taskId}/complete`, {}, {
      invalidatePrefixes: ['tasks:project:', 'tasks:my:'],
    });
    return unwrap(result);
  },

  // Pending updates — not cached (dynamic review queue)
  getPendingUpdates: async (params = {}) => {
    const response = await api.get('/tasks/pending-updates', { params });
    return unwrap(response.data);
  },

  getMySubmittedUpdates: async (params = {}) => {
    const response = await api.get('/tasks/pending-updates', { params });
    return unwrap(response.data);
  },

  getTaskUpdates: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/updates`);
    return unwrap(response.data);
  },

  getSubtasks: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/subtasks`);
    return unwrap(response.data);
  },

  getTaskComments: async (taskId, params = {}) => {
    const response = await api.get(`/tasks/${taskId}/comments`, { params });
    return unwrap(response.data);
  },

  addTaskComment: async (taskId, comment) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { comment });
    return unwrap(response.data);
  },
};

// Update status labels and values matching the backend UpdateStatus enum
export const UPDATE_STATUS = {
  Submitted: 1,
  UnderContractorAdminReview: 2,
  ContractorAdminApproved: 3,
  ContractorAdminRejected: 4,
  UnderSupervisorReview: 5,
  SupervisorApproved: 6,
  SupervisorRejected: 7,
  UnderAdminReview: 8,
  AdminApproved: 9,
  AdminRejected: 10,
};

export const UPDATE_STATUS_LABELS = {
  1: 'Submitted',
  2: 'Under Contractor Admin Review',
  3: 'Contractor Admin Approved',
  4: 'Contractor Admin Rejected',
  5: 'Under Supervisor Review',
  6: 'Supervisor Approved',
  7: 'Supervisor Rejected',
  8: 'Under Admin Review',
  9: 'Admin Approved',
  10: 'Admin Rejected',
};

export const TASK_STATUS_LABELS = {
  NotStarted: 'Not Started',
  InProgress: 'In Progress',
  OnHold: 'On Hold',
  UnderReview: 'Under Review',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};
