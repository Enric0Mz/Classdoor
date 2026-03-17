import * as externalReviewRepository from "@/repositories/externalReviewRepository";
import { GET } from "@/app/api/v1/external-reviews/route";

jest.mock("@/repositories/externalReviewRepository", () => ({
  findByUniversityId: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const SAMPLE_EXTERNAL_REVIEWS = [
  {
    id: "ext-1",
    rating: 5,
    textSnippet: "Excellent university...",
    sourceUrl: "https://maps.google.com/1",
    source: "GOOGLE_MAPS",
    originalDate: new Date("2025-06-01"),
    universityId: "uni-1",
  },
  {
    id: "ext-2",
    rating: 3,
    textSnippet: "Average experience...",
    sourceUrl: "https://maps.google.com/2",
    source: "GOOGLE_MAPS",
    originalDate: new Date("2025-05-01"),
    universityId: "uni-1",
  },
];

function makeGetRequest(searchParams = "") {
  return { url: `http://localhost/api/v1/external-reviews${searchParams}` };
}

describe("GET /api/v1/external-reviews", () => {
  it("returns 200 with paginated external reviews", async () => {
    externalReviewRepository.findByUniversityId.mockResolvedValue({
      data: SAMPLE_EXTERNAL_REVIEWS,
      total: 2,
    });

    const response = await GET(makeGetRequest("?universityId=uni-1"));

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(SAMPLE_EXTERNAL_REVIEWS);
    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it("returns 200 with correct pagination params", async () => {
    externalReviewRepository.findByUniversityId.mockResolvedValue({
      data: [SAMPLE_EXTERNAL_REVIEWS[0]],
      total: 2,
    });

    const response = await GET(
      makeGetRequest("?universityId=uni-1&page=2&limit=1"),
    );

    expect(externalReviewRepository.findByUniversityId).toHaveBeenCalledWith({
      universityId: "uni-1",
      skip: 1,
      take: 1,
    });
    expect(response.body.pagination).toEqual({
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
  });

  it("returns 400 when universityId is missing", async () => {
    const response = await GET(makeGetRequest());

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe("universityId is required");
  });

  it("returns 200 with empty results when no reviews exist", async () => {
    externalReviewRepository.findByUniversityId.mockResolvedValue({
      data: [],
      total: 0,
    });

    const response = await GET(makeGetRequest("?universityId=uni-1"));

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.pagination.total).toBe(0);
  });
});
