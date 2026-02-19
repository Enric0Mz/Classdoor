import { NextResponse } from "next/server";
import { AppError } from "@/errors/AppError";
import * as reviewService from "@/domain/reviewService";
import { verifyToken } from "@/lib/auth";

function tryGetAuthenticatedUser(request) {
  try {
    return verifyToken(request);
  } catch {
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const review = await reviewService.getReviewById(id);
    return NextResponse.json(review);
  } catch (error) {
    if (error.statusCode) {
      return NextResponse.json(
        { error: { message: error.message, statusCode: error.statusCode } },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: { message: "Internal server error", statusCode: 500 } },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const decoded = tryGetAuthenticatedUser(request);
    const body = await request.json();
    const requesterId = decoded ? decoded.id : null;
    const editToken = body.editToken || null;
    const review = await reviewService.updateReview(id, body, requesterId, editToken);
    return NextResponse.json(review);
  } catch (error) {
    if (error.statusCode) {
      return NextResponse.json(
        { error: { message: error.message, statusCode: error.statusCode } },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: { message: "Internal server error", statusCode: 500 } },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const decoded = tryGetAuthenticatedUser(request);
    const body = await request.json().catch(() => ({}));
    const requesterId = decoded ? decoded.id : null;
    const editToken = body.editToken || null;
    await reviewService.deleteReview(id, requesterId, editToken);
    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    if (error.statusCode) {
      return NextResponse.json(
        { error: { message: error.message, statusCode: error.statusCode } },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: { message: "Internal server error", statusCode: 500 } },
      { status: 500 }
    );
  }
}
