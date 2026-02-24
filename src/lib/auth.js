import jwt from "jsonwebtoken";
import { AppError } from "@/errors/AppError";
import * as userRepository from "@/repositories/userRepository";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "Fatal Error: JWT_SECRET environment variable is not defined.",
  );
}

export function signToken({ id, email, role }) {
  return jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: "7d" });
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

export async function requireVerifiedUser(request) {
  const decoded = verifyToken(request);
  const user = await userRepository.findById(decoded.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (!user.emailVerified) {
    throw new AppError("Email verification required", 403);
  }

  return decoded;
}
