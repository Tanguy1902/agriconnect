import api from './api';

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const notificationsService = {
  getNotifications: async (params?: { skip?: number, limit?: number, is_read?: boolean }) => {
    const response = await api.get<Notification[]>('/notifications/', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },

  markAsRead: async (id: number) => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },
};
