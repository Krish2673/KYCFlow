import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../config/redis";

const baseOptions = {
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes.",
  },
};

function createLoginLimiter() {
  if (process.env.REDIS_URL) {
    return rateLimit({
      ...baseOptions,
      store: new RedisStore({
        sendCommand: (...args: string[]) =>
          redisClient.call(args[0]!, ...args.slice(1)) as Promise<number | string>,
      }),
    });
  }

  console.warn(
    "REDIS_URL not configured — login rate limiting uses in-memory store.",
  );
  return rateLimit(baseOptions);
}

export const loginLimiter = createLoginLimiter();
