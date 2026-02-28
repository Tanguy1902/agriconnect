"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

export interface User {
  id: number;
  email: string;
  full_name: string;
  user_type: 'agriculteur' | 'collecteur' | 'admin';
  region?: string;
  commune?: string;
  profile_picture?: string;
  latitude?: number;
  longitude?: number;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token) {
        try {
          // Restaurer immédiatement si on a les données en local
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          
          // Vérifier/Synchroniser avec le backend
          const response = await import('@/lib/api').then(m => m.default.get('/users/me'));
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error: unknown) {
          const err = error as { response?: { status: number } };
          console.error("Failed to sync user profile", error);
          // Si c'est une erreur d'auth (401), on nettoie
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.push(
      userData.user_type === 'agriculteur' 
        ? '/dashboard/agriculteur' 
        : userData.user_type === 'admin'
        ? '/dashboard/admin'
        : '/dashboard/collecteur'
    );
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
