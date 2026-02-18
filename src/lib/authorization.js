import { AppError } from "@/errors/AppError";

export function requireRole(decodedToken, allowedRoles) {
  if (!allowedRoles.includes(decodedToken.role)) {
    throw new AppError("Forbidden: insufficient permissions", 403);
  }
}
