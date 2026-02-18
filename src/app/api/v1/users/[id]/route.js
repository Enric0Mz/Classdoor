import { NextResponse } from "next/server";
import { AppError } from "@/errors/AppError";
import * as userService from "@/domain/userService";
import { verifyToken } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
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

export async function DELETE(request, { params }) {
  try {
    const decoded = verifyToken(request);
    const { id } = await params;
    const isAdmin = decoded.role === "ADMIN";
    if (!isAdmin && decoded.id !== id) {
      throw new AppError("Forbidden", 403);
    }
    await userService.deleteUser(id);
    return NextResponse.json({ message: "User deleted" });
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
