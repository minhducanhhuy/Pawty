import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storage from '../utils/storage';
import { User } from '../types';
import { api } from '../api/endpoints';
import { setClientToken } from '../api/client';

const AUTH_TOKEN_KEY = '@pawty_token';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (done: boolean) => void;
  loginWithOtp: (phone: string, otpCode: string, referralCode?: string) => Promise<void>;
  loginWithSocial: (provider: 'google' | 'apple', phone: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser(me);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await storage.getItem(AUTH_TOKEN_KEY);
        const initialToken = storedToken || 'mock_jwt_token_pawty_01';
        setToken(initialToken);
        setClientToken(initialToken);
        const me = await api.getMe();
        setUser(me);
      } catch (err) {
        console.error('Auth bootstrap error:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginWithOtp = useCallback(async (phone: string, otpCode: string, referralCode?: string) => {
    const res = await api.verifyOtp(phone, otpCode, referralCode);
    setToken(res.token);
    setClientToken(res.token);
    setUser(res.user);
    await storage.setItem(AUTH_TOKEN_KEY, res.token);
  }, []);

  const loginWithSocial = useCallback(async (provider: 'google' | 'apple', phone: string) => {
    const res = await api.socialLogin(provider, phone);
    setToken(res.token);
    setClientToken(res.token);
    setUser(res.user);
    await storage.setItem(AUTH_TOKEN_KEY, res.token);
  }, []);

  const updateUser = useCallback(async (patch: Partial<User>) => {
    const updated = await api.updateMe(patch);
    setUser(updated);
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setHasCompletedOnboarding(false);
    setClientToken(null);
    await storage.removeItem(AUTH_TOKEN_KEY);
  }, []);

  const deleteAccount = useCallback(async () => {
    const res = await api.deleteMe();
    await logout();
    return res.scheduledHardDeleteAt;
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isLoading,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        loginWithOtp,
        loginWithSocial,
        refreshUser,
        updateUser,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
