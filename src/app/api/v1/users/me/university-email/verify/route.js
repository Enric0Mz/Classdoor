import { NextResponse } from "next/server";
import { AppError } from "@/errors/AppError";
import * as verificationService from "@/domain/universityEmailVerificationService";
import { withErrorHandler } from "@/lib/errorHandler";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(async (request) => {
  const body = await request.json();
  const { token } = body;

  if (!token) {
    throw new AppError("token is required", 400);
  }

  const result = await verificationService.verifyUniversityEmail(token);
  return NextResponse.json(result);
});
