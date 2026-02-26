import prisma from "@/lib/prisma";

export async function checkDatabaseConnection() {
  await prisma.$queryRawUnsafe("SELECT 1");
}

export async function getActiveConnections() {
  const result = await prisma.$queryRawUnsafe(
    "SELECT count(*)::int AS active_connections FROM pg_stat_activity WHERE datname = current_database()"
  );

  return result[0].active_connections;
}
