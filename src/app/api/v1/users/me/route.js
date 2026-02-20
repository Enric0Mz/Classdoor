import { NextResponse } from "next/server";
import * as userService from "@/domain/userService";
import { verifyToken } from "@/lib/auth";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request) => {
  const decoded = verifyToken(request);
  const user = await userService.getUserById(decoded.id);
  return NextResponse.json(user);
});

export const PUT = withErrorHandler(async (request) => {
  const decoded = verifyToken(request);
  const body = await request.json();
  const user = await userService.updateUser(decoded.id, body);
  return NextResponse.json(user);
});

export const DELETE = withErrorHandler(async (request) => {
  const decoded = verifyToken(request);
  await userService.deleteUser(decoded.id);
  return NextResponse.json({ message: "User deleted" });
});
