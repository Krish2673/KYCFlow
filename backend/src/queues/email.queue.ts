import { Queue } from "bullmq";
import { bullRedisConnection } from "../config/redis";

export const emailQueue = new Queue(
    "emailQueue",
    {
        connection: bullRedisConnection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: 100,
            removeOnFail: 50,
        },
    }
);