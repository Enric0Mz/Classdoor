import { resetPassword } from "@/domain/passwordResetService";
import * as passwordResetTokenRepository from "@/repositories/passwordResetTokenRepository";
import * as userRepository from "@/repositories/userRepository";
import * as refreshTokenRepository from "@/repositories/refreshTokenRepository";
import bcrypt from "bcryptjs";
import { PUT } from "@/app/api/v1/users/reset-password/route";

jest.mock("@/repositories/passwordResetTokenRepository", () => ({
  markAsUsed: jest.fn(),
}));

jest.mock("@/repositories/userRepository", () => ({
  update: jest.fn(),
}));

jest.mock("@/repositories/refreshTokenRepository", () => ({
  deleteAllByUserId: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-new-password"),
}));

jest.mock("@/lib/emailService", () => ({
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = (body) => ({ json: jest.fn().mockResolvedValue(body) });

const VALID_PASSWORD = "StrongPass1!";

const VALID_TOKEN_RECORD = {
  id: "token-1",
  userId: "user-1",
  email: "test@test.com",
  token: "valid-token",
  status: "USED",
  expiresAt: new Date(Date.now() + 3600000),
};

beforeEach(() => jest.clearAllMocks());

describe("passwordResetService.resetPassword", () => {
  it("resets password successfully with valid token and password", async () => {
    passwordResetTokenRepository.markAsUsed.mockResolvedValue({
      record: VALID_TOKEN_RECORD,
      alreadyUsed: false,
    });

    const result = await resetPassword("valid-token", VALID_PASSWORD);

    expect(passwordResetTokenRepository.markAsUsed).toHaveBeenCalledWith(
      "valid-token",
    );
    expect(bcrypt.hash).toHaveBeenCalledWith(VALID_PASSWORD, 10);
    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      password: "hashed-new-password",
    });
    expect(refreshTokenRepository.deleteAllByUserId).toHaveBeenCalledWith(
      "user-1",
    );
    expect(result.message).toBe("Password reset successfully");
  });

  it("throws 400 for invalid or not found token", async () => {
    passwordResetTokenRepository.markAsUsed.mockResolvedValue({
      record: null,
      alreadyUsed: false,
    });

    await expect(
      resetPassword("invalid-token", VALID_PASSWORD),
    ).rejects.toMatchObject({
      message: "Invalid or expired reset token",
      statusCode: 400,
    });
  });

  it("throws 400 for already used token", async () => {
    passwordResetTokenRepository.markAsUsed.mockResolvedValue({
      record: VALID_TOKEN_RECORD,
      alreadyUsed: true,
    });

    await expect(
      resetPassword("used-token", VALID_PASSWORD),
    ).rejects.toMatchObject({
      message: "This reset link has already been used",
      statusCode: 400,
    });
  });

  it("throws 400 when token is missing", async () => {
    await expect(resetPassword("", VALID_PASSWORD)).rejects.toMatchObject({
      message: "Token is required",
      statusCode: 400,
    });
  });

  it("throws 400 when new password is missing", async () => {
    await expect(resetPassword("valid-token", "")).rejects.toMatchObject({
      message: "New password is required",
      statusCode: 400,
    });
  });

  it("throws 400 for password too short", async () => {
    await expect(resetPassword("valid-token", "Ab1!")).rejects.toMatchObject({
      message: expect.stringContaining("at least"),
      statusCode: 400,
    });
  });

  it("throws 400 for password without uppercase", async () => {
    await expect(
      resetPassword("valid-token", "lowercase1!"),
    ).rejects.toMatchObject({
      message: expect.stringContaining("uppercase"),
      statusCode: 400,
    });
  });

  it("throws 400 for password without symbol", async () => {
    await expect(
      resetPassword("valid-token", "NoSymbol123"),
    ).rejects.toMatchObject({
      message: expect.stringContaining("symbol"),
      statusCode: 400,
    });
  });

  it("invalidates all refresh tokens after successful reset", async () => {
    passwordResetTokenRepository.markAsUsed.mockResolvedValue({
      record: VALID_TOKEN_RECORD,
      alreadyUsed: false,
    });

    await resetPassword("valid-token", VALID_PASSWORD);

    expect(refreshTokenRepository.deleteAllByUserId).toHaveBeenCalledWith(
      "user-1",
    );
  });

  it("hashes the new password before storing", async () => {
    passwordResetTokenRepository.markAsUsed.mockResolvedValue({
      record: VALID_TOKEN_RECORD,
      alreadyUsed: false,
    });

    await resetPassword("valid-token", VALID_PASSWORD);

    expect(bcrypt.hash).toHaveBeenCalledWith(VALID_PASSWORD, 10);
    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      password: "hashed-new-password",
    });
  });
});

describe("PUT /api/v1/users/reset-password", () => {
  it("returns 200 on successful reset", async () => {
    passwordResetTokenRepository.markAsUsed.mockResolvedValue({
      record: VALID_TOKEN_RECORD,
      alreadyUsed: false,
    });

    const response = await PUT(
      makeRequest({ token: "valid-token", newPassword: VALID_PASSWORD }),
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Password reset successfully");
  });

  it("returns 400 for invalid token", async () => {
    passwordResetTokenRepository.markAsUsed.mockResolvedValue({
      record: null,
      alreadyUsed: false,
    });

    const response = await PUT(
      makeRequest({ token: "bad-token", newPassword: VALID_PASSWORD }),
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        message: "Invalid or expired reset token",
        statusCode: 400,
      },
    });
  });

  it("returns 400 for weak password", async () => {
    const response = await PUT(
      makeRequest({ token: "valid-token", newPassword: "weak" }),
    );

    expect(response.status).toBe(400);
    expect(response.body.error.statusCode).toBe(400);
  });
});
