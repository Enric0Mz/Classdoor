import { requireRole, requireSelfOrRole } from "@/lib/authorization";
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

describe("requireSelfOrRole", () => {
  it("does not throw when the user is accessing their own resource", () => {
    const decodedToken = { id: "user-1", role: "USER" };

    expect(() => requireSelfOrRole(decodedToken, "user-1", ["ADMIN"])).not.toThrow();
  });

  it("does not throw when the user has an allowed role", () => {
    const decodedToken = { id: "admin-1", role: "ADMIN" };

    expect(() => requireSelfOrRole(decodedToken, "user-1", ["ADMIN"])).not.toThrow();
  });

  it("does not throw when the user has one of multiple allowed roles", () => {
    const decodedToken = { id: "mod-1", role: "MODERATOR" };

    expect(() => requireSelfOrRole(decodedToken, "user-1", ["ADMIN", "MODERATOR"])).not.toThrow();
  });

  it("throws 403 when the user is not the owner and lacks an allowed role", () => {
    const decodedToken = { id: "user-2", role: "USER" };

    expect(() => requireSelfOrRole(decodedToken, "user-1", ["ADMIN"])).toThrow(AppError);
    expect(() => requireSelfOrRole(decodedToken, "user-1", ["ADMIN"])).toThrow("Forbidden");
  });

  it("throws 403 with the correct status code", () => {
    const decodedToken = { id: "user-2", role: "USER" };

    try {
      requireSelfOrRole(decodedToken, "user-1", ["ADMIN"]);
    } catch (error) {
      expect(error.statusCode).toBe(403);
    }
  });
});
