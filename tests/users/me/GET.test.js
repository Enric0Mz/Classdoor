import * as userRepository from "@/repositories/userRepository";
import { verifyToken } from "@/lib/auth";
import { GET } from "@/app/api/v1/users/me/route";

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

describe("GET /api/v1/users/me", () => {
  it("returns 200 and user without password when token is valid", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "test@test.com", role: "USER" });
    userRepository.findById.mockResolvedValue(USER_IN_DB);

    const response = await GET({});

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveProperty("password");
    expect(response.body.email).toBe("test@test.com");
  });

  it("returns 404 when user no longer exists in the database", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "test@test.com", role: "USER" });
    userRepository.findById.mockResolvedValue(null);

    const response = await GET({});

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { message: "User not found", statusCode: 404 },
    });
  });

  it("returns 401 when verifyToken throws an AppError for missing or invalid token", async () => {
    const { AppError } = require("@/errors/AppError");
    verifyToken.mockImplementation(() => {
      throw new AppError("Unauthorized", 401);
    });

    const response = await GET({});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Unauthorized", statusCode: 401 },
    });
  });

  it("returns 500 when verifyToken throws an unexpected non-AppError", async () => {
    verifyToken.mockImplementation(() => {
      throw new Error("Something went very wrong");
    });

    const response = await GET({});

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
