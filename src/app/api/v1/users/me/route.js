import { NextResponse } from "next/server";
import * as userService from "@/domain/userService";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const decoded = verifyToken(request);
    const user = await userService.getUserById(decoded.id);
    return NextResponse.json(user);
  } catch (error) {
    if (error.statusCode) {
      return NextResponse.json(
        { error: { message: error.message, statusCode: error.statusCode } },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: { message: "Internal server error", statusCode: 500 } },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const decoded = verifyToken(request);
    const body = await request.json();
    const user = await userService.updateUser(decoded.id, body);
    return NextResponse.json(user);
  } catch (error) {
    if (error.statusCode) {
      return NextResponse.json(
        { error: { message: error.message, statusCode: error.statusCode } },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: { message: "Internal server error", statusCode: 500 } },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const decoded = verifyToken(request);
    await userService.deleteUser(decoded.id);
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    if (error.statusCode) {
      return NextResponse.json(
        { error: { message: error.message, statusCode: error.statusCode } },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: { message: "Internal server error", statusCode: 500 } },
      { status: 500 },
    );
  }
}
