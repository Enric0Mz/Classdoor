import * as healthService from "@/domain/healthService";
import { GET } from "@/app/api/v1/health/route";

jest.mock("@/domain/healthService", () => ({
  getHealthStatus: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const HEALTHY_RESPONSE = {
  status: "healthy",
  uptime: 1234,
  database: {
    status: "healthy",
    activeConnections: 5,
  },
};

const UNHEALTHY_RESPONSE = {
  status: "unhealthy",
  uptime: 1234,
  database: {
    status: "unhealthy",
    activeConnections: 0,
  },
};

describe("GET /api/v1/health", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 when the application is healthy", async () => {
    healthService.getHealthStatus.mockResolvedValue(HEALTHY_RESPONSE);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(HEALTHY_RESPONSE);
  });

  it("returns 503 when the application is unhealthy", async () => {
    healthService.getHealthStatus.mockResolvedValue(UNHEALTHY_RESPONSE);

    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.body).toEqual(UNHEALTHY_RESPONSE);
  });
});
