import crypto from "crypto";
import { AppError } from "@/errors/AppError";
import * as emailVerificationTokenRepository from "@/repositories/emailVerificationTokenRepository";
import * as userRepository from "@/repositories/userRepository";
import * as universityRepository from "@/repositories/universityRepository";
import { sendEmailVerification } from "@/lib/emailService";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export async function sendEmailVerificationToUser(userId, email) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.emailVerified) {
    throw new AppError("Email already verified", 400);
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  await emailVerificationTokenRepository.revokeByUserIdAndType(
    userId,
    "PERSONAL",
  );

  await emailVerificationTokenRepository.create({
    userId,
    email,
    token,
    expiresAt,
    type: "PERSONAL",
  });

  await sendEmailVerification(email, token);

  return { message: "Verification email sent" };
}

export async function verifyEmail(token) {
  const { record, alreadyUsed } =
    await emailVerificationTokenRepository.markAsUsed(token);

  if (!record) {
    throw new AppError("Verification token not found", 404);
  }

  if (alreadyUsed) {
    return { message: "Email verified successfully" };
  }

  if (record.expiresAt < new Date()) {
    throw new AppError("Token has expired", 400);
  }

  const domain = record.email.split("@")[1].toLowerCase();
  const linkedUniversity = await universityRepository.findByEmailDomain(domain);

  const updateData = { emailVerified: true };

  if (linkedUniversity) {
    updateData.universityEmail = record.email;
    updateData.verified = true;
    updateData.universityId = linkedUniversity.id;
  }

  await userRepository.update(record.userId, updateData);

  return { message: "Email verified successfully" };
}
