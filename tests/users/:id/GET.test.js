import { getUserById } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import { verifyToken } from "@/lib/auth";
import { GET } from "@/app/api/v1/users/[id]/route";

jest.mock("@/repositories/userRepository", () => ({
  findById: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  verifyToken: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const USER_IN_DB = {
  id: "user-1",
  email: "test@test.com",
  password: "hashed",
  role: "USER",
  createdAt: "2024-01-01T00:00:00.000Z",
};

function makeParams(id) {
  return { params: Promise.resolve({ id }) };
}

describe("userService.getUserById", () => {
  it("returns user without password", async () => {
    userRepository.findById.mockResolvedValue({
      id: "user-1", email: "test@test.com", password: "hashed", createdAt: new Date(),
    });

    const result = await getUserById("user-1");

    expect(result).not.toHaveProperty("password");
    expect(result.email).toBe("test@test.com");
  });

  it("throws 404 when user not found", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(getUserById("missing")).rejects.toMatchObject({
      message: "User not found",
      statusCode: 404,
    });
  });
});

describe("GET /api/v1/users/:id", () => {
  it("returns 200 when user fetches their own data", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "test@test.com", role: "USER" });
    userRepository.findById.mockResolvedValue(USER_IN_DB);

    const response = await GET({}, makeParams("user-1"));

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveProperty("password");
  });

  it("returns 200 when ADMIN fetches any user", async () => {
    verifyToken.mockReturnValue({ id: "admin-1", email: "admin@test.com", role: "ADMIN" });
    userRepository.findById.mockResolvedValue(USER_IN_DB);

    const response = await GET({}, makeParams("user-1"));

    expect(response.status).toBe(200);
  });

  it("returns 200 when MODERATOR fetches any user", async () => {
    verifyToken.mockReturnValue({ id: "mod-1", email: "mod@test.com", role: "MODERATOR" });
    userRepository.findById.mockResolvedValue(USER_IN_DB);

    const response = await GET({}, makeParams("user-1"));

    expect(response.status).toBe(200);
  });

  it("returns 403 when USER fetches another user's data", async () => {
    verifyToken.mockReturnValue({ id: "user-2", email: "other@test.com", role: "USER" });

    const response = await GET({}, makeParams("user-1"));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: { message: "Forbidden", statusCode: 403 },
    });
  });

  it("returns 401 when request has no token", async () => {
    const { AppError } = require("@/errors/AppError");
    verifyToken.mockImplementation(() => {
      throw new AppError("Unauthorized", 401);
    });

    const response = await GET({}, makeParams("user-1"));

    expect(response.status).toBe(401);
  });

  it("returns 404 when user not found", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "test@test.com", role: "USER" });
    userRepository.findById.mockResolvedValue(null);

    const response = await GET({}, makeParams("user-1"));

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { message: "User not found", statusCode: 404 },
    });
  });
});
