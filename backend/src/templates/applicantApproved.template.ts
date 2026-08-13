export const applicantApprovedTemplate = (
  applicantName: string,
  orgName: string,
  loginLink: string,
) => `
  <div style="font-family: sans-serif; max-width: 560px;">
    <h2>Your KYCFlow account has been approved</h2>
    <p>Hi ${applicantName},</p>
    <p>Your registration with <strong>${orgName}</strong> has been approved. You can now sign in and complete your KYC application.</p>
    <p><a href="${loginLink}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;">Sign In</a></p>
  </div>
`;
