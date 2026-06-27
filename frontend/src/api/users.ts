import { apiRequest } from './client';
import type { CreateUserInput, User } from '../types';

export function getUsers() {
  return apiRequest<User[]>('/api/v1/users');
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

export function getReviewers(tenantId: string) {
  return getUsers().then((users) =>
    users.filter((u) => u.role === 'REVIEWER' && u.tenantId === tenantId),
  );
}
