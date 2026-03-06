const mockProcessPendingReviews = jest.fn();

jest.mock("@/domain/moderationQueueService", () => ({
  processPendingReviews: (...args) => mockProcessPendingReviews(...args),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

import { POST } from "@/app/api/v1/cron/moderate-reviews/route";

beforeEach(() => {
  jest.clearAllMocks();
  process.env.CRON_SECRET = "test-secret";
});

afterEach(() => {
  delete process.env.CRON_SECRET;
});

function makeRequest(authHeader) {
  return {
    headers: {
      get: (name) => (name === "authorization" ? authHeader : null),
    },
  };
}

describe("POST /api/v1/cron/moderate-reviews", () => {
  it("returns 401 when no authorization header is provided", async () => {
    const response = await POST(makeRequest(null));

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when authorization header has wrong secret", async () => {
    const response = await POST(makeRequest("Bearer wrong-secret"));

    expect(response.status).toBe(401);
  });

  it("returns 401 when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;

    const response = await POST(makeRequest("Bearer test-secret"));

    expect(response.status).toBe(401);
  });

  it("processes pending reviews and returns stats", async () => {
    const stats = { processed: 5, succeeded: 4, failed: 1 };
    mockProcessPendingReviews.mockResolvedValue(stats);

    const response = await POST(makeRequest("Bearer test-secret"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(stats);
    expect(mockProcessPendingReviews).toHaveBeenCalledTimes(1);
  });
});
