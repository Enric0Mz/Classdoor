import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

export async function getPendingMigrations() {
  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");

  const entries = await fs.promises.readdir(migrationsDir, {
    withFileTypes: true,
  });

  const migrationFolders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const appliedMigrations = await prisma.$queryRaw`
    SELECT migration_name FROM _prisma_migrations
    WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
  `;

  const appliedNames = new Set(
    appliedMigrations.map((migration) => migration.migration_name),
  );

  const pendingMigrations = migrationFolders.filter(
    (migrationName) => !appliedNames.has(migrationName),
  );

  return {
    pending: pendingMigrations,
    total: pendingMigrations.length,
  };
}
