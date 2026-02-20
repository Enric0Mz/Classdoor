import { NextResponse } from "next/server";
import { AppError } from "@/errors/AppError";
import * as verificationService from "@/domain/universityEmailVerificationService";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    throw new AppError("token query parameter is required", 400);
  }

  const result = await verificationService.verifyUniversityEmail(token);
  return NextResponse.json(result);
});
