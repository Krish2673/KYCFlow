export const invitationTemplate = (
  inviteeName: string,
  orgName: string,
  inviteLink: string,
  role: string,
) => `
  <div style="font-family: sans-serif; max-width: 560px;">
    <h2>You've been invited to KYCFlow</h2>
    <p>Hi ${inviteeName},</p>
    <p><strong>${orgName}</strong> has invited you to join as a <strong>${role.replace("_", " ")}</strong>.</p>
    <p>Click the link below to set your password and activate your account:</p>
    <p><a href="${inviteLink}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;">Accept Invitation</a></p>
    <p style="color:#64748b;font-size:14px;">This link expires in 7 days. If you didn't expect this invitation, you can ignore this email.</p>
  </div>
`;
