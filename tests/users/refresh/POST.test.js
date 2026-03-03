import { rotateRefreshToken } from "@/lib/auth";
import { POST } from "@/app/api/v1/users/refresh/route";

jest.mock("@/lib/auth", () => ({
  rotateRefreshToken: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = (body) => ({ json: jest.fn().mockResolvedValue(body) });

beforeEach(() => jest.clearAllMocks());

describe("POST /api/v1/users/refresh", () => {
  it("returns new access token and rotated refresh token", async () => {
    rotateRefreshToken.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    const response = await POST(
      makeRequest({ refreshToken: "old-refresh-token" }),
    );

    expect(response.status).toBe(200);
    expect(response.body.token).toBe("new-access-token");
    expect(response.body.refreshToken).toBe("new-refresh-token");
    expect(rotateRefreshToken).toHaveBeenCalledWith("old-refresh-token");
  });

  it("returns 400 when refreshToken is missing", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Refresh token is required", statusCode: 400 },
    });
  });

  it("returns 401 when refresh token is invalid", async () => {
    rotateRefreshToken.mockRejectedValue(
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

  it("returns 401 when refresh token is expired", async () => {
    rotateRefreshToken.mockRejectedValue(
      Object.assign(new Error("Refresh token expired"), {
        name: "AppError",
        statusCode: 401,
      }),
    );

    const response = await POST(makeRequest({ refreshToken: "expired-token" }));

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Refresh token expired", statusCode: 401 },
    });
  });
});
