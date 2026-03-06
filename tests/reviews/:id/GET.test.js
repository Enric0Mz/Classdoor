import { getReviewById } from "@/domain/reviewService";
import * as reviewRepository from "@/repositories/reviewRepository";
import { GET } from "@/app/api/v1/reviews/[id]/route";

jest.mock("@/repositories/reviewRepository", () => ({
  findById: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const SAMPLE_REVIEW = {
  id: "review-1",
  rating: 4,
  difficultyLevel: 3,
  universityId: "uni-1",
  moderationStatus: "APPROVED",
  moderationReason: null,
  author: { id: "user-1", username: "AgilOnca123", verified: true },
  createdAt: new Date(),
  isVerified: false,
};

function makeParams(id) {
  return { params: Promise.resolve({ id }) };
}

describe("reviewService.getReviewById", () => {
  it("returns review with author info", async () => {
    reviewRepository.findById.mockResolvedValue(SAMPLE_REVIEW);

    const result = await getReviewById("review-1");

    expect(result).toEqual(SAMPLE_REVIEW);
    expect(result.author).toHaveProperty("id");
    expect(result.author).toHaveProperty("username");
    expect(result.author).toHaveProperty("verified");
  });

  it("throws 404 when review does not exist", async () => {
    reviewRepository.findById.mockResolvedValue(null);

    await expect(getReviewById("missing")).rejects.toMatchObject({
      message: "Review not found",
      statusCode: 404,
    });
  });
});

describe("GET /api/v1/reviews/:id", () => {
  it("returns 200 with review", async () => {
    reviewRepository.findById.mockResolvedValue(SAMPLE_REVIEW);

    const response = await GET({}, makeParams("review-1"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(SAMPLE_REVIEW);
  });

  it("returns 404 when review is not found", async () => {
    reviewRepository.findById.mockResolvedValue(null);

    const response = await GET({}, makeParams("missing"));

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { message: "Review not found", statusCode: 404 },
    });
  });
});
