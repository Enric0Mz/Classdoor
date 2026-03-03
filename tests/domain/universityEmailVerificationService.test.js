import {
  submitUniversityEmail,
  verifyUniversityEmail,
} from "@/domain/universityEmailVerificationService";
import * as verificationRepository from "@/repositories/universityEmailVerificationRepository";
import * as userRepository from "@/repositories/userRepository";
import * as universityRepository from "@/repositories/universityRepository";
import { sendVerificationEmail } from "@/lib/emailService";
import { findUniversityByDomain } from "@/lib/universityDomains";

jest.mock("@/repositories/universityEmailVerificationRepository", () => ({
  create: jest.fn(),
  findByToken: jest.fn(),
  deleteByUserId: jest.fn(),
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

jest.mock("@/lib/universityDomains", () => ({
  findUniversityByDomain: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("universityEmailVerificationService.submitUniversityEmail", () => {
  it("throws 400 when the email domain is not a recognized university domain", async () => {
    findUniversityByDomain.mockReturnValue(null);

    await expect(
      submitUniversityEmail("user-1", "user@email.com", "me@gmail.com"),
    ).rejects.toMatchObject({
      message: "Email domain is not recognized as a university email",
      statusCode: 400,
    });

    expect(verificationRepository.create).not.toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("proceeds to send verification when the domain is recognized", async () => {
    findUniversityByDomain.mockReturnValue({
      name: "Universidade de São Paulo",
    });
    verificationRepository.deleteByUserId.mockResolvedValue(undefined);
    verificationRepository.create.mockResolvedValue({ id: "verif-1" });
    sendVerificationEmail.mockResolvedValue(undefined);

    const result = await submitUniversityEmail(
      "user-1",
      "user@email.com",
      "me@usp.br",
    );

    expect(findUniversityByDomain).toHaveBeenCalledWith("usp.br");
    expect(verificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        universityEmail: "me@usp.br",
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

    expect(findUniversityByDomain).not.toHaveBeenCalled();
  });
});

describe("universityEmailVerificationService.verifyUniversityEmail", () => {
  it("normalizes the domain to lowercase before the DB lookup", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    verificationRepository.findByToken.mockResolvedValue({
      userId: "user-1",
      universityEmail: "me@USP.BR",
      token: "valid-token",
      expiresAt: futureDate,
    });
    universityRepository.findByEmailDomain.mockResolvedValue({
      id: "univ-usp",
      name: "Universidade de São Paulo",
    });
    userRepository.update.mockResolvedValue({ id: "user-1" });
    verificationRepository.deleteByUserId.mockResolvedValue(undefined);

    await verifyUniversityEmail("valid-token");

    expect(universityRepository.findByEmailDomain).toHaveBeenCalledWith(
      "usp.br",
    );
  });

  it("sets verified=true and links universityId when a matching university is in the DB", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    verificationRepository.findByToken.mockResolvedValue({
      userId: "user-1",
      universityEmail: "me@usp.br",
      token: "valid-token",
      expiresAt: futureDate,
    });
    universityRepository.findByEmailDomain.mockResolvedValue({
      id: "univ-usp",
      name: "Universidade de São Paulo",
    });
    userRepository.update.mockResolvedValue({ id: "user-1" });
    verificationRepository.deleteByUserId.mockResolvedValue(undefined);

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
    verificationRepository.findByToken.mockResolvedValue({
      userId: "user-1",
      universityEmail: "me@unknownuni.br",
      token: "valid-token",
      expiresAt: futureDate,
    });
    universityRepository.findByEmailDomain.mockResolvedValue(null);
    userRepository.update.mockResolvedValue({ id: "user-1" });
    verificationRepository.deleteByUserId.mockResolvedValue(undefined);

    await verifyUniversityEmail("valid-token");

    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      universityEmail: "me@unknownuni.br",
      verified: true,
      universityId: null,
    });
  });

  it("throws 404 when token does not exist", async () => {
    verificationRepository.findByToken.mockResolvedValue(null);

    await expect(verifyUniversityEmail("ghost-token")).rejects.toMatchObject({
      message: "Verification token not found",
      statusCode: 404,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("throws 400 when token has expired", async () => {
    const pastDate = new Date(Date.now() - 1000);
    verificationRepository.findByToken.mockResolvedValue({
      userId: "user-1",
      universityEmail: "me@usp.br",
      token: "expired-token",
      expiresAt: pastDate,
    });

    await expect(verifyUniversityEmail("expired-token")).rejects.toMatchObject({
      message: "Token has expired",
      statusCode: 400,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
