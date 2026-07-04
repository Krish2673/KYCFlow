import { Request, Response } from "express";
import { loginUser, blacklistToken, refreshAccessToken, requestOTP, verifyOTP } from "./auth.service";
import { AppError } from "../../errors/AppError";
import { sendResponse } from "../../utils/sendResponse";

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

export const logoutController = async (req, res) => {

    const authHeader =
    req.headers.authorization;

if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(
        "Token missing",
        400
    );
}

const token =
    authHeader.split(" ")[1];

const decoded =
jwt.verify(
    token,
    process.env.JWT_SECRET!
) as {
    userId: string
};

await redisClient.del(
    `refresh:${decoded.userId}`
);

  await blacklistToken(
    token
);

    return sendResponse(
        res,
        200,
        "Logged out successfully"
    );

};

export const refreshTokenController = async (req, res) => {

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

export const requestOTPController =
asyncHandler(
async (req, res) => {

    const { email } =
        req.body;

    await requestOTP(email);

    return sendResponse(
        res,
        200,
        "OTP sent successfully"
    );

});

export const verifyOTPController =
asyncHandler(
async (req, res) => {

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

});