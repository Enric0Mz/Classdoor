import crypto from "crypto";
import { AppError } from "@/errors/AppError";
import * as emailVerificationRepository from "@/repositories/emailVerificationRepository";
import * as userRepository from "@/repositories/userRepository";
import * as universityRepository from "@/repositories/universityRepository";
import { sendEmailVerification } from "@/lib/emailService";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export async function sendEmailVerificationToUser(userId, email) {
  console.log("[EmailVerification] sendEmailVerificationToUser called", {
    userId,
    email,
  });

  const user = await userRepository.findById(userId);
  if (!user) {
    console.log("[EmailVerification] User not found", { userId });
    throw new AppError("User not found", 404);
  }

  if (user.emailVerified) {
    console.log("[EmailVerification] Email already verified", { userId });
    throw new AppError("Email already verified", 400);
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  console.log("[EmailVerification] Deleting old tokens", { userId });
  const deleted = await emailVerificationRepository.deleteByUserId(userId);
  console.log("[EmailVerification] Deleted old tokens", {
    userId,
    deletedCount: deleted?.count ?? 0,
  });

  console.log("[EmailVerification] Creating new token", { userId, token });
  await emailVerificationRepository.create({ userId, email, token, expiresAt });
  console.log("[EmailVerification] Token created in DB", { userId, token });

  console.log("[EmailVerification] Sending email", { userId, email });
  await sendEmailVerification(email, token);
  console.log("[EmailVerification] Email sent", { userId, email, token });

  return { message: "Verification email sent" };
}

export async function verifyEmail(token) {
  console.log("[EmailVerification] verifyEmail called", { token });

  const record = await emailVerificationRepository.claimByToken(token);
  console.log("[EmailVerification] claimByToken result", {
    token,
    found: !!record,
    userId: record?.userId,
  });

  if (!record) {
    throw new AppError("Verification token not found", 404);
  }

  if (record.expiresAt < new Date()) {
    console.log("[EmailVerification] Token expired", {
      token,
      expiresAt: record.expiresAt,
    });
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

  console.log("[EmailVerification] Updating user", {
    userId: record.userId,
    updateData,
  });
  await userRepository.update(record.userId, updateData);
  console.log("[EmailVerification] User updated successfully", {
    userId: record.userId,
  });

  return { message: "Email verified successfully" };
}
