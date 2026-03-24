import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import * as migrationService from "@/domain/migrationService";
import { POST } from "@/app/api/v1/migrations/route";
import { AppError } from "@/errors/AppError";

jest.mock("@/lib/auth", () => ({
  requireVerifiedUser: jest.fn(),
}));

jest.mock("@/lib/authorization", () => ({
  requireRole: jest.fn(),
}));

jest.mock("@/domain/migrationService", () => ({
  getPendingMigrations: jest.fn(),
  runPendingMigrations: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = () => ({ headers: { get: jest.fn() } });

beforeEach(() => jest.clearAllMocks());

describe("POST /api/v1/migrations", () => {
  it("returns 200 when migrations are run successfully", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-id", role: "ADMIN" });
    migrationService.runPendingMigrations.mockResolvedValue({
      message: "Migrations applied successfully",
      migrationsRun: 2,
      output: "2 migrations applied.",
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Migrations applied successfully",
      migrationsRun: 2,
      output: "2 migrations applied.",
    });
  });

  it("returns 200 with no-op message when nothing is pending", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-id", role: "ADMIN" });
    migrationService.runPendingMigrations.mockResolvedValue({
      message: "No pending migrations",
      migrationsRun: 0,
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "No pending migrations",
      migrationsRun: 0,
    });
  });

  it("returns 401 when user is not authenticated", async () => {
    requireVerifiedUser.mockRejectedValue(
      new AppError("Authentication required", 401),
    );

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(requireRole).not.toHaveBeenCalled();
    expect(migrationService.runPendingMigrations).not.toHaveBeenCalled();
  });

  it("returns 403 when user is not an admin", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "user-id", role: "USER" });
    requireRole.mockImplementationOnce(() => {
      throw new AppError("Forbidden", 403);
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(403);
    expect(migrationService.runPendingMigrations).not.toHaveBeenCalled();
  });

  it("returns 500 when the migrate deploy command fails", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-id", role: "ADMIN" });
    migrationService.runPendingMigrations.mockRejectedValue(
      new Error("Command failed"),
    );

    const response = await POST(makeRequest());

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
