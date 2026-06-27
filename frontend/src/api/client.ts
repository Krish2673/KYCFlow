import { API_BASE, TOKEN_KEY } from '../lib/constants';
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

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
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

export async function apiRequestWithMeta<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; meta?: ApiResponse<T>['meta'] }> {
  const token = getToken();
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
