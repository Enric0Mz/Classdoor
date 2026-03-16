import { NextResponse } from "next/server";
import * as externalReviewService from "@/domain/externalReviewService";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const universityId = searchParams.get("universityId");
  const { page, limit, skip } = parsePagination(searchParams);
  const { data, total } = await externalReviewService.listByUniversity({
    universityId,
    skip,
    take: limit,
  });
  return NextResponse.json(paginatedResponse(data, total, page, limit));
});
