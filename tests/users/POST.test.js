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
  it("registers a user with valid email and password", async () => {
    const input = { email: "test@test.com", password: "secret123" };
    const created = {
      id: "user-1",
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

    const result = await registerUser(input);

    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@test.com");
    expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 10);
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@test.com", password: "hashed", username: expect.any(String) })
    );
    expect(signToken).toHaveBeenCalledWith({ id: "user-1", email: "test@test.com", role: "USER" });
    expect(result.user).not.toHaveProperty("password");
    expect(result.token).toBe("jwt-token");
  });

  it("registers anonymous user when no email or password provided", async () => {
    const created = {
      id: "user-2",
      email: null,
      username: "BravoCapivara347",
      role: "USER",
      createdAt: new Date(),
    };
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("anon-jwt");

    const result = await registerUser({});

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ username: expect.any(String) })
    );
    expect(signToken).toHaveBeenCalledWith({ id: "user-2", email: null, role: "USER" });
    expect(result.user).toHaveProperty("username");
    expect(typeof result.user.username).toBe("string");
    expect(result.token).toBe("anon-jwt");
  });

  it("registers anonymous user with custom username when provided", async () => {
    const created = {
      id: "user-3",
      email: null,
      username: "MeuApelido",
      role: "USER",
      createdAt: new Date(),
    };
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("custom-jwt");

    const result = await registerUser({ username: "MeuApelido" });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ username: "MeuApelido" })
    );
    expect(result.user.username).toBe("MeuApelido");
  });

  it("throws 400 when only email is provided without password", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({ email: "x@x.com" })).rejects.toMatchObject({
      message: "Email and password are required",
      statusCode: 400,
    });
  });

  it("throws 400 when only password is provided without email", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({ password: "secret123" })).rejects.toMatchObject({
      message: "Email and password are required",
      statusCode: 400,
    });
  });

  it("throws 400 when email format is invalid", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({ email: "not-an-email", password: "secret123" })).rejects.toMatchObject({
      message: "Invalid email format",
      statusCode: 400,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when password is too short", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(registerUser({ email: "test@test.com", password: "short" })).rejects.toMatchObject({
      message: "Password must be at least 8 characters long",
      statusCode: 400,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 409 when email already exists", async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue({ id: "user-1", email: "test@test.com" });

    await expect(registerUser({ email: "test@test.com", password: "secret123" })).rejects.toMatchObject({
      message: "A user with this email already exists",
      statusCode: 409,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 409 when username already exists", async () => {
    userRepository.findByUsername.mockResolvedValue({ id: "user-1", username: "AgilOnca123" });

    await expect(registerUser({ username: "AgilOnca123" })).rejects.toMatchObject({
      message: "A user with this username already exists",
      statusCode: 409,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/v1/users", () => {
  it("returns 201 with user and token for email registration", async () => {
    const created = {
      id: "user-1",
      email: "test@test.com",
      username: "AgilOnca123",
      password: "hashed",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");

    const response = await POST(makeRequest({ email: "test@test.com", password: "secret123" }));

    expect(response.status).toBe(201);
    expect(response.body.token).toBe("jwt-token");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("returns 201 with username for anonymous registration", async () => {
    const created = {
      id: "user-2",
      email: null,
      username: "BravoCapivara347",
      role: "USER",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("anon-jwt");

    const response = await POST(makeRequest({}));

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty("username");
    expect(response.body.user).not.toHaveProperty("email", expect.any(String));
  });

  it("returns 201 using provided username with email registration", async () => {
    const created = {
      id: "user-3",
      email: "x@x.com",
      username: "MeuApelido",
      password: "hashed",
      role: "USER",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed");
    userRepository.create.mockResolvedValue(created);
    signToken.mockReturnValue("jwt-token");

    const response = await POST(makeRequest({ username: "MeuApelido", email: "x@x.com", password: "pass1234" }));

    expect(response.status).toBe(201);
    expect(response.body.user.username).toBe("MeuApelido");
  });

  it("returns 400 when fields are missing", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    const response = await POST(makeRequest({ email: "test@test.com" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Email and password are required", statusCode: 400 },
    });
  });

  it("returns 409 when email already exists", async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue({ id: "user-1", email: "test@test.com" });

    const response = await POST(makeRequest({ email: "test@test.com", password: "secret123" }));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: { message: "A user with this email already exists", statusCode: 409 },
    });
  });
});
