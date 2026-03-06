import { DELETE } from "@/app/api/v1/universities/[id]/route";
import { deleteUniversity } from "@/domain/universityService";
import * as universityRepository from "@/repositories/universityRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";

jest.mock("@/repositories/universityRepository", () => ({
  findById: jest.fn(),
  remove: jest.fn(),
}));

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

const UNIVERSITY = {
  id: "uni-1",
  name: "USP",
  location: "SP",
  type: "PUBLIC",
  reviews: [],
};

describe("universityService.deleteUniversity", () => {
  it("deletes the university when it exists", async () => {
    universityRepository.findById.mockResolvedValue(UNIVERSITY);
    universityRepository.remove.mockResolvedValue(UNIVERSITY);

    await deleteUniversity("uni-1");

    expect(universityRepository.findById).toHaveBeenCalledWith("uni-1");
    expect(universityRepository.remove).toHaveBeenCalledWith("uni-1");
  });

  it("throws 404 when university does not exist", async () => {
    universityRepository.findById.mockResolvedValue(null);

    await expect(deleteUniversity("missing")).rejects.toMatchObject({
      message: "University not found",
      statusCode: 404,
    });
    expect(universityRepository.remove).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/v1/universities/:id", () => {
  it("returns 200 when authenticated as ADMIN", async () => {
    requireVerifiedUser.mockReturnValue({ id: "admin-1", role: "ADMIN" });
    requireRole.mockReturnValue(undefined);
    universityRepository.findById.mockResolvedValue(UNIVERSITY);
    universityRepository.remove.mockResolvedValue(UNIVERSITY);

    const response = await DELETE(makeRequest(), makeParams("uni-1"));

    expect(requireVerifiedUser).toHaveBeenCalled();
    expect(requireRole).toHaveBeenCalledWith({ id: "admin-1", role: "ADMIN" }, [
      "ADMIN",
    ]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "University deleted" });
  });

  it("returns 404 when university does not exist", async () => {
    requireVerifiedUser.mockReturnValue({ id: "admin-1", role: "ADMIN" });
    requireRole.mockReturnValue(undefined);
    universityRepository.findById.mockResolvedValue(null);

    const response = await DELETE(makeRequest(), makeParams("missing"));

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { message: "University not found", statusCode: 404 },
    });
  });

  it("returns 401 when no token is provided", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Authentication required", 401);
    });

    const response = await DELETE(makeRequest(), makeParams("uni-1"));

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

    const response = await DELETE(makeRequest(), makeParams("uni-1"));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        message: "Forbidden: insufficient permissions",
        statusCode: 403,
      },
    });
  });
});
