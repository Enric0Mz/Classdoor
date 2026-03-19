import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/errorHandler";
import { completeGoogleRegistration } from "@/domain/googleAuthService";

export const POST = withErrorHandler(async (request) => {
  const { pendingToken, username } = await request.json();

  const result = await completeGoogleRegistration(pendingToken, username);

  return NextResponse.json({
    user: result.user,
    token: result.token,
    refreshToken: result.refreshToken,
  });
});
