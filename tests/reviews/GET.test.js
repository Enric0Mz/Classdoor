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
  { id: "review-1", rating: 4, difficultyLevel: 3, universityId: "uni-1", author: null, createdAt: new Date() },
  { id: "review-2", rating: 5, difficultyLevel: 2, universityId: "uni-1", author: null, createdAt: new Date() },
];

describe("reviewService.listReviews", () => {
  it("returns all reviews when no filter is provided", async () => {
    reviewRepository.findAll.mockResolvedValue(SAMPLE_REVIEWS);

    const result = await listReviews();

    expect(reviewRepository.findAll).toHaveBeenCalledWith({ universityId: undefined });
    expect(result).toEqual(SAMPLE_REVIEWS);
  });

  it("passes universityId filter to repository", async () => {
    const filtered = [SAMPLE_REVIEWS[0]];
    reviewRepository.findAll.mockResolvedValue(filtered);

    const result = await listReviews({ universityId: "uni-1" });

    expect(reviewRepository.findAll).toHaveBeenCalledWith({ universityId: "uni-1" });
    expect(result).toEqual(filtered);
  });
});

function makeGetRequest(searchParams = "") {
  return { url: `http://localhost/api/v1/reviews${searchParams}` };
}

describe("GET /api/v1/reviews", () => {
  it("returns 200 with list of reviews", async () => {
    reviewRepository.findAll.mockResolvedValue(SAMPLE_REVIEWS);

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual(SAMPLE_REVIEWS);
  });

  it("returns 200 with filtered reviews when universityId is provided", async () => {
    const filtered = [SAMPLE_REVIEWS[0]];
    reviewRepository.findAll.mockResolvedValue(filtered);

    const response = await GET(makeGetRequest("?universityId=uni-1"));

    expect(reviewRepository.findAll).toHaveBeenCalledWith({ universityId: "uni-1" });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(filtered);
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
