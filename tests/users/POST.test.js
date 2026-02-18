import { registerUser } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import { POST } from "@/app/api/v1/users/route";

jest.mock("@/repositories/userRepository", () => ({
  findByEmail: jest.fn(),
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
  it("registers a user with valid input", async () => {
    const input = { email: "test@test.com", password: "secret123" };
    const created = { id: "user-1", email: "test@test.com", password: "hashed", role: "USER", createdAt: new Date() };
    userRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");

    const result = await registerUser(input);

    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@test.com");
    expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 10);
    expect(userRepository.create).toHaveBeenCalledWith({ email: "test@test.com", password: "hashed" });
    expect(signToken).toHaveBeenCalledWith({ id: "user-1", email: "test@test.com", role: "USER" });
    expect(result.user).not.toHaveProperty("password");
    expect(result.token).toBe("jwt-token");
  });

  it("throws 400 when email is missing", async () => {
    await expect(registerUser({ password: "secret" })).rejects.toMatchObject({
      message: "Email and password are required",
      statusCode: 400,
    });
  });

  it("throws 400 when password is missing", async () => {
    await expect(registerUser({ email: "test@test.com" })).rejects.toMatchObject({
      message: "Email and password are required",
      statusCode: 400,
    });
  });

  it("throws 400 when email format is invalid", async () => {
    await expect(registerUser({ email: "not-an-email", password: "secret123" })).rejects.toMatchObject({
      message: "Invalid email format",
      statusCode: 400,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when password is too short", async () => {
    await expect(registerUser({ email: "test@test.com", password: "short" })).rejects.toMatchObject({
      message: "Password must be at least 8 characters long",
      statusCode: 400,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 409 when email already exists", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: "user-1", email: "test@test.com" });

    await expect(registerUser({ email: "test@test.com", password: "secret123" })).rejects.toMatchObject({
      message: "A user with this email already exists",
      statusCode: 409,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/v1/users", () => {
  it("returns 201 with user and token", async () => {
    const created = { id: "user-1", email: "test@test.com", password: "hashed", createdAt: "2024-01-01T00:00:00.000Z" };
    userRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");

    const response = await POST(makeRequest({ email: "test@test.com", password: "secret123" }));

    expect(response.status).toBe(201);
    expect(response.body.token).toBe("jwt-token");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("returns 400 when fields are missing", async () => {
    const response = await POST(makeRequest({ email: "test@test.com" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Email and password are required", statusCode: 400 },
    });
  });

  it("returns 409 when email already exists", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: "user-1", email: "test@test.com" });

    const response = await POST(makeRequest({ email: "test@test.com", password: "secret123" }));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: { message: "A user with this email already exists", statusCode: 409 },
    });
  });
});
