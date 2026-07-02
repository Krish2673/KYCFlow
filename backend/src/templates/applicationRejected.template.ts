export const applicationRejectedTemplate = (
    applicantName: string
) => {

    return `

    <div style="font-family: Arial, sans-serif; padding: 20px;">

        <h2>
            KYC Application Update
        </h2>

        <p>
            Hello ${applicantName},
        </p>

        <p>
            Unfortunately, your KYC application
            could not be approved at this time.
        </p>

        <p>
            Please contact support for further details.
        </p>

        <br>

        <p>
            Regards,<br>
            KYCFlow Team
        </p>

    </div>

    `;
};