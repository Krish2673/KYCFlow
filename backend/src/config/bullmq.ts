import { Queue } from "bullmq";
import { bullRedisConnection } from "./redis";

export const emailQueue = new Queue(
    "emailQueue",
    {
        connection: bullRedisConnection,
    }
);