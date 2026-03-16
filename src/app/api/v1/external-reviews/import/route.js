import { NextResponse } from "next/server";
import * as externalReviewService from "@/domain/externalReviewService";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { withErrorHandler } from "@/lib/errorHandler";

export const POST = withErrorHandler(async (request) => {
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);
  const body = await request.json();
  const result = await externalReviewService.importReviews(body);
  return NextResponse.json(result, { status: 201 });
});
