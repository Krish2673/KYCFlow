import "./env";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error(
    "REDIS_URL is not set. Auth, caching, and rate limiting will not work.",
  );
}

const useTls = redisUrl?.startsWith("rediss://") ?? false;

const sharedOptions = useTls ? { tls: {} } : {};

export const redisClient = new Redis(redisUrl ?? "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: 3,
  ...sharedOptions,
});

export const bullRedisConnection = new Redis(
  redisUrl ?? "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null,
    ...sharedOptions,
  },
);

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});
