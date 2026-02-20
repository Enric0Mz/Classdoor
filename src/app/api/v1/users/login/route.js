import { NextResponse } from "next/server";
import * as userService from "@/domain/userService";
import { withErrorHandler } from "@/lib/errorHandler";

export const POST = withErrorHandler(async (request) => {
  const body = await request.json();
  const result = await userService.loginUser(body);
  return NextResponse.json(result);
});
