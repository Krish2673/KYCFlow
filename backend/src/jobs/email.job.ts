import { emailQueue } from "../queues/email.queue";

export const queueEmail = async (
    to: string,
    subject: string,
    html: string
) => {

    await emailQueue.add(
        "sendEmail",
        {
            to,
            subject,
            html,
        }
    );

};