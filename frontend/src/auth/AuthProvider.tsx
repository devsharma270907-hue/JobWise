import React, { createContext, useContext, useEffect, useState } from 'react';
import { client } from '../lib/api/client';
import { refreshClient } from '../lib/api/refreshClient';
import { tokenStore } from './tokenStore';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'switcher' | 'freelancer' | 'admin';
  targetRoles: string[];
  targetLocations: string[];
  preferredComp?: string;
  skills: string[];
  aiUsage?: {
    monthlyTokensUsed: number;
    monthlyBudget: number;
    budgetResetAt: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await client.get('/users/me');
      setUser(res.data.data);
    } catch {
      setUser(null);
    }
  };

  // On mount, perform silent refresh to rehydrate access token if session cookie exists
  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      try {
        const { data } = await refreshClient.post('/auth/refresh');
        if (isMounted && data.data?.accessToken) {
          tokenStore.set(data.data.accessToken);
          await fetchCurrentUser();
        }
      } catch {
        if (isMounted) {
          tokenStore.clear();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await client.post('/auth/login', { email, password });
    const { accessToken, user: userData } = res.data.data;
    tokenStore.set(accessToken);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string, role = 'student') => {
    const res = await client.post('/auth/register', { name, email, password, role });
    const { accessToken, user: userData } = res.data.data;
    tokenStore.set(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch {
      // Continue cleanup regardless
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
