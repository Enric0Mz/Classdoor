import { NextResponse } from "next/server";
import * as universityService from "@/domain/universityService";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request, { params }) => {
  const { id } = await params;
  const university = await universityService.getUniversityById(id);
  return NextResponse.json(university);
});

export const PUT = withErrorHandler(async (request, { params }) => {
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const { id } = await params;
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);
  await universityService.deleteUniversity(id);
  return NextResponse.json({ message: "University deleted" });
});
