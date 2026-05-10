import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: any;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refresh_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        await fetchCurrentUser();
      }
      setLoading(false);
    };
    initAuth();
  }, [accessToken]);

  const login: AuthContextType['login'] = async (username, password) => {
    const data = await authApi.login(username, password);
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token || null);
    localStorage.setItem('access_token', data.access_token);
    if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
    }
    await fetchCurrentUser();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch(e) {
      console.error('Logout error', e);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  };

  const refreshAccessToken = async () => {
    try {
      const data = await authApi.refresh();
      if (data.access_token) {
        setAccessToken(data.access_token);
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
          localStorage.setItem('refresh_token', data.refresh_token);
        }
      }
    } catch (error) {
       console.error('Failed to refresh token', error);
       logout();
    }
  };

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, isAuthenticated, loading, login, logout, refreshAccessToken, fetchCurrentUser }}>
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
