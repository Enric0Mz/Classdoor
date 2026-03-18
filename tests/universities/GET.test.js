import { listUniversities } from "@/domain/universityService";
import * as universityRepository from "@/repositories/universityRepository";
import { GET } from "@/app/api/v1/universities/route";

jest.mock("@/repositories/universityRepository", () => ({
  findAll: jest.fn(),
  findAllOrderedByReviewCount: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const ENRICHED_UNIVERSITIES = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "MIT",
    location: "Cambridge",
    type: "PRIVATE",
    courses: ["Business"],
    rating: 4.5,
    reviewCount: 2,
    images: [],
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "USP",
    location: "São Paulo",
    type: "PUBLIC",
    courses: ["Research"],
    rating: 4.5,
    reviewCount: 2,
    images: [],
  },
];

const PAGINATED_RESULT = { data: ENRICHED_UNIVERSITIES, total: 2 };

function makeGetRequest(searchParams = "") {
  return { url: `http://localhost/api/v1/universities${searchParams}` };
}

beforeEach(() => jest.clearAllMocks());

describe("universityService.listUniversities", () => {
  it("delegates to findAllOrderedByReviewCount", async () => {
    universityRepository.findAllOrderedByReviewCount.mockResolvedValue(
      PAGINATED_RESULT,
    );

    const result = await listUniversities({
      skip: 0,
      take: 10,
      search: "MIT",
      type: "PRIVATE",
      state: "SP",
    });

    expect(
      universityRepository.findAllOrderedByReviewCount,
    ).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      search: "MIT",
      type: "PRIVATE",
      state: "SP",
    });
    expect(result.data).toEqual(ENRICHED_UNIVERSITIES);
    expect(result.total).toBe(2);
  });

  it("returns empty data when no universities exist", async () => {
    universityRepository.findAllOrderedByReviewCount.mockResolvedValue({
      data: [],
      total: 0,
    });

    const result = await listUniversities();

    expect(result).toEqual({ data: [], total: 0 });
  });
});

describe("GET /api/v1/universities", () => {
  it("returns 200 with paginated universities using defaults", async () => {
    universityRepository.findAllOrderedByReviewCount.mockResolvedValue(
      PAGINATED_RESULT,
    );

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: ENRICHED_UNIVERSITIES,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  });

  it("returns 200 with correct pagination when page and limit are provided", async () => {
    universityRepository.findAllOrderedByReviewCount.mockResolvedValue(
      PAGINATED_RESULT,
    );

    const response = await GET(makeGetRequest("?page=2&limit=1"));

    expect(
      universityRepository.findAllOrderedByReviewCount,
    ).toHaveBeenCalledWith({
      skip: 1,
      take: 1,
      search: undefined,
      type: undefined,
      state: undefined,
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
    universityRepository.findAllOrderedByReviewCount.mockResolvedValue({
      data: [],
      total: 0,
    });

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  });

  it("passes search param to repository", async () => {
    universityRepository.findAllOrderedByReviewCount.mockResolvedValue({
      data: [ENRICHED_UNIVERSITIES[1]],
      total: 1,
    });

    const response = await GET(makeGetRequest("?search=USP"));

    expect(response.status).toBe(200);
    expect(
      universityRepository.findAllOrderedByReviewCount,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ search: "USP", skip: 0, take: 10 }),
    );
  });

  it("passes type filter to repository", async () => {
    universityRepository.findAllOrderedByReviewCount.mockResolvedValue({
      data: [ENRICHED_UNIVERSITIES[1]],
      total: 1,
    });

    const response = await GET(makeGetRequest("?type=PUBLIC"));

    expect(response.status).toBe(200);
    expect(
      universityRepository.findAllOrderedByReviewCount,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ type: "PUBLIC", skip: 0, take: 10 }),
    );
  });

  it("passes state filter to repository", async () => {
    universityRepository.findAllOrderedByReviewCount.mockResolvedValue({
      data: [ENRICHED_UNIVERSITIES[1]],
      total: 1,
    });

    const response = await GET(makeGetRequest("?state=SP"));

    expect(response.status).toBe(200);
    expect(
      universityRepository.findAllOrderedByReviewCount,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ state: "SP", skip: 0, take: 10 }),
    );
  });

  it("combines search, type, and state filters", async () => {
    universityRepository.findAllOrderedByReviewCount.mockResolvedValue({
      data: [],
      total: 0,
    });

    const response = await GET(
      makeGetRequest("?search=São&type=PUBLIC&state=SP"),
    );

    expect(response.status).toBe(200);
    expect(
      universityRepository.findAllOrderedByReviewCount,
    ).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      search: "São",
      type: "PUBLIC",
      state: "SP",
    });
  });

  it("passes no filters when none are provided", async () => {
    universityRepository.findAllOrderedByReviewCount.mockResolvedValue(
      PAGINATED_RESULT,
    );

    await GET(makeGetRequest());

    expect(
      universityRepository.findAllOrderedByReviewCount,
    ).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      search: undefined,
      type: undefined,
      state: undefined,
    });
  });

  it("returns 500 on unexpected repository error", async () => {
    universityRepository.findAllOrderedByReviewCount.mockRejectedValue(
      new Error("DB down"),
    );

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
