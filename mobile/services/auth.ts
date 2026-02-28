import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  username: string; // email
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  user_type: 'agriculteur' | 'collecteur';
  region?: string;
  commune?: string;
  experience_years?: number;
  crop_types?: string[];
  intervention_zones?: string[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  user_type: 'agriculteur' | 'collecteur' | 'admin';
  profile_picture?: string;
  location_region?: string;
  location_commune?: string;
  latitude?: number;
  longitude?: number;
  experience_years?: number;
  farm_description?: string;
  crop_types?: string;
  intervention_zones?: string;
  collection_capacity?: string;
  created_at: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Store token
    await AsyncStorage.setItem('access_token', response.data.access_token);

    return response.data;
  },

  async register(data: RegisterData): Promise<User> {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    // Store user data
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/users/me', data);
    // Refresh stored user
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user');
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('access_token');
  },

  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
