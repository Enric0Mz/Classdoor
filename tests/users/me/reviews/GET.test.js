import { listReviewsByAuthor } from "@/domain/reviewService";
import * as reviewRepository from "@/repositories/reviewRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { GET } from "@/app/api/v1/users/me/reviews/route";

jest.mock("@/repositories/reviewRepository", () => ({
  findByAuthorId: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  requireVerifiedUser: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const REVIEWS = [
  {
    id: "review-1",
    rating: 4,
    difficultyLevel: 3,
    universityId: "uni-1",
    authorId: "user-1",
    author: { id: "user-1", username: "TestUser", verified: false },
    university: { id: "uni-1", name: "Test University" },
  },
  {
    id: "review-2",
    rating: 5,
    difficultyLevel: 2,
    universityId: "uni-2",
    authorId: "user-1",
    author: { id: "user-1", username: "TestUser", verified: false },
    university: { id: "uni-2", name: "Another University" },
  },
];

describe("reviewService.listReviewsByAuthor", () => {
  it("returns reviews for the given author", async () => {
    reviewRepository.findByAuthorId.mockResolvedValue({
      data: REVIEWS,
      total: 2,
    });

    const result = await listReviewsByAuthor({
      authorId: "user-1",
      skip: 0,
      take: 10,
    });

    expect(reviewRepository.findByAuthorId).toHaveBeenCalledWith({
      authorId: "user-1",
      skip: 0,
      take: 10,
    });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.data[0]).toHaveProperty("isVerified");
  });

  it("returns empty array when author has no reviews", async () => {
    reviewRepository.findByAuthorId.mockResolvedValue({ data: [], total: 0 });

    const result = await listReviewsByAuthor({ authorId: "user-no-reviews" });

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("GET /api/v1/users/me/reviews", () => {
  it("returns 200 with the authenticated user's reviews", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "user-1",
      email: "user@test.com",
      role: "USER",
    });
    reviewRepository.findByAuthorId.mockResolvedValue({
      data: REVIEWS,
      total: 2,
    });

    const request = {
      url: "http://localhost/api/v1/users/me/reviews?page=1&limit=10",
    };

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination).toBeDefined();
  });

  it("returns 401 when no token is provided", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Unauthorized", 401);
    });

    const request = {
      url: "http://localhost/api/v1/users/me/reviews",
    };

    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
