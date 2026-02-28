import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { createLogger } from '../utils/logger';
import * as tokenStorage from '../services/secureTokenStorage';
import * as api from '../services/api';

const log = createLogger('Auth');

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  emirate?: string;
  discount?: number;
  role?: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, extra?: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogleToken: (idToken: string) => Promise<{ success: boolean; error?: string }>;
  loginWithAppleToken: (payload: { identityToken: string; fullName?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  loginWithEmail: async () => ({ success: false }),
  register: async () => ({ success: false }),
  loginWithGoogleToken: async () => ({ success: false }),
  loginWithAppleToken: async () => ({ success: false }),
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await tokenStorage.getToken();
        const savedUser = await tokenStorage.getUserData();
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          log.debug('Session restored');
          // Validate token in background
          const profile = await api.fetchUserProfile(savedToken);
          if (profile) {
            setUser(profile);
            await tokenStorage.saveUserData(profile);
          } else {
            log.warn('Token invalid, clearing session');
            await tokenStorage.clearAll();
            setToken(null);
            setUser(null);
          }
        }
      } catch (e: any) {
        log.error('Session restore failed', e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAuthSuccess = useCallback(async (result: { user: any; token: string }) => {
    setUser(result.user);
    setToken(result.token);
    await tokenStorage.saveToken(result.token);
    await tokenStorage.saveUserData(result.user);
    log.info('Authenticated', { userId: result.user?.id });
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const result = await api.loginWithEmail(email, password);
      if (result.success && result.token) {
        await handleAuthSuccess(result as any);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Login failed' };
    }
  }, [handleAuthSuccess]);

  const register = useCallback(async (
    name: string, email: string, password: string,
    extra?: Record<string, string>,
  ) => {
    try {
      const result = await api.registerUser(name, email, password, extra);
      if (result.success && result.token) {
        await handleAuthSuccess(result as any);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Registration failed' };
    }
  }, [handleAuthSuccess]);

  const loginWithGoogleToken = useCallback(async (idToken: string) => {
    try {
      const result = await api.loginWithGoogle(idToken);
      if (result.success && result.token) {
        await handleAuthSuccess(result as any);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Google login failed' };
    }
  }, [handleAuthSuccess]);

  const loginWithAppleToken = useCallback(async (payload: { identityToken: string; fullName?: string }) => {
    try {
      const result = await api.loginWithApple(payload);
      if (result.success && result.token) {
        await handleAuthSuccess(result as any);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Apple login failed' };
    }
  }, [handleAuthSuccess]);

  const logout = useCallback(async () => {
    await tokenStorage.clearAll();
    setUser(null);
    setToken(null);
    log.info('Logged out');
    router.replace('/auth/login');
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const profile = await api.fetchUserProfile(token);
    if (profile) {
      setUser(profile);
      await tokenStorage.saveUserData(profile);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      loginWithEmail, register, loginWithGoogleToken, loginWithAppleToken,
      logout, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
