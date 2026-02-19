import { updateReview } from "@/domain/reviewService";
import * as reviewRepository from "@/repositories/reviewRepository";
import { verifyToken } from "@/lib/auth";
import { PUT } from "@/app/api/v1/reviews/[id]/route";

jest.mock("@/repositories/reviewRepository", () => ({
  findById: jest.fn(),
  update: jest.fn(),
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

const GUEST_REVIEW = {
  id: "review-1",
  rating: 3,
  difficultyLevel: 2,
  universityId: "uni-1",
  authorId: null,
  editToken: "valid-edit-token",
};

const AUTH_REVIEW = {
  id: "review-2",
  rating: 3,
  difficultyLevel: 2,
  universityId: "uni-1",
  authorId: "user-1",
  editToken: null,
};

const UPDATE_DATA = { rating: 5, comment: "Updated comment" };

function makeParams(id) {
  return { params: Promise.resolve({ id }) };
}

describe("reviewService.updateReview", () => {
  it("updates review when requesterId matches authorId", async () => {
    const updatedReview = { ...AUTH_REVIEW, ...UPDATE_DATA };
    reviewRepository.findById.mockResolvedValue(AUTH_REVIEW);
    reviewRepository.update.mockResolvedValue(updatedReview);

    const result = await updateReview("review-2", UPDATE_DATA, "user-1", null);

    expect(reviewRepository.update).toHaveBeenCalledWith(
      "review-2",
      expect.objectContaining({ rating: 5 })
    );
    expect(result).toEqual(updatedReview);
  });

  it("updates review when editToken matches", async () => {
    const updatedReview = { ...GUEST_REVIEW, ...UPDATE_DATA };
    reviewRepository.findById.mockResolvedValue(GUEST_REVIEW);
    reviewRepository.update.mockResolvedValue(updatedReview);

    const result = await updateReview("review-1", UPDATE_DATA, null, "valid-edit-token");

    expect(reviewRepository.update).toHaveBeenCalled();
    expect(result).toEqual(updatedReview);
  });

  it("throws 403 when neither requester nor editToken match", async () => {
    reviewRepository.findById.mockResolvedValue(AUTH_REVIEW);

    await expect(updateReview("review-2", UPDATE_DATA, "wrong-user", null)).rejects.toMatchObject({
      message: "Forbidden",
      statusCode: 403,
    });
    expect(reviewRepository.update).not.toHaveBeenCalled();
  });

  it("throws 404 when review does not exist", async () => {
    reviewRepository.findById.mockResolvedValue(null);

    await expect(updateReview("missing", UPDATE_DATA, "user-1", null)).rejects.toMatchObject({
      message: "Review not found",
      statusCode: 404,
    });
  });
});

describe("PUT /api/v1/reviews/:id", () => {
  it("returns 200 when auth token matches authorId", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "user@test.com", role: "USER" });
    const updatedReview = { ...AUTH_REVIEW, rating: 5 };
    reviewRepository.findById.mockResolvedValue(AUTH_REVIEW);
    reviewRepository.update.mockResolvedValue(updatedReview);

    const request = {
      url: "http://localhost/api/v1/reviews/review-2",
      json: jest.fn().mockResolvedValue(UPDATE_DATA),
    };

    const response = await PUT(request, makeParams("review-2"));

    expect(response.status).toBe(200);
  });

  it("returns 200 when body editToken matches review editToken", async () => {
    verifyToken.mockImplementation(() => {
      throw new Error("No token");
    });
    const updatedReview = { ...GUEST_REVIEW, rating: 5 };
    reviewRepository.findById.mockResolvedValue(GUEST_REVIEW);
    reviewRepository.update.mockResolvedValue(updatedReview);

    const request = {
      url: "http://localhost/api/v1/reviews/review-1",
      json: jest.fn().mockResolvedValue({ ...UPDATE_DATA, editToken: "valid-edit-token" }),
    };

    const response = await PUT(request, makeParams("review-1"));

    expect(response.status).toBe(200);
  });

  it("returns 403 when neither auth nor editToken match", async () => {
    verifyToken.mockReturnValue({ id: "wrong-user", email: "wrong@test.com", role: "USER" });
    reviewRepository.findById.mockResolvedValue(AUTH_REVIEW);

    const request = {
      url: "http://localhost/api/v1/reviews/review-2",
      json: jest.fn().mockResolvedValue(UPDATE_DATA),
    };

    const response = await PUT(request, makeParams("review-2"));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: { message: "Forbidden", statusCode: 403 },
    });
  });
});
