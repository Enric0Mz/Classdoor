import { NextResponse } from "next/server";
import * as universitySubmissionService from "@/domain/universitySubmissionService";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request) => {
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN", "MODERATOR"]);

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status") || undefined;

  const { data, total } = await universitySubmissionService.listSubmissions({
    skip,
    take: limit,
    status,
  });

  return NextResponse.json(paginatedResponse(data, total, page, limit));
});

export const POST = withErrorHandler(async (request) => {
  const decoded = await requireVerifiedUser(request);
  const body = await request.json();

  const submission = await universitySubmissionService.createSubmission(
    body,
    decoded.id,
  );

  return NextResponse.json(submission, { status: 201 });
});
