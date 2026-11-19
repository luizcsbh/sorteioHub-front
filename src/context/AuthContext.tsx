import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface Address {
  id?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'PARTICIPANT';
  avatarUrl?: string | null;
  phone?: string | null;
  cpfMasked?: string | null;
  isCpfValidated: boolean;
  address?: Address | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsProfileCompletion: boolean;
  loginWithGoogle: (credential?: string, mockProfile?: any) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  completeProfile: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sorteiohub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('sorteiohub_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('sorteiohub_user', JSON.stringify(res.data));
          setNeedsProfileCompletion(!res.data.isCpfValidated || !res.data.address);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const loginWithGoogle = async (credential?: string, mockProfile?: any) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/google', { credential, mockProfile });
      const { token: newToken, user: newUser, needsProfileCompletion: needsCompletion } = res.data;

      localStorage.setItem('sorteiohub_token', newToken);
      localStorage.setItem('sorteiohub_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setNeedsProfileCompletion(needsCompletion);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser, needsProfileCompletion: needsCompletion } = res.data;

      localStorage.setItem('sorteiohub_token', newToken);
      localStorage.setItem('sorteiohub_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setNeedsProfileCompletion(needsCompletion ?? false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token: newToken, user: newUser, needsProfileCompletion: needsCompletion } = res.data;

      localStorage.setItem('sorteiohub_token', newToken);
      localStorage.setItem('sorteiohub_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setNeedsProfileCompletion(needsCompletion ?? false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/complete-profile', data);
      const { token: newToken, user: updatedUser } = res.data;

      localStorage.setItem('sorteiohub_token', newToken);
      localStorage.setItem('sorteiohub_user', JSON.stringify(updatedUser));
      setToken(newToken);
      setUser(updatedUser);
      setNeedsProfileCompletion(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sorteiohub_token');
    localStorage.removeItem('sorteiohub_user');
    setToken(null);
    setUser(null);
    setNeedsProfileCompletion(false);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('sorteiohub_user', JSON.stringify(res.data));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        needsProfileCompletion,
        loginWithGoogle,
        loginWithEmail,
        register,
        completeProfile,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
