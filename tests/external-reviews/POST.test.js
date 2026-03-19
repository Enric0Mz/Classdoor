import * as externalReviewService from "@/domain/externalReviewService";
import * as universityRepository from "@/repositories/universityRepository";
import * as externalReviewRepository from "@/repositories/externalReviewRepository";
import { POST } from "@/app/api/v1/external-reviews/import/route";

jest.mock("@/repositories/universityRepository", () => ({
  findByName: jest.fn(),
}));

jest.mock("@/repositories/externalReviewRepository", () => ({
  createMany: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  requireVerifiedUser: jest
    .fn()
    .mockResolvedValue({ id: "admin-1", role: "ADMIN" }),
}));

jest.mock("@/lib/authorization", () => ({
  requireRole: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

function makePostRequest(body) {
  return {
    json: async () => body,
    headers: { get: () => "Bearer fake-token" },
  };
}

describe("POST /api/v1/external-reviews/import", () => {
  it("returns 201 with import summary on success", async () => {
    universityRepository.findByName.mockResolvedValue({
      id: "uni-1",
      name: "USP",
    });
    externalReviewRepository.createMany.mockResolvedValue({ count: 2 });

    const response = await POST(
      makePostRequest([
        {
          universityName: "USP",
          reviews: [
            { rating: 5, text: "Great", url: "https://maps.google.com/1" },
            { rating: 4, text: "Good", url: "https://maps.google.com/2" },
          ],
        },
      ]),
    );

    expect(response.status).toBe(201);
    expect(response.body.imported).toBe(2);
    expect(response.body.skippedUniversities).toEqual([]);
  });

  it("returns 400 when payload is not an array", async () => {
    const response = await POST(makePostRequest("not an array"));

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe("Payload must be an array");
  });

  it("returns 201 with skipped universities when not found", async () => {
    universityRepository.findByName.mockResolvedValue(null);

    const response = await POST(
      makePostRequest([
        {
          universityName: "Unknown",
          reviews: [
            { rating: 4, text: "Nice", url: "https://maps.google.com/3" },
          ],
        },
      ]),
    );

    expect(response.status).toBe(201);
    expect(response.body.imported).toBe(0);
    expect(response.body.skippedUniversities).toEqual(["Unknown"]);
  });
});
