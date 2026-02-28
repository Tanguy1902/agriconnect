import api from './api';

export interface StatNotification {
  id: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface FarmerStats {
  active_offers_count: number;
  active_orders_count: number;
  monthly_revenue: number;
  unread_messages_count: number;
  recent_activity: StatNotification[];
}

export interface CollectorStats {
  active_demands_count: number;
  new_offers_count: number;
  monthly_expenses: number;
  unread_messages_count: number;
  recent_activity: StatNotification[];
}

export const statisticsService = {
  async getFarmerStats(): Promise<FarmerStats> {
    const response = await api.get<FarmerStats>('/statistics/farmer');
    return response.data;
  },

  async getCollectorStats(): Promise<CollectorStats> {
    const response = await api.get<CollectorStats>('/statistics/collector');
    return response.data;
  },
};
