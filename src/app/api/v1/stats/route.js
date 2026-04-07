import { NextResponse } from "next/server";
import * as statsService from "@/domain/statsService";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async () => {
  const stats = await statsService.getPlatformStats();

  return NextResponse.json(stats);
});
