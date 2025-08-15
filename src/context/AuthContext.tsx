import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'technician' | 'client';
  avatar?: string;
  phone?: string;
  isActive?: boolean;
  address?: string;
  city?: string;
  postalCode?: string;
  departement?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on app load
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    console.log('AuthContext useEffect: Checking for stored data');
    console.log('  Token:', token ? '[PRESENT]' : '[MISSING]');
    console.log('  User Data:', userData ? '[PRESENT]' : '[MISSING]');

    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        console.log('  Parsed User Data:', parsedUserData);
        setUser(parsedUserData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { accessToken, user: userData } = response.data.data;

      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};