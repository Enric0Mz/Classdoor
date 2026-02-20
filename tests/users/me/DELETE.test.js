import { deleteUser } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import { verifyToken } from "@/lib/auth";
import { DELETE } from "@/app/api/v1/users/me/route";

jest.mock("@/repositories/userRepository", () => ({
  findById: jest.fn(),
  deactivate: jest.fn(),
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
    userRepository.deactivate.mockResolvedValue({ id: "user-1" });

    await deleteUser("user-1");

    expect(userRepository.deactivate).toHaveBeenCalledWith("user-1");
  });
});

describe("DELETE /api/v1/users/me", () => {
  it("returns 200 with success message when authenticated", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "test@test.com", role: "USER" });
    userRepository.deactivate.mockResolvedValue({ id: "user-1" });

    const response = await DELETE(makeRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "User deleted" });
    expect(userRepository.deactivate).toHaveBeenCalledWith("user-1");
  });

  it("returns 401 when no token is provided", async () => {
    const { AppError } = require("@/errors/AppError");
    verifyToken.mockImplementation(() => {
      throw new AppError("Authentication required", 401);
    });

    const response = await DELETE(makeRequest());

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Authentication required", statusCode: 401 },
    });
  });
});
