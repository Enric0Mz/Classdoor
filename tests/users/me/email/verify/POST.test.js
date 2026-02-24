import * as emailVerificationRepository from "@/repositories/emailVerificationRepository";
import { sendEmailVerification } from "@/lib/emailService";
import { verifyToken } from "@/lib/auth";
import { POST } from "@/app/api/v1/users/me/email/verify/route";

jest.mock("@/repositories/emailVerificationRepository", () => ({
  create: jest.fn(),
  findByToken: jest.fn(),
  deleteByUserId: jest.fn(),
}));

jest.mock("@/lib/emailService", () => ({
  sendEmailVerification: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  verifyToken: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const makeRequest = () => ({ headers: { get: jest.fn() } });

describe("POST /api/v1/users/me/email/verify", () => {
  it("returns 200 and resends the verification email", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "user@test.com" });
    emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);
    emailVerificationRepository.create.mockResolvedValue({ id: "verif-1" });
    sendEmailVerification.mockResolvedValue(undefined);

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Verification email sent" });
    expect(sendEmailVerification).toHaveBeenCalledWith("user@test.com", expect.any(String));
  });

  it("returns 400 when the account has no email address", async () => {
    verifyToken.mockReturnValue({ id: "user-anon", email: null });

    const response = await POST(makeRequest());

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Account has no email address to verify", statusCode: 400 },
    });
    expect(sendEmailVerification).not.toHaveBeenCalled();
  });

  it("returns 401 when no token is provided", async () => {
    const { AppError } = require("@/errors/AppError");
    verifyToken.mockImplementation(() => {
      throw new AppError("Unauthorized", 401);
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
  });
});
