import { NextResponse } from "next/server";
import * as universityService from "@/domain/universityService";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);

  const search = searchParams.get("search") || undefined;
  const type = searchParams.get("type") || undefined;
  const state = searchParams.get("state") || undefined;

  const { data, total } = await universityService.listUniversities({
    skip,
    take: limit,
    search,
    type,
    state,
  });
  return NextResponse.json(paginatedResponse(data, total, page, limit));
});

export const POST = withErrorHandler(async (request) => {
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);
  const body = await request.json();
  const university = await universityService.createUniversity(body);
  return NextResponse.json(university, { status: 201 });
});
