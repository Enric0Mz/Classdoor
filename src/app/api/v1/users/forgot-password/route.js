import { NextResponse } from "next/server";
import * as passwordResetService from "@/domain/passwordResetService";
import { withErrorHandler } from "@/lib/errorHandler";

export const POST = withErrorHandler(async (request) => {
  const { email } = await request.json();
  const result = await passwordResetService.requestPasswordReset(email);
  return NextResponse.json(result);
});
