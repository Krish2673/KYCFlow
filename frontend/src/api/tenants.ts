import { apiRequest } from './client';
import type { CreateTenantInput, Tenant } from '../types';

export function getTenants() {
  return apiRequest<Tenant[]>('/api/v1/tenants');
}

export function getTenant(id: string) {
  return apiRequest<Tenant>(`/api/v1/tenants/${id}`);
}

export function createTenant(data: CreateTenantInput) {
  return apiRequest<Tenant>('/api/v1/tenants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
