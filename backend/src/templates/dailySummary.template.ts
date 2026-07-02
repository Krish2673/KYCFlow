interface DailySummaryMetrics {
    total: number;
    draft: number;
    submitted: number;
    documentVerification: number;
    riskAssessment: number;
    manualReview: number;
    approved: number;
    rejected: number;
}

export const dailySummaryTemplate = (
    metrics: DailySummaryMetrics
) => {

    return `

    <div
        style="
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 700px;
        "
    >

        <h2>
            Daily KYC Summary Report
        </h2>

        <p>
            Here's the latest overview of your KYC pipeline:
        </p>

        <table
            style="
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            "
        >

            <tr>
                <td><strong>Total Applications</strong></td>
                <td>${metrics.total}</td>
            </tr>

            <tr>
                <td>Draft</td>
                <td>${metrics.draft}</td>
            </tr>

            <tr>
                <td>Submitted</td>
                <td>${metrics.submitted}</td>
            </tr>

            <tr>
                <td>Document Verification</td>
                <td>${metrics.documentVerification}</td>
            </tr>

            <tr>
                <td>Risk Assessment</td>
                <td>${metrics.riskAssessment}</td>
            </tr>

            <tr>
                <td>Manual Review</td>
                <td>${metrics.manualReview}</td>
            </tr>

            <tr>
                <td>Approved</td>
                <td>${metrics.approved}</td>
            </tr>

            <tr>
                <td>Rejected</td>
                <td>${metrics.rejected}</td>
            </tr>

        </table>

        <br>

        <div
            style="
                padding: 15px;
                background-color: #f0fdf4;
                border-left: 4px solid #22c55e;
            "
        >
            Approval Rate:
            <strong>
                ${
                    metrics.total > 0
                    ? (
                        (metrics.approved / metrics.total) * 100
                    ).toFixed(2)
                    : 0
                }%
            </strong>
        </div>

        <br>

        <p>
            Regards,<br>
            KYCFlow Analytics Engine
        </p>

    </div>

    `;
};