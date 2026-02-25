import { NextResponse } from "next/server";
import * as courseService from "@/domain/courseService";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request, { params }) => {
  const { id } = await params;
  const course = await courseService.getCourseById(id);
  return NextResponse.json(course);
});

export const PUT = withErrorHandler(async (request, { params }) => {
  const { id } = await params;
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);
  const body = await request.json();
  const course = await courseService.updateCourse(id, body);
  return NextResponse.json(course);
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const { id } = await params;
  const decoded = await requireVerifiedUser(request);
  requireRole(decoded, ["ADMIN"]);
  await courseService.deleteCourse(id);
  return NextResponse.json({ message: "Course deleted" });
});
