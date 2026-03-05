import { approveSubmission } from "@/domain/universitySubmissionService";
import * as universityDomainRepository from "@/repositories/universityDomainRepository";
import * as universitySubmissionRepository from "@/repositories/universitySubmissionRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { PUT } from "@/app/api/v1/university-submissions/[id]/approve/route";

jest.mock("@/repositories/universityDomainRepository", () => ({
  create: jest.fn(),
}));

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

const makeRequest = (body = {}) => ({
  json: jest.fn().mockResolvedValue(body),
  headers: { get: jest.fn() },
});

beforeEach(() => jest.clearAllMocks());

describe("universitySubmissionService.approveSubmission", () => {
  it("approves a pending submission", async () => {
    const submission = { id: "sub-1", name: "USP", status: "PENDING" };
    const approved = {
      ...submission,
      status: "APPROVED",
      reviewedBy: "admin-1",
    };

    universitySubmissionRepository.findById.mockResolvedValue(submission);
    universitySubmissionRepository.updateStatus.mockResolvedValue(approved);

    const result = await approveSubmission("sub-1", "admin-1");

    expect(universitySubmissionRepository.updateStatus).toHaveBeenCalledWith(
      "sub-1",
      {
        status: "APPROVED",
        reviewedBy: "admin-1",
        reviewedAt: expect.any(Date),
        universityId: undefined,
      },
    );
    expect(result).toEqual(approved);
  });

  it("creates UniversityDomain when emailDomain and universityId are provided", async () => {
    const submission = {
      id: "sub-1",
      name: "USP",
      status: "PENDING",
      emailDomain: "usp.br",
    };
    const approved = { ...submission, status: "APPROVED" };

    universitySubmissionRepository.findById.mockResolvedValue(submission);
    universitySubmissionRepository.updateStatus.mockResolvedValue(approved);
    universityDomainRepository.create.mockResolvedValue({
      id: "dom-1",
      domain: "usp.br",
    });

    await approveSubmission("sub-1", "admin-1", { universityId: "uni-1" });

    expect(universityDomainRepository.create).toHaveBeenCalledWith(
      "usp.br",
      "uni-1",
    );
  });

  it("uses emailDomain from options over submission emailDomain", async () => {
    const submission = {
      id: "sub-1",
      name: "USP",
      status: "PENDING",
      emailDomain: "old.br",
    };
    const approved = { ...submission, status: "APPROVED" };

    universitySubmissionRepository.findById.mockResolvedValue(submission);
    universitySubmissionRepository.updateStatus.mockResolvedValue(approved);
    universityDomainRepository.create.mockResolvedValue({ id: "dom-1" });

    await approveSubmission("sub-1", "admin-1", {
      universityId: "uni-1",
      emailDomain: "corrected.br",
    });

    expect(universityDomainRepository.create).toHaveBeenCalledWith(
      "corrected.br",
      "uni-1",
    );
  });

  it("skips domain creation when emailDomain is absent", async () => {
    const submission = { id: "sub-1", name: "USP", status: "PENDING" };
    const approved = { ...submission, status: "APPROVED" };

    universitySubmissionRepository.findById.mockResolvedValue(submission);
    universitySubmissionRepository.updateStatus.mockResolvedValue(approved);

    await approveSubmission("sub-1", "admin-1", { universityId: "uni-1" });

    expect(universityDomainRepository.create).not.toHaveBeenCalled();
  });

  it("skips domain creation when universityId is absent", async () => {
    const submission = {
      id: "sub-1",
      name: "USP",
      status: "PENDING",
      emailDomain: "usp.br",
    };
    const approved = { ...submission, status: "APPROVED" };

    universitySubmissionRepository.findById.mockResolvedValue(submission);
    universitySubmissionRepository.updateStatus.mockResolvedValue(approved);

    await approveSubmission("sub-1", "admin-1");

    expect(universityDomainRepository.create).not.toHaveBeenCalled();
  });

  it("throws 404 when submission does not exist", async () => {
    universitySubmissionRepository.findById.mockResolvedValue(null);

    await expect(
      approveSubmission("nonexistent", "admin-1"),
    ).rejects.toMatchObject({
      message: "Submission not found",
      statusCode: 404,
    });
  });

  it("throws 400 when submission is not pending", async () => {
    universitySubmissionRepository.findById.mockResolvedValue({
      id: "sub-1",
      status: "APPROVED",
    });

    await expect(approveSubmission("sub-1", "admin-1")).rejects.toMatchObject({
      message: "Only pending submissions can be approved",
      statusCode: 400,
    });
  });
});

describe("PUT /api/v1/university-submissions/[id]/approve", () => {
  it("returns 200 with the approved submission", async () => {
    const approved = { id: "sub-1", name: "USP", status: "APPROVED" };

    requireVerifiedUser.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    requireRole.mockReturnValue(undefined);
    universitySubmissionRepository.findById.mockResolvedValue({
      id: "sub-1",
      status: "PENDING",
    });
    universitySubmissionRepository.updateStatus.mockResolvedValue(approved);

    const response = await PUT(makeRequest(), {
      params: Promise.resolve({ id: "sub-1" }),
    });

    expect(requireRole).toHaveBeenCalledWith({ id: "admin-1", role: "ADMIN" }, [
      "ADMIN",
    ]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(approved);
  });

  it("returns 403 when user is not admin", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockResolvedValue({ id: "user-1", role: "USER" });
    requireRole.mockImplementation(() => {
      throw new AppError("Forbidden: insufficient permissions", 403);
    });

    const response = await PUT(makeRequest(), {
      params: Promise.resolve({ id: "sub-1" }),
    });

    expect(response.status).toBe(403);
  });
});
