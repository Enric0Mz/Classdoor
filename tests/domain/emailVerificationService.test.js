import {
  sendEmailVerificationToUser,
  verifyEmail,
} from "@/domain/emailVerificationService";
import * as emailVerificationTokenRepository from "@/repositories/emailVerificationTokenRepository";
import * as userRepository from "@/repositories/userRepository";
import * as universityRepository from "@/repositories/universityRepository";
import { sendEmailVerification } from "@/lib/emailService";

jest.mock("@/repositories/emailVerificationTokenRepository", () => ({
  create: jest.fn(),
  findByToken: jest.fn(),
  markAsUsed: jest.fn(),
  revokeByUserIdAndType: jest.fn(),
}));

jest.mock("@/repositories/userRepository", () => ({
  findById: jest.fn(),
  update: jest.fn(),
}));

jest.mock("@/repositories/universityRepository", () => ({
  findByEmailDomain: jest.fn(),
}));

jest.mock("@/lib/emailService", () => ({
  sendEmailVerification: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("emailVerificationService.sendEmailVerificationToUser", () => {
  it("revokes existing tokens, creates a new one, and sends the email", async () => {
    userRepository.findById.mockResolvedValue({
      id: "user-1",
      emailVerified: false,
    });
    emailVerificationTokenRepository.revokeByUserIdAndType.mockResolvedValue({
      count: 0,
    });
    emailVerificationTokenRepository.create.mockResolvedValue({
      id: "verif-1",
    });
    sendEmailVerification.mockResolvedValue(undefined);

    const result = await sendEmailVerificationToUser("user-1", "user@test.com");

    expect(
      emailVerificationTokenRepository.revokeByUserIdAndType,
    ).toHaveBeenCalledWith("user-1", "PERSONAL");
    expect(emailVerificationTokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        email: "user@test.com",
        token: expect.any(String),
        expiresAt: expect.any(Date),
        type: "PERSONAL",
      }),
    );
    expect(sendEmailVerification).toHaveBeenCalledWith(
      "user@test.com",
      expect.any(String),
    );
    expect(result).toEqual({ message: "Verification email sent" });
  });

  it("revokes existing tokens before creating a new one", async () => {
    userRepository.findById.mockResolvedValue({
      id: "user-1",
      emailVerified: false,
    });
    emailVerificationTokenRepository.revokeByUserIdAndType.mockResolvedValue({
      count: 0,
    });
    emailVerificationTokenRepository.create.mockResolvedValue({
      id: "verif-2",
    });
    sendEmailVerification.mockResolvedValue(undefined);

    await sendEmailVerificationToUser("user-1", "user@test.com");

    const revokeOrder =
      emailVerificationTokenRepository.revokeByUserIdAndType.mock
        .invocationCallOrder[0];
    const createOrder =
      emailVerificationTokenRepository.create.mock.invocationCallOrder[0];
    expect(revokeOrder).toBeLessThan(createOrder);
  });

  it("throws 400 when email is already verified", async () => {
    userRepository.findById.mockResolvedValue({
      id: "user-1",
      emailVerified: true,
    });

    await expect(
      sendEmailVerificationToUser("user-1", "user@test.com"),
    ).rejects.toMatchObject({
      message: "Email already verified",
      statusCode: 400,
    });

    expect(emailVerificationTokenRepository.create).not.toHaveBeenCalled();
    expect(sendEmailVerification).not.toHaveBeenCalled();
  });
});

describe("emailVerificationService.verifyEmail", () => {
  it("sets only emailVerified=true for a personal email domain", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: {
        userId: "user-1",
        email: "user@gmail.com",
        token: "valid-token",
        expiresAt: futureDate,
      },
      alreadyUsed: false,
    });
    universityRepository.findByEmailDomain.mockResolvedValue(null);
    userRepository.update.mockResolvedValue({
      id: "user-1",
      emailVerified: true,
    });
    const result = await verifyEmail("valid-token");

    expect(universityRepository.findByEmailDomain).toHaveBeenCalledWith(
      "gmail.com",
    );
    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      emailVerified: true,
    });
    expect(result).toEqual({ message: "Email verified successfully" });
  });

  it("also sets universityEmail, verified, and universityId when the email belongs to a known university domain", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: {
        userId: "user-1",
        email: "student@usp.br",
        token: "valid-token",
        expiresAt: futureDate,
      },
      alreadyUsed: false,
    });
    universityRepository.findByEmailDomain.mockResolvedValue({
      id: "univ-usp",
    });
    userRepository.update.mockResolvedValue({ id: "user-1" });

    const result = await verifyEmail("valid-token");

    expect(universityRepository.findByEmailDomain).toHaveBeenCalledWith(
      "usp.br",
    );
    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      emailVerified: true,
      universityEmail: "student@usp.br",
      verified: true,
      universityId: "univ-usp",
    });
    expect(result).toEqual({ message: "Email verified successfully" });
  });

  it("sets only emailVerified when domain is not found in the database", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: {
        userId: "user-1",
        email: "student@unknownuni.br",
        token: "valid-token",
        expiresAt: futureDate,
      },
      alreadyUsed: false,
    });
    universityRepository.findByEmailDomain.mockResolvedValue(null);
    userRepository.update.mockResolvedValue({ id: "user-1" });

    await verifyEmail("valid-token");

    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      emailVerified: true,
    });
  });

  it("throws 404 when token does not exist", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: null,
      alreadyUsed: false,
    });

    await expect(verifyEmail("ghost-token")).rejects.toMatchObject({
      message: "Verification token not found",
      statusCode: 404,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("throws 400 when token has expired", async () => {
    const pastDate = new Date(Date.now() - 1000);
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: {
        userId: "user-1",
        email: "user@test.com",
        token: "expired-token",
        expiresAt: pastDate,
      },
      alreadyUsed: false,
    });

    await expect(verifyEmail("expired-token")).rejects.toMatchObject({
      message: "Token has expired",
      statusCode: 400,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("returns success without updating user when token was already used (idempotent)", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: {
        userId: "user-1",
        email: "user@test.com",
        token: "used-token",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        status: "USED",
      },
      alreadyUsed: true,
    });

    const result = await verifyEmail("used-token");

    expect(result).toEqual({ message: "Email verified successfully" });
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
