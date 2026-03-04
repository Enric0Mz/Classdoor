import { NextResponse } from "next/server";
import * as universitySubmissionService from "@/domain/universitySubmissionService";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request, { params }) => {
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN", "MODERATOR"]);

  const { id } = await params;
  const submission = await universitySubmissionService.getSubmissionById(id);

  return NextResponse.json(submission);
});
