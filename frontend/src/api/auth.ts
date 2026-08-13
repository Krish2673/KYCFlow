import {
  API_BASE,
  REFRESH_TOKEN_KEY,
  TOKEN_KEY,
  USER_KEY,
} from '../lib/constants';
import type { AuthUser, InvitationDetails, LoginResponse, RegisterApplicantInput, RegisterOrganizationInput } from '../types';

function storeSession(data: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function parseAuthResponse(response: Response): Promise<LoginResponse> {
  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? 'Authentication failed');
  }

  const { accessToken, refreshToken, user } = body.data as LoginResponse;

  if (!accessToken || !refreshToken || !user) {
    throw new Error('Invalid authentication response from server');
  }

  storeSession({ accessToken, refreshToken, user });
  return { accessToken, refreshToken, user };
}

export async function registerApplicant(data: RegisterApplicantInput) {
  const response = await fetch(`${API_BASE}/api/v1/auth/register/applicant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message ?? 'Registration failed');
  }
  return body.message as string;
}

export async function registerOrganization(data: RegisterOrganizationInput) {
  const response = await fetch(`${API_BASE}/api/v1/auth/register/organization`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message ?? 'Registration failed');
  }
  return body.message as string;
}

export async function getInvitation(token: string) {
  const response = await fetch(`${API_BASE}/api/v1/auth/invite/${token}`);
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message ?? 'Invalid invitation');
  }
  return body.data as InvitationDetails;
}

export async function acceptInvitation(token: string, password: string, name?: string) {
  const response = await fetch(`${API_BASE}/api/v1/auth/invite/${token}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, name }),
  });

  return parseAuthResponse(response);
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return parseAuthResponse(response);
}

export async function requestOtp(email: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/v1/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? 'Failed to send OTP');
  }
}

export async function verifyOtp(email: string, otp: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  return parseAuthResponse(response);
}

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        const body = await response.json();

        if (!response.ok || !body.success || !body.data?.accessToken) {
          return null;
        }

        localStorage.setItem(TOKEN_KEY, body.data.accessToken);
        return body.data.accessToken as string;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function logout(): Promise<void> {
  const token = getStoredToken();

  try {
    if (token) {
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // Best-effort server logout; always clear local session.
  } finally {
    clearSession();
  }
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
  const response = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${getStoredToken() ?? ''}`,
    },
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? 'Failed to fetch user');
  }

  return body.user as { userId: string; tenantId: string; role: string };
}
