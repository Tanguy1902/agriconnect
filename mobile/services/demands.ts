import api from './api';

export interface Demand {
  id: number;
  collector_id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  max_unit_price: number;
  description?: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  created_at: string;
}

export interface CreateDemandData {
  product_id: number;
  product_name?: string;
  quantity: number;
  max_unit_price: number;
  quality_required?: string;
  special_requirements?: string;
}

export const demandsService = {
  async getDemands(params?: any): Promise<Demand[]> {
    const response = await api.get<Demand[]>('/demands', { params });
    return response.data;
  },

  async getMyDemands(): Promise<Demand[]> {
    const response = await api.get<Demand[]>('/demands/me');
    return response.data;
  },

  async getDemandById(id: number): Promise<Demand> {
    const response = await api.get<Demand>(`/demands/${id}`);
    return response.data;
  },

  async createDemand(data: CreateDemandData): Promise<Demand> {
    const response = await api.post<Demand>('/demands', data);
    return response.data;
  },

  async updateDemand(id: number, data: Partial<CreateDemandData>): Promise<Demand> {
    const response = await api.put<Demand>(`/demands/${id}`, data);
    return response.data;
  },

  async deleteDemand(id: number): Promise<void> {
    await api.delete(`/demands/${id}`);
  },
};
