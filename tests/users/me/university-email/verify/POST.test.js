import { verifyUniversityEmail } from "@/domain/universityEmailVerificationService";
import * as emailVerificationTokenRepository from "@/repositories/emailVerificationTokenRepository";
import * as userRepository from "@/repositories/userRepository";
import { POST } from "@/app/api/v1/users/me/university-email/verify/route";

jest.mock("@/repositories/emailVerificationTokenRepository", () => ({
  findByToken: jest.fn(),
  markAsUsed: jest.fn(),
  revokeByUserIdAndType: jest.fn(),
}));

jest.mock("@/repositories/userRepository", () => ({
  update: jest.fn(),
}));

jest.mock("@/repositories/universityRepository", () => ({
  findByEmailDomain: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/lib/emailService", () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const VALID_RECORD = {
  id: "verif-1",
  userId: "user-1",
  email: "me@uni.br",
  token: "valid-token",
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
};

const EXPIRED_RECORD = {
  id: "verif-2",
  userId: "user-2",
  email: "me@uni.br",
  token: "expired-token",
  expiresAt: new Date(Date.now() - 60 * 60 * 1000),
};

describe("universityEmailVerificationService.verifyUniversityEmail", () => {
  it("verifies email, updates user and marks token as used on valid token", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: VALID_RECORD,
      alreadyUsed: false,
    });
    userRepository.update.mockResolvedValue({ id: "user-1", verified: true });

    const result = await verifyUniversityEmail("valid-token");

    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      universityEmail: "me@uni.br",
      verified: true,
      universityId: null,
    });
    expect(result).toEqual({
      message: "University email verified successfully",
    });
  });

  it("throws 404 when token is not found", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: null,
      alreadyUsed: false,
    });

    await expect(verifyUniversityEmail("unknown-token")).rejects.toMatchObject({
      message: "Verification token not found",
      statusCode: 404,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("throws 400 when token has expired", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: EXPIRED_RECORD,
      alreadyUsed: false,
    });

    await expect(verifyUniversityEmail("expired-token")).rejects.toMatchObject({
      message: "Token has expired",
      statusCode: 400,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("returns success without updating user when token was already used (idempotent)", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: { ...VALID_RECORD, status: "USED" },
      alreadyUsed: true,
    });

    const result = await verifyUniversityEmail("valid-token");

    expect(result).toEqual({
      message: "University email verified successfully",
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});

function makeRequest(body = {}) {
  return {
    url: "http://localhost/api/v1/users/me/university-email/verify",
    json: () => Promise.resolve(body),
  };
}

describe("POST /api/v1/users/me/university-email/verify", () => {
  it("returns 200 with success message on valid token", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: VALID_RECORD,
      alreadyUsed: false,
    });
    userRepository.update.mockResolvedValue({ id: "user-1", verified: true });

    const response = await POST(makeRequest({ token: "valid-token" }));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "University email verified successfully",
    });
  });

  it("returns 400 when token is missing from body", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "token is required", statusCode: 400 },
    });
  });

  it("returns 404 when token is unknown", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: null,
      alreadyUsed: false,
    });

    const response = await POST(makeRequest({ token: "unknown-token" }));

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { message: "Verification token not found", statusCode: 404 },
    });
  });

  it("returns 400 when token has expired", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: EXPIRED_RECORD,
      alreadyUsed: false,
    });

    const response = await POST(makeRequest({ token: "expired-token" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Token has expired", statusCode: 400 },
    });
  });

  it("returns 200 when token was already used (idempotent)", async () => {
    emailVerificationTokenRepository.markAsUsed.mockResolvedValue({
      record: { ...VALID_RECORD, status: "USED" },
      alreadyUsed: true,
    });

    const response = await POST(makeRequest({ token: "valid-token" }));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "University email verified successfully",
    });
  });
});
