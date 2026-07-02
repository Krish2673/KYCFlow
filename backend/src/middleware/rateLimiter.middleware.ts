import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../config/redis";

export const loginLimiter =
rateLimit({

    windowMs:
        15 * 60 * 1000,

    max:
        10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many login attempts. Try again in 15 minutes."
    },

    store:
        new RedisStore({

            sendCommand:
                (...args: string[]) =>
                    redisClient.call(
                        args[0],
                        ...args.slice(1)
                    ),

        }),

});