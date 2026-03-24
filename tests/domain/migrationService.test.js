import * as migrationService from "@/domain/migrationService";
import prisma from "@/lib/prisma";
import fs from "fs";
import { exec } from "child_process";

jest.mock("@/lib/prisma", () => ({
  $queryRaw: jest.fn(),
}));

jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn(),
  },
}));

jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

jest.mock("util", () => ({
  promisify: (fn) => fn,
}));

const APPLIED_MIGRATIONS = [
  { migration_name: "20260217232444_switch_to_postgres" },
  { migration_name: "20260218044512_add_university_fields" },
];

const ALL_MIGRATION_DIRS = [
  { name: "20260217232444_switch_to_postgres", isDirectory: () => true },
  { name: "20260218044512_add_university_fields", isDirectory: () => true },
  { name: "20260218232852_add_user_role", isDirectory: () => true },
];

beforeEach(() => jest.clearAllMocks());

describe("migrationService.getPendingMigrations", () => {
  it("returns pending migrations not yet applied", async () => {
    fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS);
    prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);

    const result = await migrationService.getPendingMigrations();

    expect(result.pending).toEqual(["20260218232852_add_user_role"]);
    expect(result.total).toBe(1);
  });

  it("returns empty list when all migrations are applied", async () => {
    fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS.slice(0, 2));
    prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);

    const result = await migrationService.getPendingMigrations();

    expect(result.pending).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("returns all migrations as pending when none are applied", async () => {
    fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS);
    prisma.$queryRaw.mockResolvedValue([]);

    const result = await migrationService.getPendingMigrations();

    expect(result.total).toBe(3);
    expect(result.pending).toHaveLength(3);
  });

  it("ignores non-directory entries like migration_lock.toml", async () => {
    const entriesWithFile = [
      ...ALL_MIGRATION_DIRS.slice(0, 2),
      { name: "migration_lock.toml", isDirectory: () => false },
    ];
    fs.promises.readdir.mockResolvedValue(entriesWithFile);
    prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);

    const result = await migrationService.getPendingMigrations();

    expect(result.pending).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("throws when database query fails", async () => {
    fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS);
    prisma.$queryRaw.mockRejectedValue(new Error("DB error"));

    await expect(migrationService.getPendingMigrations()).rejects.toThrow(
      "DB error",
    );
  });
});

describe("migrationService.runPendingMigrations", () => {
  it("returns early when no pending migrations", async () => {
    fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS.slice(0, 2));
    prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);

    const result = await migrationService.runPendingMigrations();

    expect(result).toEqual({
      message: "No pending migrations",
      migrationsRun: 0,
    });
    expect(exec).not.toHaveBeenCalled();
  });

  it("runs deploy command when there are pending migrations", async () => {
    fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS);
    prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);
    exec.mockResolvedValue({ stdout: "1 migration applied.", stderr: "" });

    const result = await migrationService.runPendingMigrations();

    expect(exec).toHaveBeenCalledWith("npx prisma migrate deploy");
    expect(result.migrationsRun).toBe(1);
    expect(result.message).toBe("Migrations applied successfully");
    expect(result.output).toBe("1 migration applied.");
  });

  it("uses stderr output when stdout is empty", async () => {
    fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS);
    prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);
    exec.mockResolvedValue({ stdout: "", stderr: "Applied migration." });

    const result = await migrationService.runPendingMigrations();

    expect(result.output).toBe("Applied migration.");
  });

  it("throws when exec command fails", async () => {
    fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS);
    prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);
    exec.mockRejectedValue(new Error("Command failed"));

    await expect(migrationService.runPendingMigrations()).rejects.toThrow(
      "Command failed",
    );
  });
});
