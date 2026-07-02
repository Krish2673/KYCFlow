export const escalationTemplate = (
    applicantName: string,
    reviewerName?: string
) => {

    return `

    <div
        style="
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 600px;
        "
    >

        <h2 style="color: #dc2626;">
            Escalation Required
        </h2>

        <p>
            Hello Admin,
        </p>

        <p>
            The KYC application for
            <strong>${applicantName}</strong>
            has remained pending for more than
            <strong>72 hours</strong>.
        </p>

        ${
            reviewerName
            ? `
            <p>
                Assigned Reviewer:
                <strong>${reviewerName}</strong>
            </p>
            `
            : ""
        }

        <div
            style="
                margin-top: 20px;
                padding: 15px;
                background-color: #fef2f2;
                border-left: 4px solid #dc2626;
            "
        >
            Immediate attention is recommended to
            maintain SLA compliance.
        </div>

        <br>

        <p>
            Regards,<br>
            KYCFlow Workflow Engine
        </p>

    </div>

    `;
};