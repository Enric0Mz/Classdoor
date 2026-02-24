import { PUT } from "@/app/api/v1/universities/[id]/route";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";

jest.mock("@/lib/auth", () => ({
  requireVerifiedUser: jest.fn(),
}));

jest.mock("@/lib/authorization", () => ({
  requireRole: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = () => ({ headers: { get: jest.fn() } });

function makeParams(id) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => jest.clearAllMocks());

describe("PUT /api/v1/universities/:id", () => {
  it("returns 501 when authenticated as ADMIN", async () => {
    requireVerifiedUser.mockReturnValue({ id: "admin-1", role: "ADMIN" });
    requireRole.mockReturnValue(undefined);

    const response = await PUT(makeRequest(), makeParams("uni-1"));

    expect(requireVerifiedUser).toHaveBeenCalled();
    expect(requireRole).toHaveBeenCalledWith({ id: "admin-1", role: "ADMIN" }, [
      "ADMIN",
    ]);
    expect(response.status).toBe(501);
    expect(response.body).toEqual({ message: "Not implemented" });
  });

  it("returns 401 when no token is provided", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Authentication required", 401);
    });

    const response = await PUT(makeRequest(), makeParams("uni-1"));

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Authentication required", statusCode: 401 },
    });
  });

  it("returns 403 when authenticated user is not ADMIN", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockReturnValue({ id: "user-1", role: "USER" });
    requireRole.mockImplementation(() => {
      throw new AppError("Forbidden: insufficient permissions", 403);
    });

    const response = await PUT(makeRequest(), makeParams("uni-1"));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        message: "Forbidden: insufficient permissions",
        statusCode: 403,
      },
    });
  });
});
