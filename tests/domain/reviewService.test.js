import {
  createReview,
  listReviews,
  getReviewById,
  updateReview,
} from "@/domain/reviewService";
import * as reviewRepository from "@/repositories/reviewRepository";

jest.mock("@/repositories/reviewRepository", () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock("@/lib/sanitize", () => ({
  sanitizeString: jest.fn((value) => value),
}));

const mockModerateComment = jest.fn().mockResolvedValue({
  moderationStatus: "APPROVED",
  moderationReason: null,
});

jest.mock("@/domain/moderationService", () => ({
  moderateComment: (...args) => mockModerateComment(...args),
}));

beforeEach(() => jest.clearAllMocks());

const UNIVERSITY_ID = "univ-usp";

function makeReview(authorUniversityId, reviewUniversityId = UNIVERSITY_ID) {
  return {
    id: "review-1",
    rating: 4,
    difficultyLevel: 3,
    universityId: reviewUniversityId,
    comment: "Great university",
    authorId: "user-1",
    moderationStatus: "APPROVED",
    moderationReason: null,
    author: {
      id: "user-1",
      username: "TestUser",
      verified: true,
      universityId: authorUniversityId,
    },
    createdAt: new Date(),
  };
}

describe("reviewService — isVerified computation", () => {
  describe("getReviewById", () => {
    it("returns isVerified=true when author's universityId matches the reviewed university", async () => {
      reviewRepository.findById.mockResolvedValue(makeReview(UNIVERSITY_ID));

      const result = await getReviewById("review-1");

      expect(result.isVerified).toBe(true);
    });

    it("returns isVerified=false when author's universityId differs from the reviewed university", async () => {
      reviewRepository.findById.mockResolvedValue(makeReview("univ-other"));

      const result = await getReviewById("review-1");

      expect(result.isVerified).toBe(false);
    });

    it("returns isVerified=false when author's universityId is null", async () => {
      reviewRepository.findById.mockResolvedValue(makeReview(null));

      const result = await getReviewById("review-1");

      expect(result.isVerified).toBe(false);
    });

    it("returns isVerified=false when review has no author", async () => {
      const reviewWithNoAuthor = { ...makeReview(null), author: null };
      reviewRepository.findById.mockResolvedValue(reviewWithNoAuthor);

      const result = await getReviewById("review-1");

      expect(result.isVerified).toBe(false);
    });
  });

  describe("listReviews", () => {
    it("adds isVerified to all reviews in the list", async () => {
      reviewRepository.findAll.mockResolvedValue({
        data: [
          makeReview(UNIVERSITY_ID), // same university → verified
          makeReview("univ-other"), // different university → not verified
          makeReview(null), // no university link → not verified
        ],
        total: 3,
      });

      const { data } = await listReviews({ universityId: UNIVERSITY_ID });

      expect(data[0].isVerified).toBe(true);
      expect(data[1].isVerified).toBe(false);
      expect(data[2].isVerified).toBe(false);
    });
  });

  describe("createReview", () => {
    it("returns isVerified on the created review", async () => {
      reviewRepository.create.mockResolvedValue(makeReview(UNIVERSITY_ID));

      const { review } = await createReview(
        {
          rating: 4,
          difficultyLevel: 3,
          universityId: UNIVERSITY_ID,
          comment: "Great university overall!",
        },
        "user-1",
      );

      expect(review.isVerified).toBe(true);
    });

    it("throws 400 when comment is missing", async () => {
      await expect(
        createReview(
          { rating: 4, difficultyLevel: 3, universityId: UNIVERSITY_ID },
          "user-1",
        ),
      ).rejects.toMatchObject({
        message: "comment is required",
        statusCode: 400,
      });
    });

    it("throws 400 when comment is too short", async () => {
      await expect(
        createReview(
          {
            rating: 4,
            difficultyLevel: 3,
            universityId: UNIVERSITY_ID,
            comment: "short",
          },
          "user-1",
        ),
      ).rejects.toMatchObject({
        message: "comment must be at least 10 characters",
        statusCode: 400,
      });
    });

    it("throws 400 when comment exceeds the maximum length", async () => {
      const tooLongComment = "a".repeat(2001);
      await expect(
        createReview(
          {
            rating: 4,
            difficultyLevel: 3,
            universityId: UNIVERSITY_ID,
            comment: tooLongComment,
          },
          "user-1",
        ),
      ).rejects.toMatchObject({
        message: "comment must be at most 2000 characters",
        statusCode: 400,
      });
    });
  });

  describe("createReview — moderation", () => {
    it("passes the sanitized comment to moderateComment", async () => {
      reviewRepository.create.mockResolvedValue(makeReview(UNIVERSITY_ID));

      await createReview(
        {
          rating: 4,
          difficultyLevel: 3,
          universityId: UNIVERSITY_ID,
          comment: "Great university overall!",
        },
        "user-1",
      );

      expect(mockModerateComment).toHaveBeenCalledWith(
        "Great university overall!",
      );
    });

    it("saves moderationStatus and moderationReason to the database", async () => {
      mockModerateComment.mockResolvedValueOnce({
        moderationStatus: "REJECTED_OFFENSIVE",
        moderationReason: "Linguagem ofensiva detectada.",
      });
      reviewRepository.create.mockResolvedValue({
        ...makeReview(UNIVERSITY_ID),
        moderationStatus: "REJECTED_OFFENSIVE",
        moderationReason: "Linguagem ofensiva detectada.",
      });

      await createReview(
        {
          rating: 4,
          difficultyLevel: 3,
          universityId: UNIVERSITY_ID,
          comment: "Texto ofensivo aqui!!",
        },
        "user-1",
      );

      expect(reviewRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          moderationStatus: "REJECTED_OFFENSIVE",
          moderationReason: "Linguagem ofensiva detectada.",
        }),
      );
    });

    it("returns moderation object when review is rejected", async () => {
      mockModerateComment.mockResolvedValueOnce({
        moderationStatus: "REJECTED_NONSENSE",
        moderationReason: "Conteúdo sem sentido.",
      });
      reviewRepository.create.mockResolvedValue({
        ...makeReview(UNIVERSITY_ID),
        moderationStatus: "REJECTED_NONSENSE",
        moderationReason: "Conteúdo sem sentido.",
      });

      const result = await createReview(
        {
          rating: 4,
          difficultyLevel: 3,
          universityId: UNIVERSITY_ID,
          comment: "asdjkfhaslkdjfh",
        },
        "user-1",
      );

      expect(result.moderation).toEqual({
        status: "REJECTED_NONSENSE",
        reason: "Conteúdo sem sentido.",
      });
    });

    it("does not include moderation object when review is approved", async () => {
      reviewRepository.create.mockResolvedValue(makeReview(UNIVERSITY_ID));

      const result = await createReview(
        {
          rating: 4,
          difficultyLevel: 3,
          universityId: UNIVERSITY_ID,
          comment: "Ótima universidade!",
        },
        "user-1",
      );

      expect(result.moderation).toBeUndefined();
    });
  });

  describe("updateReview", () => {
    it("returns isVerified on the updated review", async () => {
      reviewRepository.findById.mockResolvedValue(makeReview(UNIVERSITY_ID));
      reviewRepository.update.mockResolvedValue(makeReview(UNIVERSITY_ID));

      const result = await updateReview(
        "review-1",
        { rating: 5 },
        "user-1",
        "USER",
      );

      expect(result.isVerified).toBe(true);
    });

    it("throws 400 when an updated comment is too short", async () => {
      reviewRepository.findById.mockResolvedValue(makeReview(UNIVERSITY_ID));

      await expect(
        updateReview("review-1", { comment: "tiny" }, "user-1", "USER"),
      ).rejects.toMatchObject({
        message: "comment must be at least 10 characters",
        statusCode: 400,
      });
    });

    it("throws 400 when an updated comment exceeds the maximum length", async () => {
      reviewRepository.findById.mockResolvedValue(makeReview(UNIVERSITY_ID));
      const tooLongComment = "b".repeat(2001);

      await expect(
        updateReview("review-1", { comment: tooLongComment }, "user-1", "USER"),
      ).rejects.toMatchObject({
        message: "comment must be at most 2000 characters",
        statusCode: 400,
      });
    });

    it("re-runs moderation when the comment is updated", async () => {
      reviewRepository.findById.mockResolvedValue(makeReview(UNIVERSITY_ID));
      reviewRepository.update.mockResolvedValue(makeReview(UNIVERSITY_ID));

      await updateReview(
        "review-1",
        { comment: "Updated comment here" },
        "user-1",
        "USER",
      );

      expect(mockModerateComment).toHaveBeenCalledWith("Updated comment here");
      expect(reviewRepository.update).toHaveBeenCalledWith(
        "review-1",
        expect.objectContaining({
          moderationStatus: "APPROVED",
          moderationReason: null,
        }),
      );
    });

    it("does not run moderation when only rating is updated", async () => {
      reviewRepository.findById.mockResolvedValue(makeReview(UNIVERSITY_ID));
      reviewRepository.update.mockResolvedValue(makeReview(UNIVERSITY_ID));

      await updateReview("review-1", { rating: 5 }, "user-1", "USER");

      expect(mockModerateComment).not.toHaveBeenCalled();
    });

    it("returns moderation object when updated comment is rejected", async () => {
      mockModerateComment.mockResolvedValueOnce({
        moderationStatus: "REJECTED_OFFENSIVE",
        moderationReason: "Linguagem ofensiva.",
      });
      reviewRepository.findById.mockResolvedValue(makeReview(UNIVERSITY_ID));
      reviewRepository.update.mockResolvedValue({
        ...makeReview(UNIVERSITY_ID),
        moderationStatus: "REJECTED_OFFENSIVE",
        moderationReason: "Linguagem ofensiva.",
      });

      const result = await updateReview(
        "review-1",
        { comment: "Texto ofensivo" },
        "user-1",
        "USER",
      );

      expect(result.moderation).toEqual({
        status: "REJECTED_OFFENSIVE",
        reason: "Linguagem ofensiva.",
      });
    });
  });
});
