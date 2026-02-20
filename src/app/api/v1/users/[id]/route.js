import { NextResponse } from "next/server";
import * as userService from "@/domain/userService";
import { verifyToken } from "@/lib/auth";
import { requireRole, requireSelfOrRole } from "@/lib/authorization";
import { withErrorHandler } from "@/lib/errorHandler";

export const GET = withErrorHandler(async (request, { params }) => {
  const decoded = verifyToken(request);
  const { id } = await params;
  requireSelfOrRole(decoded, id, ["ADMIN", "MODERATOR"]);
  const user = await userService.getUserById(id);
  return NextResponse.json(user);
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const decoded = verifyToken(request);
  requireRole(decoded, ["ADMIN"]);
  const { id } = await params;
  await userService.deleteUser(id);
  return NextResponse.json({ message: "User deleted" });
});
