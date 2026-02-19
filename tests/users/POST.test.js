import { registerUser } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import { POST } from "@/app/api/v1/users/route";

jest.mock("@/repositories/userRepository", () => ({
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  signToken: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = (body) => ({ json: jest.fn().mockResolvedValue(body) });

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

    const result = await registerUser({ username: "AgilOnca123", password: "secret123" });

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
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");

    const result = await registerUser({ username: "AgilOnca123", email: "test@test.com", password: "secret123" });

    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@test.com");
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@test.com", password: "hashed", username: "AgilOnca123" })
    );
    expect(signToken).toHaveBeenCalledWith({ id: "user-2", email: "test@test.com", role: "USER" });
    expect(result.user).not.toHaveProperty("password");
    expect(result.token).toBe("jwt-token");
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

    const result = await registerUser({ password: "secret123" });

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

  it("throws 400 when no arguments are provided", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({})).rejects.toMatchObject({
      message: "Password is required",
      statusCode: 400,
    });
  });

  it("throws 400 when password is too short", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({ username: "AgilOnca123", password: "short" })).rejects.toMatchObject({
      message: "Password must be at least 8 characters long",
      statusCode: 400,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when email format is invalid", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(
      registerUser({ username: "AgilOnca123", email: "not-an-email", password: "secret123" })
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
      registerUser({ username: "AgilOnca123", email: "test@test.com", password: "secret123" })
    ).rejects.toMatchObject({
      message: "A user with this email already exists",
      statusCode: 409,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 409 when username already exists", async () => {
    userRepository.findByUsername.mockResolvedValue({ id: "user-1", username: "AgilOnca123" });

    await expect(registerUser({ username: "AgilOnca123", password: "secret123" })).rejects.toMatchObject({
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

    const response = await POST(makeRequest({ username: "AgilOnca123", password: "secret123" }));

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
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");

    const response = await POST(makeRequest({ username: "AgilOnca123", email: "test@test.com", password: "secret123" }));

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

  it("returns 409 when email already exists", async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue({ id: "user-1", email: "test@test.com" });

    const response = await POST(makeRequest({ username: "AgilOnca123", email: "test@test.com", password: "secret123" }));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: { message: "A user with this email already exists", statusCode: 409 },
    });
  });
});
