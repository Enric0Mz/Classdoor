import { NextResponse } from "next/server";
import * as reviewService from "@/domain/reviewService";
import { verifyToken } from "@/lib/auth";

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
    const decoded = verifyToken(request);
    const body = await request.json();
    const review = await reviewService.updateReview(id, body, decoded.id);
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
    const decoded = verifyToken(request);
    await reviewService.deleteReview(id, decoded.id);
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
