import crypto from "crypto";
import { AppError } from "@/errors/AppError";
import * as verificationRepository from "@/repositories/universityEmailVerificationRepository";
import * as userRepository from "@/repositories/userRepository";
import { sendVerificationEmail } from "@/lib/emailService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export async function submitUniversityEmail(userId, userEmail, universityEmail) {
  if (!userEmail) {
    throw new AppError("Anonymous accounts cannot submit a university email", 403);
  }

  if (!EMAIL_REGEX.test(universityEmail)) {
    throw new AppError("Invalid university email format", 400);
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Remove any existing pending verification for this user
  await verificationRepository.deleteByUserId(userId);

  await verificationRepository.create({ userId, universityEmail, token, expiresAt });

  await sendVerificationEmail(universityEmail, token);

  return { message: "Verification email sent" };
}

export async function verifyUniversityEmail(token) {
  const record = await verificationRepository.findByToken(token);
  if (!record) {
    throw new AppError("Verification token not found", 404);
  }

  if (record.expiresAt < new Date()) {
    throw new AppError("Token has expired", 400);
  }

  await userRepository.update(record.userId, {
    universityEmail: record.universityEmail,
    verified: true,
  });

  await verificationRepository.deleteByUserId(record.userId);

  return { message: "University email verified successfully" };
}
