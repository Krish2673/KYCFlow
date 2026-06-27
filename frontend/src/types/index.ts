export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'REVIEWER';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DOCUMENT_VERIFICATION'
  | 'RISK_ASSESSMENT'
  | 'MANUAL_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type DocumentType =
  | 'AADHAAR'
  | 'PAN'
  | 'PASSPORT'
  | 'DRIVING_LICENSE'
  | 'BANK_STATEMENT'
  | 'SELFIE';

export type RiskDecision = 'APPROVED' | 'MANUAL_REVIEW' | 'REJECT';

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  createdAt: string;
  updatedAt?: string;
  tenant?: Tenant;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
}

export interface Application {
  id: string;
  fullName: string;
  email: string;
  status: ApplicationStatus;
  tenantId: string;
  reviewerId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  reviewer?: User | null;
  createdBy?: User;
}

export interface Document {
  id: string;
  type: DocumentType;
  path: string;
  verified: boolean;
  uploadedAt: string;
  applicationId: string;
}

export interface ApplicationMetrics {
  total: number;
  draft: number;
  submitted: number;
  documentVerification: number;
  riskAssessment: number;
  manualReview: number;
  approved: number;
  rejected: number;
}

export interface RiskAssessment {
  trustScore: number;
  decision: RiskDecision;
  reasons: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: unknown[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ApplicationsQuery {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  reviewerId?: string;
  search?: string;
}

export interface CreateApplicationInput {
  fullName: string;
  email: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  tenantId: string;
}

export interface CreateTenantInput {
  name: string;
}

export interface AssignReviewerInput {
  reviewerId: string;
}

export interface UpdateStatusInput {
  newStatus: ApplicationStatus;
}
