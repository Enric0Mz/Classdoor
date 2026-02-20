import { NextResponse } from "next/server";
import * as universityService from "@/domain/universityService";
import { verifyToken } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const university = await universityService.getUniversityById(id);
    return NextResponse.json(university);
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
    const decoded = verifyToken(request);
    requireRole(decoded, ["ADMIN"]);
    return NextResponse.json({ message: "Not implemented" }, { status: 501 });
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
    const decoded = verifyToken(request);
    requireRole(decoded, ["ADMIN"]);
    return NextResponse.json({ message: "Not implemented" }, { status: 501 });
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
