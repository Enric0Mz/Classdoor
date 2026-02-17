import { listUniversities } from "@/domain/universityService";
import * as universityRepository from "@/repositories/universityRepository";
import { GET } from "@/app/api/v1/universities/route";

jest.mock("@/repositories/universityRepository", () => ({
  findAll: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const UNIVERSITIES = [
  { id: "1", name: "MIT", location: "Cambridge" },
  { id: "2", name: "Stanford", location: "Palo Alto" },
];

beforeEach(() => jest.clearAllMocks());

describe("universityService.listUniversities", () => {
  it("returns all universities from the repository", async () => {
    universityRepository.findAll.mockResolvedValue(UNIVERSITIES);

    const result = await listUniversities();

    expect(universityRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(UNIVERSITIES);
  });

  it("returns an empty array when no universities exist", async () => {
    universityRepository.findAll.mockResolvedValue([]);

    const result = await listUniversities();

    expect(result).toEqual([]);
  });
});

describe("GET /api/v1/universities", () => {
  it("returns 200 with the list of universities", async () => {
    universityRepository.findAll.mockResolvedValue(UNIVERSITIES);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(UNIVERSITIES);
  });

  it("returns 200 with an empty array when no universities exist", async () => {
    universityRepository.findAll.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 500 on unexpected repository error", async () => {
    universityRepository.findAll.mockRejectedValue(new Error("DB down"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
