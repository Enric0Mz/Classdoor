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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get("universityId");
    const reviews = await reviewService.listReviews({ universityId });
    return NextResponse.json(reviews);
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

export async function POST(request) {
  try {
    const decoded = tryGetAuthenticatedUser(request);
    const body = await request.json();
    const authorId = decoded ? decoded.id : null;
    const result = await reviewService.createReview(body, authorId);
    return NextResponse.json(result, { status: 201 });
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
