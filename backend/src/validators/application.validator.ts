import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";

export const createApplicationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name is required"),

  email: z
    .string()
    .email("Invalid email"),
});


export const updateStatusSchema = z.object({
  newStatus: z.nativeEnum(ApplicationStatus),
});

export const assignReviewerSchema = z.object({
  reviewerId: z
    .string()
    .min(1, "Reviewer ID is required"),
});