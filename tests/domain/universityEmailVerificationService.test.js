import {
  submitUniversityEmail,
  verifyUniversityEmail,
} from "@/domain/universityEmailVerificationService";
import * as emailVerificationTokenRepository from "@/repositories/emailVerificationTokenRepository";
import * as userRepository from "@/repositories/userRepository";
import * as universityRepository from "@/repositories/universityRepository";
import { sendVerificationEmail } from "@/lib/emailService";

jest.mock("@/repositories/emailVerificationTokenRepository", () => ({
  create: jest.fn(),
  findByToken: jest.fn(),
  markAsUsed: jest.fn(),
  revokeByUserIdAndType: jest.fn(),
}));

jest.mock("@/repositories/userRepository", () => ({
  update: jest.fn(),
}));

jest.mock("@/repositories/universityRepository", () => ({
  findByEmailDomain: jest.fn(),
}));

jest.mock("@/lib/emailService", () => ({
  sendVerificationEmail: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("universityEmailVerificationService.submitUniversityEmail", () => {
  it("throws 400 when the email domain is not a recognized university domain", async () => {
    universityRepository.findByEmailDomain.mockResolvedValue(null);

    await expect(
      submitUniversityEmail("user-1", "user@email.com", "me@gmail.com"),
    ).rejects.toMatchObject({
      message: "Email domain is not recognized as a university email",
      statusCode: 400,
    });

    expect(emailVerificationTokenRepository.create).not.toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("proceeds to send verification when the domain is recognized", async () => {
    universityRepository.findByEmailDomain.mockResolvedValue({
      id: "univ-usp",
      name: "Universidade de São Paulo",
    });
    emailVerificationTokenRepository.revokeByUserIdAndType.mockResolvedValue({
      count: 0,
    });
    emailVerificationTokenRepository.create.mockResolvedValue({
      id: "verif-1",
    });
    sendVerificationEmail.mockResolvedValue(undefined);

    const result = await submitUniversityEmail(
      "user-1",
      "user@email.com",
      "me@usp.br",
    );

    expect(universityRepository.findByEmailDomain).toHaveBeenCalledWith(
      "usp.br",
    );
    expect(emailVerificationTokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        email: "me@usp.br",
        type: "UNIVERSITY",
      }),
    );
    expect(result).toEqual({ message: "Verification email sent" });
  });

  it("throws 403 when the user has no registered email (anonymous)", async () => {
    await expect(
      submitUniversityEmail("user-anon", null, "me@usp.br"),
    ).rejects.toMatchObject({
      message: "Anonymous accounts cannot submit a university email",
      statusCode: 403,
    });
  });

  it("throws 400 when the email format is invalid before checking the domain", async () => {
    await expect(
      submitUniversityEmail("user-1", "user@email.com", "not-an-email"),
    ).rejects.toMatchObject({
      message: "Invalid university email format",
      statusCode: 400,
    });

    expect(universityRepository.findByEmailDomain).not.toHaveBeenCalled();
  });
});

describe("universityEmailVerificationService.verifyUniversityEmail", () => {
  it("normalizes the domain to lowercase before the DB lookup", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: {
        userId: "user-1",
        email: "me@USP.BR",
        token: "valid-token",
        expiresAt: futureDate,
      },
      alreadyUsed: false,
    });
    universityRepository.findByEmailDomain.mockResolvedValue({
      id: "univ-usp",
      name: "Universidade de São Paulo",
    });
    userRepository.update.mockResolvedValue({ id: "user-1" });
    await verifyUniversityEmail("valid-token");

    expect(universityRepository.findByEmailDomain).toHaveBeenCalledWith(
      "usp.br",
    );
  });

  it("sets verified=true and links universityId when a matching university is in the DB", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: {
        userId: "user-1",
        email: "me@usp.br",
        token: "valid-token",
        expiresAt: futureDate,
      },
      alreadyUsed: false,
    });
    universityRepository.findByEmailDomain.mockResolvedValue({
      id: "univ-usp",
      name: "Universidade de São Paulo",
    });
    userRepository.update.mockResolvedValue({ id: "user-1" });
    const result = await verifyUniversityEmail("valid-token");

    expect(universityRepository.findByEmailDomain).toHaveBeenCalledWith(
      "usp.br",
    );
    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      universityEmail: "me@usp.br",
      verified: true,
      universityId: "univ-usp",
    });
    expect(result).toEqual({
      message: "University email verified successfully",
    });
  });

  it("sets universityId to null when no matching university is found in the DB", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: {
        userId: "user-1",
        email: "me@unknownuni.br",
        token: "valid-token",
        expiresAt: futureDate,
      },
      alreadyUsed: false,
    });
    universityRepository.findByEmailDomain.mockResolvedValue(null);
    userRepository.update.mockResolvedValue({ id: "user-1" });
    await verifyUniversityEmail("valid-token");

    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      universityEmail: "me@unknownuni.br",
      verified: true,
      universityId: null,
    });
  });

  it("throws 404 when token does not exist", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: null,
      alreadyUsed: false,
    });

    await expect(verifyUniversityEmail("ghost-token")).rejects.toMatchObject({
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
        email: "me@usp.br",
        token: "expired-token",
        expiresAt: pastDate,
      },
      alreadyUsed: false,
    });

    await expect(verifyUniversityEmail("expired-token")).rejects.toMatchObject({
      message: "Token has expired",
      statusCode: 400,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("throws 404 when token has been revoked", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: null,
      alreadyUsed: false,
    });

    await expect(verifyUniversityEmail("revoked-token")).rejects.toMatchObject({
      message: "Verification token not found",
      statusCode: 404,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("returns success without updating user when token was already used (idempotent)", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: {
        userId: "user-1",
        email: "me@usp.br",
        token: "used-token",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        status: "USED",
      },
      alreadyUsed: true,
    });

    const result = await verifyUniversityEmail("used-token");

    expect(result).toEqual({
      message: "University email verified successfully",
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
