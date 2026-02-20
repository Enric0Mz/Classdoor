import { NextResponse } from "next/server";
import { AppError } from "@/errors/AppError";
import * as verificationService from "@/domain/universityEmailVerificationService";
import { verifyToken } from "@/lib/auth";
import { withErrorHandler } from "@/lib/errorHandler";

export const POST = withErrorHandler(async (request) => {
  const decoded = verifyToken(request);
  const { universityEmail } = await request.json();

  if (!universityEmail) {
    throw new AppError("universityEmail is required", 400);
  }

  const result = await verificationService.submitUniversityEmail(
    decoded.id,
    decoded.email,
    universityEmail
  );

  return NextResponse.json(result);
});
