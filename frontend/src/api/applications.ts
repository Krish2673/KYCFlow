import { apiRequest, apiRequestWithMeta } from './client';
import type {
  Application,
  ApplicationMetrics,
  ApplicationsQuery,
  AssignReviewerInput,
  CreateApplicationInput,
  RiskAssessment,
  UpdateStatusInput,
} from '../types';

function buildQuery(params: ApplicationsQuery) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.status) search.set('status', params.status);
  if (params.reviewerId) search.set('reviewerId', params.reviewerId);
  if (params.search) search.set('search', params.search);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function getApplications(params: ApplicationsQuery = {}) {
  return apiRequestWithMeta<Application[]>(
    `/api/v1/applications${buildQuery(params)}`,
  );
}

export function getMyApplications(params: ApplicationsQuery = {}) {
  return apiRequestWithMeta<Application[]>(
    `/api/v1/applications/my${buildQuery(params)}`,
  );
}

export function getApplication(id: string) {
  return apiRequest<Application>(`/api/v1/applications/${id}`);
}

export function getApplicationMetrics() {
  return apiRequest<ApplicationMetrics>('/api/v1/applications/metrics');
}

export function getApplicationRisk(id: string) {
  return apiRequest<RiskAssessment>(`/api/v1/applications/${id}/risk`);
}

export function createApplication(data: CreateApplicationInput) {
  return apiRequest<Application>('/api/v1/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function submitApplication(id: string) {
  return apiRequest<Application>(`/api/v1/applications/${id}/submit`, {
    method: 'PATCH',
  });
}

export function updateApplicationStatus(id: string, data: UpdateStatusInput) {
  return apiRequest<Application>(`/api/v1/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function assignReviewer(id: string, data: AssignReviewerInput) {
  return apiRequest<Application>(`/api/v1/applications/${id}/assign-reviewer`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
