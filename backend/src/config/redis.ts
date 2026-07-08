import Redis from "ioredis";

export const redisClient = new Redis(process.env.REDIS_URL!);

export const bullRedisConnection =
  new Redis(
    process.env.REDIS_URL!,
    {
      maxRetriesPerRequest: null,
      tls : {},
    }
  );

redisClient.on(
    "connect",
    () => {
        console.log(
            "Redis Connected"
        );
    }
);

redisClient.on(
    "error",
    (err) => {
        console.error(
            "Redis Error:",
            err
        );
    }
);