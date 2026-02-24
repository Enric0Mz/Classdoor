import crypto from "crypto";
import { AppError } from "@/errors/AppError";
import * as emailVerificationRepository from "@/repositories/emailVerificationRepository";
import * as userRepository from "@/repositories/userRepository";
import * as universityRepository from "@/repositories/universityRepository";
import { sendEmailVerification } from "@/lib/emailService";
import { findUniversityByDomain } from "@/lib/universityDomains";

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
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await emailVerificationRepository.deleteByUserId(userId);
  await emailVerificationRepository.create({ userId, email, token, expiresAt });
  await sendEmailVerification(email, token);

  return { message: "Verification email sent" };
}

export async function verifyEmail(token) {
  const record = await emailVerificationRepository.findByToken(token);
  if (!record) {
    throw new AppError("Verification token not found", 404);
  }

  if (record.expiresAt < new Date()) {
    throw new AppError("Token has expired", 400);
  }

  const domain = record.email.split("@")[1].toLowerCase();
  const isUniversityEmail = findUniversityByDomain(domain) !== null;

  const updateData = { emailVerified: true };

  if (isUniversityEmail) {
    const linkedUniversity = await universityRepository.findByEmailDomain(domain);
    updateData.universityEmail = record.email;
    updateData.verified = true;
    updateData.universityId = linkedUniversity?.id ?? null;
  }

  await userRepository.update(record.userId, updateData);
  await emailVerificationRepository.deleteByUserId(record.userId);

  return { message: "Email verified successfully" };
}
