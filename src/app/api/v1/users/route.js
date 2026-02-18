import { NextResponse } from "next/server";
import * as userService from "@/domain/userService";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    verifyToken(request);
    const users = await userService.listUsers();
    return NextResponse.json(users);
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
    const body = await request.json();
    const result = await userService.registerUser(body);
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
