import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';
import { User, AuthResponse } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string) => Promise<User>;
  loginFederated: (fullName: string, email: string, provider: 'google' | 'apple', providerId: string) => Promise<User>;
  logout: () => void;
  updateLocalUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStoredAuth() {
      const storedToken = localStorage.getItem('dermscan_token');
      const storedUser = localStorage.getItem('dermscan_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // silent fail
          }
        }

        try {
          // Verify token reliability against live database
          const response = await api.get<User>('/auth/me');
          setUser(response.data);
          localStorage.setItem('dermscan_user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Initial token authentication failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    }
    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { access_token, user: loggedUser } = response.data;
      
      localStorage.setItem('dermscan_token', access_token);
      localStorage.setItem('dermscan_user', JSON.stringify(loggedUser));
      
      setToken(access_token);
      setUser(loggedUser);
      setIsLoading(false);
      return loggedUser;
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.response?.data?.error || 'Login attempt failed.');
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        full_name: fullName,
        email,
        password
      });
      const { access_token, user: registeredUser } = response.data;

      localStorage.setItem('dermscan_token', access_token);
      localStorage.setItem('dermscan_user', JSON.stringify(registeredUser));

      setToken(access_token);
      setUser(registeredUser);
      setIsLoading(false);
      return registeredUser;
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.response?.data?.error || 'Registration failed.');
    }
  };

  const loginFederated = async (fullName: string, email: string, provider: 'google' | 'apple', providerId: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/federated', {
        full_name: fullName,
        email,
        provider,
        provider_id: providerId
      });
      const { access_token, user: loggedUser } = response.data;

      localStorage.setItem('dermscan_token', access_token);
      localStorage.setItem('dermscan_user', JSON.stringify(loggedUser));

      setToken(access_token);
      setUser(loggedUser);
      setIsLoading(false);
      return loggedUser;
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.response?.data?.error || `${provider === 'google' ? 'Google' : 'Apple'} login failed.`);
    }
  };

  const logout = () => {
    localStorage.removeItem('dermscan_token');
    localStorage.removeItem('dermscan_user');
    setToken(null);
    setUser(null);
  };

  const updateLocalUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('dermscan_user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        loginFederated,
        logout,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be invoked within an AuthProvider');
  }
  return context;
}
