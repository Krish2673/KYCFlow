import prisma from "../../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redisClient } from "../../config/redis";

export const loginUser = async (
  email: string,
  password: string
) => {

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1d",
    }
  );

  return {
    token,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
  };
};

export const blacklistToken =
async (
    token: string
) => {

    const decoded = jwt.decode(token) as jwt.JwtPayload;

    if (!decoded?.exp) {
        return;
    }

    const ttl =
        decoded.exp -
        Math.floor(
            Date.now() / 1000
        );

    if (ttl <= 0) {
        return;
    }

    await redisClient.set(
    `blacklist:${token}`,
    "true",
    "EX",
    ttl
);

};