import { createUniversity } from "@/domain/universityService";
import * as universityRepository from "@/repositories/universityRepository";
import * as universityDomainRepository from "@/repositories/universityDomainRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { POST } from "@/app/api/v1/universities/route";

jest.mock("@/repositories/universityRepository", () => ({
  findByName: jest.fn(),
  findBySlug: jest.fn(),
  create: jest.fn(),
}));

jest.mock("@/repositories/universityDomainRepository", () => ({
  findByDomain: jest.fn(),
  create: jest.fn(),
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

describe("universityService.createUniversity", () => {
  it("creates a university with valid input", async () => {
    const input = {
      name: "MIT",
      location: "Cambridge",
      website: "https://mit.edu",
      type: "PRIVATE",
      courses: ["Business"],
      rating: 4.5,
    };
    const created = {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      ...input,
      createdAt: new Date(),
    };
    universityRepository.findByName.mockResolvedValue(null);
    universityRepository.create.mockResolvedValue(created);

    const result = await createUniversity(input);

    expect(universityRepository.findByName).toHaveBeenCalledWith("MIT");
    expect(universityRepository.create).toHaveBeenCalledWith({
      ...input,
      slug: "mit",
    });
    expect(result).toEqual(created);
  });

  it("creates a university without optional fields", async () => {
    const input = { name: "MIT", location: "Cambridge", type: "PUBLIC" };
    universityRepository.findByName.mockResolvedValue(null);
    universityRepository.create.mockResolvedValue({
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      ...input,
    });

    await createUniversity(input);

    expect(universityRepository.create).toHaveBeenCalledWith({
      name: "MIT",
      slug: "mit",
      abbreviation: undefined,
      location: "Cambridge",
      website: undefined,
      images: undefined,
      type: "PUBLIC",
      courses: undefined,
      rating: undefined,
    });
  });

  it("throws 400 when name is missing", async () => {
    await expect(
      createUniversity({ location: "Cambridge", type: "PUBLIC" }),
    ).rejects.toMatchObject({
      message: "Name is required",
      statusCode: 400,
    });
    expect(universityRepository.findByName).not.toHaveBeenCalled();
    expect(universityRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when location is missing", async () => {
    await expect(
      createUniversity({ name: "MIT", type: "PUBLIC" }),
    ).rejects.toMatchObject({
      message: "Location is required",
      statusCode: 400,
    });
    expect(universityRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when type is missing", async () => {
    await expect(
      createUniversity({ name: "MIT", location: "Cambridge" }),
    ).rejects.toMatchObject({
      message: "Type is required",
      statusCode: 400,
    });
    expect(universityRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when type is invalid", async () => {
    await expect(
      createUniversity({ name: "MIT", location: "Cambridge", type: "HYBRID" }),
    ).rejects.toMatchObject({
      message: "Type must be PUBLIC or PRIVATE",
      statusCode: 400,
    });
    expect(universityRepository.create).not.toHaveBeenCalled();
  });

  it("creates a university and links the domain when domain is provided", async () => {
    const input = {
      name: "USP",
      location: "Sao Paulo",
      type: "PUBLIC",
      domain: "usp.br",
    };
    const created = {
      id: "uni-id-123",
      name: "USP",
      location: "Sao Paulo",
      type: "PUBLIC",
      createdAt: new Date(),
    };
    universityRepository.findByName.mockResolvedValue(null);
    universityDomainRepository.findByDomain.mockResolvedValue(null);
    universityRepository.create.mockResolvedValue(created);
    universityDomainRepository.create.mockResolvedValue({
      id: "domain-id-1",
      domain: "usp.br",
      universityId: "uni-id-123",
    });

    const result = await createUniversity(input);

    expect(universityDomainRepository.findByDomain).toHaveBeenCalledWith(
      "usp.br",
    );
    expect(universityDomainRepository.create).toHaveBeenCalledWith(
      "usp.br",
      "uni-id-123",
    );
    expect(result).toEqual(created);
  });

  it("throws 409 when domain is already linked to another university", async () => {
    const input = {
      name: "USP",
      location: "Sao Paulo",
      type: "PUBLIC",
      domain: "usp.br",
    };
    universityRepository.findByName.mockResolvedValue(null);
    universityDomainRepository.findByDomain.mockResolvedValue({
      id: "existing-domain",
      domain: "usp.br",
      universityId: "other-uni-id",
    });

    await expect(createUniversity(input)).rejects.toMatchObject({
      message: "This domain is already linked to another university",
      statusCode: 409,
    });
    expect(universityRepository.create).not.toHaveBeenCalled();
  });

  it("does not create a domain record when domain is not provided", async () => {
    const input = { name: "MIT", location: "Cambridge", type: "PRIVATE" };
    universityRepository.findByName.mockResolvedValue(null);
    universityRepository.create.mockResolvedValue({
      id: "uni-id-456",
      ...input,
    });

    await createUniversity(input);

    expect(universityDomainRepository.findByDomain).not.toHaveBeenCalled();
    expect(universityDomainRepository.create).not.toHaveBeenCalled();
  });

  it("throws 409 when university name already exists", async () => {
    universityRepository.findByName.mockResolvedValue({
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      name: "MIT",
    });

    await expect(
      createUniversity({ name: "MIT", location: "Cambridge", type: "PRIVATE" }),
    ).rejects.toMatchObject({
      message: "A university with this name already exists",
      statusCode: 409,
    });
    expect(universityRepository.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/v1/universities", () => {
  it("returns 201 with the created university when authenticated as ADMIN", async () => {
    const input = {
      name: "MIT",
      location: "Cambridge",
      website: "https://mit.edu",
      type: "PRIVATE",
      courses: ["Business"],
      rating: 4.5,
    };
    const created = {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      ...input,
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    requireVerifiedUser.mockReturnValue({
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    });
    requireRole.mockReturnValue(undefined);
    universityRepository.findByName.mockResolvedValue(null);
    universityRepository.create.mockResolvedValue(created);

    const response = await POST(makeRequest(input));

    expect(requireVerifiedUser).toHaveBeenCalled();
    expect(requireRole).toHaveBeenCalledWith(
      { id: "admin-1", email: "admin@test.com", role: "ADMIN" },
      ["ADMIN"],
    );
    expect(response.status).toBe(201);
    expect(response.body).toEqual(created);
  });

  it("returns 401 when no token provided", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Authentication required", 401);
    });

    const response = await POST(
      makeRequest({ name: "MIT", location: "Cambridge", type: "PUBLIC" }),
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Authentication required", statusCode: 401 },
    });
  });

  it("returns 403 when authenticated user is not ADMIN", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockReturnValue({
      id: "user-1",
      email: "user@test.com",
      role: "USER",
    });
    requireRole.mockImplementation(() => {
      throw new AppError("Forbidden: insufficient permissions", 403);
    });

    const response = await POST(
      makeRequest({ name: "MIT", location: "Cambridge", type: "PUBLIC" }),
    );

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        message: "Forbidden: insufficient permissions",
        statusCode: 403,
      },
    });
  });

  it("returns 400 when name is missing", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    });
    requireRole.mockReturnValue(undefined);

    const response = await POST(
      makeRequest({ location: "Cambridge", type: "PUBLIC" }),
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Name is required", statusCode: 400 },
    });
  });

  it("returns 400 when location is missing", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    });
    requireRole.mockReturnValue(undefined);

    const response = await POST(makeRequest({ name: "MIT", type: "PUBLIC" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Location is required", statusCode: 400 },
    });
  });

  it("returns 400 when type is missing", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    });
    requireRole.mockReturnValue(undefined);

    const response = await POST(
      makeRequest({ name: "MIT", location: "Cambridge" }),
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Type is required", statusCode: 400 },
    });
  });

  it("returns 400 when type is invalid", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    });
    requireRole.mockReturnValue(undefined);

    const response = await POST(
      makeRequest({ name: "MIT", location: "Cambridge", type: "HYBRID" }),
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Type must be PUBLIC or PRIVATE", statusCode: 400 },
    });
  });

  it("returns 409 when the university already exists", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    });
    requireRole.mockReturnValue(undefined);
    universityRepository.findByName.mockResolvedValue({
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      name: "MIT",
    });

    const response = await POST(
      makeRequest({ name: "MIT", location: "Cambridge", type: "PRIVATE" }),
    );

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: {
        message: "A university with this name already exists",
        statusCode: 409,
      },
    });
  });

  it("returns 500 on unexpected repository error", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    });
    requireRole.mockReturnValue(undefined);
    universityRepository.findByName.mockResolvedValue(null);
    universityRepository.create.mockRejectedValue(new Error("DB down"));

    const response = await POST(
      makeRequest({ name: "MIT", location: "Cambridge", type: "PUBLIC" }),
    );

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
