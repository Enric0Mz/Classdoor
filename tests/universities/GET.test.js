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

const UNIVERSITIES_FROM_DB = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "MIT",
    location: "Cambridge",
    type: "PRIVATE",
    courses: ["Business"],
    rating: 4.5,
    reviews: [{ rating: 5 }, { rating: 4 }],
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "USP",
    location: "São Paulo",
    type: "PUBLIC",
    courses: ["Research"],
    rating: 4.3,
    reviews: [{ rating: 4 }, { rating: 5 }],
  },
];

const ENRICHED_UNIVERSITIES = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "MIT",
    location: "Cambridge",
    type: "PRIVATE",
    courses: ["Business"],
    rating: 4.5,
    reviewCount: 2,
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "USP",
    location: "São Paulo",
    type: "PUBLIC",
    courses: ["Research"],
    rating: 4.5,
    reviewCount: 2,
  },
];

const PAGINATED_UNIVERSITIES = { data: UNIVERSITIES_FROM_DB, total: 2 };

function makeGetRequest(searchParams = "") {
  return { url: `http://localhost/api/v1/universities${searchParams}` };
}

beforeEach(() => jest.clearAllMocks());

describe("universityService.listUniversities", () => {
  it("enriches universities with reviewCount and computed rating", async () => {
    universityRepository.findAll.mockResolvedValue(PAGINATED_UNIVERSITIES);

    const result = await listUniversities();

    expect(universityRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual(ENRICHED_UNIVERSITIES);
    expect(result.total).toBe(2);
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
      data: ENRICHED_UNIVERSITIES,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  });

  it("returns 200 with correct pagination when page and limit are provided", async () => {
    universityRepository.findAll.mockResolvedValue(PAGINATED_UNIVERSITIES);

    const response = await GET(makeGetRequest("?page=2&limit=1"));

    expect(universityRepository.findAll).toHaveBeenCalledWith({
      skip: 1,
      take: 1,
      where: undefined,
    });
    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
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

  it("passes search param to repository as where clause", async () => {
    universityRepository.findAll.mockResolvedValue({ data: [UNIVERSITIES_FROM_DB[1]], total: 1 });

    const response = await GET(makeGetRequest("?search=USP"));

    expect(response.status).toBe(200);
    expect(universityRepository.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: {
        AND: [
          {
            OR: [
              { name: { contains: "USP", mode: "insensitive" } },
              { abbreviation: { contains: "USP", mode: "insensitive" } },
              { location: { contains: "USP", mode: "insensitive" } },
              { courses: { hasSome: ["USP"] } },
            ],
          },
        ],
      },
    });
  });

  it("passes type filter to repository as where clause", async () => {
    universityRepository.findAll.mockResolvedValue({ data: [UNIVERSITIES_FROM_DB[1]], total: 1 });

    const response = await GET(makeGetRequest("?type=PUBLIC"));

    expect(response.status).toBe(200);
    expect(universityRepository.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: { AND: [{ type: "PUBLIC" }] },
    });
  });

  it("passes state filter to repository as where clause", async () => {
    universityRepository.findAll.mockResolvedValue({ data: [UNIVERSITIES_FROM_DB[1]], total: 1 });

    const response = await GET(makeGetRequest("?state=SP"));

    expect(response.status).toBe(200);
    expect(universityRepository.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: {
        AND: [{ location: { contains: "SP", mode: "insensitive" } }],
      },
    });
  });

  it("combines search, type, and state filters", async () => {
    universityRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const response = await GET(makeGetRequest("?search=São&type=PUBLIC&state=SP"));

    expect(response.status).toBe(200);
    expect(universityRepository.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: {
        AND: [
          {
            OR: [
              { name: { contains: "São", mode: "insensitive" } },
              { abbreviation: { contains: "São", mode: "insensitive" } },
              { location: { contains: "São", mode: "insensitive" } },
              { courses: { hasSome: ["São"] } },
            ],
          },
          { type: "PUBLIC" },
          { location: { contains: "SP", mode: "insensitive" } },
        ],
      },
    });
  });

  it("passes no where clause when no filters are provided", async () => {
    universityRepository.findAll.mockResolvedValue(PAGINATED_UNIVERSITIES);

    await GET(makeGetRequest());

    expect(universityRepository.findAll).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: undefined,
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
