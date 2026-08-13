import { Request, Response } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  inviteUser,
  getPendingApplicants,
} from "./user.service";
import {
  approveApplicant,
  rejectApplicant,
} from "../auth/registration.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";

export const createUserController = asyncHandler(async (req: Request, res: Response) => {
  const user = await createUser(req.body);
  return sendResponse(res, 201, "User created successfully", user);
});

export const inviteUserController = asyncHandler(async (req: Request, res: Response) => {
  const result = await inviteUser({
    ...req.body,
    tenantId: req.user!.tenantId,
    invitedById: req.user!.userId,
  });
  return sendResponse(res, 201, result.message, result);
});

export const getAllUsersController = asyncHandler(async (req: Request, res: Response) => {
  const users = await getAllUsers(req.user!.tenantId);
  return sendResponse(res, 200, "Users fetched successfully", users);
});

export const getPendingApplicantsController = asyncHandler(async (req: Request, res: Response) => {
  const applicants = await getPendingApplicants(req.user!.tenantId);
  return sendResponse(res, 200, "Pending applicants fetched", applicants);
});

export const approveApplicantController = asyncHandler(async (req: Request, res: Response) => {
  const result = await approveApplicant(
    req.params.id as string,
    req.user!.userId,
    req.user!.tenantId,
  );
  return sendResponse(res, 200, "Applicant approved successfully", result);
});

export const rejectApplicantController = asyncHandler(async (req: Request, res: Response) => {
  const result = await rejectApplicant(req.params.id as string, req.user!.tenantId);
  return sendResponse(res, 200, "Applicant rejected", result);
});

export const getUserByIdController = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.params.id as string, req.user!.tenantId);

  if (!user) {
    return sendResponse(res, 404, "User not found");
  }

  return sendResponse(res, 200, "User fetched successfully", user);
});
