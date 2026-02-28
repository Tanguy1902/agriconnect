import api from './api';

export interface Match {
  id: number;
  match_score: number;
  matching_reason: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  offer?: any;
  demand?: any;
}

export const matchesService = {
  async getMatches(): Promise<Match[]> {
    const response = await api.get<Match[]>('/matches');
    return response.data;
  },

  async acceptMatch(id: number): Promise<void> {
    await api.post(`/matches/${id}/accept`);
  },

  async rejectMatch(id: number): Promise<void> {
    await api.post(`/matches/${id}/reject`);
  },
};
