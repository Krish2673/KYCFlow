import { apiRequest, ApiError } from './client';
import type { ApplicationStatus } from '../types';

export interface AuditLog {
  id: string;
  applicationId: string;
  userId: string;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

/** Calls backend audit endpoint — graceful fallback when not yet implemented. */
export async function getAuditLogs(applicationId: string): Promise<AuditLog[]> {
  try {
    return await apiRequest<AuditLog[]>(
      `/api/v1/applications/${applicationId}/audit-logs`,
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}
