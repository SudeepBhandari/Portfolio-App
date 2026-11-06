import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAuth = async () => {
    try {
      const res = await api.adminCheckMe();
      if (res.authenticated && res.admin) {
        setAdmin(res.admin);
        setIsAuthenticated(true);
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch {
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.adminLogin(email, pass);
    setAdmin(res.admin);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.adminLogout();
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, isLoading, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
