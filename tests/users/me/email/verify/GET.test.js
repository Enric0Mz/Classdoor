import * as emailVerificationRepository from "@/repositories/emailVerificationRepository";
import * as userRepository from "@/repositories/userRepository";
import { GET } from "@/app/api/v1/users/me/email/verify/route";

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

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

function makeRequest(query) {
  return { url: `http://localhost/api/v1/users/me/email/verify?${query}` };
}

describe("GET /api/v1/users/me/email/verify", () => {
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

    const response = await GET(makeRequest("token=valid-token"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Email verified successfully" });
  });

  it("returns 400 when token query param is missing", async () => {
    const response = await GET(makeRequest(""));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "token query parameter is required", statusCode: 400 },
    });
  });

  it("returns 404 when token is not found", async () => {
    emailVerificationRepository.findByToken.mockResolvedValue(null);

    const response = await GET(makeRequest("token=ghost-token"));

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

    const response = await GET(makeRequest("token=expired-token"));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Token has expired", statusCode: 400 },
    });
  });
});
