import { createSubmission } from "@/domain/universitySubmissionService";
import * as universityRepository from "@/repositories/universityRepository";
import * as universitySubmissionRepository from "@/repositories/universitySubmissionRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { POST } from "@/app/api/v1/university-submissions/route";

jest.mock("@/repositories/universityRepository", () => ({
  findByName: jest.fn(),
}));

jest.mock("@/repositories/universitySubmissionRepository", () => ({
  create: jest.fn(),
  findPendingByName: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  requireVerifiedUser: jest.fn(),
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

describe("universitySubmissionService.createSubmission", () => {
  it("creates a submission with valid input", async () => {
    const input = {
      name: "USP",
      type: "PUBLIC",
      location: "SP",
      website: "https://usp.br",
    };
    const created = {
      id: "sub-1",
      ...input,
      status: "PENDING",
      submitterId: "user-1",
    };

    universityRepository.findByName.mockResolvedValue(null);
    universitySubmissionRepository.findPendingByName.mockResolvedValue(null);
    universitySubmissionRepository.create.mockResolvedValue(created);

    const result = await createSubmission(input, "user-1");

    expect(universityRepository.findByName).toHaveBeenCalledWith("USP");
    expect(
      universitySubmissionRepository.findPendingByName,
    ).toHaveBeenCalledWith("USP");
    expect(universitySubmissionRepository.create).toHaveBeenCalledWith({
      name: "USP",
      location: "SP",
      type: "PUBLIC",
      website: "https://usp.br",
      emailDomain: undefined,
      submitterId: "user-1",
    });
    expect(result).toEqual(created);
  });

  it("creates a submission without optional fields", async () => {
    const input = { name: "UNICAMP", type: "PUBLIC" };

    universityRepository.findByName.mockResolvedValue(null);
    universitySubmissionRepository.findPendingByName.mockResolvedValue(null);
    universitySubmissionRepository.create.mockResolvedValue({
      id: "sub-2",
      ...input,
    });

    await createSubmission(input, "user-1");

    expect(universitySubmissionRepository.create).toHaveBeenCalledWith({
      name: "UNICAMP",
      location: undefined,
      type: "PUBLIC",
      website: undefined,
      emailDomain: undefined,
      submitterId: "user-1",
    });
  });

  it("throws 400 when name is missing", async () => {
    await expect(
      createSubmission({ type: "PUBLIC" }, "user-1"),
    ).rejects.toMatchObject({
      message: "Name is required",
      statusCode: 400,
    });
    expect(universityRepository.findByName).not.toHaveBeenCalled();
  });

  it("throws 400 when type is missing", async () => {
    await expect(
      createSubmission({ name: "USP" }, "user-1"),
    ).rejects.toMatchObject({
      message: "Type is required",
      statusCode: 400,
    });
  });

  it("throws 400 when type is invalid", async () => {
    await expect(
      createSubmission({ name: "USP", type: "HYBRID" }, "user-1"),
    ).rejects.toMatchObject({
      message: "Type must be PUBLIC or PRIVATE",
      statusCode: 400,
    });
  });

  it("throws 409 when university already exists", async () => {
    universityRepository.findByName.mockResolvedValue({
      id: "uni-1",
      name: "USP",
    });

    await expect(
      createSubmission({ name: "USP", type: "PUBLIC" }, "user-1"),
    ).rejects.toMatchObject({
      message: "A university with this name already exists",
      statusCode: 409,
    });
    expect(universitySubmissionRepository.create).not.toHaveBeenCalled();
  });

  it("throws 409 when a pending submission with the same name exists", async () => {
    universityRepository.findByName.mockResolvedValue(null);
    universitySubmissionRepository.findPendingByName.mockResolvedValue({
      id: "sub-1",
      name: "USP",
    });

    await expect(
      createSubmission({ name: "USP", type: "PUBLIC" }, "user-1"),
    ).rejects.toMatchObject({
      message: "A submission with this name is already pending review",
      statusCode: 409,
    });
    expect(universitySubmissionRepository.create).not.toHaveBeenCalled();
  });

  it("creates a submission with emailDomain", async () => {
    const input = { name: "USP", type: "PUBLIC", emailDomain: "usp.br" };

    universityRepository.findByName.mockResolvedValue(null);
    universitySubmissionRepository.findPendingByName.mockResolvedValue(null);
    universitySubmissionRepository.create.mockResolvedValue({
      id: "sub-4",
      ...input,
    });

    await createSubmission(input, "user-1");

    expect(universitySubmissionRepository.create).toHaveBeenCalledWith({
      name: "USP",
      location: undefined,
      type: "PUBLIC",
      website: undefined,
      emailDomain: "usp.br",
      submitterId: "user-1",
    });
  });

  it("sanitizes emailDomain HTML", async () => {
    universityRepository.findByName.mockResolvedValue(null);
    universitySubmissionRepository.findPendingByName.mockResolvedValue(null);
    universitySubmissionRepository.create.mockResolvedValue({ id: "sub-5" });

    await createSubmission(
      {
        name: "USP",
        type: "PUBLIC",
        emailDomain: "<script>alert('xss')</script>usp.br",
      },
      "user-1",
    );

    expect(universitySubmissionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        emailDomain:
          "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;usp.br",
      }),
    );
  });

  it("sanitizes HTML from input fields", async () => {
    universityRepository.findByName.mockResolvedValue(null);
    universitySubmissionRepository.findPendingByName.mockResolvedValue(null);
    universitySubmissionRepository.create.mockResolvedValue({ id: "sub-3" });

    await createSubmission(
      {
        name: "<script>alert('xss')</script>USP",
        type: "PUBLIC",
        location: "<b>SP</b>",
      },
      "user-1",
    );

    expect(universitySubmissionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;USP",
        location: "&lt;b&gt;SP&lt;/b&gt;",
      }),
    );
  });
});

describe("POST /api/v1/university-submissions", () => {
  it("returns 201 with the created submission", async () => {
    const input = { name: "USP", type: "PUBLIC" };
    const created = {
      id: "sub-1",
      ...input,
      status: "PENDING",
      submitterId: "user-1",
    };

    requireVerifiedUser.mockResolvedValue({ id: "user-1", role: "USER" });
    universityRepository.findByName.mockResolvedValue(null);
    universitySubmissionRepository.findPendingByName.mockResolvedValue(null);
    universitySubmissionRepository.create.mockResolvedValue(created);

    const response = await POST(makeRequest(input));

    expect(requireVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual(created);
  });

  it("returns 401 when no token provided", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Authentication required", 401);
    });

    const response = await POST(makeRequest({ name: "USP", type: "PUBLIC" }));

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Authentication required", statusCode: 401 },
    });
  });

  it("returns 400 when name is missing", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "user-1", role: "USER" });

    const response = await POST(makeRequest({ type: "PUBLIC" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Name is required", statusCode: 400 },
    });
  });

  it("returns 409 when university already exists", async () => {
    requireVerifiedUser.mockResolvedValue({ id: "user-1", role: "USER" });
    universityRepository.findByName.mockResolvedValue({
      id: "uni-1",
      name: "USP",
    });

    const response = await POST(makeRequest({ name: "USP", type: "PUBLIC" }));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: {
        message: "A university with this name already exists",
        statusCode: 409,
      },
    });
  });
});
