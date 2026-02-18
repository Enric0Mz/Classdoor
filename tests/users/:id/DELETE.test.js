import { deleteUser } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import { verifyToken } from "@/lib/auth";
import { DELETE } from "@/app/api/v1/users/[id]/route";

jest.mock("@/repositories/userRepository", () => ({
  remove: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  verifyToken: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = () => ({
  headers: { get: jest.fn() },
});

beforeEach(() => jest.clearAllMocks());

describe("userService.deleteUser", () => {
  it("deletes the user", async () => {
    userRepository.remove.mockResolvedValue({ id: "user-1" });

    await deleteUser("user-1");

    expect(userRepository.remove).toHaveBeenCalledWith("user-1");
  });
});

describe("DELETE /api/v1/users/:id", () => {
  it("returns 200 with success message", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "test@test.com" });
    userRepository.remove.mockResolvedValue({ id: "user-1" });

    const response = await DELETE(
      makeRequest(),
      { params: Promise.resolve({ id: "user-1" }) }
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "User deleted" });
  });

  it("returns 401 when no token provided", async () => {
    const { AppError } = require("@/errors/AppError");
    verifyToken.mockImplementation(() => {
      throw new AppError("Authentication required", 401);
    });

    const response = await DELETE(
      makeRequest(),
      { params: Promise.resolve({ id: "user-1" }) }
    );

    expect(response.status).toBe(401);
  });

  it("returns 403 when token user does not match", async () => {
    verifyToken.mockReturnValue({ id: "other-user", email: "other@test.com" });

    const response = await DELETE(
      makeRequest(),
      { params: Promise.resolve({ id: "user-1" }) }
    );

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: { message: "Forbidden", statusCode: 403 },
    });
  });
});
