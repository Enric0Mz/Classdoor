import { NextResponse } from "next/server";
import { rotateRefreshToken } from "@/lib/auth";
import { withErrorHandler } from "@/lib/errorHandler";
import { AppError } from "@/errors/AppError";

export const POST = withErrorHandler(async (request) => {
  const body = await request.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  const tokens = await rotateRefreshToken(refreshToken);

  return NextResponse.json({
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});
