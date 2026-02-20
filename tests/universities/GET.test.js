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
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "MIT", location: "Cambridge", type: "PRIVATE", courses: ["Business"], rating: 4.5 },
  { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", name: "USP", location: "São Paulo", type: "PUBLIC", courses: ["Research"], rating: 4.3 },
];

const PAGINATED_UNIVERSITIES = { data: UNIVERSITIES, total: 2 };

function makeGetRequest(searchParams = "") {
  return { url: `http://localhost/api/v1/universities${searchParams}` };
}

beforeEach(() => jest.clearAllMocks());

describe("universityService.listUniversities", () => {
  it("returns paginated universities from the repository", async () => {
    universityRepository.findAll.mockResolvedValue(PAGINATED_UNIVERSITIES);

    const result = await listUniversities();

    expect(universityRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(PAGINATED_UNIVERSITIES);
  });

  it("returns empty data when no universities exist", async () => {
    universityRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await listUniversities();

    expect(result).toEqual({ data: [], total: 0 });
  });
});

describe("GET /api/v1/universities", () => {
  it("returns 200 with paginated universities using defaults", async () => {
    universityRepository.findAll.mockResolvedValue(PAGINATED_UNIVERSITIES);

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: UNIVERSITIES,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  });

  it("returns 200 with correct pagination when page and limit are provided", async () => {
    universityRepository.findAll.mockResolvedValue(PAGINATED_UNIVERSITIES);

    const response = await GET(makeGetRequest("?page=2&limit=1"));

    expect(universityRepository.findAll).toHaveBeenCalledWith({ skip: 1, take: 1 });
    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({ page: 2, limit: 1, total: 2, totalPages: 2 });
  });

  it("returns 200 with empty data when no universities exist", async () => {
    universityRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  });

  it("returns 500 on unexpected repository error", async () => {
    universityRepository.findAll.mockRejectedValue(new Error("DB down"));

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
