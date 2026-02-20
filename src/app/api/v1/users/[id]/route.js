import { NextResponse } from "next/server";
import { AppError } from "@/errors/AppError";
import * as userService from "@/domain/userService";
import { verifyToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const decoded = verifyToken(request);
    const { id } = await params;
    const isAdminOrModerator = ["ADMIN", "MODERATOR"].includes(decoded.role);
    if (!isAdminOrModerator && decoded.id !== id) {
      throw new AppError("Forbidden", 403);
    }
    const user = await userService.getUserById(id);
    return NextResponse.json(user);
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

