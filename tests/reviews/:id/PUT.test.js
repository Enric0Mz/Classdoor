import { updateReview } from "@/domain/reviewService";
import * as reviewRepository from "@/repositories/reviewRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { PUT } from "@/app/api/v1/reviews/[id]/route";

jest.mock("@/repositories/reviewRepository", () => ({
  findById: jest.fn(),
  update: jest.fn(),
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

const REVIEW = {
  id: "review-1",
  rating: 3,
  difficultyLevel: 2,
  universityId: "uni-1",
  authorId: "user-1",
  author: { id: "user-1", username: "AgilOnca123", verified: false },
};

const UPDATE_DATA = { rating: 5, comment: "Updated comment" };

function makeParams(id) {
  return { params: Promise.resolve({ id }) };
}

describe("reviewService.updateReview", () => {
  it("updates the review when requester is the author", async () => {
    const updatedReview = { ...REVIEW, ...UPDATE_DATA };
    reviewRepository.findById.mockResolvedValue(REVIEW);
    reviewRepository.update.mockResolvedValue(updatedReview);

    const result = await updateReview("review-1", UPDATE_DATA, "user-1");

    expect(reviewRepository.update).toHaveBeenCalledWith(
      "review-1",
      expect.objectContaining({ rating: 5, comment: "Updated comment" })
    );
    expect(result).toEqual({ ...updatedReview, isVerified: false });
  });

  it("throws 403 when requester is not the author", async () => {
    reviewRepository.findById.mockResolvedValue(REVIEW);

    await expect(updateReview("review-1", UPDATE_DATA, "other-user")).rejects.toMatchObject({
      message: "Forbidden",
      statusCode: 403,
    });
    expect(reviewRepository.update).not.toHaveBeenCalled();
  });

  it("throws 404 when review does not exist", async () => {
    reviewRepository.findById.mockResolvedValue(null);

    await expect(updateReview("missing", UPDATE_DATA, "user-1")).rejects.toMatchObject({
      message: "Review not found",
      statusCode: 404,
    });
  });
});

describe("PUT /api/v1/reviews/:id", () => {
  it("returns 200 when the authenticated user is the author", async () => {
    requireVerifiedUser.mockReturnValue({ id: "user-1", email: "user@test.com", role: "USER" });
    const updatedReview = { ...REVIEW, rating: 5 };
    reviewRepository.findById.mockResolvedValue(REVIEW);
    reviewRepository.update.mockResolvedValue(updatedReview);

    const request = {
      json: jest.fn().mockResolvedValue(UPDATE_DATA),
    };

    const response = await PUT(request, makeParams("review-1"));

    expect(response.status).toBe(200);
  });

  it("returns 401 when no token is provided", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Unauthorized", 401);
    });

    const request = { json: jest.fn().mockResolvedValue(UPDATE_DATA) };

    const response = await PUT(request, makeParams("review-1"));

    expect(response.status).toBe(401);
  });

  it("returns 403 when authenticated user is not the author", async () => {
    requireVerifiedUser.mockReturnValue({ id: "other-user", email: "other@test.com", role: "USER" });
    reviewRepository.findById.mockResolvedValue(REVIEW);

    const request = { json: jest.fn().mockResolvedValue(UPDATE_DATA) };

    const response = await PUT(request, makeParams("review-1"));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: { message: "Forbidden", statusCode: 403 },
    });
  });
});
