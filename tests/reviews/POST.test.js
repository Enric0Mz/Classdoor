import { createReview } from "@/domain/reviewService";
import * as reviewRepository from "@/repositories/reviewRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { POST } from "@/app/api/v1/reviews/route";

jest.mock("@/repositories/reviewRepository", () => ({
  create: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  requireVerifiedUser: jest.fn(),
}));

jest.mock("@/domain/moderationService", () => ({
  moderateComment: jest.fn().mockResolvedValue({
    moderationStatus: "APPROVED",
    moderationReason: null,
  }),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const VALID_REVIEW_BODY = {
  rating: 4,
  difficultyLevel: 3,
  universityId: "uni-1",
  comment: "Great university",
};

describe("reviewService.createReview", () => {
  it("creates a review linked to the authenticated author", async () => {
    const created = {
      id: "review-1",
      ...VALID_REVIEW_BODY,
      authorId: "user-1",
      author: { id: "user-1", username: "AgilOnca123", verified: false },
    };
    reviewRepository.create.mockResolvedValue(created);

    const result = await createReview(VALID_REVIEW_BODY, "user-1");

    expect(reviewRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: "user-1",
        universityId: "uni-1",
        rating: 4,
      }),
    );
    expect(result).toEqual({ review: { ...created, isVerified: false } });
    expect(result).not.toHaveProperty("editToken");
  });

  it("throws 400 when universityId is missing", async () => {
    const { universityId: _removed, ...bodyWithoutUniversityId } =
      VALID_REVIEW_BODY;

    await expect(
      createReview(bodyWithoutUniversityId, "user-1"),
    ).rejects.toMatchObject({
      message: "universityId is required",
      statusCode: 400,
    });
    expect(reviewRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when rating is out of range", async () => {
    await expect(
      createReview({ ...VALID_REVIEW_BODY, rating: 6 }, "user-1"),
    ).rejects.toMatchObject({
      message: "Rating must be an integer between 1 and 5",
      statusCode: 400,
    });
  });

  it("throws 400 when difficultyLevel is out of range", async () => {
    await expect(
      createReview({ ...VALID_REVIEW_BODY, difficultyLevel: 0 }, "user-1"),
    ).rejects.toMatchObject({
      message: "Difficulty level must be an integer between 1 and 5",
      statusCode: 400,
    });
  });
});

function makeRequest(body) {
  return {
    url: "http://localhost/api/v1/reviews",
    json: jest.fn().mockResolvedValue(body),
  };
}

describe("POST /api/v1/reviews", () => {
  it("returns 201 with the created review when authenticated", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "user-1",
      email: "user@test.com",
      role: "USER",
    });
    const created = {
      id: "review-1",
      ...VALID_REVIEW_BODY,
      authorId: "user-1",
    };
    reviewRepository.create.mockResolvedValue(created);

    const response = await POST(makeRequest(VALID_REVIEW_BODY));

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      review: { ...created, isVerified: false },
    });
    expect(response.body).not.toHaveProperty("editToken");
  });

  it("returns 401 when no token is provided", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Unauthorized", 401);
    });

    const response = await POST(makeRequest(VALID_REVIEW_BODY));

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Unauthorized", statusCode: 401 },
    });
  });

  it("returns 400 when required fields are missing", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "user-1",
      email: "user@test.com",
      role: "USER",
    });

    const response = await POST(makeRequest({ rating: 4, difficultyLevel: 3 }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "universityId is required", statusCode: 400 },
    });
  });
});
