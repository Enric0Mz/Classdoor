import { AppError } from "@/errors/AppError";

export function requireRole(decodedToken, allowedRoles) {
  if (!allowedRoles.includes(decodedToken.role)) {
    throw new AppError("Forbidden: insufficient permissions", 403);
  }
}

export function requireSelfOrRole(decodedToken, resourceOwnerId, allowedRoles) {
  const hasAllowedRole = allowedRoles.includes(decodedToken.role);
  const isSelf = decodedToken.id === resourceOwnerId;
  if (!hasAllowedRole && !isSelf) {
    throw new AppError("Forbidden", 403);
  }
}
