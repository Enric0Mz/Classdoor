process.env.JWT_SECRET = "test-secret";

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: jest.fn().mockReturnValue("mock-jwt-token"),
    verify: jest.fn(),
  },
}));

jest.mock("@/repositories/refreshTokenRepository", () => ({
  create: jest.fn(),
  findByToken: jest.fn(),
  deleteByToken: jest.fn(),
  deleteOldestByUserId: jest.fn(),
}));

jest.mock("@/repositories/userRepository", () => ({
  findById: jest.fn(),
}));

const refreshTokenRepository = require("@/repositories/refreshTokenRepository");
const userRepository = require("@/repositories/userRepository");
const {
  generateRefreshToken,
  createRefreshToken,
  rotateRefreshToken,
  invalidateRefreshToken,
} = require("@/lib/auth");

beforeEach(() => jest.clearAllMocks());

describe("generateRefreshToken", () => {
  it("returns a hex string of 80 characters (40 bytes)", () => {
    const token = generateRefreshToken();

    expect(typeof token).toBe("string");
    expect(token).toHaveLength(80);
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });

  it("generates unique tokens on each call", () => {
    const tokenOne = generateRefreshToken();
    const tokenTwo = generateRefreshToken();

    expect(tokenOne).not.toBe(tokenTwo);
  });
});

describe("createRefreshToken", () => {
  it("stores a refresh token in the database and returns it", async () => {
    refreshTokenRepository.create.mockResolvedValue({});

    const token = await createRefreshToken("user-1");

    expect(typeof token).toBe("string");
    expect(token).toHaveLength(80);
    expect(refreshTokenRepository.create).toHaveBeenCalledWith({
      token,
      userId: "user-1",
      expiresAt: expect.any(Date),
    });
  });

  it("removes oldest tokens when exceeding the max per user", async () => {
    refreshTokenRepository.create.mockResolvedValue({});
    refreshTokenRepository.deleteOldestByUserId.mockResolvedValue({});

    await createRefreshToken("user-1");

    expect(refreshTokenRepository.deleteOldestByUserId).toHaveBeenCalledWith("user-1", 5);
  });

  it("sets expiration 7 days in the future", async () => {
    refreshTokenRepository.create.mockResolvedValue({});

    await createRefreshToken("user-1");

    const callArgs = refreshTokenRepository.create.mock.calls[0][0];
    const expiresAt = callArgs.expiresAt;
    const now = new Date();
    const differenceInDays = (expiresAt - now) / (1000 * 60 * 60 * 24);

    expect(differenceInDays).toBeGreaterThan(6.9);
    expect(differenceInDays).toBeLessThanOrEqual(7);
  });
});

describe("rotateRefreshToken", () => {
  it("returns new access token and refresh token for a valid token", async () => {
    const storedToken = {
      token: "old-token",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 86400000),
    };
    const user = { id: "user-1", email: "test@test.com", role: "USER" };

    refreshTokenRepository.findByToken.mockResolvedValue(storedToken);
    refreshTokenRepository.deleteByToken.mockResolvedValue({});
    refreshTokenRepository.create.mockResolvedValue({});
    userRepository.findById.mockResolvedValue(user);

    const result = await rotateRefreshToken("old-token");

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(typeof result.accessToken).toBe("string");
    expect(typeof result.refreshToken).toBe("string");
    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith("old-token");
  });

  it("throws 401 when the token does not exist", async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(null);

    await expect(rotateRefreshToken("nonexistent")).rejects.toMatchObject({
      message: "Invalid refresh token",
      statusCode: 401,
    });
  });

  it("throws 401 and deletes the token when it is expired", async () => {
    const expiredToken = {
      token: "expired-token",
      userId: "user-1",
      expiresAt: new Date(Date.now() - 86400000),
    };

    refreshTokenRepository.findByToken.mockResolvedValue(expiredToken);
    refreshTokenRepository.deleteByToken.mockResolvedValue({});

    await expect(rotateRefreshToken("expired-token")).rejects.toMatchObject({
      message: "Refresh token expired",
      statusCode: 401,
    });
    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith("expired-token");
  });

  it("throws 401 when the user no longer exists", async () => {
    const storedToken = {
      token: "orphan-token",
      userId: "deleted-user",
      expiresAt: new Date(Date.now() + 86400000),
    };

    refreshTokenRepository.findByToken.mockResolvedValue(storedToken);
    refreshTokenRepository.deleteByToken.mockResolvedValue({});
    userRepository.findById.mockResolvedValue(null);

    await expect(rotateRefreshToken("orphan-token")).rejects.toMatchObject({
      message: "User not found",
      statusCode: 401,
    });
  });
});

describe("invalidateRefreshToken", () => {
  it("deletes the token from the database", async () => {
    refreshTokenRepository.findByToken.mockResolvedValue({ token: "valid-token" });
    refreshTokenRepository.deleteByToken.mockResolvedValue({});

    await invalidateRefreshToken("valid-token");

    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith("valid-token");
  });

  it("throws 401 when the token does not exist", async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(null);

    await expect(invalidateRefreshToken("bad-token")).rejects.toMatchObject({
      message: "Invalid refresh token",
      statusCode: 401,
    });
  });
});
