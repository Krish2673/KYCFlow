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

  const accessToken = jwt.sign(
    {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
    },
    process.env.JWT_SECRET!,
    {
        expiresIn: "15m",
    }
);

const refreshToken = jwt.sign(
    {
        userId: user.id,
    },
    process.env.JWT_REFRESH_SECRET!,
    {
        expiresIn: "7d",
    }
);

  await redisClient.set(
    `refresh:${user.id}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
);

  return {
    accessToken,
    refreshToken,
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

export const refreshAccessToken =
async (
    refreshToken: string
) => {

    const decoded =
    jwt.verify(

        refreshToken,

        process.env
            .JWT_REFRESH_SECRET!

    ) as {

        userId: string

    };

    const storedToken =
    await redisClient.get(
        `refresh:${decoded.userId}`
    );

    if (
        storedToken !==
        refreshToken
    ) {

        throw new AppError(
            "Invalid refresh token",
            401
        );

    }

    const user =
    await prisma.user.findUnique({
        where: {
            id: decoded.userId
        }
    });

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
    }

    const accessToken =
    jwt.sign(
        {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: "15m"
        }
    );

    return {
        accessToken
    };

};