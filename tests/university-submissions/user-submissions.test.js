import * as universitySubmissionRepository from "@/repositories/universitySubmissionRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { GET } from "@/app/api/v1/users/me/university-submissions/route";

jest.mock("@/repositories/universitySubmissionRepository", () => ({
  findBySubmitter: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  requireVerifiedUser: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = (query = "") => ({
  url: `http://localhost:3000/api/v1/users/me/university-submissions${query}`,
  headers: { get: jest.fn() },
});

beforeEach(() => jest.clearAllMocks());

describe("GET /api/v1/users/me/university-submissions", () => {
  it("returns the user's own submissions", async () => {
    const submissions = [
      { id: "sub-1", name: "USP", status: "PENDING" },
      { id: "sub-2", name: "UNICAMP", status: "APPROVED" },
    ];

    requireVerifiedUser.mockResolvedValue({ id: "user-1", role: "USER" });
    universitySubmissionRepository.findBySubmitter.mockResolvedValue({
      data: submissions,
      total: 2,
    });

    const response = await GET(makeRequest());

    expect(requireVerifiedUser).toHaveBeenCalled();
    expect(universitySubmissionRepository.findBySubmitter).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ skip: 0 }),
    );
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(submissions);
    expect(response.body.pagination.total).toBe(2);
  });

  it("returns 401 when not authenticated", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Authentication required", 401);
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Authentication required", statusCode: 401 },
    });
  });

  it("supports pagination parameters", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "user-1", role: "USER" });
    universitySubmissionRepository.findBySubmitter.mockResolvedValue({
      data: [],
      total: 0,
    });

    await GET(makeRequest("?page=2&limit=5"));

    expect(universitySubmissionRepository.findBySubmitter).toHaveBeenCalledWith(
      "user-1",
      { skip: 5, take: 5 },
    );
  });
});
