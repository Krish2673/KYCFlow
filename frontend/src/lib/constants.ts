import type { ApplicationStatus, DocumentType, UserRole } from '../types';

export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const TOKEN_KEY = 'kycflow_token';
export const USER_KEY = 'kycflow_user';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  DOCUMENT_VERIFICATION: 'Document Verification',
  RISK_ASSESSMENT: 'Risk Assessment',
  MANUAL_REVIEW: 'Manual Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  AADHAAR: 'Aadhaar',
  PAN: 'PAN Card',
  PASSPORT: 'Passport',
  DRIVING_LICENSE: 'Driving License',
  BANK_STATEMENT: 'Bank Statement',
  SELFIE: 'Selfie',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  TENANT_ADMIN: 'Tenant Admin',
  REVIEWER: 'Reviewer',
};

export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['DOCUMENT_VERIFICATION'],
  DOCUMENT_VERIFICATION: ['RISK_ASSESSMENT'],
  RISK_ASSESSMENT: ['MANUAL_REVIEW'],
  MANUAL_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: [],
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  DOCUMENT_VERIFICATION: 'bg-amber-100 text-amber-700',
  RISK_ASSESSMENT: 'bg-orange-100 text-orange-700',
  MANUAL_REVIEW: 'bg-purple-100 text-purple-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export const RISK_DECISION_COLORS = {
  APPROVED: 'text-emerald-600',
  MANUAL_REVIEW: 'text-amber-600',
  REJECT: 'text-red-600',
} as const;
