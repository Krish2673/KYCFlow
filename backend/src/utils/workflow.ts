import { ApplicationStatus } from "@prisma/client";

export const VALID_TRANSITIONS: Record<
  ApplicationStatus,
  ApplicationStatus[]
> = {
  DRAFT: ["SUBMITTED"],

  SUBMITTED: [
    "DOCUMENT_VERIFICATION",
  ],

  DOCUMENT_VERIFICATION: [
    "RISK_ASSESSMENT",
  ],

  RISK_ASSESSMENT: [
    "MANUAL_REVIEW",
  ],

  MANUAL_REVIEW: [
    "APPROVED",
    "REJECTED",
  ],

  APPROVED: [],

  REJECTED: [],
};