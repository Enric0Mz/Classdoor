import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AppError } from "@/errors/AppError";
import { validatePassword } from "@/lib/passwordValidation";
import { sendPasswordResetEmail } from "@/lib/emailService";
import * as userRepository from "@/repositories/userRepository";
import * as passwordResetTokenRepository from "@/repositories/passwordResetTokenRepository";
import * as refreshTokenRepository from "@/repositories/refreshTokenRepository";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_EXPIRY_HOURS = 1;

export async function requestPasswordReset(email) {
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  const user = await userRepository.findByEmail(email);

  if (!user || !user.password) {
    return {
      message:
        "If an account with this email exists, a password reset link has been sent",
    };
  }

  await passwordResetTokenRepository.revokeByUserId(user.id);

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await passwordResetTokenRepository.create({
    userId: user.id,
    email: user.email,
    token,
    expiresAt,
  });

  await sendPasswordResetEmail(user.email, token);

  return {
    message:
      "If an account with this email exists, a password reset link has been sent",
  };
}

export async function resetPassword(token, newPassword) {
  if (!token) {
    throw new AppError("Token is required", 400);
  }

  if (!newPassword) {
    throw new AppError("New password is required", 400);
  }

  validatePassword(newPassword);

  const { record, alreadyUsed } =
    await passwordResetTokenRepository.markAsUsed(token);

  if (!record) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  if (alreadyUsed) {
    throw new AppError("This reset link has already been used", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userRepository.update(record.userId, { password: hashedPassword });
  await refreshTokenRepository.deleteAllByUserId(record.userId);

  return { message: "Password reset successfully" };
}
