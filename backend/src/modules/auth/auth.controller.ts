import { Request, Response } from "express";
import { loginUser, blacklistToken, refreshAccessToken, requestOTP, verifyOTP } from "./auth.service";
import { AppError } from "../../errors/AppError";
import { sendResponse } from "../../utils/sendResponse";
import jwt from "jsonwebtoken";
import { redisClient } from "../../config/redis";

export const loginController = async (
  req: Request,
  res: Response
) => {
  try {

    const { email, password } = req.body;

    const result = await loginUser(
      email,
      password
    );

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });

  }
};

export const logoutController = async (req : Request, res : Response) => {

    const authHeader =
    req.headers.authorization;

if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(
        "Token missing",
        400
    );
}

const token = authHeader.split(" ")[1];

if (!token) {
    throw new AppError(
        "Token missing",
        401
    );
}

const decoded =
jwt.verify(
    token,
    process.env.JWT_SECRET!
) as jwt.JwtPayload & {
    userId: string
};

await redisClient.del(
    `refresh:${decoded.userId}`
);

  await blacklistToken(
    token as string
);

    return sendResponse(
        res,
        200,
        "Logged out successfully"
    );

};

export const refreshTokenController = async (req : Request, res : Response) => {

    const { refreshToken } =
        req.body;

    const result =
        await refreshAccessToken(
            refreshToken
        );

    return sendResponse(
        res,
        200,
        "Access token refreshed",
        result
    );

};

export const requestOTPController = async (req : Request, res : Response) => {

    const { email } =
        req.body;

    await requestOTP(email);

    return sendResponse(
        res,
        200,
        "OTP sent successfully"
    );

};

export const verifyOTPController = async (req : Request, res : Response) => {

    const {
        email,
        otp
    } = req.body;

    const result =
    await verifyOTP(
        email,
        otp
    );

    return sendResponse(
        res,
        200,
        "OTP verified successfully",
        result
    );

};