import { NextResponse } from "next/server";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { withErrorHandler } from "@/lib/errorHandler";
import * as migrationService from "@/domain/migrationService";

export const GET = withErrorHandler(async (request) => {
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const result = await migrationService.getMigrations(status);

  return NextResponse.json(result);
});
