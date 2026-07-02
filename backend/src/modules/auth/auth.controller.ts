import { Request, Response } from "express";
import { loginUser, blacklistToken } from "./auth.service";
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

await blacklistToken(token);

    return sendResponse(
        res,
        200,
        "Logged out successfully"
    );

};