import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

const execAsync = promisify(exec);

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

export async function runPendingMigrations() {
  const { pending } = await getPendingMigrations();

  if (pending.length === 0) {
    return {
      message: "No pending migrations",
      migrationsRun: 0,
    };
  }

  const prismaBinary = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    "prisma",
  );
  const { stdout, stderr } = await execAsync(`${prismaBinary} migrate deploy`);

  return {
    message: "Migrations applied successfully",
    migrationsRun: pending.length,
    output: stdout || stderr,
  };
}
