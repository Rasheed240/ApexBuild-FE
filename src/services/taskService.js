import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

export const taskService = {
  // Get my tasks filtered by organization
  getMyTasks: async (params = {}) => {
    const response = await api.get('/tasks/my-tasks', { params });
    return unwrap(response);
  },

  // Get task by ID (includes subtasks, updates, comments)
  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return unwrap(response);
  },

  // Get tasks for a project
  getProjectTasks: async (projectId, params = {}) => {
    const response = await api.get(`/projects/${projectId}/tasks`, { params });
    return unwrap(response);
  },

  // Create task
  createTask: async (data) => {
    const response = await api.post('/tasks', data);
    return unwrap(response);
  },

  // Update task
  updateTask: async (taskId, data) => {
    const response = await api.put(`/tasks/${taskId}`, data);
    return unwrap(response);
  },

  // Delete task
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return unwrap(response);
  },

  // Submit a progress update/report on a task (FieldWorker)
  submitTaskUpdate: async (taskId, data) => {
    const response = await api.post(`/tasks/${taskId}/updates`, data);
    return unwrap(response);
  },

  // ─── REVIEW CHAIN ─────────────────────────────────────────────────────────

  // Step 1 (contracted tasks only): ContractorAdmin approves/rejects
  reviewByContractorAdmin: async (updateId, approved, feedback) => {
    const response = await api.post(`/tasks/updates/${updateId}/approve-contractor-admin`, {
      approved,
      feedback,
    });
    return unwrap(response);
  },

  // Step 2: DepartmentSupervisor approves/rejects
  reviewBySupervisor: async (updateId, approved, feedback) => {
    const response = await api.post(`/tasks/updates/${updateId}/approve-supervisor`, {
      approved,
      feedback,
    });
    return unwrap(response);
  },

  // Step 3: ProjectAdmin final approval
  reviewByAdmin: async (updateId, approved, feedback) => {
    const response = await api.post(`/tasks/updates/${updateId}/approve-admin`, {
      approved,
      feedback,
    });
    return unwrap(response);
  },

  // Mark task as complete (ProjectAdmin/ProjectOwner only)
  markTaskComplete: async (taskId) => {
    const response = await api.post(`/tasks/${taskId}/complete`);
    return unwrap(response);
  },

  // Get pending task updates for review (scoped to current user's role; backend role-filters)
  getPendingUpdates: async (params = {}) => {
    const response = await api.get('/tasks/pending-updates', { params });
    return unwrap(response);
  },

  // Get all updates submitted by the current user across tasks
  getMySubmittedUpdates: async (params = {}) => {
    const response = await api.get('/tasks/pending-updates', { params });
    return unwrap(response);
  },

  // Get all updates for a specific task
  getTaskUpdates: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/updates`);
    return unwrap(response);
  },

  // Get subtasks for a parent task
  getSubtasks: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/subtasks`);
    return unwrap(response);
  },

  // Get task comments
  getTaskComments: async (taskId, params = {}) => {
    const response = await api.get(`/tasks/${taskId}/comments`, { params });
    return unwrap(response);
  },

  // Add task comment
  addTaskComment: async (taskId, comment) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { comment });
    return unwrap(response);
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
