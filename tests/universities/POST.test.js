import { createUniversity } from "@/domain/universityService";
import * as universityRepository from "@/repositories/universityRepository";
import { POST } from "@/app/api/v1/universities/route";

jest.mock("@/repositories/universityRepository", () => ({
  findByName: jest.fn(),
  create: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const makeRequest = (body) => ({ json: jest.fn().mockResolvedValue(body) });

beforeEach(() => jest.clearAllMocks());

describe("universityService.createUniversity", () => {
  it("creates a university with valid input", async () => {
    const input = { name: "MIT", location: "Cambridge", website: "https://mit.edu" };
    const created = { id: "1", ...input, createdAt: new Date() };
    universityRepository.findByName.mockResolvedValue(null);
    universityRepository.create.mockResolvedValue(created);

    const result = await createUniversity(input);

    expect(universityRepository.findByName).toHaveBeenCalledWith("MIT");
    expect(universityRepository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(created);
  });

  it("creates a university without the optional website field", async () => {
    const input = { name: "MIT", location: "Cambridge" };
    universityRepository.findByName.mockResolvedValue(null);
    universityRepository.create.mockResolvedValue({ id: "1", ...input });

    await createUniversity(input);

    expect(universityRepository.create).toHaveBeenCalledWith({
      name: "MIT",
      location: "Cambridge",
      website: undefined,
    });
  });

  it("throws 400 when name is missing", async () => {
    await expect(createUniversity({ location: "Cambridge" })).rejects.toMatchObject({
      message: "Name is required",
      statusCode: 400,
    });
    expect(universityRepository.findByName).not.toHaveBeenCalled();
    expect(universityRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when location is missing", async () => {
    await expect(createUniversity({ name: "MIT" })).rejects.toMatchObject({
      message: "Location is required",
      statusCode: 400,
    });
    expect(universityRepository.create).not.toHaveBeenCalled();
  });

  it("throws 409 when university name already exists", async () => {
    universityRepository.findByName.mockResolvedValue({ id: "1", name: "MIT" });

    await expect(
      createUniversity({ name: "MIT", location: "Cambridge" })
    ).rejects.toMatchObject({
      message: "A university with this name already exists",
      statusCode: 409,
    });
    expect(universityRepository.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/v1/universities", () => {
  it("returns 201 with the created university", async () => {
    const input = { name: "MIT", location: "Cambridge", website: "https://mit.edu" };
    const created = { id: "1", ...input, createdAt: "2024-01-01T00:00:00.000Z" };
    universityRepository.findByName.mockResolvedValue(null);
    universityRepository.create.mockResolvedValue(created);

    const response = await POST(makeRequest(input));

    expect(response.status).toBe(201);
    expect(response.body).toEqual(created);
  });

  it("returns 400 when name is missing", async () => {
    const response = await POST(makeRequest({ location: "Cambridge" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Name is required", statusCode: 400 },
    });
  });

  it("returns 400 when location is missing", async () => {
    const response = await POST(makeRequest({ name: "MIT" }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "Location is required", statusCode: 400 },
    });
  });

  it("returns 409 when the university already exists", async () => {
    universityRepository.findByName.mockResolvedValue({ id: "1", name: "MIT" });

    const response = await POST(makeRequest({ name: "MIT", location: "Cambridge" }));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: { message: "A university with this name already exists", statusCode: 409 },
    });
  });

  it("returns 500 on unexpected repository error", async () => {
    universityRepository.findByName.mockResolvedValue(null);
    universityRepository.create.mockRejectedValue(new Error("DB down"));

    const response = await POST(makeRequest({ name: "MIT", location: "Cambridge" }));

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
