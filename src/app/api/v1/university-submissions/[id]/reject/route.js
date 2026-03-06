import { NextResponse } from "next/server";
import * as universitySubmissionService from "@/domain/universitySubmissionService";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { withErrorHandler } from "@/lib/errorHandler";

export const PUT = withErrorHandler(async (request, { params }) => {
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);

  const { id } = await params;
  const body = await request.json();

  const submission = await universitySubmissionService.rejectSubmission(
    id,
    decoded.id,
    body.reason,
  );

  return NextResponse.json(submission);
});
