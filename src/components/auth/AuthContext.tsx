// src/components/auth/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../../io/api';
import { User, ApiResponse, AuthResponseData } from '../../types/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ApiResponse<AuthResponseData>>;
  register: (email: string, password: string) => Promise<ApiResponse<AuthResponseData>>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize state lazily to avoid side effects in useEffect
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading] = useState<boolean>(false); 

  const handleAuthResponse = (response: ApiResponse<AuthResponseData>) => {
    if (response.success && response.data?.token && response.data?.user) {
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return response;
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    return handleAuthResponse(response);
  };

  const register = async (email: string, password: string) => {
    const response = await api.register(email, password);
    return handleAuthResponse(response);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};