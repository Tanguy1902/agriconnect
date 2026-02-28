import api from './api';
import { User } from './auth';

export interface PlatformStats {
  users: {
    total: number;
    farmers: number;
    collectors: number;
  };
  content: {
    offers: number;
    demands: number;
    products: number;
  };
}

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/admin/users');
    return response.data;
  },

  async toggleUserActive(userId: number): Promise<{ status: string; is_active: boolean }> {
    const response = await api.put<{ status: string; is_active: boolean }>(`/admin/users/${userId}/toggle-active`);
    return response.data;
  },

  async getPlatformStats(): Promise<PlatformStats> {
    const response = await api.get<PlatformStats>('/admin/stats');
    return response.data;
  },

  getExportUsersUrl(): string {
    // This will be used for direct downloading or sharing
    return '/admin/export/users';
  },

  getExportStatsUrl(): string {
    return '/admin/export/stats';
  }
};
