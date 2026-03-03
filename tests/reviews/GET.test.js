import { listReviews } from "@/domain/reviewService";
import * as reviewRepository from "@/repositories/reviewRepository";
import { GET } from "@/app/api/v1/reviews/route";

jest.mock("@/repositories/reviewRepository", () => ({
  findAll: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const SAMPLE_REVIEWS = [
  {
    id: "review-1",
    rating: 4,
    difficultyLevel: 3,
    universityId: "uni-1",
    author: null,
    createdAt: new Date(),
    isVerified: false,
  },
  {
    id: "review-2",
    rating: 5,
    difficultyLevel: 2,
    universityId: "uni-1",
    author: null,
    createdAt: new Date(),
    isVerified: false,
  },
];

const PAGINATED_REVIEWS = { data: SAMPLE_REVIEWS, total: 2 };

function makeGetRequest(searchParams = "") {
  return { url: `http://localhost/api/v1/reviews${searchParams}` };
}

describe("reviewService.listReviews", () => {
  it("returns paginated reviews when no filter is provided", async () => {
    reviewRepository.findAll.mockResolvedValue(PAGINATED_REVIEWS);

    const result = await listReviews();

    expect(reviewRepository.findAll).toHaveBeenCalledWith({
      universityId: undefined,
      skip: undefined,
      take: undefined,
    });
    expect(result).toEqual(PAGINATED_REVIEWS);
  });

  it("passes universityId filter to repository", async () => {
    const filtered = { data: [SAMPLE_REVIEWS[0]], total: 1 };
    reviewRepository.findAll.mockResolvedValue(filtered);

    const result = await listReviews({ universityId: "uni-1" });

    expect(reviewRepository.findAll).toHaveBeenCalledWith({
      universityId: "uni-1",
      skip: undefined,
      take: undefined,
    });
    expect(result).toEqual(filtered);
  });
});

describe("GET /api/v1/reviews", () => {
  it("returns 200 with paginated reviews using defaults", async () => {
    reviewRepository.findAll.mockResolvedValue(PAGINATED_REVIEWS);

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: SAMPLE_REVIEWS,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  });

  it("returns 200 with correct pagination when page and limit are provided", async () => {
    reviewRepository.findAll.mockResolvedValue(PAGINATED_REVIEWS);

    const response = await GET(makeGetRequest("?page=2&limit=5"));

    expect(reviewRepository.findAll).toHaveBeenCalledWith({
      universityId: null,
      skip: 5,
      take: 5,
    });
    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      page: 2,
      limit: 5,
      total: 2,
      totalPages: 1,
    });
  });

  it("returns 200 with filtered reviews when universityId is provided", async () => {
    const filtered = { data: [SAMPLE_REVIEWS[0]], total: 1 };
    reviewRepository.findAll.mockResolvedValue(filtered);

    const response = await GET(makeGetRequest("?universityId=uni-1"));

    expect(reviewRepository.findAll).toHaveBeenCalledWith({
      universityId: "uni-1",
      skip: 0,
      take: 10,
    });
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([SAMPLE_REVIEWS[0]]);
  });

  it("returns 500 on repository error", async () => {
    reviewRepository.findAll.mockRejectedValue(new Error("Database failure"));

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
