import {
  handleGoogleCallback,
  completeGoogleRegistration,
} from "@/domain/googleAuthService";
import * as userRepository from "@/repositories/userRepository";
import * as universityRepository from "@/repositories/universityRepository";
import { signToken, createRefreshToken } from "@/lib/auth";
import { exchangeCodeForTokens, fetchGoogleUserInfo } from "@/lib/googleOAuth";
import { generateUsername } from "@/lib/generateUsername";
import jwt from "jsonwebtoken";

jest.mock("@/repositories/userRepository", () => ({
  findByGoogleId: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}));

jest.mock("@/repositories/universityRepository", () => ({
  findByEmailDomain: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  signToken: jest.fn().mockReturnValue("mock-jwt-token"),
  createRefreshToken: jest.fn().mockResolvedValue("mock-refresh-token"),
}));

jest.mock("@/lib/googleOAuth", () => ({
  exchangeCodeForTokens: jest.fn(),
  fetchGoogleUserInfo: jest.fn(),
}));

jest.mock("@/lib/generateUsername", () => ({
  generateUsername: jest.fn().mockReturnValue("AgilOnca123"),
}));

const GOOGLE_USER = {
  googleId: "google-123",
  email: "user@gmail.com",
  emailVerified: true,
  name: "Test User",
};

const EXISTING_USER = {
  id: "user-1",
  email: "user@gmail.com",
  username: "ExistingUser",
  password: "hashed-password",
  role: "USER",
  googleId: null,
  authProvider: "local",
  verified: false,
  emailVerified: true,
  createdAt: new Date(),
};

const GOOGLE_LINKED_USER = {
  ...EXISTING_USER,
  googleId: "google-123",
  authProvider: "google",
};

function createPendingToken({ googleId, email }) {
  return jwt.sign(
    { googleId, email, purpose: "google_registration" },
    process.env.JWT_SECRET,
    { expiresIn: "10m" },
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  exchangeCodeForTokens.mockResolvedValue({
    access_token: "google-access-token",
  });
  fetchGoogleUserInfo.mockResolvedValue(GOOGLE_USER);
  universityRepository.findByEmailDomain.mockResolvedValue(null);
});

