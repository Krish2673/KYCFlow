import { apiRequest } from './client';
import type { CreateUserInput, InviteUserInput, User } from '../types';

export function getUsers() {
  return apiRequest<User[]>('/api/v1/users');
}

export function getPendingApplicants() {
  return apiRequest<User[]>('/api/v1/users/pending');
}

export function getUser(id: string) {
  return apiRequest<User>(`/api/v1/users/${id}`);
}

export function createUser(data: CreateUserInput) {
  return apiRequest<User>('/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function inviteUser(data: InviteUserInput) {
  return apiRequest<{ message: string; email: string }>('/api/v1/users/invite', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function approveApplicant(id: string) {
  return apiRequest<{ user: User; application: unknown }>(`/api/v1/users/${id}/approve`, {
    method: 'PATCH',
  });
}

export function rejectApplicant(id: string) {
  return apiRequest<User>(`/api/v1/users/${id}/reject`, {
    method: 'PATCH',
  });
}

export function getReviewers(tenantId: string) {
  return getUsers().then((users) =>
    users.filter((u) => u.role === 'REVIEWER' && u.status === 'ACTIVE' && u.tenantId === tenantId),
  );
}
