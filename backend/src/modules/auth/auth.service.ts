import prisma from "../../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redisClient } from "../../config/redis";
import { AppError } from "../../errors/AppError";
import { emailQueue } from "../../queues/email.queue";    
import { queueEmail } from "../../jobs/email.job";
import { generateOTP } from "../../utils/otp";
import { otpTemplate } from "../../templates";

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

  if (!user.password) {
    throw new AppError("Please complete your account setup via the invitation link", 403);
  }

  if (user.status === "PENDING") {
    throw new AppError("Your account is pending approval from your organization admin", 403);
  }

  if (user.status === "REJECTED") {
    throw new AppError("Your registration was rejected. Contact your organization admin", 403);
  }

  if (user.status === "SUSPENDED") {
    throw new AppError("Your account has been suspended", 403);
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

        process.env.JWT_REFRESH_SECRET!

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

export const requestOTP = async (
    email: string
) => {

    const user =
    await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
    }

    const cooldown =
    await redisClient.get(
        `otp_cooldown:${email}`
    );

    if (cooldown) {
        throw new AppError(
            "Please wait before requesting another OTP",
            429
        );
    }

    const otp = generateOTP();

    const hashedOTP =
await bcrypt.hash(
    otp,
    10
);

    await redisClient.set(
        `otp:${email}`,
        hashedOTP,
        "EX",
        300
    );

    await redisClient.set(
        `otp_cooldown:${email}`,
        "true",
        "EX",
        60
    );

    await queueEmail(
        email,
        "Your Login OTP",
        otpTemplate(otp)
    );

    return;
};

export const verifyOTP = async (
    email: string,
    otp: string
) => {

    const storedOtp =
    await redisClient.get(
        `otp:${email}`
    );

    if (!storedOtp) {
        throw new AppError(
            "OTP expired",
            400
        );
    }

    const attempts =
    Number(
        await redisClient.get(
            `otp_attempts:${email}`
        )
    ) || 0;

    if (attempts >= 3) {

        await redisClient.del(
            `otp:${email}`
        );

        throw new AppError(
            "Maximum OTP attempts exceeded",
            400
        );
    }

    const valid =
await bcrypt.compare(
    otp,
    storedOtp
);

    if (!valid) {

        await redisClient.incr(
            `otp_attempts:${email}`
        );

        await redisClient.expire(
            `otp_attempts:${email}`,
            300
        );

        throw new AppError(
            "Invalid OTP",
            400
        );
    }

    await redisClient.del(
        `otp:${email}`
    );

    await redisClient.del(
        `otp_attempts:${email}`
    );

    const user =
    await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
    }

    if (!user.password) {
        throw new AppError("Please complete your account setup via the invitation link", 403);
    }

    if (user.status !== "ACTIVE") {
        throw new AppError("Your account is not active", 403);
    }

    const accessToken = jwt.sign(
        {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: "15m"
        }
    );

    const refreshToken = jwt.sign(
        {
            userId: user.id
        },
        process.env.JWT_REFRESH_SECRET!,
        {
            expiresIn: "7d"
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
            tenantId: user.tenantId
        }
    };
};