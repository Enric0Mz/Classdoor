import { getUniversityById } from "@/domain/universityService";
import * as universityRepository from "@/repositories/universityRepository";
import { GET } from "@/app/api/v1/universities/[id]/route";

jest.mock("@/repositories/universityRepository", () => ({
  findById: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const SAMPLE_REVIEWS = [
  { id: "r-1", rating: 5, difficultyLevel: 3, comment: "Amazing", authorId: "u-1", author: { id: "u-1", username: "AgilOnca123", verified: true }, createdAt: new Date() },
  { id: "r-2", rating: 4, difficultyLevel: 4, comment: "Good",    authorId: null, author: null, createdAt: new Date() },
  { id: "r-3", rating: 2, difficultyLevel: 2, comment: "Meh",     authorId: null, author: null, createdAt: new Date() },
];

const UNIVERSITY_IN_DB = {
  id: "uni-1",
  name: "USP",
  location: "São Paulo, SP",
  type: "PUBLIC",
  website: "https://usp.br",
  image: null,
  courses: ["Engenharia", "Medicina"],
  rating: 4.3,
  createdAt: new Date(),
  reviews: SAMPLE_REVIEWS,
};

function makeParams(id) {
  return { params: Promise.resolve({ id }) };
}

describe("universityService.getUniversityById", () => {
  it("returns university with correct stats computed from all reviews", async () => {
    universityRepository.findById.mockResolvedValue(UNIVERSITY_IN_DB);

    const result = await getUniversityById("uni-1");

    // Stats: ratings [5, 4, 2] → avg 3.7; recommended (≥4) = 2/3 = 67%
    expect(result.stats.reviewCount).toBe(3);
    expect(result.stats.averageRating).toBe(3.7);
    expect(result.stats.averageDifficultyLevel).toBe(3.0);
    expect(result.stats.recommendationPercentage).toBe(67);
  });

  it("does not include reviews array in the response", async () => {
    universityRepository.findById.mockResolvedValue(UNIVERSITY_IN_DB);

    const result = await getUniversityById("uni-1");

    expect(result).not.toHaveProperty("reviews");
    expect(result).toHaveProperty("stats");
    expect(result.name).toBe("USP");
  });

  it("returns null stats when university has no reviews", async () => {
    universityRepository.findById.mockResolvedValue({ ...UNIVERSITY_IN_DB, reviews: [] });

    const result = await getUniversityById("uni-1");

    expect(result.stats).toEqual({
      averageRating: null,
      averageDifficultyLevel: null,
      recommendationPercentage: null,
      reviewCount: 0,
    });
    expect(result).not.toHaveProperty("reviews");
  });

  it("throws 404 when university does not exist", async () => {
    universityRepository.findById.mockResolvedValue(null);

    await expect(getUniversityById("missing")).rejects.toMatchObject({
      message: "University not found",
      statusCode: 404,
    });
  });
});

describe("GET /api/v1/universities/:id", () => {
  it("returns 200 with university and stats but no reviews array", async () => {
    universityRepository.findById.mockResolvedValue(UNIVERSITY_IN_DB);

    const response = await GET({}, makeParams("uni-1"));

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("USP");
    expect(response.body.stats).toHaveProperty("reviewCount", 3);
    expect(response.body).not.toHaveProperty("reviews");
  });

  it("returns 404 when university is not found", async () => {
    universityRepository.findById.mockResolvedValue(null);

    const response = await GET({}, makeParams("missing"));

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { message: "University not found", statusCode: 404 },
    });
  });
});
