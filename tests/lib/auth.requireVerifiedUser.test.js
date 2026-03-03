process.env.JWT_SECRET = "test-secret";

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
  },
}));

jest.mock("@/repositories/userRepository", () => ({
  findById: jest.fn(),
}));

const jwt = require("jsonwebtoken").default;
const userRepository = require("@/repositories/userRepository");
const { requireVerifiedUser } = require("@/lib/auth");

function makeRequest(token) {
  return {
    headers: {
      get: jest.fn().mockReturnValue(token ? `Bearer ${token}` : null),
    },
  };
}

describe("requireVerifiedUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns decoded token when user exists and email is verified", async () => {
    jwt.verify.mockReturnValue({
      id: "user-1",
      email: "test@test.com",
      role: "USER",
    });
    userRepository.findById.mockResolvedValue({
      id: "user-1",
      emailVerified: true,
    });

    const result = await requireVerifiedUser(makeRequest("valid-token"));

    expect(result).toEqual({
      id: "user-1",
      email: "test@test.com",
      role: "USER",
    });
  });

  it("throws 403 when email is not verified", async () => {
    jwt.verify.mockReturnValue({
      id: "user-1",
      email: "test@test.com",
      role: "USER",
    });
    userRepository.findById.mockResolvedValue({
      id: "user-1",
      emailVerified: false,
    });

    await expect(
      requireVerifiedUser(makeRequest("valid-token")),
    ).rejects.toMatchObject({
      message: "Email verification required",
      statusCode: 403,
    });
  });

  it("throws 404 when user is not found", async () => {
    jwt.verify.mockReturnValue({
      id: "user-1",
      email: "test@test.com",
      role: "USER",
    });
    userRepository.findById.mockResolvedValue(null);

    await expect(
      requireVerifiedUser(makeRequest("valid-token")),
    ).rejects.toMatchObject({ message: "User not found", statusCode: 404 });
  });

  it("allows ADMIN users even without email verification", async () => {
    jwt.verify.mockReturnValue({
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    });
    userRepository.findById.mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
      emailVerified: false,
    });

    const result = await requireVerifiedUser(makeRequest("valid-token"));

    expect(result).toEqual({
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    });
  });

  it("throws 401 when no auth header is provided", async () => {
    await expect(requireVerifiedUser(makeRequest(null))).rejects.toMatchObject({
      message: "Authentication required",
      statusCode: 401,
    });
  });
});
