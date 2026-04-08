import { NextResponse } from "next/server";
import * as passwordResetService from "@/domain/passwordResetService";
import { withErrorHandler } from "@/lib/errorHandler";

export const PUT = withErrorHandler(async (request) => {
  const { token, newPassword } = await request.json();
  const result = await passwordResetService.resetPassword(token, newPassword);
  return NextResponse.json(result);
});
