import * as healthRepository from "@/repositories/healthRepository";

export async function getHealthStatus() {
  const uptimeInSeconds = Math.floor(process.uptime());

  try {
    await healthRepository.checkDatabaseConnection();
    const activeConnections = await healthRepository.getActiveConnections();

    return {
      status: "healthy",
      uptime: uptimeInSeconds,
      database: {
        status: "healthy",
        activeConnections,
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      uptime: uptimeInSeconds,
      database: {
        status: "unhealthy",
        activeConnections: 0,
      },
    };
  }
}
