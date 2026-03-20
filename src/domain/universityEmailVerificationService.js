import crypto from "crypto";
import { AppError } from "@/errors/AppError";
import * as emailVerificationTokenRepository from "@/repositories/emailVerificationTokenRepository";
import * as userRepository from "@/repositories/userRepository";
import * as universityRepository from "@/repositories/universityRepository";
import { sendVerificationEmail } from "@/lib/emailService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export async function submitUniversityEmail(
  userId,
  userEmail,
  universityEmail,
) {
  if (!userEmail) {
    throw new AppError(
      "Anonymous accounts cannot submit a university email",
      403,
    );
  }

  if (!EMAIL_REGEX.test(universityEmail)) {
    throw new AppError("Invalid university email format", 400);
  }

  const domain = universityEmail.split("@")[1].toLowerCase();
  const knownUniversity = await universityRepository.findByEmailDomain(domain);

  if (!knownUniversity) {
    throw new AppError(
      "Email domain is not recognized as a university email",
      400,
    );
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  await emailVerificationTokenRepository.revokeByUserIdAndType(
    userId,
    "UNIVERSITY",
  );

  await emailVerificationTokenRepository.create({
    userId,
    email: universityEmail,
    token,
    expiresAt,
    type: "UNIVERSITY",
  });

  await sendVerificationEmail(universityEmail, token);

  return { message: "Verification email sent" };
}

export async function verifyUniversityEmail(token) {
  const { record, alreadyUsed } =
    await emailVerificationTokenRepository.markAsUsed(token);

  if (!record) {
    throw new AppError("Verification token not found", 404);
  }

  if (alreadyUsed) {
    return { message: "University email verified successfully" };
  }

  if (record.expiresAt < new Date()) {
    throw new AppError("Token has expired", 400);
  }

  const domain = record.email.split("@")[1].toLowerCase();
  const linkedUniversity = await universityRepository.findByEmailDomain(domain);

  await userRepository.update(record.userId, {
    universityEmail: record.email,
    verified: true,
    universityId: linkedUniversity?.id ?? null,
  });

  return { message: "University email verified successfully" };
}
