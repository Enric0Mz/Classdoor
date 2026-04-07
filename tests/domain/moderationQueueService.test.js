import { processPendingReviews } from "@/domain/moderationQueueService";
import * as reviewRepository from "@/repositories/reviewRepository";

jest.mock("@/repositories/reviewRepository", () => ({
  findPendingModeration: jest.fn(),
  update: jest.fn(),
}));

jest.mock("@/repositories/universityRepository", () => ({
  updateRating: jest.fn(),
}));

const mockModerateComment = jest.fn();

jest.mock("@/domain/moderationService", () => ({
  moderateComment: (...args) => mockModerateComment(...args),
}));

beforeEach(() => jest.clearAllMocks());

function makePendingReview(id, comment = "A valid review comment") {
  return {
    id,
    comment,
    moderationStatus: "PENDING_MODERATION",
    moderationReason: null,
  };
}

describe("moderationQueueService", () => {
  it("returns zero stats when there are no pending reviews", async () => {
    reviewRepository.findPendingModeration.mockResolvedValue([]);

    const stats = await processPendingReviews();

    expect(stats).toEqual({ processed: 0, succeeded: 0, failed: 0 });
  });

  it("processes pending reviews and updates their status", async () => {
    const pendingReview = makePendingReview("review-1");
    reviewRepository.findPendingModeration.mockResolvedValue([pendingReview]);
    mockModerateComment.mockResolvedValue({
      moderationStatus: "APPROVED",
      moderationReason: null,
    });
    reviewRepository.update.mockResolvedValue({});

    const stats = await processPendingReviews();

    expect(mockModerateComment).toHaveBeenCalledWith(pendingReview.comment);
    expect(reviewRepository.update).toHaveBeenCalledWith("review-1", {
      moderationStatus: "APPROVED",
      moderationReason: null,
    });
    expect(stats).toEqual({ processed: 1, succeeded: 1, failed: 0 });
  });

  it("counts as failed when moderation still returns PENDING_MODERATION", async () => {
    reviewRepository.findPendingModeration.mockResolvedValue([
      makePendingReview("review-1"),
    ]);
    mockModerateComment.mockResolvedValue({
      moderationStatus: "PENDING_MODERATION",
      moderationReason: null,
    });

    const stats = await processPendingReviews();

    expect(reviewRepository.update).not.toHaveBeenCalled();
    expect(stats).toEqual({ processed: 1, succeeded: 0, failed: 1 });
  });

  it("handles mixed results in a batch", async () => {
    reviewRepository.findPendingModeration.mockResolvedValue([
      makePendingReview("review-1"),
      makePendingReview("review-2"),
      makePendingReview("review-3"),
    ]);

    mockModerateComment
      .mockResolvedValueOnce({
        moderationStatus: "APPROVED",
        moderationReason: null,
      })
      .mockResolvedValueOnce({
        moderationStatus: "PENDING_MODERATION",
        moderationReason: null,
      })
      .mockResolvedValueOnce({
        moderationStatus: "REJECTED_OFFENSIVE",
        moderationReason: "Linguagem ofensiva.",
      });

    reviewRepository.update.mockResolvedValue({});

    const stats = await processPendingReviews();

    expect(stats).toEqual({ processed: 3, succeeded: 2, failed: 1 });
    expect(reviewRepository.update).toHaveBeenCalledTimes(2);
  });

  it("counts as failed when moderateComment throws an error", async () => {
    reviewRepository.findPendingModeration.mockResolvedValue([
      makePendingReview("review-1"),
    ]);
    mockModerateComment.mockRejectedValue(new Error("Unexpected error"));

    const stats = await processPendingReviews();

    expect(reviewRepository.update).not.toHaveBeenCalled();
    expect(stats).toEqual({ processed: 1, succeeded: 0, failed: 1 });
  });

  it("passes batchSize to findPendingModeration", async () => {
    reviewRepository.findPendingModeration.mockResolvedValue([]);

    await processPendingReviews(10);

    expect(reviewRepository.findPendingModeration).toHaveBeenCalledWith(10);
  });
});
