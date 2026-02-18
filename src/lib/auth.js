import jwt from "jsonwebtoken";
import { AppError } from "@/errors/AppError";

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken({ id, email }) {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(request) {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = header.slice(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}
