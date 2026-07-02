import { Worker } from "bullmq";
import { bullRedisConnection } from "../config/redis";
import { resend } from "../config/resend";

export const emailWorker =
new Worker(

    "emailQueue",

    async (job) => {

        const {
            to,
            subject,
            html
        } = job.data;

        const response =
        await resend.emails.send({

            from:
                "KYCFlow <onboarding@resend.dev>",

            to,

            subject,

            html,

        });

        console.log(
            "Email sent:",
            response.data?.id
        );

    },

    {
        connection:
            bullRedisConnection,
    }

);