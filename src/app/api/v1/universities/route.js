import { NextResponse } from "next/server";
import * as universityService from "@/domain/universityService";
import { verifyToken } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { parsePagination, paginatedResponse } from "@/lib/pagination";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const { data, total } = await universityService.listUniversities({ skip, take: limit });
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
    requireRole(decoded, ["ADMIN"]);
    const body = await request.json();
    const university = await universityService.createUniversity(body);
    return NextResponse.json(university, { status: 201 });
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
