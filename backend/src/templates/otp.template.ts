export const otpTemplate = (
    otp: string
) => {
    return `
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>Please use this code to complete your verification.</p>
    `;
};