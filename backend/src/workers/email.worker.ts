import { Worker } from "bullmq";
import { bullRedisConnection } from "../config/redis";

export const emailWorker =
new Worker(

    "emailQueue",

    async (job) => {

        console.log(
            `Sending email to ${job.data.to}`
        );

        console.log(
            job.data.subject
        );

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    3000
                )
        );

        console.log(
            `Email sent successfully`
        );

    },

    {
        connection:
            bullRedisConnection,
    }

);