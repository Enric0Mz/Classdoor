import { updateUser } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import bcrypt from "bcrypt";
import { verifyToken } from "@/lib/auth";
import { PUT } from "@/app/api/v1/users/me/route";

jest.mock("@/repositories/userRepository", () => ({
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  update: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  verifyToken: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = (body) => ({
  json: jest.fn().mockResolvedValue(body),
  headers: { get: jest.fn() },
});

const VALID_PASSWORD = "Newpass1!";

beforeEach(() => jest.clearAllMocks());

describe("userService.updateUser", () => {
  it("updates user and strips password", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.update.mockResolvedValue({
      id: "user-1", email: "new@test.com", password: "hashed", createdAt: new Date(),
    });

    const result = await updateUser("user-1", { email: "new@test.com" });

    expect(result).not.toHaveProperty("password");
    expect(result.email).toBe("new@test.com");
  });

  it("throws 409 when email is already taken by another user", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: "user-2", email: "taken@test.com" });

    await expect(updateUser("user-1", { email: "taken@test.com" })).rejects.toMatchObject({
      message: "A user with this email already exists",
      statusCode: 409,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("hashes new password when provided", async () => {
    bcrypt.hash.mockResolvedValue("new-hash");
    userRepository.update.mockResolvedValue({
      id: "user-1", email: "test@test.com", password: "new-hash", createdAt: new Date(),
    });

    await updateUser("user-1", { password: VALID_PASSWORD });

    expect(bcrypt.hash).toHaveBeenCalledWith(VALID_PASSWORD, 10);
    expect(userRepository.update).toHaveBeenCalledWith("user-1", { password: "new-hash" });
  });

  it("throws 400 when email format is invalid", async () => {
    await expect(updateUser("user-1", { email: "not-an-email" })).rejects.toMatchObject({
      message: "Invalid email format",
      statusCode: 400,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("throws 400 when new password is too short (under 8 chars)", async () => {
    await expect(updateUser("user-1", { password: "Aa1!" })).rejects.toMatchObject({
      message: "Password must be at least 8 characters long",
      statusCode: 400,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("throws 400 when new password is too long (over 40 chars)", async () => {
    await expect(
      updateUser("user-1", { password: "Newpass1!" + "a".repeat(32) })
    ).rejects.toMatchObject({
      message: "Password must be at most 40 characters long",
      statusCode: 400,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("throws 400 when new password has no uppercase letter", async () => {
    await expect(updateUser("user-1", { password: "newpass1!" })).rejects.toMatchObject({
      message: "Password must contain at least one uppercase letter",
      statusCode: 400,
    });
  });

  it("throws 400 when new password has no lowercase letter", async () => {
    await expect(updateUser("user-1", { password: "NEWPASS1!" })).rejects.toMatchObject({
      message: "Password must contain at least one lowercase letter",
      statusCode: 400,
    });
  });

  it("throws 400 when new password has no number", async () => {
    await expect(updateUser("user-1", { password: "Newpasss!" })).rejects.toMatchObject({
      message: "Password must contain at least one number",
      statusCode: 400,
    });
  });

  it("throws 400 when new password has no symbol", async () => {
    await expect(updateUser("user-1", { password: "Newpass12" })).rejects.toMatchObject({
      message: "Password must contain at least one symbol",
      statusCode: 400,
    });
  });
});

describe("PUT /api/v1/users/me", () => {
  it("returns 200 with updated user using token id", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "test@test.com" });
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.update.mockResolvedValue({
      id: "user-1", email: "new@test.com", password: "hashed", createdAt: "2024-01-01T00:00:00.000Z",
    });

    const response = await PUT(makeRequest({ email: "new@test.com" }));

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveProperty("password");
    expect(userRepository.update).toHaveBeenCalledWith("user-1", { email: "new@test.com" });
  });

  it("returns 401 when no token provided", async () => {
    const { AppError } = require("@/errors/AppError");
    verifyToken.mockImplementation(() => {
      throw new AppError("Authentication required", 401);
    });

    const response = await PUT(makeRequest({ email: "new@test.com" }));

    expect(response.status).toBe(401);
  });
});
