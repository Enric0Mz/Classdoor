import { NextResponse } from "next/server";
import * as universityService from "@/domain/universityService";

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
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

export async function DELETE(request, { params }) {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
