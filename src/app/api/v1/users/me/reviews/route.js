import { NextResponse } from "next/server";
import * as reviewService from "@/domain/reviewService";
import { requireVerifiedUser } from "@/lib/auth";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request) => {
  const decoded = await requireVerifiedUser(request);

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);

  const { data, total } = await reviewService.listReviewsByAuthor({
    authorId: decoded.id,
    skip,
    take: limit,
  });

  return NextResponse.json(paginatedResponse(data, total, page, limit));
});
