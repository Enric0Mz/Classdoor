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

function makeParams(id) {
  return { params: Promise.resolve({ id }) };
}

describe("reviewService.deleteReview", () => {
  it("deletes review when requesterId matches authorId", async () => {
    reviewRepository.findById.mockResolvedValue(AUTH_REVIEW);
    reviewRepository.remove.mockResolvedValue(AUTH_REVIEW);

    await deleteReview("review-2", "user-1", null);

    expect(reviewRepository.remove).toHaveBeenCalledWith("review-2");
  });

  it("deletes review when editToken matches", async () => {
    reviewRepository.findById.mockResolvedValue(GUEST_REVIEW);
    reviewRepository.remove.mockResolvedValue(GUEST_REVIEW);

    await deleteReview("review-1", null, "valid-edit-token");

    expect(reviewRepository.remove).toHaveBeenCalledWith("review-1");
  });

  it("throws 403 when neither requester nor editToken match", async () => {
    reviewRepository.findById.mockResolvedValue(AUTH_REVIEW);

    await expect(deleteReview("review-2", "wrong-user", null)).rejects.toMatchObject({
      message: "Forbidden",
      statusCode: 403,
    });
    expect(reviewRepository.remove).not.toHaveBeenCalled();
  });

  it("throws 404 when review does not exist", async () => {
    reviewRepository.findById.mockResolvedValue(null);

    await expect(deleteReview("missing", "user-1", null)).rejects.toMatchObject({
      message: "Review not found",
      statusCode: 404,
    });
  });
});

describe("DELETE /api/v1/reviews/:id", () => {
  it("returns 200 when auth token matches authorId", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "user@test.com", role: "USER" });
    reviewRepository.findById.mockResolvedValue(AUTH_REVIEW);
    reviewRepository.remove.mockResolvedValue(AUTH_REVIEW);

    const request = {
      url: "http://localhost/api/v1/reviews/review-2",
      json: jest.fn().mockResolvedValue({}),
    };

    const response = await DELETE(request, makeParams("review-2"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Review deleted" });
  });

  it("returns 200 when body editToken matches review editToken", async () => {
    verifyToken.mockImplementation(() => {
      throw new Error("No token");
    });
    reviewRepository.findById.mockResolvedValue(GUEST_REVIEW);
    reviewRepository.remove.mockResolvedValue(GUEST_REVIEW);

    const request = {
      url: "http://localhost/api/v1/reviews/review-1",
      json: jest.fn().mockResolvedValue({ editToken: "valid-edit-token" }),
    };

    const response = await DELETE(request, makeParams("review-1"));

    expect(response.status).toBe(200);
  });

  it("returns 403 when neither auth nor editToken match", async () => {
    verifyToken.mockReturnValue({ id: "wrong-user", email: "wrong@test.com", role: "USER" });
    reviewRepository.findById.mockResolvedValue(AUTH_REVIEW);

    const request = {
      url: "http://localhost/api/v1/reviews/review-2",
      json: jest.fn().mockResolvedValue({}),
    };

    const response = await DELETE(request, makeParams("review-2"));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: { message: "Forbidden", statusCode: 403 },
    });
  });
});
