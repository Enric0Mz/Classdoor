import { verifyToken, invalidateRefreshToken } from "@/lib/auth";
import { POST } from "@/app/api/v1/users/logout/route";

jest.mock("@/lib/auth", () => ({
  verifyToken: jest
    .fn()
    .mockReturnValue({ id: "user-1", email: "test@test.com", role: "USER" }),
  invalidateRefreshToken: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = (body, token = "Bearer valid-token") => ({
  json: jest.fn().mockResolvedValue(body),
  headers: { get: jest.fn().mockReturnValue(token) },
});

beforeEach(() => jest.clearAllMocks());

describe("POST /api/v1/users/logout", () => {
  it("returns 200 when logout is successful", async () => {
    invalidateRefreshToken.mockResolvedValue(undefined);

    const response = await POST(
      makeRequest({ refreshToken: "valid-refresh-token" }),
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Logged out successfully" });
    expect(verifyToken).toHaveBeenCalled();
    expect(invalidateRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
  });

  it("returns 400 when refreshToken is missing", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Refresh token is required", statusCode: 400 },
    });
  });

  it("returns 401 when access token is missing", async () => {
    verifyToken.mockImplementationOnce(() => {
      throw Object.assign(new Error("Authentication required"), {
        name: "AppError",
        statusCode: 401,
      });
    });

    const response = await POST(
      makeRequest({ refreshToken: "valid-refresh-token" }, null),
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Authentication required", statusCode: 401 },
    });
  });

  it("returns 401 when refresh token is invalid", async () => {
    invalidateRefreshToken.mockRejectedValue(
      Object.assign(new Error("Invalid refresh token"), {
        name: "AppError",
        statusCode: 401,
      }),
    );

    const response = await POST(makeRequest({ refreshToken: "bad-token" }));

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Invalid refresh token", statusCode: 401 },
    });
  });
});
