import { requestPasswordReset } from "@/domain/passwordResetService";
import * as userRepository from "@/repositories/userRepository";
import * as passwordResetTokenRepository from "@/repositories/passwordResetTokenRepository";
import * as emailService from "@/lib/emailService";
import { POST } from "@/app/api/v1/users/forgot-password/route";

jest.mock("@/repositories/userRepository", () => ({
  findByEmail: jest.fn(),
}));

jest.mock("@/repositories/passwordResetTokenRepository", () => ({
  create: jest.fn(),
  revokeByUserId: jest.fn(),
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

const USER_IN_DB = {
  id: "user-1",
  email: "test@test.com",
  password: "hashed-password",
  authProvider: "local",
  role: "USER",
};

const GOOGLE_ONLY_USER = {
  id: "user-2",
  email: "google@test.com",
  password: null,
  authProvider: "google",
  role: "USER",
};

beforeEach(() => jest.clearAllMocks());

describe("passwordResetService.requestPasswordReset", () => {
  it("sends reset email when user exists with local auth", async () => {
    userRepository.findByEmail.mockResolvedValue(USER_IN_DB);
    passwordResetTokenRepository.create.mockResolvedValue({});

    const result = await requestPasswordReset("test@test.com");

    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@test.com");
    expect(passwordResetTokenRepository.revokeByUserId).toHaveBeenCalledWith(
      "user-1",
    );
    expect(passwordResetTokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        email: "test@test.com",
      }),
    );
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      "test@test.com",
      expect.any(String),
    );
    expect(result.message).toContain("password reset link has been sent");
  });

  it("returns success silently when email is not found", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await requestPasswordReset("notfound@test.com");

    expect(passwordResetTokenRepository.create).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(result.message).toContain("password reset link has been sent");
  });

  it("returns success silently when user is Google-only auth", async () => {
    userRepository.findByEmail.mockResolvedValue(GOOGLE_ONLY_USER);

    const result = await requestPasswordReset("google@test.com");

    expect(passwordResetTokenRepository.create).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(result.message).toContain("password reset link has been sent");
  });

  it("throws 400 for invalid email format", async () => {
    await expect(requestPasswordReset("not-an-email")).rejects.toMatchObject({
      message: "Invalid email format",
      statusCode: 400,
    });
  });

  it("throws 400 when email is missing", async () => {
    await expect(requestPasswordReset("")).rejects.toMatchObject({
      message: "Invalid email format",
      statusCode: 400,
    });
  });

  it("revokes existing pending tokens before creating a new one", async () => {
    userRepository.findByEmail.mockResolvedValue(USER_IN_DB);
    passwordResetTokenRepository.create.mockResolvedValue({});

    await requestPasswordReset("test@test.com");

    const revokeCallOrder =
      passwordResetTokenRepository.revokeByUserId.mock.invocationCallOrder[0];
    const createCallOrder =
      passwordResetTokenRepository.create.mock.invocationCallOrder[0];
    expect(revokeCallOrder).toBeLessThan(createCallOrder);
  });
});

describe("POST /api/v1/users/forgot-password", () => {
  it("returns 200 with success message for valid email", async () => {
    userRepository.findByEmail.mockResolvedValue(USER_IN_DB);
    passwordResetTokenRepository.create.mockResolvedValue({});

    const response = await POST(makeRequest({ email: "test@test.com" }));

    expect(response.status).toBe(200);
    expect(response.body.message).toContain(
      "password reset link has been sent",
    );
  });

  it("returns 200 even for non-existent email", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const response = await POST(makeRequest({ email: "nobody@test.com" }));

    expect(response.status).toBe(200);
    expect(response.body.message).toContain(
      "password reset link has been sent",
    );
  });

  it("returns 400 for invalid email format", async () => {
    const response = await POST(makeRequest({ email: "bad-email" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Invalid email format", statusCode: 400 },
    });
  });
});
