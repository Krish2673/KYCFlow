import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  getStoredToken,
  getStoredUser,
  login as apiLogin,
  logout as apiLogout,
  verifyOtp as apiVerifyOtp,
} from '../api/auth';
import type { AuthUser, UserRole } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (user: AuthUser, token: string) => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      login: async (email, password) => {
        const result = await apiLogin(email, password);
        setUser(result.user);
        setToken(result.accessToken);
      },
      loginWithOtp: async (email, otp) => {
        const result = await apiVerifyOtp(email, otp);
        setUser(result.user);
        setToken(result.accessToken);
      },
      logout: async () => {
        await apiLogout();
        setUser(null);
        setToken(null);
      },
      setSession: (nextUser, nextToken) => {
        setUser(nextUser);
        setToken(nextToken);
      },
      hasRole: (...roles) => !!user && roles.includes(user.role),
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
