import { NextResponse } from "next/server";
import * as reviewService from "@/domain/reviewService";
import { verifyToken } from "@/lib/auth";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request, { params }) => {
  const { id } = await params;
  const review = await reviewService.getReviewById(id);
  return NextResponse.json(review);
});

export const PUT = withErrorHandler(async (request, { params }) => {
  const { id } = await params;
  const decoded = verifyToken(request);
  const body = await request.json();
  const review = await reviewService.updateReview(id, body, decoded.id, decoded.role);
  return NextResponse.json(review);
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const { id } = await params;
  const decoded = verifyToken(request);
  await reviewService.deleteReview(id, decoded.id, decoded.role);
  return NextResponse.json({ message: "Review deleted" });
});
