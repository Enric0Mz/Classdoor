import * as emailVerificationRepository from "@/repositories/emailVerificationRepository";
import * as userRepository from "@/repositories/userRepository";
import { PUT } from "@/app/api/v1/users/me/email/verify/route";

jest.mock("@/repositories/emailVerificationRepository", () => ({
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

jest.mock("@/lib/universityDomains", () => ({
  findUniversityByDomain: jest.fn().mockReturnValue(null),
}));

jest.mock("@/lib/emailService", () => ({
  sendEmailVerification: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

function makeRequest(body = {}) {
  return {
    url: "http://localhost/api/v1/users/me/email/verify",
    json: () => Promise.resolve(body),
  };
}

describe("PUT /api/v1/users/me/email/verify", () => {
  it("returns 200 when token is valid", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    emailVerificationRepository.findByToken.mockResolvedValue({
      userId: "user-1",
      email: "user@test.com",
      token: "valid-token",
      expiresAt: futureDate,
    });
    userRepository.update.mockResolvedValue({ id: "user-1" });
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

    const response = await PUT(makeRequest({ token: "valid-token" }));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Email verified successfully" });
  });

  it("returns 400 when token is missing from body", async () => {
    const response = await PUT(makeRequest({}));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "token is required", statusCode: 400 },
    });
  });

  it("returns 404 when token is not found", async () => {
    emailVerificationRepository.findByToken.mockResolvedValue(null);

    const response = await PUT(makeRequest({ token: "ghost-token" }));

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { message: "Verification token not found", statusCode: 404 },
    });
  });

  it("returns 400 when token has expired", async () => {
    const pastDate = new Date(Date.now() - 1000);
    emailVerificationRepository.findByToken.mockResolvedValue({
      userId: "user-1",
      email: "user@test.com",
      token: "expired-token",
      expiresAt: pastDate,
    });

    const response = await PUT(makeRequest({ token: "expired-token" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Token has expired", statusCode: 400 },
    });
  });
});
