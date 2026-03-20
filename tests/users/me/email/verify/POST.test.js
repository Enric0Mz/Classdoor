import * as emailVerificationTokenRepository from "@/repositories/emailVerificationTokenRepository";
import * as userRepository from "@/repositories/userRepository";
import { sendEmailVerification } from "@/lib/emailService";
import { verifyToken } from "@/lib/auth";
import { POST } from "@/app/api/v1/users/me/email/verify/route";

jest.mock("@/repositories/emailVerificationTokenRepository", () => ({
  create: jest.fn(),
  findByToken: jest.fn(),
  revokeByUserIdAndType: jest.fn(),
}));

jest.mock("@/repositories/userRepository", () => ({
  findById: jest.fn(),
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
    userRepository.findById.mockResolvedValue({
      id: "user-1",
      emailVerified: false,
    });
    emailVerificationTokenRepository.revokeByUserIdAndType.mockResolvedValue({
      count: 0,
    });
    emailVerificationTokenRepository.create.mockResolvedValue({
      id: "verif-1",
    });
    sendEmailVerification.mockResolvedValue(undefined);

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Verification email sent" });
    expect(sendEmailVerification).toHaveBeenCalledWith(
      "user@test.com",
      expect.any(String),
    );
  });

  it("returns 400 when the account has no email address", async () => {
    verifyToken.mockReturnValue({ id: "user-anon", email: null });

    const response = await POST(makeRequest());

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        message: "Account has no email address to verify",
        statusCode: 400,
      },
    });
    expect(sendEmailVerification).not.toHaveBeenCalled();
  });

  it("returns 400 when email is already verified", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "user@test.com" });
    userRepository.findById.mockResolvedValue({
      id: "user-1",
      emailVerified: true,
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Email already verified", statusCode: 400 },
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
