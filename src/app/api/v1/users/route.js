import { NextResponse } from "next/server";
import * as userService from "@/domain/userService";
import { verifyToken } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { parsePagination, paginatedResponse } from "@/lib/pagination";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request) => {
  const decoded = verifyToken(request);
  requireRole(decoded, ["ADMIN", "MODERATOR"]);
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const { data, total } = await userService.listUsers({ skip, take: limit });
  return NextResponse.json(paginatedResponse(data, total, page, limit));
});

export const POST = withErrorHandler(async (request) => {
  const body = await request.json();
  const result = await userService.registerUser(body);
  return NextResponse.json(result, { status: 201 });
});
