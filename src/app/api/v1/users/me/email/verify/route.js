import { NextResponse } from "next/server";
import { AppError } from "@/errors/AppError";
import * as emailVerificationService from "@/domain/emailVerificationService";
import { verifyToken } from "@/lib/auth";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    throw new AppError("token query parameter is required", 400);
  }

  const result = await emailVerificationService.verifyEmail(token);
  return NextResponse.json(result);
});

export const POST = withErrorHandler(async (request) => {
  const decoded = verifyToken(request);

  if (!decoded.email) {
    throw new AppError("Account has no email address to verify", 400);
  }

  const result = await emailVerificationService.sendEmailVerificationToUser(
    decoded.id,
    decoded.email,
  );
  return NextResponse.json(result);
});
