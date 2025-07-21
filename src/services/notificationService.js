import api from './api';

const unwrap = (response) => response.data?.data ?? response.data;

export const notificationService = {
  list: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return unwrap(response);
  },

  getUnread: async () => {
    const response = await api.get('/notifications/unread');
    return unwrap(response);
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread/count');
    return unwrap(response);
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return unwrap(response);
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return unwrap(response);
  },

  delete: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return unwrap(response);
  },
};

