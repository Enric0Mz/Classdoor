import { NextResponse } from "next/server";
import * as universitySubmissionService from "@/domain/universitySubmissionService";
import { requireVerifiedUser } from "@/lib/auth";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request) => {
  const decoded = await requireVerifiedUser(request);

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);

  const { data, total } =
    await universitySubmissionService.listSubmissionsByUser(decoded.id, {
      skip,
      take: limit,
    });

  return NextResponse.json(paginatedResponse(data, total, page, limit));
});
