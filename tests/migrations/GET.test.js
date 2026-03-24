import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import * as migrationService from "@/domain/migrationService";
import { GET } from "@/app/api/v1/migrations/route";
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

describe("GET /api/v1/migrations", () => {
  it("returns 200 with pending migrations list", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-id", role: "ADMIN" });
    migrationService.getPendingMigrations.mockResolvedValue({
      pending: ["20260218232852_add_user_role"],
      total: 1,
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      pending: ["20260218232852_add_user_role"],
      total: 1,
    });
  });

  it("returns 200 with empty list when no migrations are pending", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-id", role: "ADMIN" });
    migrationService.getPendingMigrations.mockResolvedValue({
      pending: [],
      total: 0,
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ pending: [], total: 0 });
  });

  it("returns 401 when user is not authenticated", async () => {
    requireVerifiedUser.mockRejectedValue(
      new AppError("Authentication required", 401),
    );

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(requireRole).not.toHaveBeenCalled();
    expect(migrationService.getPendingMigrations).not.toHaveBeenCalled();
  });

  it("returns 403 when user is not an admin", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "user-id", role: "USER" });
    requireRole.mockImplementationOnce(() => {
      throw new AppError("Forbidden", 403);
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(403);
    expect(migrationService.getPendingMigrations).not.toHaveBeenCalled();
  });

  it("returns 500 on unexpected service error", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-id", role: "ADMIN" });
    migrationService.getPendingMigrations.mockRejectedValue(
      new Error("DB down"),
    );

    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
