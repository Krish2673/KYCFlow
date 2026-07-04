import { emailQueue } from "../queues/email.queue";

async function registerJobs() {
  await emailQueue.add(
    "daily-summary",
    {},
    {
      repeat: {
        pattern: "0 8 * * *",
      },
    }
  );
}

registerJobs().catch(console.error);