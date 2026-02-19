import { createReview } from "@/domain/reviewService";
import * as reviewRepository from "@/repositories/reviewRepository";
import { verifyToken } from "@/lib/auth";
import { POST } from "@/app/api/v1/reviews/route";

jest.mock("@/repositories/reviewRepository", () => ({
  create: jest.fn(),
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

const VALID_REVIEW_BODY = {
  rating: 4,
  difficultyLevel: 3,
  universityId: "uni-1",
  comment: "Great university",
};

describe("reviewService.createReview", () => {
  it("creates a guest review with editToken when authorId is null", async () => {
    const created = { id: "review-1", ...VALID_REVIEW_BODY, authorId: null, editToken: "some-token" };
    reviewRepository.create.mockResolvedValue(created);

    const result = await createReview(VALID_REVIEW_BODY, null);

    expect(result).toHaveProperty("review");
    expect(result).toHaveProperty("editToken");
    expect(typeof result.editToken).toBe("string");
    expect(result.editToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it("creates an authenticated review without editToken when authorId is provided", async () => {
    const created = { id: "review-2", ...VALID_REVIEW_BODY, authorId: "user-1" };
    reviewRepository.create.mockResolvedValue(created);

    const result = await createReview(VALID_REVIEW_BODY, "user-1");

    expect(result).toHaveProperty("review");
    expect(result).not.toHaveProperty("editToken");
  });

  it("throws 400 when universityId is missing", async () => {
    const { universityId: _removed, ...bodyWithoutUniversityId } = VALID_REVIEW_BODY;

    await expect(createReview(bodyWithoutUniversityId, null)).rejects.toMatchObject({
      message: "universityId is required",
      statusCode: 400,
    });
    expect(reviewRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when rating is below range", async () => {
    await expect(createReview({ ...VALID_REVIEW_BODY, rating: 0 }, null)).rejects.toMatchObject({
      message: "Rating must be an integer between 1 and 5",
      statusCode: 400,
    });
  });

  it("throws 400 when rating is above range", async () => {
    await expect(createReview({ ...VALID_REVIEW_BODY, rating: 6 }, null)).rejects.toMatchObject({
      message: "Rating must be an integer between 1 and 5",
      statusCode: 400,
    });
  });

  it("throws 400 when difficultyLevel is out of range", async () => {
    await expect(createReview({ ...VALID_REVIEW_BODY, difficultyLevel: 0 }, null)).rejects.toMatchObject({
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
  it("returns 201 with editToken when no auth header is present", async () => {
    verifyToken.mockImplementation(() => {
      throw new Error("No token");
    });
    const created = { id: "review-1", ...VALID_REVIEW_BODY, authorId: null, editToken: "edit-token-uuid" };
    reviewRepository.create.mockResolvedValue(created);

    const response = await POST(makeRequest(VALID_REVIEW_BODY));

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("editToken");
  });

  it("returns 201 without editToken when valid auth header is present", async () => {
    verifyToken.mockReturnValue({ id: "user-1", email: "user@test.com", role: "USER" });
    const created = { id: "review-2", ...VALID_REVIEW_BODY, authorId: "user-1" };
    reviewRepository.create.mockResolvedValue(created);

    const response = await POST(makeRequest(VALID_REVIEW_BODY));

    expect(response.status).toBe(201);
    expect(response.body).not.toHaveProperty("editToken");
  });

  it("returns 400 when required fields are missing", async () => {
    verifyToken.mockImplementation(() => {
      throw new Error("No token");
    });

    const response = await POST(makeRequest({ rating: 4, difficultyLevel: 3 }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "universityId is required", statusCode: 400 },
    });
  });
});
