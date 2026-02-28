import api from './api';

export interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  description?: string;
  image_url?: string;
  offer_count?: number;
}

export interface CreateProductData {
  name: string;
  category: string;
  unit: string;
  description?: string;
}

export const productsService = {
  async getProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  async getProductById(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },
};
