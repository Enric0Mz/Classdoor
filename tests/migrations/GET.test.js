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
  getMigrations: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = (status) => ({
  headers: { get: jest.fn() },
  url: `http://localhost/api/v1/migrations${status ? `?status=${status}` : ""}`,
});

beforeEach(() => jest.clearAllMocks());

describe("GET /api/v1/migrations", () => {
  it("returns 200 with pending migrations when status=pending", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-id", role: "ADMIN" });
    migrationService.getMigrations.mockResolvedValue({
      migrations: ["20260218232852_add_user_role"],
      total: 1,
      status: "pending",
    });

    const response = await GET(makeRequest("pending"));

    expect(response.status).toBe(200);
    expect(migrationService.getMigrations).toHaveBeenCalledWith("pending");
  });

  it("returns 200 with applied migrations when status=applied", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-id", role: "ADMIN" });
    migrationService.getMigrations.mockResolvedValue({
      migrations: ["20260217232444_switch_to_postgres"],
      total: 1,
      status: "applied",
    });

    const response = await GET(makeRequest("applied"));

    expect(response.status).toBe(200);
    expect(migrationService.getMigrations).toHaveBeenCalledWith("applied");
  });

  it("returns 200 with all migrations when no status filter", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-id", role: "ADMIN" });
    migrationService.getMigrations.mockResolvedValue({
      migrations: [
        { name: "20260217232444_switch_to_postgres", status: "applied" },
      ],
      total: 1,
      status: "all",
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(200);
    expect(migrationService.getMigrations).toHaveBeenCalledWith(null);
  });

  it("returns 401 when user is not authenticated", async () => {
    requireVerifiedUser.mockRejectedValue(
      new AppError("Authentication required", 401),
    );

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(requireRole).not.toHaveBeenCalled();
    expect(migrationService.getMigrations).not.toHaveBeenCalled();
  });

  it("returns 403 when user is not an admin", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "user-id", role: "USER" });
    requireRole.mockImplementationOnce(() => {
      throw new AppError("Forbidden", 403);
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(403);
    expect(migrationService.getMigrations).not.toHaveBeenCalled();
  });

  it("returns 500 on unexpected service error", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-id", role: "ADMIN" });
    migrationService.getMigrations.mockRejectedValue(new Error("DB down"));

    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
