import { AppError } from "@/errors/AppError";

const MINIMUM_PASSWORD_LENGTH = 8;
const MAXIMUM_PASSWORD_LENGTH = 40;

export function validatePassword(password) {
  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    throw new AppError(
      `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters long`,
      400,
    );
  }
  if (password.length > MAXIMUM_PASSWORD_LENGTH) {
    throw new AppError(
      `Password must be at most ${MAXIMUM_PASSWORD_LENGTH} characters long`,
      400,
    );
  }
  if (!/[A-Z]/.test(password)) {
    throw new AppError(
      "Password must contain at least one uppercase letter",
      400,
    );
  }
  if (!/[a-z]/.test(password)) {
    throw new AppError(
      "Password must contain at least one lowercase letter",
      400,
    );
  }
  if (!/[0-9]/.test(password)) {
    throw new AppError("Password must contain at least one number", 400);
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new AppError("Password must contain at least one symbol", 400);
  }
}
