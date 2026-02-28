import api from './api';

export interface Offer {
  id: number;
  farmer_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  description?: string;
  image_url?: string;
  location_region?: string;
  location_commune?: string;
  status: 'active' | 'sold' | 'cancelled';
  created_at: string;
}

export interface CreateOfferData {
  product_id: number;
  quantity: number;
  unit_price: number;
  quality?: string;
  description?: string;
  location_region?: string;
  location_commune?: string;
  image?: any; // For File/Blob
}

export const offersService = {
  async getOffers(params?: any): Promise<Offer[]> {
    const response = await api.get<Offer[]>('/offers', { params });
    return response.data;
  },

  async getMyOffers(): Promise<Offer[]> {
    const response = await api.get<Offer[]>('/offers/me');
    return response.data;
  },

  async getOfferById(id: number): Promise<Offer> {
    const response = await api.get<Offer>(`/offers/${id}`);
    return response.data;
  },

  async createOffer(data: CreateOfferData): Promise<Offer> {
    const formData = new FormData();
    formData.append('product_id', data.product_id.toString());
    formData.append('quantity', data.quantity.toString());
    formData.append('unit_price', data.unit_price.toString());
    if (data.quality) formData.append('quality', data.quality);
    if (data.description) formData.append('description', data.description);
    if (data.location_region) formData.append('location_region', data.location_region);
    if (data.location_commune) formData.append('location_commune', data.location_commune);
    
    if (data.image) {
      // In React Native with Expo, you'd typically pass an object with uri, name, and type
      formData.append('image', data.image);
    }

    const response = await api.post<Offer>('/offers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateOffer(id: number, data: Partial<CreateOfferData>): Promise<Offer> {
    const formData = new FormData();
    if (data.quantity !== undefined) formData.append('quantity', data.quantity.toString());
    if (data.unit_price !== undefined) formData.append('unit_price', data.unit_price.toString());
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.location_region !== undefined) formData.append('location_region', data.location_region || '');
    if (data.location_commune !== undefined) formData.append('location_commune', data.location_commune || '');
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await api.put<Offer>(`/offers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteOffer(id: number): Promise<void> {
    await api.delete(`/offers/${id}`);
  },
};
