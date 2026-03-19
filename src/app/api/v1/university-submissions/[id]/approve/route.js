import { NextResponse } from "next/server";
import * as universitySubmissionService from "@/domain/universitySubmissionService";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { withErrorHandler } from "@/lib/errorHandler";

export const PUT = withErrorHandler(async (request, { params }) => {
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);

  const { id } = await params;
  const contentLength = request.headers.get("content-length");
  const hasBody = contentLength && contentLength !== "0";
  const body = hasBody ? await request.json() : {};

  const submission = await universitySubmissionService.approveSubmission(
    id,
    decoded.id,
    { universityId: body.universityId, emailDomain: body.emailDomain },
  );

  return NextResponse.json(submission);
});
