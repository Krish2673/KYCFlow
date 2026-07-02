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
    },

    case "reviewer-reminder":
        const application =
        await prisma.application.findUnique({
            where: {
                id: job.data.applicationId
            }
        });

        if (!application) {
            return;
        }

        const pendingStatuses = [

            "SUBMITTED",

            "DOCUMENT_VERIFICATION",

            "RISK_ASSESSMENT",

            "MANUAL_REVIEW"

        ];

        if (
            pendingStatuses.includes(
                application.status
            )
        ) {

            await resend.emails.send({

                from:
                    "KYCFlow <onboarding@resend.dev>",

                to:
                    job.data.reviewerEmail,

                subject:
                    "Reminder: Pending Application Review",

                html:
                    reviewerReminderTemplate(
                        job.data.reviewerName,
                        job.data.applicantName
                    ),

            });

        }

    case "reviewer-escalation":
        const application =
await prisma.application.findUnique({
    where: {
        id: job.data.applicationId
    }
});

if (!application) {
    return;
}

const pendingStatuses = [

    "SUBMITTED",

    "DOCUMENT_VERIFICATION",

    "RISK_ASSESSMENT",

    "MANUAL_REVIEW"

];

if (
    pendingStatuses.includes(
        application.status
    )
) {

    const admin =
    await prisma.user.findFirst({

        where: {

            tenantId:
                job.data.tenantId,

            role:
                "TENANT_ADMIN",

        },

    });

    if (!admin) {
        return;
    }

    await resend.emails.send({

        from:
            "KYCFlow <onboarding@resend.dev>",

        to:
            admin.email,

        subject:
            "Escalation: Application Pending Review",

        html:
            escalationTemplate(
                application.fullName
            ),

    });

}

    case "daily-summary":
        const tenants =
await prisma.tenant.findMany();

for (
    const tenant
    of tenants
) {

    const metrics =
    await getApplicationMetrics(
        tenant.id
    );

    const admin =
    await prisma.user.findFirst({

        where: {

            tenantId:
                tenant.id,

            role:
                "TENANT_ADMIN",

        },

    });

    if (!admin) {
        continue;
    }

    await resend.emails.send({

        from:
            "KYCFlow <onboarding@resend.dev>",

        to:
            admin.email,

        subject:
            "Daily KYC Summary",

        html:
            dailySummaryTemplate(
                metrics
            ),

    });

}

);