import * as healthRepository from "@/repositories/healthRepository";
import { getHealthStatus } from "@/domain/healthService";

jest.mock("@/repositories/healthRepository", () => ({
  checkDatabaseConnection: jest.fn(),
  getActiveConnections: jest.fn(),
}));

describe("healthService.getHealthStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns healthy status when database is reachable", async () => {
    healthRepository.checkDatabaseConnection.mockResolvedValue(undefined);
    healthRepository.getActiveConnections.mockResolvedValue(5);

    const result = await getHealthStatus();

    expect(result.status).toBe("healthy");
    expect(result.uptime).toEqual(expect.any(Number));
    expect(result.database).toEqual({
      status: "healthy",
      activeConnections: 5,
    });
  });

  it("returns unhealthy status when database connection fails", async () => {
    healthRepository.checkDatabaseConnection.mockRejectedValue(
      new Error("Connection refused")
    );

    const result = await getHealthStatus();

    expect(result.status).toBe("unhealthy");
    expect(result.uptime).toEqual(expect.any(Number));
    expect(result.database).toEqual({
      status: "unhealthy",
      activeConnections: 0,
    });
  });

  it("returns unhealthy status when fetching active connections fails", async () => {
    healthRepository.checkDatabaseConnection.mockResolvedValue(undefined);
    healthRepository.getActiveConnections.mockRejectedValue(
      new Error("Query failed")
    );

    const result = await getHealthStatus();

    expect(result.status).toBe("unhealthy");
    expect(result.database.status).toBe("unhealthy");
  });
});
