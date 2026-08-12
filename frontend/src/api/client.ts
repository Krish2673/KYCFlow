import {
  clearSession,
  getStoredToken,
  refreshAccessToken,
} from './auth';
import { API_BASE } from '../lib/constants';
import type { ApiResponse } from '../types';

export class ApiError extends Error {
  status: number;
  errors?: unknown[];

  constructor(message: string, status: number, errors?: unknown[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

function redirectToLogin() {
  clearSession();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiResponse<T> & { user?: T };

  if (!response.ok || body.success === false) {
    throw new ApiError(
      body.message ?? 'Request failed',
      response.status,
      body.errors,
    );
  }

  if (body.data !== undefined) return body.data;
  if (body.user !== undefined) return body.user;
  return body as unknown as T;
}

async function fetchWithAuth(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !retried && path !== '/api/v1/auth/refresh') {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return fetchWithAuth(path, options, true);
    }
    redirectToLogin();
    throw new ApiError('Session expired. Please sign in again.', 401);
  }

  return response;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(path, options);
  return parseResponse<T>(response);
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; meta?: ApiResponse<T>['meta'] }> {
  const response = await fetchWithAuth(path, options);
  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || body.success === false) {
    throw new ApiError(
      body.message ?? 'Request failed',
      response.status,
      body.errors,
    );
  }

  return { data: body.data as T, meta: body.meta };
}
