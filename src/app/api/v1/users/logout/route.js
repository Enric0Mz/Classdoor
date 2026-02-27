import { NextResponse } from "next/server";
import { verifyToken, invalidateRefreshToken } from "@/lib/auth";
import { withErrorHandler } from "@/lib/errorHandler";
import { AppError } from "@/errors/AppError";

export const POST = withErrorHandler(async (request) => {
  verifyToken(request);

  const body = await request.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  await invalidateRefreshToken(refreshToken);

  return NextResponse.json({ message: "Logged out successfully" });
});
