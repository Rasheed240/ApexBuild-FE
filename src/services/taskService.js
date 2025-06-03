import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

export const taskService = {
  // Get my tasks filtered by organization
  getMyTasks: async (params = {}) => {
    const response = await api.get('/tasks/my-tasks', { params });
    return unwrap(response);
  },

  // Get task by ID
  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
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

  // Mark task as done (assignee)
  markTaskDone: async (taskId, notes) => {
    const response = await api.post(`/tasks/${taskId}/done`, { notes });
    return unwrap(response);
  },

  // Submit task update/report
  submitTaskUpdate: async (taskId, data) => {
    const response = await api.post(`/tasks/${taskId}/updates`, data);
    return unwrap(response);
  },

  // Approve/reject task update by supervisor
  reviewBySupervisor: async (updateId, approved, feedback) => {
    const response = await api.post(`/tasks/updates/${updateId}/approve-supervisor`, {
      approved,
      feedback,
    });
    return unwrap(response);
  },

  // Approve/reject task update by admin
  reviewByAdmin: async (updateId, approved, feedback) => {
    const response = await api.post(`/tasks/updates/${updateId}/approve-admin`, {
      approved,
      feedback,
    });
    return unwrap(response);
  },

  // Mark task as complete (admin only)
  markTaskComplete: async (taskId) => {
    const response = await api.post(`/tasks/${taskId}/complete`);
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

  // Get pending task updates for review
  getPendingUpdates: async (params = {}) => {
    const response = await api.get('/tasks/pending-updates', { params });
    return unwrap(response);
  },
};
