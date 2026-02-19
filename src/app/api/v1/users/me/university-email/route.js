import { NextResponse } from "next/server";
import { AppError } from "@/errors/AppError";
import * as verificationService from "@/domain/universityEmailVerificationService";
import { verifyToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const decoded = verifyToken(request);
    const { universityEmail } = await request.json();

    if (!universityEmail) {
      throw new AppError("universityEmail is required", 400);
    }

    const result = await verificationService.submitUniversityEmail(
      decoded.id,
      decoded.email,
      universityEmail
    );

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
