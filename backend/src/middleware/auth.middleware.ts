import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis";
import { AppError } from "../errors/AppError";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const blacklisted = await redisClient.get(
    `blacklist:${token}`
);

if (blacklisted) {

    throw new AppError(
        "Token has been invalidated",
        401
    );

}

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      userId: string;
      tenantId: string;
      role: string;
    };

    req.user = decoded;

    next();

  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: error instanceof Error
                ? error.message
                : "Invalid Token",
    });

  }
};