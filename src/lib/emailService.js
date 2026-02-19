// TODO: Replace with a real email provider (e.g., SendGrid, Resend) when ready for production
export async function sendVerificationEmail(toEmail, token) {
  console.log(`[EmailService] Sending verification email to ${toEmail}`);
  console.log(`[EmailService] Verification token: ${token}`);
  console.log(`[EmailService] Verification URL: /api/v1/users/me/university-email/verify?token=${token}`);
}
