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
  hasPassword?: boolean;
  address?: Address | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsProfileCompletion: boolean;
  /** true quando o login Google vinculou uma conta existente pelo e-mail */
  linkedByEmail: boolean;
  loginWithGoogle: (credential?: string, mockProfile?: any) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string,
    extraData?: { cpf?: string; phone?: string; accountType?: 'PARTICIPANT' | 'ADMINISTRATOR' }
  ) => Promise<any>;
  completeProfile: (data: any) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  changePassword: (data: { currentPassword?: string; newPassword: string; confirmPassword?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sorteioclub_user') || localStorage.getItem('sorteiohub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('sorteioclub_token') || localStorage.getItem('sorteiohub_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState<boolean>(false);
  const [linkedByEmail, setLinkedByEmail] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('sorteioclub_user', JSON.stringify(res.data));
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
      const { token: newToken, user: newUser, needsProfileCompletion: needsCompletion, linkedByEmail: linked } = res.data;

      localStorage.setItem('sorteioclub_token', newToken);
      localStorage.setItem('sorteioclub_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setNeedsProfileCompletion(needsCompletion);
      setLinkedByEmail(!!linked);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser, needsProfileCompletion: needsCompletion } = res.data;

      localStorage.setItem('sorteioclub_token', newToken);
      localStorage.setItem('sorteioclub_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setNeedsProfileCompletion(needsCompletion ?? false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string,
    extraData?: { cpf?: string; phone?: string; accountType?: 'PARTICIPANT' | 'ADMINISTRATOR' }
  ) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword: confirmPassword || password,
        cpf: extraData?.cpf,
        phone: extraData?.phone,
        accountType: extraData?.accountType,
      });
      const { token: newToken, user: newUser, needsProfileCompletion: needsCompletion } = res.data;

      localStorage.setItem('sorteioclub_token', newToken);
      localStorage.setItem('sorteioclub_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setNeedsProfileCompletion(needsCompletion ?? false);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/complete-profile', data);
      const { token: newToken, user: updatedUser } = res.data;

      localStorage.setItem('sorteioclub_token', newToken);
      localStorage.setItem('sorteioclub_user', JSON.stringify(updatedUser));
      setToken(newToken);
      setUser(updatedUser);
      setNeedsProfileCompletion(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.put('/auth/profile', data);
      setUser(res.data);
      localStorage.setItem('sorteioclub_user', JSON.stringify(res.data));
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: { currentPassword?: string; newPassword: string; confirmPassword?: string }) => {
    setIsLoading(true);
    try {
      await api.put('/auth/change-password', data);
      if (user) {
        const updated = { ...user, hasPassword: true };
        setUser(updated);
        localStorage.setItem('sorteioclub_user', JSON.stringify(updated));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sorteioclub_token');
    localStorage.removeItem('sorteioclub_user');
    localStorage.removeItem('sorteiohub_token');
    localStorage.removeItem('sorteiohub_user');
    setToken(null);
    setUser(null);
    setNeedsProfileCompletion(false);
    setLinkedByEmail(false);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('sorteioclub_user', JSON.stringify(res.data));
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
        linkedByEmail,
        loginWithGoogle,
        loginWithEmail,
        register,
        completeProfile,
        updateProfile,
        changePassword,
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
