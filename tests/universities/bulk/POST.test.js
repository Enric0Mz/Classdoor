import { bulkCreateUniversities } from "@/domain/universityService";
import * as universityRepository from "@/repositories/universityRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { POST } from "@/app/api/v1/universities/bulk/route";

jest.mock("@/repositories/universityRepository", () => ({
  findByName: jest.fn(),
  createManyWithDomains: jest.fn(),
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

    universityRepository.findByName.mockResolvedValue(null);
    universityRepository.createManyWithDomains.mockResolvedValue(
      createdUniversities,
    );

    const result = await bulkCreateUniversities(validUniversities);

    expect(universityRepository.findByName).toHaveBeenCalledTimes(2);
    expect(universityRepository.findByName).toHaveBeenCalledWith(
      "University A",
    );
    expect(universityRepository.findByName).toHaveBeenCalledWith(
      "University B",
    );
    expect(universityRepository.createManyWithDomains).toHaveBeenCalledWith(
      validUniversities,
    );
    expect(result).toEqual(createdUniversities);
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

  it("throws 409 when a university name already exists", async () => {
    universityRepository.findByName.mockResolvedValue({
      id: "existing-id",
      name: "University A",
    });

    await expect(
      bulkCreateUniversities([
        { name: "University A", location: "City", type: "PUBLIC" },
      ]),
    ).rejects.toMatchObject({
      message:
        'Item 0: A university with the name "University A" already exists',
      statusCode: 409,
    });

    expect(universityRepository.createManyWithDomains).not.toHaveBeenCalled();
  });

  it("includes the correct item index in validation errors", async () => {
    universityRepository.findByName
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "existing-id", name: "University B" });

    await expect(
      bulkCreateUniversities([
        { name: "University A", location: "City A", type: "PUBLIC" },
        { name: "University B", location: "City B", type: "PRIVATE" },
      ]),
    ).rejects.toMatchObject({
      message:
        'Item 1: A university with the name "University B" already exists',
      statusCode: 409,
    });
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

  it("returns 201 with created universities when authenticated as ADMIN", async () => {
    const createdUniversities = [
      {
        id: "uuid-0",
        name: "University A",
        location: "City A, Brazil",
        type: "PRIVATE",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    requireVerifiedUser.mockReturnValue(adminToken);
    requireRole.mockReturnValue(undefined);
    universityRepository.findByName.mockResolvedValue(null);
    universityRepository.createManyWithDomains.mockResolvedValue(
      createdUniversities,
    );

    const response = await POST(makeRequest(validPayload));

    expect(requireVerifiedUser).toHaveBeenCalled();
    expect(requireRole).toHaveBeenCalledWith(adminToken, ["ADMIN"]);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdUniversities);
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

  it("returns 409 when a university already exists", async () => {
    requireVerifiedUser.mockReturnValue(adminToken);
    requireRole.mockReturnValue(undefined);
    universityRepository.findByName.mockResolvedValue({
      id: "existing-id",
      name: "University A",
    });

    const response = await POST(makeRequest(validPayload));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: {
        message:
          'Item 0: A university with the name "University A" already exists',
        statusCode: 409,
      },
    });
  });

  it("returns 500 on unexpected repository error", async () => {
    requireVerifiedUser.mockReturnValue(adminToken);
    requireRole.mockReturnValue(undefined);
    universityRepository.findByName.mockResolvedValue(null);
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
