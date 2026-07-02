export const applicationApprovedTemplate = (
    applicantName: string
) => {

    return `

    <div style="font-family: Arial, sans-serif; padding: 20px;">

        <h2>
            KYC Approved 🎉
        </h2>

        <p>
            Hello ${applicantName},
        </p>

        <p>
            Congratulations!
            Your KYC application has been approved successfully.
        </p>

        <p>
            You may now proceed with onboarding.
        </p>

        <br>

        <p>
            Regards,<br>
            KYCFlow Team
        </p>

    </div>

    `;
};