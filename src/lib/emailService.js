import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL =
  process.env.APP_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export async function sendEmailVerification(toEmail, token) {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "InfoCampus <onboarding@infocampus.com.br>",
    to: toEmail,
    subject: "Verifique o seu email para usar o InfoCampus",
    html: `
      <p>Bem vindo ao InfoCampus!</p>
      <p>Clique no link abaixo para validar seu email. Esse link expira em 24h.</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>Se não foi você que criou essa conta, ignore esse email</p>
    `,
  });
}

export async function sendPasswordResetEmail(toEmail, token) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "InfoCampus <onboarding@infocampus.com.br>",
    to: toEmail,
    subject: "Redefinição de senha - InfoCampus",
    html: `
      <p>Você solicitou a redefinição da sua senha no InfoCampus.</p>
      <p>Clique no link abaixo para criar uma nova senha. Esse link expira em 1 hora.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Se não foi você que solicitou, ignore esse email. Sua senha não será alterada.</p>
    `,
  });
}

export async function sendVerificationEmail(toEmail, token) {
  const verificationUrl = `${APP_URL}/verify-university-email?token=${token}`;

  await resend.emails.send({
    from: "InfoCampus <onboarding@infocampus.com.br>",
    to: toEmail,
    subject: "Verifique o seu email para usar o InfoCampus",
    html: `
      <p>Bem vindo ao InfoCampus!</p>
      <p>Clique no link abaixo para validar seu email e ganhar o badge de verificado! Esse link expira em 24h.</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>Se não foi você que criou essa conta, ignore esse email</p>
    `,
  });
}
