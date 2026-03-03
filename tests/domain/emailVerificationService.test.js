import {
  sendEmailVerificationToUser,
  verifyEmail,
} from "@/domain/emailVerificationService";
import * as emailVerificationRepository from "@/repositories/emailVerificationRepository";
import * as userRepository from "@/repositories/userRepository";
import * as universityRepository from "@/repositories/universityRepository";
import { sendEmailVerification } from "@/lib/emailService";
import { findUniversityByDomain } from "@/lib/universityDomains";

jest.mock("@/repositories/emailVerificationRepository", () => ({
  create: jest.fn(),
  findByToken: jest.fn(),
  deleteByUserId: jest.fn(),
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

jest.mock("@/lib/universityDomains", () => ({
  findUniversityByDomain: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("emailVerificationService.sendEmailVerificationToUser", () => {
  it("deletes any existing token, creates a new one, and sends the email", async () => {
    userRepository.findById.mockResolvedValue({
      id: "user-1",
      emailVerified: false,
    });
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);
    emailVerificationRepository.create.mockResolvedValue({ id: "verif-1" });
    sendEmailVerification.mockResolvedValue(undefined);

    const result = await sendEmailVerificationToUser("user-1", "user@test.com");

    expect(emailVerificationRepository.deleteByUserId).toHaveBeenCalledWith(
      "user-1",
    );
    expect(emailVerificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        email: "user@test.com",
        token: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    );
    expect(sendEmailVerification).toHaveBeenCalledWith(
      "user@test.com",
      expect.any(String),
    );
    expect(result).toEqual({ message: "Verification email sent" });
  });

  it("deletes existing token before creating a new one", async () => {
    userRepository.findById.mockResolvedValue({
      id: "user-1",
      emailVerified: false,
    });
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);
    emailVerificationRepository.create.mockResolvedValue({ id: "verif-2" });
    sendEmailVerification.mockResolvedValue(undefined);

    await sendEmailVerificationToUser("user-1", "user@test.com");

    const deleteOrder =
      emailVerificationRepository.deleteByUserId.mock.invocationCallOrder[0];
    const createOrder =
      emailVerificationRepository.create.mock.invocationCallOrder[0];
    expect(deleteOrder).toBeLessThan(createOrder);
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

    expect(emailVerificationRepository.create).not.toHaveBeenCalled();
    expect(sendEmailVerification).not.toHaveBeenCalled();
  });
});

describe("emailVerificationService.verifyEmail", () => {
  it("sets only emailVerified=true for a personal email domain", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    emailVerificationRepository.findByToken.mockResolvedValue({
      userId: "user-1",
      email: "user@gmail.com",
      token: "valid-token",
      expiresAt: futureDate,
    });
    findUniversityByDomain.mockReturnValue(null);
    userRepository.update.mockResolvedValue({
      id: "user-1",
      emailVerified: true,
    });
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

    const result = await verifyEmail("valid-token");

    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      emailVerified: true,
    });
    expect(universityRepository.findByEmailDomain).not.toHaveBeenCalled();
    expect(result).toEqual({ message: "Email verified successfully" });
  });

  it("also sets universityEmail, verified, and universityId when the email belongs to a known university domain", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    emailVerificationRepository.findByToken.mockResolvedValue({
      userId: "user-1",
      email: "student@usp.br",
      token: "valid-token",
      expiresAt: futureDate,
    });
    findUniversityByDomain.mockReturnValue({
      name: "Universidade de São Paulo",
    });
    universityRepository.findByEmailDomain.mockResolvedValue({
      id: "univ-usp",
    });
    userRepository.update.mockResolvedValue({ id: "user-1" });
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

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

  it("sets universityId to null when the domain is a known university but not in the DB yet", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    emailVerificationRepository.findByToken.mockResolvedValue({
      userId: "user-1",
      email: "student@unknownuni.br",
      token: "valid-token",
      expiresAt: futureDate,
    });
    findUniversityByDomain.mockReturnValue({ name: "Unknown University" });
    universityRepository.findByEmailDomain.mockResolvedValue(null);
    userRepository.update.mockResolvedValue({ id: "user-1" });
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

    await verifyEmail("valid-token");

    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      emailVerified: true,
      universityEmail: "student@unknownuni.br",
      verified: true,
      universityId: null,
    });
  });

  it("throws 404 when token does not exist", async () => {
    emailVerificationRepository.findByToken.mockResolvedValue(null);

    await expect(verifyEmail("ghost-token")).rejects.toMatchObject({
      message: "Verification token not found",
      statusCode: 404,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("throws 400 when token has expired", async () => {
    const pastDate = new Date(Date.now() - 1000);
    emailVerificationRepository.findByToken.mockResolvedValue({
      userId: "user-1",
      email: "user@test.com",
      token: "expired-token",
      expiresAt: pastDate,
    });

    await expect(verifyEmail("expired-token")).rejects.toMatchObject({
      message: "Token has expired",
      statusCode: 400,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
