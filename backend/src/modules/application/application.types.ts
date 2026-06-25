import { ApplicationStatus } from "@prisma/client";

export interface ApplicationFilters {
  page: number;
  limit: number;
  status?: ApplicationStatus;
  reviewerId?: string;
  search?: string;
}