import { registerUser } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import * as emailVerificationRepository from "@/repositories/emailVerificationRepository";
import { sendEmailVerification } from "@/lib/emailService";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import { POST } from "@/app/api/v1/users/route";

jest.mock("@/repositories/userRepository", () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}));

jest.mock("@/repositories/emailVerificationRepository", () => ({
  create: jest.fn(),
  deleteByUserId: jest.fn(),
}));

jest.mock("@/lib/emailService", () => ({
  sendEmailVerification: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  signToken: jest.fn(),
  createRefreshToken: jest.fn().mockResolvedValue("mock-refresh-token"),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = (body) => ({ json: jest.fn().mockResolvedValue(body) });

const VALID_PASSWORD = "Secret1!";

beforeEach(() => jest.clearAllMocks());

describe("userService.registerUser", () => {
  it("registers a user with username and password (no email)", async () => {
    const created = {
      id: "user-1",
      email: null,
      username: "AgilOnca123",
      password: "hashed",
      role: "USER",
      createdAt: new Date(),
    };
    userRepository.findByUsername.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");

    const result = await registerUser({ username: "AgilOnca123", password: VALID_PASSWORD });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ username: "AgilOnca123", password: "hashed" })
    );
    expect(signToken).toHaveBeenCalledWith({ id: "user-1", email: null, role: "USER" });
    expect(result.user).not.toHaveProperty("password");
    expect(result.token).toBe("jwt-token");
  });

  it("registers a user with username, password, and email", async () => {
    const created = {
      id: "user-2",
      email: "test@test.com",
      username: "AgilOnca123",
      password: "hashed",
      role: "USER",
      createdAt: new Date(),
    };
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findById.mockResolvedValue({ id: "user-2", emailVerified: false });
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);
    emailVerificationRepository.create.mockResolvedValue({ id: "verif-1" });
    sendEmailVerification.mockResolvedValue(undefined);

    const result = await registerUser({ username: "AgilOnca123", email: "test@test.com", password: VALID_PASSWORD });

    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@test.com");
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@test.com", password: "hashed", username: "AgilOnca123" })
    );
    expect(result.user).not.toHaveProperty("password");
    expect(result.token).toBe("jwt-token");
  });

  it("sends a verification email after registering with an email", async () => {
    const created = {
      id: "user-2",
      email: "test@test.com",
      username: "AgilOnca123",
      password: "hashed",
      role: "USER",
      createdAt: new Date(),
    };
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findById.mockResolvedValue({ id: "user-2", emailVerified: false });
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);
    emailVerificationRepository.create.mockResolvedValue({ id: "verif-1" });
    sendEmailVerification.mockResolvedValue(undefined);

    await registerUser({ username: "AgilOnca123", email: "test@test.com", password: VALID_PASSWORD });

    expect(sendEmailVerification).toHaveBeenCalledWith("test@test.com", expect.any(String));
  });

  it("does not send a verification email for anonymous registration (no email)", async () => {
    const created = {
      id: "user-1",
      email: null,
      username: "AgilOnca123",
      password: "hashed",
      role: "USER",
      createdAt: new Date(),
    };
    userRepository.findByUsername.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");

    await registerUser({ username: "AgilOnca123", password: VALID_PASSWORD });

    expect(sendEmailVerification).not.toHaveBeenCalled();
  });

  it("auto-generates username when not provided", async () => {
    const created = {
      id: "user-3",
      email: null,
      username: "BravoCapivara347",
      password: "hashed",
      role: "USER",
      createdAt: new Date(),
    };
    userRepository.findByUsername.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");

    const result = await registerUser({ password: VALID_PASSWORD });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ username: expect.any(String), password: "hashed" })
    );
    expect(result.user).toHaveProperty("username");
  });

  it("throws 400 when password is missing", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({ username: "AgilOnca123" })).rejects.toMatchObject({
      message: "Password is required",
      statusCode: 400,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when password is too short (under 8 chars)", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({ username: "AgilOnca123", password: "Aa1!" })).rejects.toMatchObject({
      message: "Password must be at least 8 characters long",
      statusCode: 400,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when password is too long (over 40 chars)", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(
      registerUser({ username: "AgilOnca123", password: "Secret1!" + "a".repeat(33) })
    ).rejects.toMatchObject({
      message: "Password must be at most 40 characters long",
      statusCode: 400,
    });
  });

  it("throws 400 when password has no uppercase letter", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({ username: "AgilOnca123", password: "secret1!" })).rejects.toMatchObject({
      message: "Password must contain at least one uppercase letter",
      statusCode: 400,
    });
  });

  it("throws 400 when password has no lowercase letter", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({ username: "AgilOnca123", password: "SECRET1!" })).rejects.toMatchObject({
      message: "Password must contain at least one lowercase letter",
      statusCode: 400,
    });
  });

  it("throws 400 when password has no number", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({ username: "AgilOnca123", password: "Secrettt!" })).rejects.toMatchObject({
      message: "Password must contain at least one number",
      statusCode: 400,
    });
  });

  it("throws 400 when password has no symbol", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({ username: "AgilOnca123", password: "Secret123" })).rejects.toMatchObject({
      message: "Password must contain at least one symbol",
      statusCode: 400,
    });
  });

  it("throws 400 when email format is invalid", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(
      registerUser({ username: "AgilOnca123", email: "not-an-email", password: VALID_PASSWORD })
    ).rejects.toMatchObject({
      message: "Invalid email format",
      statusCode: 400,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 409 when email already exists", async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue({ id: "user-1", email: "test@test.com" });

    await expect(
      registerUser({ username: "AgilOnca123", email: "test@test.com", password: VALID_PASSWORD })
    ).rejects.toMatchObject({
      message: "A user with this email already exists",
      statusCode: 409,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 409 when username already exists", async () => {
    userRepository.findByUsername.mockResolvedValue({ id: "user-1", username: "AgilOnca123" });

    await expect(registerUser({ username: "AgilOnca123", password: VALID_PASSWORD })).rejects.toMatchObject({
      message: "A user with this username already exists",
      statusCode: 409,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });


});

describe("POST /api/v1/users", () => {
  it("returns 201 with user and token (no email)", async () => {
    const created = {
      id: "user-1",
      email: null,
      username: "AgilOnca123",
      password: "hashed",
      role: "USER",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    userRepository.findByUsername.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");

    const response = await POST(makeRequest({ username: "AgilOnca123", password: VALID_PASSWORD }));

    expect(response.status).toBe(201);
    expect(response.body.token).toBe("jwt-token");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("returns 201 with user and token (with email)", async () => {
    const created = {
      id: "user-2",
      email: "test@test.com",
      username: "AgilOnca123",
      password: "hashed",
      role: "USER",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findById.mockResolvedValue({ id: "user-2", emailVerified: false });
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);
    emailVerificationRepository.create.mockResolvedValue({ id: "verif-1" });
    sendEmailVerification.mockResolvedValue(undefined);

    const response = await POST(makeRequest({ username: "AgilOnca123", email: "test@test.com", password: VALID_PASSWORD }));

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("test@test.com");
  });

  it("returns 400 when password is missing", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    const response = await POST(makeRequest({ username: "AgilOnca123" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Password is required", statusCode: 400 },
    });
  });

  it("returns 400 when password does not meet complexity rules", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    const response = await POST(makeRequest({ username: "AgilOnca123", password: "nouppercase1!" }));

    expect(response.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue({ id: "user-1", email: "test@test.com" });

    const response = await POST(makeRequest({ username: "AgilOnca123", email: "test@test.com", password: VALID_PASSWORD }));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: { message: "A user with this email already exists", statusCode: 409 },
    });
  });
});
