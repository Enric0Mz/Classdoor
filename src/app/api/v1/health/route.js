import { NextResponse } from "next/server";
import * as healthService from "@/domain/healthService";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async () => {
  const healthStatus = await healthService.getHealthStatus();

  const httpStatus = healthStatus.status === "healthy" ? 200 : 503;

  return NextResponse.json(healthStatus, { status: httpStatus });
});
