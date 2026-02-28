export const Colors = {
  primary: '#059669', // Emerald 600
  primaryForeground: '#ffffff',
  secondary: '#78350f', // Amber 900
  secondaryForeground: '#ffffff',
  accent: '#f59e0b', // Amber 500
  accentForeground: '#ffffff',
  
  // Grayscale
  background: '#f8fafc',
  foreground: '#1e293b',
  
  // Dark mode
  dark: {
    background: '#0f172a',
    foreground: '#e2e8f0',
  },
  
  // Status colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.50:8000';
