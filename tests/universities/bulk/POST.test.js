import { bulkCreateUniversities } from "@/domain/universityService";
import * as universityRepository from "@/repositories/universityRepository";
import * as universityDomainRepository from "@/repositories/universityDomainRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { POST } from "@/app/api/v1/universities/bulk/route";

jest.mock("@/repositories/universityRepository", () => ({
  findManyByNames: jest.fn(),
  createManyWithDomains: jest.fn(),
}));

jest.mock("@/repositories/universityDomainRepository", () => ({
  findManyByDomains: jest.fn(),
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

describe("universityService.bulkCreateUniversities", () => {
  const validUniversities = [
    {
      name: "University A",
      location: "City A, Brazil",
      website: "https://a.edu.br",
      type: "PRIVATE",
      courses: ["Engineering"],
      rating: 0,
      domain: "a.edu.br",
    },
    {
      name: "University B",
      location: "City B, Brazil",
      website: "https://b.edu.br",
      type: "PUBLIC",
      courses: ["Law"],
      rating: 0,
      domain: "b.edu.br",
    },
  ];

  it("creates multiple universities with domains", async () => {
    const createdUniversities = validUniversities.map((university, index) => ({
      id: `uuid-${index}`,
      name: university.name,
      location: university.location,
      website: university.website,
      type: university.type,
      courses: university.courses,
      rating: university.rating,
      createdAt: new Date(),
    }));

    universityRepository.findManyByNames.mockResolvedValue([]);
    universityDomainRepository.findManyByDomains.mockResolvedValue([]);
    universityRepository.createManyWithDomains.mockResolvedValue(
      createdUniversities,
    );

    const result = await bulkCreateUniversities(validUniversities);

    expect(universityRepository.findManyByNames).toHaveBeenCalledWith([
      "University A",
      "University B",
    ]);
    expect(universityDomainRepository.findManyByDomains).toHaveBeenCalledWith([
      "a.edu.br",
      "b.edu.br",
    ]);
    expect(universityRepository.createManyWithDomains).toHaveBeenCalledWith(
      validUniversities,
    );
    expect(result).toEqual({ created: 2, skipped: { names: [] } });
  });

  it("throws 400 when body is not an array", async () => {
    await expect(bulkCreateUniversities({})).rejects.toMatchObject({
      message: "Request body must be a non-empty array",
      statusCode: 400,
    });
  });

  it("throws 400 when body is an empty array", async () => {
    await expect(bulkCreateUniversities([])).rejects.toMatchObject({
      message: "Request body must be a non-empty array",
      statusCode: 400,
    });
  });

  it("throws 400 when an item is missing name", async () => {
    await expect(
      bulkCreateUniversities([{ location: "City", type: "PUBLIC" }]),
    ).rejects.toMatchObject({
      message: "Item 0: Name is required",
      statusCode: 400,
    });
  });

  it("throws 400 when an item is missing location", async () => {
    await expect(
      bulkCreateUniversities([{ name: "Uni", type: "PUBLIC" }]),
    ).rejects.toMatchObject({
      message: "Item 0: Location is required",
      statusCode: 400,
    });
  });

  it("throws 400 when an item is missing type", async () => {
    await expect(
      bulkCreateUniversities([{ name: "Uni", location: "City" }]),
    ).rejects.toMatchObject({
      message: "Item 0: Type is required",
      statusCode: 400,
    });
  });

  it("throws 400 when an item has invalid type", async () => {
    await expect(
      bulkCreateUniversities([
        { name: "Uni", location: "City", type: "HYBRID" },
      ]),
    ).rejects.toMatchObject({
      message: "Item 0: Type must be PUBLIC or PRIVATE",
      statusCode: 400,
    });
  });

  it("skips universities that already exist and inserts new ones", async () => {
    universityRepository.findManyByNames.mockResolvedValue([
      { id: "existing-id", name: "University A" },
    ]);
    universityDomainRepository.findManyByDomains.mockResolvedValue([]);
    universityRepository.createManyWithDomains.mockResolvedValue([
      { id: "uuid-1", name: "University B" },
    ]);

    const result = await bulkCreateUniversities(validUniversities);

    expect(universityRepository.createManyWithDomains).toHaveBeenCalledWith([
      validUniversities[1],
    ]);
    expect(result).toEqual({
      created: 1,
      skipped: { names: ["University A"] },
    });
  });

  it("returns 0 when all universities already exist", async () => {
    universityRepository.findManyByNames.mockResolvedValue([
      { id: "id-1", name: "University A" },
      { id: "id-2", name: "University B" },
    ]);

    const result = await bulkCreateUniversities(validUniversities);

    expect(result).toEqual({
      created: 0,
      skipped: { names: ["University A", "University B"] },
    });
    expect(universityRepository.createManyWithDomains).not.toHaveBeenCalled();
  });

  it("deduplicates names within the payload", async () => {
    universityRepository.findManyByNames.mockResolvedValue([]);
    universityDomainRepository.findManyByDomains.mockResolvedValue([]);
    universityRepository.createManyWithDomains.mockResolvedValue([
      { id: "uuid-0", name: "University A" },
    ]);

    const result = await bulkCreateUniversities([
      {
        name: "University A",
        location: "City A",
        type: "PUBLIC",
        domain: "a.edu.br",
      },
      {
        name: "University A",
        location: "City A",
        type: "PUBLIC",
        domain: "a.edu.br",
      },
    ]);

    expect(universityRepository.createManyWithDomains).toHaveBeenCalledWith([
      {
        name: "University A",
        abbreviation: undefined,
        location: "City A",
        type: "PUBLIC",
        domain: "a.edu.br",
        website: undefined,
        images: undefined,
        courses: undefined,
        rating: undefined,
      },
    ]);
    expect(result).toEqual({ created: 1, skipped: { names: [] } });
  });

  it("skips duplicate domains within the payload keeping only the first", async () => {
    universityRepository.findManyByNames.mockResolvedValue([]);
    universityDomainRepository.findManyByDomains.mockResolvedValue([]);
    universityRepository.createManyWithDomains.mockResolvedValue([
      { id: "uuid-0", name: "University A" },
      { id: "uuid-1", name: "University B" },
    ]);

    await bulkCreateUniversities([
      {
        name: "University A",
        location: "City A",
        type: "PUBLIC",
        domain: "same.edu.br",
      },
      {
        name: "University B",
        location: "City B",
        type: "PRIVATE",
        domain: "same.edu.br",
      },
    ]);

    const calledWith =
      universityRepository.createManyWithDomains.mock.calls[0][0];
    expect(calledWith[0].domain).toBe("same.edu.br");
    expect(calledWith[1].domain).toBeUndefined();
  });

  it("skips domains that already exist in the database", async () => {
    universityRepository.findManyByNames.mockResolvedValue([]);
    universityDomainRepository.findManyByDomains.mockResolvedValue([
      { domain: "a.edu.br", universityId: "existing-id" },
    ]);
    universityRepository.createManyWithDomains.mockResolvedValue([
      { id: "uuid-0", name: "University A" },
    ]);

    await bulkCreateUniversities([
      {
        name: "University A",
        location: "City A",
        type: "PUBLIC",
        domain: "a.edu.br",
      },
    ]);

    const calledWith =
      universityRepository.createManyWithDomains.mock.calls[0][0];
    expect(calledWith[0].domain).toBeUndefined();
  });
});

describe("POST /api/v1/universities/bulk", () => {
  const adminToken = {
    id: "admin-1",
    email: "admin@test.com",
    role: "ADMIN",
  };

  const validPayload = [
    {
      name: "University A",
      location: "City A, Brazil",
      type: "PRIVATE",
      domain: "a.edu.br",
    },
  ];

  it("returns 201 with count when authenticated as ADMIN", async () => {
    requireVerifiedUser.mockReturnValue(adminToken);
    requireRole.mockReturnValue(undefined);
    universityRepository.findManyByNames.mockResolvedValue([]);
    universityDomainRepository.findManyByDomains.mockResolvedValue([]);
    universityRepository.createManyWithDomains.mockResolvedValue([
      { id: "uuid-0", name: "University A" },
    ]);

    const response = await POST(makeRequest(validPayload));

    expect(requireVerifiedUser).toHaveBeenCalled();
    expect(requireRole).toHaveBeenCalledWith(adminToken, ["ADMIN"]);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ created: 1, skipped: { names: [] } });
  });

  it("returns 201 with skipped names when all universities already exist", async () => {
    requireVerifiedUser.mockReturnValue(adminToken);
    requireRole.mockReturnValue(undefined);
    universityRepository.findManyByNames.mockResolvedValue([
      { id: "existing-id", name: "University A" },
    ]);

    const response = await POST(makeRequest(validPayload));

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      created: 0,
      skipped: { names: ["University A"] },
    });
  });

  it("returns 401 when no token provided", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Authentication required", 401);
    });

    const response = await POST(makeRequest(validPayload));

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

    const response = await POST(makeRequest(validPayload));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        message: "Forbidden: insufficient permissions",
        statusCode: 403,
      },
    });
  });

  it("returns 400 when body is not an array", async () => {
    requireVerifiedUser.mockReturnValue(adminToken);
    requireRole.mockReturnValue(undefined);

    const response = await POST(makeRequest({ name: "Uni" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        message: "Request body must be a non-empty array",
        statusCode: 400,
      },
    });
  });

  it("returns 400 when an item fails validation", async () => {
    requireVerifiedUser.mockReturnValue(adminToken);
    requireRole.mockReturnValue(undefined);

    const response = await POST(
      makeRequest([{ location: "City", type: "PUBLIC" }]),
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Item 0: Name is required", statusCode: 400 },
    });
  });

  it("returns 500 on unexpected repository error", async () => {
    requireVerifiedUser.mockReturnValue(adminToken);
    requireRole.mockReturnValue(undefined);
    universityRepository.findManyByNames.mockResolvedValue([]);
    universityDomainRepository.findManyByDomains.mockResolvedValue([]);
    universityRepository.createManyWithDomains.mockRejectedValue(
      new Error("DB down"),
    );

    const response = await POST(makeRequest(validPayload));

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
