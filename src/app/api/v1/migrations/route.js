import { NextResponse } from "next/server";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { withErrorHandler } from "@/lib/errorHandler";
import * as migrationService from "@/domain/migrationService";

export const GET = withErrorHandler(async (request) => {
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);

  const result = await migrationService.getPendingMigrations();

  return NextResponse.json(result);
});

export const POST = withErrorHandler(async (request) => {
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);

  const result = await migrationService.runPendingMigrations();

  return NextResponse.json(result);
});
