import { apiRequest } from './client';
import { TOKEN_KEY, USER_KEY } from '../lib/constants';
import type { AuthUser, LoginResponse } from '../types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? 'Login failed');
  }

  const { token, user } = body.data as LoginResponse;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token, user };
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function fetchCurrentUser() {
  return apiRequest<{ userId: string; tenantId: string; role: string }>('/me');
}
