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
          makeReview(UNIVERSITY_ID),          // same university → verified
          makeReview("univ-other"),            // different university → not verified
          makeReview(null),                    // no university link → not verified
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
        { rating: 4, difficultyLevel: 3, universityId: UNIVERSITY_ID },
        "user-1"
      );

      expect(review.isVerified).toBe(true);
    });
  });

  describe("updateReview", () => {
    it("returns isVerified on the updated review", async () => {
      reviewRepository.findById.mockResolvedValue(makeReview(UNIVERSITY_ID));
      reviewRepository.update.mockResolvedValue(makeReview(UNIVERSITY_ID));

      const result = await updateReview("review-1", { rating: 5 }, "user-1", "USER");

      expect(result.isVerified).toBe(true);
    });
  });
});
