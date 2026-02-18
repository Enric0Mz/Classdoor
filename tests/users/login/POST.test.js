import { loginUser } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import { POST } from "@/app/api/v1/users/login/route";

jest.mock("@/repositories/userRepository", () => ({
  findByEmail: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
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

describe("userService.loginUser", () => {
  it("logs in with valid credentials", async () => {
    const user = { id: "user-1", email: "test@test.com", password: "hashed", createdAt: new Date() };
    userRepository.findByEmail.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    signToken.mockReturnValue("jwt-token");

    const result = await loginUser({ email: "test@test.com", password: "secret" });

    expect(result.user).not.toHaveProperty("password");
    expect(result.token).toBe("jwt-token");
  });

  it("throws 400 when email is missing", async () => {
    await expect(loginUser({ password: "secret" })).rejects.toMatchObject({
      message: "Email and password are required",
      statusCode: 400,
    });
  });

  it("throws 401 when email not found", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(loginUser({ email: "no@test.com", password: "secret" })).rejects.toMatchObject({
      message: "Invalid email or password",
      statusCode: 401,
    });
  });

  it("throws 401 when password is wrong", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: "user-1", email: "test@test.com", password: "hashed" });
    bcrypt.compare.mockResolvedValue(false);

    await expect(loginUser({ email: "test@test.com", password: "wrong" })).rejects.toMatchObject({
      message: "Invalid email or password",
      statusCode: 401,
    });
  });
});

describe("POST /api/v1/users/login", () => {
  it("returns 200 with user and token", async () => {
    const user = { id: "user-1", email: "test@test.com", password: "hashed", createdAt: "2024-01-01T00:00:00.000Z" };
    userRepository.findByEmail.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    signToken.mockReturnValue("jwt-token");

    const response = await POST(makeRequest({ email: "test@test.com", password: "secret" }));

    expect(response.status).toBe(200);
    expect(response.body.token).toBe("jwt-token");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("returns 400 when fields are missing", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Email and password are required", statusCode: 400 },
    });
  });

  it("returns 401 on bad credentials", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const response = await POST(makeRequest({ email: "no@test.com", password: "secret" }));

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Invalid email or password", statusCode: 401 },
    });
  });
});
