export const reviewerReminderTemplate = (
    reviewerName: string,
    applicantName: string
) => {

    return `

    <div
        style="
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 600px;
        "
    >

        <h2 style="color: #f59e0b;">
            Reminder: Pending Application Review
        </h2>

        <p>
            Hello <strong>${reviewerName}</strong>,
        </p>

        <p>
            This is a reminder that the application for
            <strong>${applicantName}</strong>
            is still awaiting your review.
        </p>

        <p>
            Please review the application as soon as possible
            to avoid delays in the KYC process.
        </p>

        <div
            style="
                margin-top: 20px;
                padding: 15px;
                background-color: #fff7ed;
                border-left: 4px solid #f59e0b;
            "
        >
            Pending for more than 48 hours.
        </div>

        <br>

        <p>
            Regards,<br>
            KYCFlow Team
        </p>

    </div>

    `;
};