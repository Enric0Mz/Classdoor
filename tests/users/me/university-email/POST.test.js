import { submitUniversityEmail } from "@/domain/universityEmailVerificationService";
import * as verificationRepository from "@/repositories/universityEmailVerificationRepository";
import * as userRepository from "@/repositories/userRepository";
import { sendVerificationEmail } from "@/lib/emailService";
import { requireVerifiedUser } from "@/lib/auth";
import { POST } from "@/app/api/v1/users/me/university-email/route";

jest.mock("@/repositories/universityEmailVerificationRepository", () => ({
  create: jest.fn(),
  findByToken: jest.fn(),
  deleteByUserId: jest.fn(),
}));

jest.mock("@/repositories/userRepository", () => ({
  update: jest.fn(),
}));

jest.mock("@/lib/emailService", () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  requireVerifiedUser: jest.fn(),
}));

jest.mock("@/repositories/universityRepository", () => ({
  findByEmailDomain: jest.fn(),
}));

jest.mock("@/lib/universityDomains", () => ({
  findUniversityByDomain: jest.fn().mockReturnValue({ name: "Test University" }),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

describe("universityEmailVerificationService.submitUniversityEmail", () => {
  it("creates a verification token and sends an email", async () => {
    verificationRepository.deleteByUserId.mockResolvedValue(undefined);
    verificationRepository.create.mockResolvedValue({ id: "verif-1" });
    sendVerificationEmail.mockResolvedValue(undefined);

    const result = await submitUniversityEmail("user-1", "user@email.com", "me@uni.br");

    expect(verificationRepository.deleteByUserId).toHaveBeenCalledWith("user-1");
    expect(verificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        universityEmail: "me@uni.br",
        token: expect.any(String),
        expiresAt: expect.any(Date),
      })
    );
    expect(sendVerificationEmail).toHaveBeenCalledWith("me@uni.br", expect.any(String));
    expect(result).toEqual({ message: "Verification email sent" });
  });

  it("throws 403 for anonymous users without a registered email", async () => {
    await expect(
      submitUniversityEmail("user-anon", null, "me@uni.br")
    ).rejects.toMatchObject({
      message: "Anonymous accounts cannot submit a university email",
      statusCode: 403,
    });
    expect(verificationRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when university email format is invalid", async () => {
    await expect(
      submitUniversityEmail("user-1", "user@email.com", "not-an-email")
    ).rejects.toMatchObject({
      message: "Invalid university email format",
      statusCode: 400,
    });
    expect(verificationRepository.create).not.toHaveBeenCalled();
  });

  it("deletes any existing pending verification before creating a new one", async () => {
    verificationRepository.deleteByUserId.mockResolvedValue(undefined);
    verificationRepository.create.mockResolvedValue({ id: "verif-2" });
    sendVerificationEmail.mockResolvedValue(undefined);

    await submitUniversityEmail("user-1", "user@email.com", "me@uni.br");

    expect(verificationRepository.deleteByUserId).toHaveBeenCalledWith("user-1");
    // deleteByUserId must be called before create
    const deleteCallOrder = verificationRepository.deleteByUserId.mock.invocationCallOrder[0];
    const createCallOrder = verificationRepository.create.mock.invocationCallOrder[0];
    expect(deleteCallOrder).toBeLessThan(createCallOrder);
  });
});

function makeRequest(body, token) {
  const request = { json: jest.fn().mockResolvedValue(body) };
  if (token) {
    request.headers = { get: jest.fn().mockReturnValue(`Bearer ${token}`) };
  }
  return request;
}

describe("POST /api/v1/users/me/university-email", () => {
  it("returns 200 with success message for authenticated user", async () => {
    requireVerifiedUser.mockReturnValue({ id: "user-1", email: "user@email.com", role: "USER" });
    verificationRepository.deleteByUserId.mockResolvedValue(undefined);
    verificationRepository.create.mockResolvedValue({ id: "verif-1" });
    sendVerificationEmail.mockResolvedValue(undefined);

    const response = await POST(makeRequest({ universityEmail: "me@uni.br" }, "valid-token"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Verification email sent" });
  });

  it("returns 401 when no auth token is provided", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Unauthorized", 401);
    });

    const response = await POST(makeRequest({ universityEmail: "me@uni.br" }));

    expect(response.status).toBe(401);
  });

  it("returns 403 for anonymous user without a registered email", async () => {
    requireVerifiedUser.mockReturnValue({ id: "user-anon", email: null, role: "USER" });

    const response = await POST(makeRequest({ universityEmail: "me@uni.br" }, "anon-token"));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        message: "Anonymous accounts cannot submit a university email",
        statusCode: 403,
      },
    });
  });

  it("returns 400 when universityEmail field is missing", async () => {
    requireVerifiedUser.mockReturnValue({ id: "user-1", email: "user@email.com", role: "USER" });

    const response = await POST(makeRequest({}, "valid-token"));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "universityEmail is required", statusCode: 400 },
    });
  });
});
