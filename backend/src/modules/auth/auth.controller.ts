import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { loginUser, blacklistToken, refreshAccessToken, requestOTP, verifyOTP } from "./auth.service";
import {
  registerApplicant,
  registerOrganization,
  getInvitationByToken,
  acceptInvitation,
} from "./registration.service";
import { AppError } from "../../errors/AppError";
import { sendResponse } from "../../utils/sendResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { redisClient } from "../../config/redis";

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const registerApplicantController = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerApplicant(req.body);
  return sendResponse(res, 201, result.message, result.user);
});

export const registerOrganizationController = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerOrganization(req.body);
  return sendResponse(res, 201, result.message, {
    tenant: result.tenant,
    user: result.user,
  });
});

export const getInvitationController = asyncHandler(async (req: Request, res: Response) => {
  const result = await getInvitationByToken(req.params.token as string);
  return sendResponse(res, 200, "Invitation details fetched", result);
});

export const acceptInvitationController = asyncHandler(async (req: Request, res: Response) => {
  const result = await acceptInvitation(req.params.token as string, req.body);
  return sendResponse(res, 200, result.message, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
  });
});

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Token missing", 400);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new AppError("Token missing", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload & {
    userId: string;
  };

  await redisClient.del(`refresh:${decoded.userId}`);
  await blacklistToken(token);

  return sendResponse(res, 200, "Logged out successfully");
});

export const refreshTokenController = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await refreshAccessToken(refreshToken);
  return sendResponse(res, 200, "Access token refreshed", result);
});

export const requestOTPController = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await requestOTP(email);
  return sendResponse(res, 200, "OTP sent successfully");
});

export const verifyOTPController = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await verifyOTP(email, otp);
  return sendResponse(res, 200, "OTP verified successfully", result);
});
