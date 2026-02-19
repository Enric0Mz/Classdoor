import { verifyUniversityEmail } from "@/domain/universityEmailVerificationService";
import * as verificationRepository from "@/repositories/universityEmailVerificationRepository";
import * as userRepository from "@/repositories/userRepository";
import { GET } from "@/app/api/v1/users/me/university-email/verify/route";

jest.mock("@/repositories/universityEmailVerificationRepository", () => ({
  findByToken: jest.fn(),
  deleteByUserId: jest.fn(),
}));

jest.mock("@/repositories/userRepository", () => ({
  update: jest.fn(),
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
  universityEmail: "me@uni.br",
  token: "valid-token",
  expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
};

const EXPIRED_RECORD = {
  id: "verif-2",
  userId: "user-2",
  universityEmail: "me@uni.br",
  token: "expired-token",
  expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
};

describe("universityEmailVerificationService.verifyUniversityEmail", () => {
  it("verifies email, updates user and cleans up record on valid token", async () => {
    verificationRepository.findByToken.mockResolvedValue(VALID_RECORD);
    userRepository.update.mockResolvedValue({ id: "user-1", verified: true });
    verificationRepository.deleteByUserId.mockResolvedValue(undefined);

    const result = await verifyUniversityEmail("valid-token");

    expect(userRepository.update).toHaveBeenCalledWith("user-1", {
      universityEmail: "me@uni.br",
      verified: true,
    });
    expect(verificationRepository.deleteByUserId).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ message: "University email verified successfully" });
  });

  it("throws 404 when token is not found", async () => {
    verificationRepository.findByToken.mockResolvedValue(null);

    await expect(verifyUniversityEmail("unknown-token")).rejects.toMatchObject({
      message: "Verification token not found",
      statusCode: 404,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("throws 400 when token has expired", async () => {
    verificationRepository.findByToken.mockResolvedValue(EXPIRED_RECORD);

    await expect(verifyUniversityEmail("expired-token")).rejects.toMatchObject({
      message: "Token has expired",
      statusCode: 400,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});

function makeRequest(searchParams = "") {
  return { url: `http://localhost/api/v1/users/me/university-email/verify${searchParams}` };
}

describe("GET /api/v1/users/me/university-email/verify", () => {
  it("returns 200 with success message on valid token", async () => {
    verificationRepository.findByToken.mockResolvedValue(VALID_RECORD);
    userRepository.update.mockResolvedValue({ id: "user-1", verified: true });
    verificationRepository.deleteByUserId.mockResolvedValue(undefined);

    const response = await GET(makeRequest("?token=valid-token"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "University email verified successfully" });
  });

  it("returns 400 when token query param is missing", async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "token query parameter is required", statusCode: 400 },
    });
  });

  it("returns 404 when token is unknown", async () => {
    verificationRepository.findByToken.mockResolvedValue(null);

    const response = await GET(makeRequest("?token=unknown-token"));

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { message: "Verification token not found", statusCode: 404 },
    });
  });

  it("returns 400 when token has expired", async () => {
    verificationRepository.findByToken.mockResolvedValue(EXPIRED_RECORD);

    const response = await GET(makeRequest("?token=expired-token"));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Token has expired", statusCode: 400 },
    });
  });
});
