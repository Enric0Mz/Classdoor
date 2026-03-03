import { listUsers } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { GET } from "@/app/api/v1/users/route";

jest.mock("@/repositories/userRepository", () => ({
  findAll: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  requireVerifiedUser: jest.fn(),
}));

jest.mock("@/lib/authorization", () => ({
  requireRole: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const USERS = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    email: "a@test.com",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    email: "b@test.com",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

const PAGINATED_USERS = { data: USERS, total: 2 };

const makeRequest = (searchParams = "") => ({
  headers: { get: jest.fn() },
  url: `http://localhost/api/v1/users${searchParams}`,
});

beforeEach(() => jest.clearAllMocks());

describe("userService.listUsers", () => {
  it("returns paginated users from the repository", async () => {
    userRepository.findAll.mockResolvedValue(PAGINATED_USERS);

    const result = await listUsers();

    expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(PAGINATED_USERS);
  });

  it("returns empty data when no users exist", async () => {
    userRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await listUsers();

    expect(result).toEqual({ data: [], total: 0 });
  });
});

describe("GET /api/v1/users", () => {
  it("returns 200 with paginated users when authenticated as ADMIN", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "user-1",
      email: "a@test.com",
      role: "ADMIN",
    });
    requireRole.mockReturnValue(undefined);
    userRepository.findAll.mockResolvedValue(PAGINATED_USERS);

    const response = await GET(makeRequest());

    expect(requireVerifiedUser).toHaveBeenCalled();
    expect(requireRole).toHaveBeenCalledWith(
      { id: "user-1", email: "a@test.com", role: "ADMIN" },
      ["ADMIN", "MODERATOR"],
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: USERS,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  });

  it("returns 200 with correct pagination when page and limit are provided", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "user-1",
      email: "a@test.com",
      role: "ADMIN",
    });
    requireRole.mockReturnValue(undefined);
    userRepository.findAll.mockResolvedValue(PAGINATED_USERS);

    const response = await GET(makeRequest("?page=2&limit=5"));

    expect(userRepository.findAll).toHaveBeenCalledWith({ skip: 5, take: 5 });
    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      page: 2,
      limit: 5,
      total: 2,
      totalPages: 1,
    });
  });

  it("returns 401 when no token provided", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Authentication required", 401);
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Authentication required", statusCode: 401 },
    });
  });

  it("returns 403 when authenticated user has USER role", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockReturnValue({
      id: "user-1",
      email: "a@test.com",
      role: "USER",
    });
    requireRole.mockImplementation(() => {
      throw new AppError("Forbidden: insufficient permissions", 403);
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        message: "Forbidden: insufficient permissions",
        statusCode: 403,
      },
    });
  });

  it("returns 500 on unexpected repository error", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "user-1",
      email: "a@test.com",
      role: "ADMIN",
    });
    requireRole.mockReturnValue(undefined);
    userRepository.findAll.mockRejectedValue(new Error("DB down"));

    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
