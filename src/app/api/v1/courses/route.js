import { NextResponse } from "next/server";
import * as courseService from "@/domain/courseService";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const { page, limit, skip } = parsePagination(searchParams);
  const { data, total } = await courseService.listCourses({
    skip,
    take: limit,
    category,
  });
  return NextResponse.json(paginatedResponse(data, total, page, limit));
});

export const POST = withErrorHandler(async (request) => {
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);
  const body = await request.json();
  const course = await courseService.createCourse(body, decoded.id);
  return NextResponse.json(course, { status: 201 });
});
