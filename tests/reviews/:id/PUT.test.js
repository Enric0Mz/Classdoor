import { updateReview } from "@/domain/reviewService";
import * as reviewRepository from "@/repositories/reviewRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { PUT } from "@/app/api/v1/reviews/[id]/route";

jest.mock("@/repositories/reviewRepository", () => ({
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
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

const REVIEW = {
  id: "review-1",
  rating: 3,
  difficultyLevel: 2,
  comment: "Original comment",
  universityId: "uni-1",
  authorId: "user-1",
  author: { id: "user-1", username: "AgilOnca123", verified: false },
};

const UPDATE_DATA = { rating: 5, comment: "Updated comment" };

function makeParams(id) {
  return { params: Promise.resolve({ id }) };
}

describe("reviewService.updateReview", () => {
  it("creates a child review instead of updating in place", async () => {
    const createdReview = { ...REVIEW, ...UPDATE_DATA, id: "review-2" };
    reviewRepository.findById.mockResolvedValue(REVIEW);
    reviewRepository.create.mockResolvedValue(createdReview);

    const result = await updateReview("review-1", UPDATE_DATA, "user-1");

    expect(reviewRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        parentReviewId: "review-1",
        rating: 5,
        comment: "Updated comment",
      }),
    );
    expect(reviewRepository.update).not.toHaveBeenCalled();
    expect(result.review.isVerified).toBe(false);
  });

  it("throws 403 when requester is not the author", async () => {
    reviewRepository.findById.mockResolvedValue(REVIEW);

    await expect(
      updateReview("review-1", UPDATE_DATA, "other-user"),
    ).rejects.toMatchObject({
      message: "Forbidden",
      statusCode: 403,
    });
    expect(reviewRepository.create).not.toHaveBeenCalled();
  });

  it("throws 404 when review does not exist", async () => {
    reviewRepository.findById.mockResolvedValue(null);

    await expect(
      updateReview("missing", UPDATE_DATA, "user-1"),
    ).rejects.toMatchObject({
      message: "Review not found",
      statusCode: 404,
    });
  });

  it("allows ADMIN to update another user's review", async () => {
    const createdReview = { ...REVIEW, ...UPDATE_DATA, id: "review-2" };
    reviewRepository.findById.mockResolvedValue(REVIEW);
    reviewRepository.create.mockResolvedValue(createdReview);

    const result = await updateReview(
      "review-1",
      UPDATE_DATA,
      "admin-user",
      "ADMIN",
    );

    expect(reviewRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 5 }),
    );
    expect(result.review.isVerified).toBe(false);
  });

  it("allows MODERATOR to update another user's review", async () => {
    const createdReview = { ...REVIEW, ...UPDATE_DATA, id: "review-2" };
    reviewRepository.findById.mockResolvedValue(REVIEW);
    reviewRepository.create.mockResolvedValue(createdReview);

    const result = await updateReview(
      "review-1",
      UPDATE_DATA,
      "mod-user",
      "MODERATOR",
    );

    expect(reviewRepository.create).toHaveBeenCalled();
    expect(result.review.isVerified).toBe(false);
  });

  it("returns moderation info when comment update is pending moderation", async () => {
    const { moderateComment } = require("@/domain/moderationService");
    moderateComment.mockResolvedValueOnce({
      moderationStatus: "PENDING_MODERATION",
      moderationReason: "Needs review",
    });

    const createdReview = {
      ...REVIEW,
      comment: "Some suspicious text",
      moderationStatus: "PENDING_MODERATION",
      id: "review-2",
    };
    reviewRepository.findById.mockResolvedValue(REVIEW);
    reviewRepository.create.mockResolvedValue(createdReview);

    const result = await updateReview(
      "review-1",
      { comment: "Some suspicious text" },
      "user-1",
    );

    expect(result.moderation).toEqual({
      status: "PENDING_MODERATION",
      reason: "Sua avaliação foi recebida e será publicada em breve.",
    });
  });

  it("returns rejection info when comment update is rejected", async () => {
    const { moderateComment } = require("@/domain/moderationService");
    moderateComment.mockResolvedValueOnce({
      moderationStatus: "REJECTED_OFFENSIVE",
      moderationReason: "Conteúdo ofensivo detectado.",
    });

    const createdReview = {
      ...REVIEW,
      comment: "Offensive content",
      moderationStatus: "REJECTED_OFFENSIVE",
      id: "review-2",
    };
    reviewRepository.findById.mockResolvedValue(REVIEW);
    reviewRepository.create.mockResolvedValue(createdReview);

    const result = await updateReview(
      "review-1",
      { comment: "Offensive content" },
      "user-1",
    );

    expect(result.moderation).toEqual({
      status: "REJECTED_OFFENSIVE",
      reason: "Conteúdo ofensivo detectado.",
    });
  });

  it("updates in place when only rating is changed (no child review created)", async () => {
    const updatedReview = { ...REVIEW, rating: 4 };
    reviewRepository.findById.mockResolvedValue(REVIEW);
    reviewRepository.update.mockResolvedValue(updatedReview);

    await updateReview("review-1", { rating: 4 }, "user-1");

    expect(reviewRepository.update).toHaveBeenCalledWith("review-1", {
      rating: 4,
      difficultyLevel: 2,
    });
    expect(reviewRepository.create).not.toHaveBeenCalled();
  });
});

describe("PUT /api/v1/reviews/:id", () => {
  it("returns 200 when the authenticated user is the author", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "user-1",
      email: "user@test.com",
      role: "USER",
    });
    const createdReview = { ...REVIEW, rating: 5, id: "review-2" };
    reviewRepository.findById.mockResolvedValue(REVIEW);
    reviewRepository.create.mockResolvedValue(createdReview);

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
    requireVerifiedUser.mockReturnValue({
      id: "other-user",
      email: "other@test.com",
      role: "USER",
    });
    reviewRepository.findById.mockResolvedValue(REVIEW);

    const request = { json: jest.fn().mockResolvedValue(UPDATE_DATA) };

    const response = await PUT(request, makeParams("review-1"));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: { message: "Forbidden", statusCode: 403 },
    });
  });
});
