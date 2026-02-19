import { deleteReview } from "@/domain/reviewService";
import * as reviewRepository from "@/repositories/reviewRepository";
import { verifyToken } from "@/lib/auth";
import { DELETE } from "@/app/api/v1/reviews/[id]/route";

jest.mock("@/repositories/reviewRepository", () => ({
  findById: jest.fn(),
  remove: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  verifyToken: jest.fn(),
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

function makeParams(id) {
  return { params: Promise.resolve({ id }) };
}

describe("reviewService.deleteReview", () => {
  it("deletes the review when requester is the author", async () => {
    reviewRepository.findById.mockResolvedValue(REVIEW);
    reviewRepository.remove.mockResolvedValue(REVIEW);

    await deleteReview("review-1", "user-1");

    expect(reviewRepository.remove).toHaveBeenCalledWith("review-1");
  });

  it("throws 403 when requester is not the author", async () => {
    reviewRepository.findById.mockResolvedValue(REVIEW);

    await expect(deleteReview("review-1", "other-user")).rejects.toMatchObject({
      message: "Forbidden",
      statusCode: 403,
    });
    expect(reviewRepository.remove).not.toHaveBeenCalled();
  });

  it("throws 404 when review does not exist", async () => {
    reviewRepository.findById.mockResolvedValue(null);

    await expect(deleteReview("missing", "user-1")).rejects.toMatchObject({
      message: "Review not found",
      statusCode: 404,
    });
  });
});

describe("DELETE /api/v1/reviews/:id", () => {
  it("returns 200 when the authenticated user is the author", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "user@test.com", role: "USER" });
    reviewRepository.findById.mockResolvedValue(REVIEW);
    reviewRepository.remove.mockResolvedValue(REVIEW);

    const response = await DELETE({}, makeParams("review-1"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Review deleted" });
  });

  it("returns 401 when no token is provided", async () => {
    const { AppError } = require("@/errors/AppError");
    verifyToken.mockImplementation(() => {
      throw new AppError("Unauthorized", 401);
    });

    const response = await DELETE({}, makeParams("review-1"));

    expect(response.status).toBe(401);
  });

  it("returns 403 when authenticated user is not the author", async () => {
    verifyToken.mockReturnValue({ id: "other-user", email: "other@test.com", role: "USER" });
    reviewRepository.findById.mockResolvedValue(REVIEW);

    const response = await DELETE({}, makeParams("review-1"));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: { message: "Forbidden", statusCode: 403 },
    });
  });
});
