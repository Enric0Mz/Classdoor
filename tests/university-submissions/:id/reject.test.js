import { rejectSubmission } from "@/domain/universitySubmissionService";
import * as universitySubmissionRepository from "@/repositories/universitySubmissionRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { PUT } from "@/app/api/v1/university-submissions/[id]/reject/route";

jest.mock("@/repositories/universitySubmissionRepository", () => ({
  findById: jest.fn(),
  updateStatus: jest.fn(),
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

const makeRequest = (body) => ({
  json: jest.fn().mockResolvedValue(body),
  headers: { get: jest.fn() },
});

beforeEach(() => jest.clearAllMocks());

describe("universitySubmissionService.rejectSubmission", () => {
  it("rejects a pending submission with a reason", async () => {
    const submission = { id: "sub-1", name: "USP", status: "PENDING" };
    const rejected = { ...submission, status: "REJECTED", reason: "Duplicada" };

    universitySubmissionRepository.findById.mockResolvedValue(submission);
    universitySubmissionRepository.updateStatus.mockResolvedValue(rejected);

    const result = await rejectSubmission("sub-1", "admin-1", "Duplicada");

    expect(universitySubmissionRepository.updateStatus).toHaveBeenCalledWith(
      "sub-1",
      {
        status: "REJECTED",
        reason: "Duplicada",
        reviewedBy: "admin-1",
        reviewedAt: expect.any(Date),
      },
    );
    expect(result).toEqual(rejected);
  });

  it("throws 400 when reason is missing", async () => {
    await expect(
      rejectSubmission("sub-1", "admin-1", ""),
    ).rejects.toMatchObject({
      message: "Reason is required for rejection",
      statusCode: 400,
    });
  });

  it("throws 400 when reason is only whitespace", async () => {
    await expect(
      rejectSubmission("sub-1", "admin-1", "   "),
    ).rejects.toMatchObject({
      message: "Reason is required for rejection",
      statusCode: 400,
    });
  });

  it("throws 404 when submission does not exist", async () => {
    universitySubmissionRepository.findById.mockResolvedValue(null);

    await expect(
      rejectSubmission("nonexistent", "admin-1", "Invalid"),
    ).rejects.toMatchObject({
      message: "Submission not found",
      statusCode: 404,
    });
  });

  it("throws 400 when submission is not pending", async () => {
    universitySubmissionRepository.findById.mockResolvedValue({
      id: "sub-1",
      status: "REJECTED",
    });

    await expect(
      rejectSubmission("sub-1", "admin-1", "Already rejected"),
    ).rejects.toMatchObject({
      message: "Only pending submissions can be rejected",
      statusCode: 400,
    });
  });
});

describe("PUT /api/v1/university-submissions/[id]/reject", () => {
  it("returns 200 with the rejected submission", async () => {
    const rejected = {
      id: "sub-1",
      name: "USP",
      status: "REJECTED",
      reason: "Duplicada",
    };

    requireVerifiedUser.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    requireRole.mockReturnValue(undefined);
    universitySubmissionRepository.findById.mockResolvedValue({
      id: "sub-1",
      status: "PENDING",
    });
    universitySubmissionRepository.updateStatus.mockResolvedValue(rejected);

    const response = await PUT(makeRequest({ reason: "Duplicada" }), {
      params: Promise.resolve({ id: "sub-1" }),
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(rejected);
  });

  it("returns 400 when reason is missing", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    requireRole.mockReturnValue(undefined);

    const response = await PUT(makeRequest({ reason: "" }), {
      params: Promise.resolve({ id: "sub-1" }),
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Reason is required for rejection", statusCode: 400 },
    });
  });

  it("returns 403 when user is not admin", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockResolvedValue({ id: "user-1", role: "USER" });
    requireRole.mockImplementation(() => {
      throw new AppError("Forbidden: insufficient permissions", 403);
    });

    const response = await PUT(makeRequest({ reason: "Invalid" }), {
      params: Promise.resolve({ id: "sub-1" }),
    });

    expect(response.status).toBe(403);
  });
});
