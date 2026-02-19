import { NextResponse } from "next/server";
import { AppError } from "@/errors/AppError";
import * as verificationService from "@/domain/universityEmailVerificationService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      throw new AppError("token query parameter is required", 400);
    }

    const result = await verificationService.verifyUniversityEmail(token);
    return NextResponse.json(result);
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
