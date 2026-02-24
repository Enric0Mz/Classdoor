import {
  sendEmailVerificationToUser,
  verifyEmail,
} from "@/domain/emailVerificationService";
import * as emailVerificationRepository from "@/repositories/emailVerificationRepository";
import * as userRepository from "@/repositories/userRepository";
import { sendEmailVerification } from "@/lib/emailService";

jest.mock("@/repositories/emailVerificationRepository", () => ({
  create: jest.fn(),
  findByToken: jest.fn(),
  deleteByUserId: jest.fn(),
}));

jest.mock("@/repositories/userRepository", () => ({
  update: jest.fn(),
}));

jest.mock("@/lib/emailService", () => ({
  sendEmailVerification: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("emailVerificationService.sendEmailVerificationToUser", () => {
  it("deletes any existing token, creates a new one, and sends the email", async () => {
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);
    emailVerificationRepository.create.mockResolvedValue({ id: "verif-1" });
    sendEmailVerification.mockResolvedValue(undefined);

    const result = await sendEmailVerificationToUser("user-1", "user@test.com");

    expect(emailVerificationRepository.deleteByUserId).toHaveBeenCalledWith("user-1");
    expect(emailVerificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        email: "user@test.com",
        token: expect.any(String),
        expiresAt: expect.any(Date),
      })
    );
    expect(sendEmailVerification).toHaveBeenCalledWith("user@test.com", expect.any(String));
    expect(result).toEqual({ message: "Verification email sent" });
  });

  it("deletes existing token before creating a new one", async () => {
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);
    emailVerificationRepository.create.mockResolvedValue({ id: "verif-2" });
    sendEmailVerification.mockResolvedValue(undefined);

    await sendEmailVerificationToUser("user-1", "user@test.com");

    const deleteOrder = emailVerificationRepository.deleteByUserId.mock.invocationCallOrder[0];
    const createOrder = emailVerificationRepository.create.mock.invocationCallOrder[0];
    expect(deleteOrder).toBeLessThan(createOrder);
  });
});

describe("emailVerificationService.verifyEmail", () => {
  it("sets emailVerified to true and deletes the token on success", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    emailVerificationRepository.findByToken.mockResolvedValue({
      userId: "user-1",
      email: "user@test.com",
      token: "valid-token",
      expiresAt: futureDate,
    });
    userRepository.update.mockResolvedValue({ id: "user-1", emailVerified: true });
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

    const result = await verifyEmail("valid-token");

    expect(userRepository.update).toHaveBeenCalledWith("user-1", { emailVerified: true });
    expect(emailVerificationRepository.deleteByUserId).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ message: "Email verified successfully" });
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
