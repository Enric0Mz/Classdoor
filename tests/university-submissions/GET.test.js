import * as universitySubmissionRepository from "@/repositories/universitySubmissionRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { GET } from "@/app/api/v1/university-submissions/route";

jest.mock("@/repositories/universitySubmissionRepository", () => ({
  findAll: jest.fn(),
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

const makeRequest = (query = "") => ({
  url: `http://localhost:3000/api/v1/university-submissions${query}`,
  headers: { get: jest.fn() },
});

beforeEach(() => jest.clearAllMocks());

describe("GET /api/v1/university-submissions", () => {
  it("returns paginated submissions for admin", async () => {
    const submissions = [
      {
        id: "sub-1",
        name: "USP",
        status: "PENDING",
        submitter: { id: "user-1", username: "joao" },
      },
    ];
    requireVerifiedUser.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    requireRole.mockReturnValue(undefined);
    universitySubmissionRepository.findAll.mockResolvedValue({
      data: submissions,
      total: 1,
    });

    const response = await GET(makeRequest());

    expect(requireVerifiedUser).toHaveBeenCalled();
    expect(requireRole).toHaveBeenCalledWith({ id: "admin-1", role: "ADMIN" }, [
      "ADMIN",
      "MODERATOR",
    ]);
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(submissions);
    expect(response.body.pagination).toBeDefined();
  });

  it("filters by status query parameter", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    requireRole.mockReturnValue(undefined);
    universitySubmissionRepository.findAll.mockResolvedValue({
      data: [],
      total: 0,
    });

    await GET(makeRequest("?status=PENDING"));

    expect(universitySubmissionRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ status: "PENDING" }),
    );
  });

  it("returns 401 when not authenticated", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Authentication required", 401);
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not admin or moderator", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockResolvedValue({ id: "user-1", role: "USER" });
    requireRole.mockImplementation(() => {
      throw new AppError("Forbidden: insufficient permissions", 403);
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(403);
  });
});