describe("googleAuthService.handleGoogleCallback", () => {
  describe("when user already exists by googleId", () => {
    it("logs in the existing Google user with intent=login", async () => {
      userRepository.findByGoogleId.mockResolvedValue(GOOGLE_LINKED_USER);

      const result = await handleGoogleCallback("auth-code", "login");

      expect(exchangeCodeForTokens).toHaveBeenCalledWith("auth-code");
      expect(fetchGoogleUserInfo).toHaveBeenCalledWith("google-access-token");
      expect(userRepository.findByGoogleId).toHaveBeenCalledWith("google-123");
      expect(result.type).toBe("authenticated");
      expect(result.token).toBe("mock-jwt-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
      expect(result.user).not.toHaveProperty("password");
    });

    it("logs in the existing Google user with intent=register", async () => {
      userRepository.findByGoogleId.mockResolvedValue(GOOGLE_LINKED_USER);

      const result = await handleGoogleCallback("auth-code", "register");

      expect(result.type).toBe("authenticated");
      expect(result.token).toBe("mock-jwt-token");
      expect(result.user).not.toHaveProperty("password");
    });
  });

  describe("when user exists by email but not googleId (account linking)", () => {
    it("links Google account to existing local user", async () => {
      userRepository.findByGoogleId.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(EXISTING_USER);
      userRepository.update.mockResolvedValue({
        ...EXISTING_USER,
        googleId: "google-123",
        authProvider: "local_and_google",
        emailVerified: true,
      });

      const result = await handleGoogleCallback("auth-code", "login");

      expect(userRepository.update).toHaveBeenCalledWith("user-1", {
        googleId: "google-123",
        authProvider: "local_and_google",
        emailVerified: true,
      });
      expect(result.type).toBe("authenticated");
      expect(result.token).toBe("mock-jwt-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
      expect(result.user).not.toHaveProperty("password");
    });

    it("sets authProvider to 'google' when existing user has no password", async () => {
      const userWithoutPassword = {
        ...EXISTING_USER,
        password: null,
      };
      userRepository.findByGoogleId.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(userWithoutPassword);
      userRepository.update.mockResolvedValue({
        ...userWithoutPassword,
        googleId: "google-123",
        authProvider: "google",
      });

      await handleGoogleCallback("auth-code", "login");

      expect(userRepository.update).toHaveBeenCalledWith("user-1", {
        googleId: "google-123",
        authProvider: "google",
        emailVerified: true,
      });
    });
  });

  describe("when user does not exist (new Google user)", () => {
    it("returns needs_username with a pending token for intent=register", async () => {
      userRepository.findByGoogleId.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await handleGoogleCallback("auth-code", "register");

      expect(result.type).toBe("needs_username");
      expect(result.pendingToken).toBeDefined();

      const decoded = jwt.verify(result.pendingToken, process.env.JWT_SECRET);
      expect(decoded.googleId).toBe("google-123");
      expect(decoded.email).toBe("user@gmail.com");
      expect(decoded.purpose).toBe("google_registration");
    });

    it("throws 404 with intent=login when no account exists", async () => {
      userRepository.findByGoogleId.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        handleGoogleCallback("auth-code", "login"),
      ).rejects.toMatchObject({
        message:
          "No account found with this Google email. Please register first.",
        statusCode: 404,
      });

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("throws 400 when Google email is not verified", async () => {
      fetchGoogleUserInfo.mockResolvedValue({
        ...GOOGLE_USER,
        emailVerified: false,
      });

      await expect(
        handleGoogleCallback("auth-code", "register"),
      ).rejects.toMatchObject({
        message: "Google account must have a verified email address",
        statusCode: 400,
      });
    });

    it("throws 400 when Google account has no email", async () => {
      fetchGoogleUserInfo.mockResolvedValue({
        ...GOOGLE_USER,
        email: null,
      });

      await expect(
        handleGoogleCallback("auth-code", "register"),
      ).rejects.toMatchObject({
        message: "Google account must have a verified email address",
        statusCode: 400,
      });
    });
  });
});

describe("googleAuthService.completeGoogleRegistration", () => {
  it("creates a new user with the chosen username", async () => {
    const pendingToken = createPendingToken({
      googleId: "google-123",
      email: "user@gmail.com",
    });

    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByGoogleId.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: "new-user-1",
      email: "user@gmail.com",
      username: "MyChosenName",
      role: "USER",
      googleId: "google-123",
      authProvider: "google",
      emailVerified: true,
      verified: false,
      createdAt: new Date(),
    });
    userRepository.findById.mockResolvedValue({
      id: "new-user-1",
      email: "user@gmail.com",
      username: "MyChosenName",
      role: "USER",
      authProvider: "google",
      emailVerified: true,
      verified: false,
      createdAt: new Date(),
    });

    const result = await completeGoogleRegistration(
      pendingToken,
      "MyChosenName",
    );

    expect(userRepository.create).toHaveBeenCalledWith({
      email: "user@gmail.com",
      username: "MyChosenName",
      googleId: "google-123",
      authProvider: "google",
      emailVerified: true,
    });
    expect(result.token).toBe("mock-jwt-token");
    expect(result.refreshToken).toBe("mock-refresh-token");
    expect(result.user.username).toBe("MyChosenName");
  });

  it("throws 409 when username is already taken", async () => {
    const pendingToken = createPendingToken({
      googleId: "google-123",
      email: "user@gmail.com",
    });

    userRepository.findByUsername.mockResolvedValue({ id: "other-user" });

    await expect(
      completeGoogleRegistration(pendingToken, "TakenName"),
    ).rejects.toMatchObject({
      message: "A user with this username already exists",
      statusCode: 409,
    });

    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when username is invalid", async () => {
    const pendingToken = createPendingToken({
      googleId: "google-123",
      email: "user@gmail.com",
    });

    await expect(
      completeGoogleRegistration(pendingToken, "ab"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });

    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when pending token is expired or invalid", async () => {
    await expect(
      completeGoogleRegistration("invalid-token", "SomeUsername"),
    ).rejects.toMatchObject({
      message: "Registration session expired. Please try again.",
      statusCode: 400,
    });
  });

  describe("university auto-linking", () => {
    it("links university when Google email matches a university domain", async () => {
      const pendingToken = createPendingToken({
        googleId: "google-123",
        email: "student@usp.br",
      });

      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.findByGoogleId.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        id: "new-user-1",
        email: "student@usp.br",
        username: "AgilOnca123",
        role: "USER",
        googleId: "google-123",
        authProvider: "google",
        emailVerified: true,
        verified: false,
        createdAt: new Date(),
      });
      universityRepository.findByEmailDomain.mockResolvedValue({
        id: "univ-usp",
      });
      userRepository.update.mockResolvedValue({});
      userRepository.findById.mockResolvedValue({
        id: "new-user-1",
        email: "student@usp.br",
        username: "AgilOnca123",
        role: "USER",
        authProvider: "google",
        emailVerified: true,
        verified: true,
        universityEmail: "student@usp.br",
        universityId: "univ-usp",
        createdAt: new Date(),
      });

      const result = await completeGoogleRegistration(
        pendingToken,
        "AgilOnca123",
      );

      expect(universityRepository.findByEmailDomain).toHaveBeenCalledWith(
        "usp.br",
      );
      expect(userRepository.update).toHaveBeenCalledWith("new-user-1", {
        universityEmail: "student@usp.br",
        verified: true,
        universityId: "univ-usp",
      });
      expect(result.user.verified).toBe(true);
    });
  });
});
