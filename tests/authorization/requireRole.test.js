import { requireRole } from "@/lib/authorization";
import { AppError } from "@/errors/AppError";

describe("requireRole", () => {
  it("does not throw when the user's role is in the allowed list", () => {
    const decodedToken = { id: "user-1", email: "test@test.com", role: "ADMIN" };

    expect(() => requireRole(decodedToken, ["ADMIN"])).not.toThrow();
  });

  it("does not throw when role matches one of multiple allowed roles", () => {
    const decodedToken = { id: "user-1", email: "test@test.com", role: "MODERATOR" };

    expect(() => requireRole(decodedToken, ["ADMIN", "MODERATOR"])).not.toThrow();
  });

  it("throws 403 when the user's role is not in the allowed list", () => {
    const decodedToken = { id: "user-1", email: "test@test.com", role: "USER" };

    expect(() => requireRole(decodedToken, ["ADMIN"])).toThrow(AppError);
    expect(() => requireRole(decodedToken, ["ADMIN"])).toThrow(
      "Forbidden: insufficient permissions"
    );
  });

  it("throws 403 with the correct status code when role is denied", () => {
    const decodedToken = { id: "user-1", email: "test@test.com", role: "USER" };

    try {
      requireRole(decodedToken, ["ADMIN", "MODERATOR"]);
    } catch (error) {
      expect(error.statusCode).toBe(403);
    }
  });
});
