import { NextResponse } from "next/server";
import * as reviewService from "@/domain/reviewService";
import { requireVerifiedUser } from "@/lib/auth";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const universityId = searchParams.get("universityId");
  const { page, limit, skip } = parsePagination(searchParams);
  const { data, total } = await reviewService.listReviews({ universityId, skip, take: limit });
  return NextResponse.json(paginatedResponse(data, total, page, limit));
});

export const POST = withErrorHandler(async (request) => {
  const decoded = await requireVerifiedUser(request);
  const body = await request.json();
  const result = await reviewService.createReview(body, decoded.id);
  return NextResponse.json(result, { status: 201 });
});
