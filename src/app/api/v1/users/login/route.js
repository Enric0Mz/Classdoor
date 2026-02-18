import { NextResponse } from "next/server";
import * as userService from "@/domain/userService";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await userService.loginUser(body);
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
