import {
  importReviews,
  listByUniversity,
  getStats,
} from "@/domain/externalReviewService";
import * as externalReviewRepository from "@/repositories/externalReviewRepository";
import * as universityRepository from "@/repositories/universityRepository";

jest.mock("@/repositories/externalReviewRepository", () => ({
  createMany: jest.fn(),
  findByUniversityId: jest.fn(),
  getStatsByUniversityId: jest.fn(),
}));

jest.mock("@/repositories/universityRepository", () => ({
  findByName: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

const UNIVERSITY = { id: "uni-1", name: "USP" };

describe("importReviews", () => {
  it("imports valid reviews for a known university", async () => {
    universityRepository.findByName.mockResolvedValue(UNIVERSITY);
    externalReviewRepository.createMany.mockResolvedValue({ count: 2 });

    const result = await importReviews([
      {
        universityName: "USP",
        reviews: [
          {
            rating: 5,
            text: "Great place",
            url: "https://maps.google.com/1",
            date: "2025-01-01",
          },
          {
            rating: 3,
            text: "Okay",
            url: "https://maps.google.com/2",
            date: "2025-02-01",
          },
        ],
      },
    ]);

    expect(result.imported).toBe(2);
    expect(result.skippedUniversities).toEqual([]);
    expect(externalReviewRepository.createMany).toHaveBeenCalledTimes(1);

    const passedData = externalReviewRepository.createMany.mock.calls[0][0];
    expect(passedData).toHaveLength(2);
    expect(passedData[0].universityId).toBe("uni-1");
    expect(passedData[0].source).toBe("GOOGLE_MAPS");
  });

  it("skips universities not found in the database", async () => {
    universityRepository.findByName.mockResolvedValue(null);

    const result = await importReviews([
      {
        universityName: "Unknown University",
        reviews: [
          { rating: 4, text: "Nice", url: "https://maps.google.com/3" },
        ],
      },
    ]);

    expect(result.imported).toBe(0);
    expect(result.skippedUniversities).toEqual(["Unknown University"]);
    expect(externalReviewRepository.createMany).not.toHaveBeenCalled();
  });

  it("skips reviews with invalid rating", async () => {
    universityRepository.findByName.mockResolvedValue(UNIVERSITY);
    externalReviewRepository.createMany.mockResolvedValue({ count: 1 });

    await importReviews([
      {
        universityName: "USP",
        reviews: [
          { rating: 0, text: "Invalid", url: "https://maps.google.com/4" },
          { rating: 6, text: "Also invalid", url: "https://maps.google.com/5" },
          { rating: 4, text: "Valid", url: "https://maps.google.com/6" },
        ],
      },
    ]);

    const passedData = externalReviewRepository.createMany.mock.calls[0][0];
    expect(passedData).toHaveLength(1);
    expect(passedData[0].rating).toBe(4);
  });

  it("skips reviews without a URL", async () => {
    universityRepository.findByName.mockResolvedValue(UNIVERSITY);
    externalReviewRepository.createMany.mockResolvedValue({ count: 0 });

    await importReviews([
      {
        universityName: "USP",
        reviews: [{ rating: 4, text: "No url" }],
      },
    ]);

    expect(externalReviewRepository.createMany).not.toHaveBeenCalled();
  });

  it("truncates text at word boundary to ~100 chars", async () => {
    universityRepository.findByName.mockResolvedValue(UNIVERSITY);
    externalReviewRepository.createMany.mockResolvedValue({ count: 1 });

    const longText =
      "This is a long review text that should be truncated at a word boundary because it exceeds the maximum allowed length of one hundred characters for LGPD compliance reasons.";

    await importReviews([
      {
        universityName: "USP",
        reviews: [
          { rating: 5, text: longText, url: "https://maps.google.com/7" },
        ],
      },
    ]);

    const passedData = externalReviewRepository.createMany.mock.calls[0][0];
    const snippet = passedData[0].textSnippet;
    expect(snippet.endsWith("...")).toBe(true);
    expect(snippet.length).toBeLessThanOrEqual(110);
  });

  it("throws 400 when payload is not an array", async () => {
    await expect(importReviews("not an array")).rejects.toMatchObject({
      message: "Payload must be an array",
      statusCode: 400,
    });
  });
});

describe("listByUniversity", () => {
  it("delegates to repository with correct params", async () => {
    const expected = { data: [], total: 0 };
    externalReviewRepository.findByUniversityId.mockResolvedValue(expected);

    const result = await listByUniversity({
      universityId: "uni-1",
      skip: 0,
      take: 10,
    });

    expect(externalReviewRepository.findByUniversityId).toHaveBeenCalledWith({
      universityId: "uni-1",
      skip: 0,
      take: 10,
    });
    expect(result).toEqual(expected);
  });

  it("throws 400 when universityId is missing", async () => {
    await expect(listByUniversity({ skip: 0, take: 10 })).rejects.toMatchObject(
      {
        message: "universityId is required",
        statusCode: 400,
      },
    );
  });
});

describe("getStats", () => {
  it("returns stats with source when reviews exist", async () => {
    externalReviewRepository.getStatsByUniversityId.mockResolvedValue({
      averageRating: 4.2,
      reviewCount: 15,
      recommendedCount: 10,
    });

    const result = await getStats("uni-1");

    expect(result).toEqual({
      averageRating: 4.2,
      reviewCount: 15,
      recommendedCount: 10,
      source: "GOOGLE_MAPS",
    });
  });

  it("returns null when no external reviews exist", async () => {
    externalReviewRepository.getStatsByUniversityId.mockResolvedValue({
      averageRating: null,
      reviewCount: 0,
      recommendedCount: 0,
    });

    const result = await getStats("uni-1");
    expect(result).toBeNull();
  });
});
