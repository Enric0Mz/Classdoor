import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function sendEmailVerification(toEmail, token) {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "Classdoor <onboarding@infocampus.com.br>",
    to: toEmail,
    subject: "Verify your Classdoor email",
    html: `
      <p>Welcome to Classdoor!</p>
      <p>Click the link below to verify your email address. The link expires in 24 hours.</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>If you did not create an account, you can ignore this email.</p>
    `,
  });
}

export async function sendVerificationEmail(toEmail, token) {
  const verificationUrl = `${APP_URL}/verify-university-email?token=${token}`;

  await resend.emails.send({
    from: "InfoCampus <onboarding@infocampus.com.br>",
    to: toEmail,
    subject: "Verify your university email on InfoCampus",
    html: `
      <p>You requested to verify your university email on InfoCampus.</p>
      <p>Click the link below to confirm. The link expires in 24 hours.</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
}
