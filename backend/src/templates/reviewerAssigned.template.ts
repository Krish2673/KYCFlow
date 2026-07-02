export const reviewerAssignedTemplate = (
    reviewerName: string,
    applicantName: string
) => {

    return `
    
    <div style="font-family: Arial, sans-serif; padding: 20px;">

        <h2>
            New Application Assigned
        </h2>

        <p>
            Hello ${reviewerName},
        </p>

        <p>
            A new application from
            <strong>${applicantName}</strong>
            has been assigned to you for review.
        </p>

        <p>
            Please login to KYCFlow and begin verification.
        </p>

        <br>

        <p>
            Regards,<br>
            KYCFlow Team
        </p>

    </div>

    `;
};