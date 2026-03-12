import { loginUser } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { POST } from "@/app/api/v1/users/login/route";

jest.mock("@/repositories/userRepository", () => ({
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
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

const USER_IN_DB = {
  id: "user-1",
  email: "test@test.com",
  password: "hashed",
  role: "USER",
  createdAt: new Date(),
};
const USER_NO_EMAIL = {
  id: "user-2",
  email: null,
  username: "AgilOnca123",
  password: "hashed",
  role: "USER",
  createdAt: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe("userService.loginUser", () => {
  it("logs in with valid email identifier and password", async () => {
    userRepository.findByEmail.mockResolvedValue(USER_IN_DB);
    bcrypt.compare.mockResolvedValue(true);
    signToken.mockReturnValue("jwt-token");

    const result = await loginUser({
      identifier: "test@test.com",
      password: "secret",
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@test.com");
    expect(result.user).not.toHaveProperty("password");
    expect(result.token).toBe("jwt-token");
  });

  it("logs in with valid username identifier and password", async () => {
    userRepository.findByUsername.mockResolvedValue(USER_NO_EMAIL);
    bcrypt.compare.mockResolvedValue(true);
    signToken.mockReturnValue("jwt-token");

    const result = await loginUser({
      identifier: "AgilOnca123",
      password: "secret",
    });

    expect(userRepository.findByUsername).toHaveBeenCalledWith("AgilOnca123");
    expect(result.user).not.toHaveProperty("password");
    expect(result.token).toBe("jwt-token");
  });

  it("throws 400 when password is missing", async () => {
    await expect(
      loginUser({ identifier: "test@test.com" }),
    ).rejects.toMatchObject({
      message: "Password is required",
      statusCode: 400,
    });
  });

  it("throws 400 when identifier is missing", async () => {
    await expect(loginUser({ password: "secret" })).rejects.toMatchObject({
      message: "Email or username is required",
      statusCode: 400,
    });
  });

  it("throws 401 when email is not found", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      loginUser({ identifier: "no@test.com", password: "secret" }),
    ).rejects.toMatchObject({
      message: "Invalid credentials",
      statusCode: 401,
    });
  });

  it("throws 401 when username is not found", async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(
      loginUser({ identifier: "GhostUser123", password: "secret" }),
    ).rejects.toMatchObject({
      message: "Invalid credentials",
      statusCode: 401,
    });
  });

  it("throws 401 when password is wrong", async () => {
    userRepository.findByEmail.mockResolvedValue(USER_IN_DB);
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      loginUser({ identifier: "test@test.com", password: "wrong" }),
    ).rejects.toMatchObject({
      message: "Invalid credentials",
      statusCode: 401,
    });
  });

  it("throws 400 when user has Google-only auth and tries password login", async () => {
    const googleOnlyUser = {
      id: "user-3",
      email: "google@test.com",
      password: null,
      authProvider: "google",
      role: "USER",
      createdAt: new Date(),
    };
    userRepository.findByEmail.mockResolvedValue(googleOnlyUser);

    await expect(
      loginUser({ identifier: "google@test.com", password: "secret" }),
    ).rejects.toMatchObject({
      message: "This account uses Google sign-in. Please log in with Google.",
      statusCode: 400,
    });

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
});

describe("POST /api/v1/users/login", () => {
  it("returns 200 with user and token on email login", async () => {
    userRepository.findByEmail.mockResolvedValue(USER_IN_DB);
    bcrypt.compare.mockResolvedValue(true);
    signToken.mockReturnValue("jwt-token");

    const response = await POST(
      makeRequest({ identifier: "test@test.com", password: "secret" }),
    );

    expect(response.status).toBe(200);
    expect(response.body.token).toBe("jwt-token");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("returns 200 with user and token on username login", async () => {
    userRepository.findByUsername.mockResolvedValue(USER_NO_EMAIL);
    bcrypt.compare.mockResolvedValue(true);
    signToken.mockReturnValue("jwt-token");

    const response = await POST(
      makeRequest({ identifier: "AgilOnca123", password: "secret" }),
    );

    expect(response.status).toBe(200);
    expect(response.body.token).toBe("jwt-token");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("returns 400 when password is missing", async () => {
    const response = await POST(makeRequest({ identifier: "test@test.com" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Password is required", statusCode: 400 },
    });
  });

  it("returns 400 when identifier is missing", async () => {
    const response = await POST(makeRequest({ password: "secret" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Email or username is required", statusCode: 400 },
    });
  });

  it("returns 401 on bad credentials", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const response = await POST(
      makeRequest({ identifier: "no@test.com", password: "secret" }),
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Invalid credentials", statusCode: 401 },
    });
  });
});
