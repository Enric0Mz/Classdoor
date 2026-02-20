import { NextResponse } from "next/server";
import * as reviewService from "@/domain/reviewService";
import { verifyToken } from "@/lib/auth";
import { parsePagination, paginatedResponse } from "@/lib/pagination";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get("universityId");
    const { page, limit, skip } = parsePagination(searchParams);
    const { data, total } = await reviewService.listReviews({ universityId, skip, take: limit });
    return NextResponse.json(paginatedResponse(data, total, page, limit));
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
    const decoded = verifyToken(request);
    const body = await request.json();
    const result = await reviewService.createReview(body, decoded.id);
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
