import api from './api';

export enum DirectPurchaseStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export interface DirectPurchase {
  id: number;
  offer_id: number;
  collector_id: number;
  quantity: number;
  unit_price: number;
  total_price?: number; // Calculated field or from backend if added later
  status: DirectPurchaseStatus;
  created_at: string;
}

export interface DirectPurchaseCreate {
  offer_id: number;
  quantity: number;
  unit_price: number;
  message?: string;
}

export const directPurchasesService = {
  createPurchase: async (data: DirectPurchaseCreate) => {
    const response = await api.post<DirectPurchase>('/direct-purchases/', data);
    return response.data;
  },

  getReceivedPurchases: async () => {
    const response = await api.get<DirectPurchase[]>('/direct-purchases/received');
    return response.data;
  },

  getSentPurchases: async () => {
    const response = await api.get<DirectPurchase[]>('/direct-purchases/sent');
    return response.data;
  },

  updateStatus: async (id: number, status: DirectPurchaseStatus) => {
    const response = await api.put<DirectPurchase>(`/direct-purchases/${id}/status`, { status });
    return response.data;
  },
};
